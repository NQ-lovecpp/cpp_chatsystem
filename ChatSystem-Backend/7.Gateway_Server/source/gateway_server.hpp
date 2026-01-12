// 网关服务器不本身不直接提供业务处理流程，负责接收客户端请求，然后转发给6个子服务处理业务
// 1. 有些业务是不需要响应给客户端的
// 2. 有些业务是需要网关服务器处理完请求后转发给某个或某些客户端的：
//      好友申请请求、好友申请处理流程、好友删除、会话创建、产生新消息

// 两个问题是如何解决的：
// 1. 鉴权：当客户端登录成功后，服务器为客户端创建一个登录会话id，客户端凭借这个登录会话id来和服务器展开后续沟通，
// 服务器通过这个登录会话id找到这个用户(因为存放了<session_id, user_id>)
// 2. 连接管理：


#include "redis_CRUD.hpp" // redis数据管理客户端封装
#include "etcd.hpp"       // 服务注册模块封装
#include "logger.hpp"     // 日志模块封装
#include "rpc_service_manager.hpp"    // 信道管理模块封装

#include "connection.hpp" // 连接管理模块

#include "user.pb.h"               // protobuf框架代码
#include "base.pb.h"               // protobuf框架代码
#include "file.pb.h"               // protobuf框架代码
#include "friend.pb.h"             // protobuf框架代码
#include "gateway.pb.h"            // protobuf框架代码
#include "message_storage.pb.h"    // protobuf框架代码
#include "speech_recognition.pb.h" // protobuf框架代码
#include "message_transmit.pb.h"   // protobuf框架代码
#include "notify.pb.h"

#include "httplib.h" // http服务器

namespace chen_im
{
// 网关暴露给客户端的接口一共28个，其中5个方法是不用鉴权的，因为用户还没有登陆：
#define GET_PHONE_VERIFY_CODE "/service/user/get_phone_verify_code" // "user.proto" rpc GetPhoneVerifyCode()
#define USERNAME_REGISTER "/service/user/username_register"         // "user.proto" rpc UserRegister()
#define USERNAME_LOGIN "/service/user/username_login"               // "user.proto" rpc UserLogin()
#define PHONE_REGISTER "/service/user/phone_register"               // "user.proto" rpc PhoneRegister()
#define PHONE_LOGIN "/service/user/phone_login"                     // "user.proto" rpc PhoneLogin()

// 其余23个都是需要鉴权的，也就是判断是否登录了
// 有5个HTTP接口会通过websocket给客户端推送消息，具体推送的API定义在notify.proto里面
// FriendAdd
// FriendAddProcess
// FriendRemove
// ChatSessionCreate
// NewMessage

#define GET_USERINFO "/service/user/get_user_info"                  // "user.proto" rpc GetUserInfo()
#define SET_USER_AVATAR "/service/user/set_avatar"                  // "user.proto" rpc SetUserAvatar()
#define SET_USER_NICKNAME "/service/user/set_nickname"              // "user.proto" rpc SetUserNickname()
#define SET_USER_DESC "/service/user/set_description"               // "user.proto" rpc SetUserDescription()
#define SET_USER_PHONE "/service/user/set_phone"                    // "user.proto" rpc SetUserPhoneNumber()
#define FRIEND_GET_LIST "/service/friend/get_friend_list"                  // "friend.proto" rpc GetFriendList()
#define FRIEND_APPLY "/service/friend/add_friend_apply"                    // "friend.proto" rpc FriendAdd()
#define FRIEND_APPLY_PROCESS "/service/friend/add_friend_process"          // "friend.proto" rpc FriendAddProcess()
#define FRIEND_REMOVE "/service/friend/remove_friend"                      // "friend.proto" rpc FriendRemove()
#define FRIEND_SEARCH "/service/friend/search_friend"                      // "friend.proto" rpc FriendSearch()
#define FRIEND_GET_PENDING_EV "/service/friend/get_pending_friend_events"  // "friend.proto" rpc GetPendingFriendEventList()
#define CSS_GET_LIST "/service/friend/get_chat_session_list"               // "friend.proto" rpc GetChatSessionList()
#define CSS_CREATE "/service/friend/create_chat_session"                   // "friend.proto" rpc ChatSessionCreate()
#define CSS_GET_MEMBER "/service/friend/get_chat_session_member"           // "friend.proto" rpc GetChatSessionMember()
#define MSG_GET_RANGE "/service/message_storage/get_history"     // "message_storage.proto" rpc GetHistoryMsg()
#define MSG_GET_RECENT "/service/message_storage/get_recent"     // "message_storage.proto" rpc GetRecentMsg()
#define MSG_KEY_SEARCH "/service/message_storage/search_history" // "message_storage.proto" rpc MsgSearch()
#define NEW_MESSAGE "/service/message_transmit/new_message" // "message_transmit.proto" rpc GetTransmitTarget()
#define FILE_GET_SINGLE "/service/file/get_single_file" // "file.proto" rpc GetSingleFile()
#define FILE_GET_MULTI "/service/file/get_multi_file"   // "file.proto" rpc GetMultiFile()
#define FILE_PUT_SINGLE "/service/file/put_single_file" // "file.proto" rpc PutSingleFile()
#define FILE_PUT_MULTI "/service/file/put_multi_file"   // "file.proto" rpc PutMultiFile()
#define SPEECH_RECOGNITION "/service/speech/recognition" // "speech_recognition.proto" rpc SpeechRecognition()
    

    // 网关服务器本质上是一个进程在运行，客户端也是
    // 但是他们分别充当websocket服务器/客户端、http服务器/客户端
    // 所以服务器进程中会存在两个线程，一个是websocket服务线程，一个是http的线程
    // 这两条线程都会一直阻塞等待，每当有消息或请求到来时，会将请求体推入线程池的任务队列让线程池里的线程去消费
    class GatewayServer
    { 
    public:
        using ptr = std::shared_ptr<GatewayServer>;
        GatewayServer(int websocket_port,
                      int http_port,
                      const std::shared_ptr<sw::redis::Redis> &redis_client,
                      const ServiceManager::ptr &service_managers,
                      const Discovery::ptr &service_discoverer,
                      const std::string user_service_name,
                      const std::string file_service_name,
                      const std::string speech_service_name,
                      const std::string message_store_service_name,
                      const std::string message_transmit_service_name,
                      const std::string friend_service_name)
            : _redis_session(std::make_shared<Session>(redis_client)),
              _redis_status(std::make_shared<Status>(redis_client)),
              _redis_uti(std::make_shared<RedisDatabaseUtility>(redis_client)),
              _service_manager(service_managers),
              _service_discoverer(service_discoverer),
              _user_service_name(user_service_name),
              _file_service_name(file_service_name),
              _speech_service_name(speech_service_name),
              _message_store_service_name(message_store_service_name),
              _message_transmit_service_name(message_transmit_service_name),
              _friend_service_name(friend_service_name),
              _connections(std::make_shared<Connection>())
        {
            _ws_server.set_access_channels(websocketpp::log::alevel::none);
            _ws_server.init_asio();
            _ws_server.set_open_handler(std::bind(&GatewayServer::when_websocket_connection_open, this, std::placeholders::_1));
            _ws_server.set_close_handler(std::bind(&GatewayServer::when_websocket_connection_close, this, std::placeholders::_1));
            auto websocket_new_message_callback = std::bind(&GatewayServer::when_websocket_get_message, this,
                                  std::placeholders::_1, std::placeholders::_2);
            _ws_server.set_message_handler(websocket_new_message_callback);
            _ws_server.set_reuse_addr(true);
            _ws_server.listen(websocket_port);
            _ws_server.start_accept();

            _http_server.Post(GET_PHONE_VERIFY_CODE, (httplib::Server::Handler)std::bind(&GatewayServer::GetPhoneVerifyCode, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(USERNAME_REGISTER,     (httplib::Server::Handler)std::bind(&GatewayServer::UserRegister, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(USERNAME_LOGIN,        (httplib::Server::Handler)std::bind(&GatewayServer::UserLogin, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(PHONE_REGISTER, (httplib::Server::Handler)std::bind(&GatewayServer::PhoneRegister, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(PHONE_LOGIN, (httplib::Server::Handler)std::bind(&GatewayServer::PhoneLogin, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(GET_USERINFO, (httplib::Server::Handler)std::bind(&GatewayServer::GetUserInfo, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(SET_USER_AVATAR, (httplib::Server::Handler)std::bind(&GatewayServer::SetUserAvatar, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(SET_USER_NICKNAME, (httplib::Server::Handler)std::bind(&GatewayServer::SetUserNickname, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(SET_USER_DESC, (httplib::Server::Handler)std::bind(&GatewayServer::SetUserDescription, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(SET_USER_PHONE, (httplib::Server::Handler)std::bind(&GatewayServer::SetUserPhoneNumber, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FRIEND_GET_LIST, (httplib::Server::Handler)std::bind(&GatewayServer::GetFriendList, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FRIEND_APPLY, (httplib::Server::Handler)std::bind(&GatewayServer::FriendAdd, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FRIEND_APPLY_PROCESS, (httplib::Server::Handler)std::bind(&GatewayServer::FriendAddProcess, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FRIEND_REMOVE, (httplib::Server::Handler)std::bind(&GatewayServer::FriendRemove, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FRIEND_SEARCH, (httplib::Server::Handler)std::bind(&GatewayServer::FriendSearch, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FRIEND_GET_PENDING_EV, (httplib::Server::Handler)std::bind(&GatewayServer::GetPendingFriendEventList, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(CSS_GET_LIST, (httplib::Server::Handler)std::bind(&GatewayServer::GetChatSessionList, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(CSS_CREATE, (httplib::Server::Handler)std::bind(&GatewayServer::ChatSessionCreate, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(CSS_GET_MEMBER, (httplib::Server::Handler)std::bind(&GatewayServer::GetChatSessionMember, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(MSG_GET_RANGE, (httplib::Server::Handler)std::bind(&GatewayServer::GetHistoryMsg, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(MSG_GET_RECENT, (httplib::Server::Handler)std::bind(&GatewayServer::GetRecentMsg, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(MSG_KEY_SEARCH, (httplib::Server::Handler)std::bind(&GatewayServer::MsgSearch, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(NEW_MESSAGE, (httplib::Server::Handler)std::bind(&GatewayServer::NewMessage, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FILE_GET_SINGLE, (httplib::Server::Handler)std::bind(&GatewayServer::GetSingleFile, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FILE_GET_MULTI, (httplib::Server::Handler)std::bind(&GatewayServer::GetMultiFile, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FILE_PUT_SINGLE, (httplib::Server::Handler)std::bind(&GatewayServer::PutSingleFile, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(FILE_PUT_MULTI, (httplib::Server::Handler)std::bind(&GatewayServer::PutMultiFile, this, std::placeholders::_1, std::placeholders::_2));
            _http_server.Post(SPEECH_RECOGNITION, (httplib::Server::Handler)std::bind(&GatewayServer::SpeechRecognition, this, std::placeholders::_1, std::placeholders::_2));
            _http_thread = std::thread([this, http_port]() { 
                                            _http_server.Options(".*", [](const httplib::Request &req, httplib::Response &res) {
                                                res.status = 200;
                                                res.set_header("Access-Control-Allow-Origin", "*");
                                                res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                                                res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
                                                res.set_content("", "text/plain");
                                            });

                                            _http_server.set_error_handler([](const httplib::Request&, httplib::Response &res) {
                                                res.set_header("Access-Control-Allow-Origin", "*");
                                                // ... 其他 CORS 头
                                                res.status = 400; // 或别的错误码
                                                res.set_content("Bad Request", "text/plain");
                                            });

                                            // _http_server.set_default_headers({
                                            //     {"Access-Control-Allow-Origin", "*"},
                                            //     {"Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"},
                                            //     {"Access-Control-Allow-Headers", "Content-Type, Authorization"}
                                            // });
                                            LOG_INFO("http server listening on port: {}", http_port);
                                            _http_server.listen("0.0.0.0", http_port); });
            _http_thread.detach(); // http线程与主执行流分离，退出时自动释放资源
        }

        void start()
        {
            _ws_server.run();
        }

        enum exit_mode
        {
            KILLED_BY_SIGNAL = 1, // 被信号所杀
            NORMAL_EXIT = 2       // 自己退出
        };
        // 意外退出或被信号所杀时，清理redis缓存
        void when_server_exit(exit_mode mode)
        {
            switch(mode)
            {
                case exit_mode::KILLED_BY_SIGNAL:
                {
                    _redis_uti->flush_all_db();
                }
                case exit_mode::NORMAL_EXIT:
                {
                    _redis_uti->flush_all_db();
                }
            }
        }

    private:
        void when_websocket_connection_open(websocketpp::connection_hdl hdl)
        {
            LOG_DEBUG("websocket长连接建立成功 {}", (size_t)_ws_server.get_con_from_hdl(hdl).get());
        }

        // 需要完成redis缓存的清理
        void when_websocket_connection_close(websocketpp::connection_hdl hdl)
        {
            // 长连接断开时做的清理工作
            // 0. 通过连接对象，获取对应的用户ID与登录会话ID
            auto conn = _ws_server.get_con_from_hdl(hdl);
            std::string uid, ssid;
            bool ret = _connections->get_client_info(conn, uid, ssid);
            if (ret == false) {
                LOG_WARN("长连接断开，未找到长连接对应的客户端信息！");
                return;
            }
            // 1. 移除登录会话信息
            _redis_session->remove(ssid);
            // 2. 移除登录状态信息
            _redis_status->remove(uid);
            // 3. 移除长连接管理数据
            _connections->remove_connection(conn);
            LOG_DEBUG("长连接断开，清理缓存数据! 会话id：{}，用户id：{}，长连接句柄：{}", ssid, uid, (size_t)conn.get());
        }

        // 
        void keepAlive(websocket_server_t::connection_ptr conn)
        {
            if (!conn || conn->get_state() != websocketpp::session::state::value::open)
            {
                LOG_DEBUG("非正常连接状态，结束连接保活");
                return;
            }
            conn->ping("");
            _ws_server.set_timer(60000, std::bind(&GatewayServer::keepAlive, this, conn));
        }

        // 长连接建一旦建立，客户端会向服务器发送一条消息（唯一一次客户端向服务器发消息），包含客户端自己的身份信息，
        // 简单看一下客户端ws连接建立成功时的回调函数：
        // connect(&websocketClient, &QWebSocket::connected, this, [=]() {
        //     LOG() << "websocket 连接成功!";
        //     // 不要忘记! 在 websocket 连接成功之后, 发送身份认证消息!
        //     sendAuth();
        // });
        // 
        // void NetClient::sendAuth()
        // {
        //     chen_im::ClientAuthenticationReq req;
        //     req.setRequestId(makeRequestId());
        //     req.setSessionId(dataCenter->getLoginSessionId());
        //     QByteArray body = req.serialize(&serializer);
        //     websocketClient.sendBinaryMessage(body);
        //     LOG() << "[WS身份认证] requestId=" << req.requestId() << ", loginSessionId=" << req.sessionId();
        // }
        // 
        // 收到第一条消息后，根据消息中的会话ID进行身份识别，将客户端长连接添加至Connection管理对象中
        void when_websocket_get_message(websocketpp::connection_hdl hdl, websocket_server_t::message_ptr msg)
        {
            // 1. 取出长连接对应的连接对象
            auto conn = _ws_server.get_con_from_hdl(hdl);

            // 2. 针对消息内容进行反序列化 -- ClientAuthenticationReq -- 提取登录会话ID
            ClientAuthenticationReq request;
            bool ret = request.ParseFromString(msg->get_payload());
            if (ret == false) {
                LOG_ERROR("长连接身份识别失败：正文反序列化失败！");
                _ws_server.close(hdl, websocketpp::close::status::unsupported_data, "正文反序列化失败!");
                return;
            }

            // 3. 在会话信息缓存中，查找会话信息
            std::string ssid = request.session_id();
            auto uid = _redis_session->get_uid(ssid); // 返回的是std::optional<std::string>

            // 4. 如果uid为空，则redis中会话信息不存在，关闭连接
            if (!uid) {
                LOG_ERROR("长连接身份识别失败, 未找到session_id: {}！", ssid);
                _ws_server.close(hdl, websocketpp::close::status::unsupported_data, "未找到会话信息!");
                return;
            }

            // 5. 会话信息存在，则添加长连接管理
            _connections->insert(conn, *uid, ssid);
            keepAlive(conn);
        }

        void GetPhoneVerifyCode(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            PhoneVerifyCodeReq req;
            PhoneVerifyCodeRsp rsp;

            // 错误回调函数
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };

            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("获取短信验证码请求正文反序列化失败！");
                return err_response("获取短信验证码请求正文反序列化失败！");
            }

            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel) {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetPhoneVerifyCode(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }

            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void UserRegister(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            UserRegisterReq req;
            UserRegisterRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("用户名注册请求正文反序列化失败！");
                return err_response("用户名注册请求正文反序列化失败！");
            }
            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.UserRegister(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void UserLogin(const httplib::Request &request, httplib::Response &response)
        {
            // 直接打印http请求的正文
            LOG_DEBUG("http 请求体：{}", request.body);
            // 加上跨域请求头
            response.set_header("Access-Control-Allow-Origin", "*");
            response.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
            response.set_header("Access-Control-Allow-Headers", "Content-Type");
            
            // 1. 取出http请求正文，将正文进行反序列化
            UserLoginReq req;
            UserLoginRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("用户登录请求正文反序列化失败！");
                return err_response("用户登录请求正文反序列化失败！");
            }

            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.UserLogin(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void PhoneRegister(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            PhoneRegisterReq req;
            PhoneRegisterRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("手机号注册请求正文反序列化失败！");
                return err_response("手机号注册请求正文反序列化失败！");
            }
            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.PhoneRegister(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void PhoneLogin(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            PhoneLoginReq req;
            PhoneLoginRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("手机号登录请求正文反序列化失败！");
                return err_response("手机号登录请求正文反序列化失败！");
            }
            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.PhoneLogin(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void GetUserInfo(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            GetUserInfoReq req;
            GetUserInfoRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("获取用户信息请求正文反序列化失败！");
                return err_response("获取用户信息请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetUserInfo(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void SetUserAvatar(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            SetUserAvatarReq req;
            SetUserAvatarRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("用户头像设置请求正文反序列化失败！");
                return err_response("用户头像设置请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.SetUserAvatar(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void SetUserNickname(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            SetUserNicknameReq req;
            SetUserNicknameRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("用户昵称设置请求正文反序列化失败！");
                return err_response("用户昵称设置请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.SetUserNickname(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void SetUserDescription(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            SetUserDescriptionReq req;
            SetUserDescriptionRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("用户签名设置请求正文反序列化失败！");
                return err_response("用户签名设置请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.SetUserDescription(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void SetUserPhoneNumber(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            SetUserPhoneNumberReq req;
            SetUserPhoneNumberRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("用户手机号设置请求正文反序列化失败！");
                return err_response("用户手机号设置请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.SetUserPhoneNumber(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return err_response("用户子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void GetFriendList(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 取出http请求正文，将正文进行反序列化
            GetFriendListReq req;
            GetFriendListRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("获取好友列表请求正文反序列化失败！");
                return err_response("获取好友列表请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 2. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_friend_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FriendService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetFriendList(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 好友子服务调用失败！", req.request_id());
                return err_response("好友子服务调用失败！");
            }
            // 3. 得到用户子服务的响应后，将响应内容进行序列化作为http响应正文
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        std::shared_ptr<GetUserInfoRsp> _GetUserInfo(const std::string &request_id, const std::string &uid)
        {
            GetUserInfoReq req;
            auto rsp = std::make_shared<GetUserInfoRsp>();
            req.set_request_id(request_id);
            req.set_user_id(uid);
            // 2. 将请求转发给用户子服务进行业务处理
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return std::shared_ptr<GetUserInfoRsp>();
            }
            chen_im::UserService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetUserInfo(&cntl, &req, rsp.get(), nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 用户子服务调用失败！", req.request_id());
                return std::shared_ptr<GetUserInfoRsp>();
            }
            return rsp;
        }

        void FriendAdd(const httplib::Request &request, httplib::Response &response)
        {
            // 好友申请的业务处理中，好友子服务其实只是在数据库创建了申请事件
            // 网关需要做的事情：当好友子服务将业务处理完毕后，如果处理是成功的--需要通知被申请方
            // 1. 正文的反序列化，提取关键要素：登录会话ID
            FriendAddReq req;
            FriendAddRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("申请好友请求正文反序列化失败！");
                return err_response("申请好友请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_friend_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FriendService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.FriendAdd(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 好友子服务调用失败！", req.request_id());
                return err_response("好友子服务调用失败！");
            }
            // 4. 若业务处理成功 --- 且获取被申请方长连接成功，则向被申请放进行好友申请事件通知
            //  否则就不通知，待客户端上线拉取未处理的好友申请时，会继续申请流程
            auto conn = _connections->get_connection(req.respondent_id());
            if (rsp.success() && conn)
            {
                LOG_DEBUG("找到被申请人 {} 长连接，对其进行好友申请通知", req.respondent_id());
                auto user_rsp = _GetUserInfo(req.request_id(), *uid);
                if (!user_rsp)
                {
                    LOG_ERROR("{} 获取当前客户端用户信息失败！", req.request_id());
                    return err_response("获取当前客户端用户信息失败！");
                }
                NotifyMessage notify;
                notify.set_notify_type(NotifyType::FRIEND_ADD_APPLY_NOTIFY);
                notify.mutable_friend_add_apply()->mutable_user_info()->CopyFrom(user_rsp->user_info());
                conn->send(notify.SerializeAsString(), websocketpp::frame::opcode::value::binary);
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void FriendAddProcess(const httplib::Request &request, httplib::Response &response)
        {
            // 被申请方，拉取完所有的待处理的好友申请请求，好友申请的处理流程-----
            FriendAddProcessReq req;
            FriendAddProcessRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("好友申请处理请求正文反序列化失败！");
                return err_response("好友申请处理请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            const std::optional<std::string> &uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_friend_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FriendService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.FriendAddProcess(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 好友子服务调用失败！", req.request_id());
                return err_response("好友子服务调用失败！");
            }

            if (rsp.success())
            {
                auto process_user_rsp = _GetUserInfo(req.request_id(), *uid); // 处理（接收）好友请求的一方
                if (!process_user_rsp)
                {
                    LOG_ERROR("{} 获取用户信息失败！", req.request_id());
                    return err_response("获取用户信息失败！");
                }
                auto apply_user_rsp = _GetUserInfo(req.request_id(), req.apply_user_id()); // 发起（申请）好友申请的一方
                if (!process_user_rsp)
                {
                    LOG_ERROR("{} 获取用户信息失败！", req.request_id());
                    return err_response("获取用户信息失败！");
                }
                auto process_ws_conn = _connections->get_connection(*uid);
                if (process_ws_conn)
                    LOG_DEBUG("找到处理人的长连接！");
                else
                    LOG_DEBUG("未找到处理人的长连接！");
                auto apply_ws_conn = _connections->get_connection(req.apply_user_id());
                if (apply_ws_conn)
                    LOG_DEBUG("找到申请人的长连接！");
                else
                    LOG_DEBUG("未找到申请人的长连接！");

                // 4. 将处理结果给申请人进行通知
                if (apply_ws_conn)
                {
                    NotifyMessage notify;
                    notify.set_notify_type(NotifyType::FRIEND_ADD_PROCESS_NOTIFY);
                    auto process_result = notify.mutable_friend_process_result();
                    process_result->mutable_user_info()->CopyFrom(process_user_rsp->user_info());
                    process_result->set_agree(req.agree());
                    apply_ws_conn->send(notify.SerializeAsString(),
                                     websocketpp::frame::opcode::value::binary);
                    LOG_DEBUG("对申请人进行申请处理结果通知！");
                }
                // 5. 若处理结果是同意 --- 会伴随着单聊会话的创建 -- 因此需要对双方进行会话创建的通知
                if (req.agree() && apply_ws_conn)
                { // 对申请人的通知---会话信息就是处理人信息
                    NotifyMessage notify;
                    notify.set_notify_type(NotifyType::CHAT_SESSION_CREATE_NOTIFY);
                    NotifyNewChatSession *new_chat_session = notify.mutable_new_chat_session_info();
                    new_chat_session->mutable_chat_session_info()->set_single_chat_friend_id(*uid);
                    new_chat_session->mutable_chat_session_info()->set_chat_session_id(rsp.new_session_id());
                    new_chat_session->mutable_chat_session_info()->set_chat_session_name(process_user_rsp->user_info().nickname());
                    new_chat_session->mutable_chat_session_info()->set_avatar(process_user_rsp->user_info().avatar());
                    apply_ws_conn->send(notify.SerializeAsString(), websocketpp::frame::opcode::value::binary);
                    LOG_DEBUG("对申请人客户端进行会话创建通知！");
                }
                if (req.agree() && process_ws_conn)
                { // 对处理人的通知 --- 会话信息就是申请人信息
                    NotifyMessage notify;
                    notify.set_notify_type(NotifyType::CHAT_SESSION_CREATE_NOTIFY);
                    NotifyNewChatSession *new_chat_session = notify.mutable_new_chat_session_info();
                    new_chat_session->mutable_chat_session_info()->set_single_chat_friend_id(req.apply_user_id());
                    new_chat_session->mutable_chat_session_info()->set_chat_session_id(rsp.new_session_id());
                    new_chat_session->mutable_chat_session_info()->set_chat_session_name(apply_user_rsp->user_info().nickname());
                    new_chat_session->mutable_chat_session_info()->set_avatar(apply_user_rsp->user_info().avatar());
                    process_ws_conn->send(notify.SerializeAsString(), websocketpp::frame::opcode::value::binary);
                    LOG_DEBUG("对处理人客户端进行会话创建通知！");
                }
            }
            // 6. 对客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void FriendRemove(const httplib::Request &request, httplib::Response &response)
        {
            // 1. 正文的反序列化，提取关键要素：登录会话ID
            FriendRemoveReq req;
            FriendRemoveRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("删除好友请求正文反序列化失败！");
                return err_response("删除好友请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_friend_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FriendService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.FriendRemove(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 好友子服务调用失败！", req.request_id());
                return err_response("好友子服务调用失败！");
            }
            // 4. 若业务处理成功 --- 且获取被申请方长连接成功，则向被申请放进行好友申请事件通知
            auto conn = _connections->get_connection(req.peer_id());
            if (rsp.success() && conn)
            {
                LOG_ERROR("对被删除人 {} 进行好友删除通知！", req.peer_id());
                NotifyMessage notify;
                notify.set_notify_type(NotifyType::FRIEND_REMOVE_NOTIFY);
                notify.mutable_friend_remove()->set_user_id(*uid);
                conn->send(notify.SerializeAsString(), websocketpp::frame::opcode::value::binary);
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void FriendSearch(const httplib::Request &request, httplib::Response &response)
        {
            FriendSearchReq req;
            FriendSearchRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("用户搜索请求正文反序列化失败！");
                return err_response("用户搜索请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_friend_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FriendService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.FriendSearch(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 好友子服务调用失败！", req.request_id());
                return err_response("好友子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void GetPendingFriendEventList(const httplib::Request &request, httplib::Response &response)
        {
            GetPendingFriendEventListReq req;
            GetPendingFriendEventListRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("获取待处理好友申请请求正文反序列化失败！");
                return err_response("获取待处理好友申请请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_friend_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FriendService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetPendingFriendEventList(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 好友子服务调用失败！", req.request_id());
                return err_response("好友子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void GetChatSessionList(const httplib::Request &request, httplib::Response &response)
        {
            GetChatSessionListReq req;
            GetChatSessionListRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("获取聊天会话列表请求正文反序列化失败！");
                return err_response("获取聊天会话列表请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_friend_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FriendService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetChatSessionList(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 好友子服务调用失败！", req.request_id());
                return err_response("好友子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void GetChatSessionMember(const httplib::Request &request, httplib::Response &response)
        {
            GetChatSessionMemberReq req;
            GetChatSessionMemberRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("获取聊天会话成员请求正文反序列化失败！");
                return err_response("获取聊天会话成员请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_friend_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FriendService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetChatSessionMember(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 好友子服务调用失败！", req.request_id());
                return err_response("好友子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }
        void ChatSessionCreate(const httplib::Request &request, httplib::Response &response)
        {
            ChatSessionCreateReq req;
            ChatSessionCreateRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("创建聊天会话请求正文反序列化失败！");
                return err_response("创建聊天会话请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_friend_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FriendService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.ChatSessionCreate(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 好友子服务调用失败！", req.request_id());
                return err_response("好友子服务调用失败！");
            }
            // 4. 若业务处理成功 --- 且获取被申请方长连接成功，则向被申请放进行好友申请事件通知
            if (rsp.success())
            {
                for (int i = 0; i < req.member_id_list_size(); i++)
                {
                    auto conn = _connections->get_connection(req.member_id_list(i));
                    if (!conn)
                    {
                        LOG_DEBUG("未找到群聊成员 {} 长连接", req.member_id_list(i));
                        continue;
                    }
                    NotifyMessage notify;
                    notify.set_notify_type(NotifyType::CHAT_SESSION_CREATE_NOTIFY);
                    auto chat_session = notify.mutable_new_chat_session_info();
                    chat_session->mutable_chat_session_info()->CopyFrom(rsp.chat_session_info());
                    conn->send(notify.SerializeAsString(), websocketpp::frame::opcode::value::binary);
                    LOG_DEBUG("对群聊成员 {} 进行会话创建通知", req.member_id_list(i));
                }
            }
            // 5. 向客户端进行响应
            rsp.clear_chat_session_info();
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }
        void GetHistoryMsg(const httplib::Request &request, httplib::Response &response)
        {
            GetHistoryMsgReq req;
            GetHistoryMsgRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("获取区间消息请求正文反序列化失败！");
                return err_response("获取区间消息请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_message_store_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::MsgStorageService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetHistoryMsg(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 消息存储子服务调用失败！", req.request_id());
                return err_response("消息存储子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }
        void GetRecentMsg(const httplib::Request &request, httplib::Response &response)
        {
            GetRecentMsgReq req;
            GetRecentMsgRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("获取最近消息请求正文反序列化失败！");
                return err_response("获取最近消息请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_message_store_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::MsgStorageService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetRecentMsg(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 消息存储子服务调用失败！", req.request_id());
                return err_response("消息存储子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }
        void MsgSearch(const httplib::Request &request, httplib::Response &response)
        {
            MsgSearchReq req;
            MsgSearchRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("消息搜索请求正文反序列化失败！");
                return err_response("消息搜索请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_message_store_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::MsgStorageService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.MsgSearch(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 消息存储子服务调用失败！", req.request_id());
                return err_response("消息存储子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }
        void GetSingleFile(const httplib::Request &request, httplib::Response &response)
        {
            GetSingleFileReq req;
            GetSingleFileRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("单文件下载请求正文反序列化失败！");
                return err_response("单文件下载请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_file_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FileService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetSingleFile(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 文件存储子服务调用失败！", req.request_id());
                return err_response("文件存储子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }
        void GetMultiFile(const httplib::Request &request, httplib::Response &response)
        {
            GetMultiFileReq req;
            GetMultiFileRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("单文件下载请求正文反序列化失败！");
                return err_response("单文件下载请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_file_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FileService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetMultiFile(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 文件存储子服务调用失败！", req.request_id());
                return err_response("文件存储子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }
        void PutSingleFile(const httplib::Request &request, httplib::Response &response)
        {
            PutSingleFileReq req;
            PutSingleFileRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("单文件上传请求正文反序列化失败！");
                return err_response("单文件上传请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_file_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FileService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.PutSingleFile(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 文件存储子服务调用失败！", req.request_id());
                return err_response("文件存储子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }
        void PutMultiFile(const httplib::Request &request, httplib::Response &response)
        {
            PutMultiFileReq req;
            PutMultiFileRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("批量文件上传请求正文反序列化失败！");
                return err_response("批量文件上传请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给好友子服务进行业务处理
            auto channel = _service_manager->get(_file_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::FileService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.PutMultiFile(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 文件存储子服务调用失败！", req.request_id());
                return err_response("文件存储子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }
        void SpeechRecognition(const httplib::Request &request, httplib::Response &response)
        {
            LOG_DEBUG("收到语音转文字请求！");
            SpeechRecognitionReq req;
            SpeechRecognitionRsp rsp;
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("语音识别请求正文反序列化失败！");
                return err_response("语音识别请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);

            auto channel = _service_manager->get(_speech_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::SpeechService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.SpeechRecognition(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 语音识别子服务调用失败！", req.request_id());
                return err_response("语音识别子服务调用失败！");
            }
            // 5. 向客户端进行响应
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

        void NewMessage(const httplib::Request &request, httplib::Response &response)
        {
            NewMessageReq req;
            NewMessageRsp rsp;               // 这是给客户端的响应
            GetTransmitTargetRsp target_rsp; // 这是请求“消息转发子服务”的响应
            auto err_response = [&req, &rsp, &response](const std::string &errmsg) -> void
            {
                rsp.set_success(false);
                rsp.set_errmsg(errmsg);
                response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
            };
            bool ret = req.ParseFromString(request.body);
            if (ret == false)
            {
                LOG_ERROR("新消息请求正文反序列化失败！");
                return err_response("新消息请求正文反序列化失败！");
            }
            // 2. 客户端身份识别与鉴权
            std::string ssid = req.session_id();
            auto uid = _redis_session->get_uid(ssid);
            if (!uid)
            {
                LOG_ERROR("{} 获取登录会话关联用户信息失败！", ssid);
                return err_response("获取登录会话关联用户信息失败！");
            }
            req.set_user_id(*uid);
            // 3. 将请求转发给消息转发子服务进行业务处理
            auto channel = _service_manager->get(_message_transmit_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 未找到可提供业务处理的用户子服务节点！", req.request_id());
                return err_response("未找到可提供业务处理的用户子服务节点！");
            }
            chen_im::MsgTransmitService_Stub stub(channel.get());
            brpc::Controller cntl;
            stub.GetTransmitTarget(&cntl, &req, &target_rsp, nullptr);
            if (cntl.Failed())
            {
                LOG_ERROR("{} 消息转发子服务调用失败！", req.request_id());
                return err_response("消息转发子服务调用失败！");
            }
            // 4. 若业务处理成功 --- 且获取被申请方长连接成功，则向被申请放进行新消息事件通知
            if (target_rsp.success())
            {
                for (int i = 0; i < target_rsp.target_id_list_size(); i++)
                {
                    std::string notify_uid = target_rsp.target_id_list(i);
                    if (notify_uid == *uid)
                        continue; // 不通知自己
                    auto conn = _connections->get_connection(notify_uid);
                    if (!conn)
                    {
                        continue;
                    }
                    NotifyMessage notify;
                    notify.set_notify_type(NotifyType::CHAT_MESSAGE_NOTIFY);
                    auto msg_info = notify.mutable_new_message_info();
                    msg_info->mutable_message_info()->CopyFrom(target_rsp.message());
                    conn->send(notify.SerializeAsString(), websocketpp::frame::opcode::value::binary);
                }
            }
            // 5. 向客户端进行响应
            rsp.set_request_id(req.request_id());
            rsp.set_success(target_rsp.success());
            rsp.set_errmsg(target_rsp.errmsg());
            response.set_content(rsp.SerializeAsString(), "application/x-protobuf");
        }

    private:
        Session::ptr _redis_session; // session库
        Status::ptr _redis_status;   // status库
        RedisDatabaseUtility::ptr _redis_uti; // 用于操作整个redis数据库

        // 子服务的完整名称
        std::string _user_service_name;
        std::string _file_service_name;
        std::string _speech_service_name;
        std::string _message_store_service_name;
        std::string _message_transmit_service_name;
        std::string _friend_service_name;

        ServiceManager::ptr _service_manager; // 要调用6个子服务
        Discovery::ptr _service_discoverer;

        Connection::ptr _connections;

        websocket_server_t _ws_server;
        httplib::Server _http_server;
        std::thread _http_thread;      // 一个执行流里不能有两个服务器，websocket和http都需要一个线程来执行
    };

    class GatewayServerFactory
    {
    public:
        // 构造redis客户端对象
        void make_redis_object(const std::string &host,
                               int port,
                               int db,
                               bool keep_alive)
        {
            _redis_client = RedisClientFactory::create(host, port, db, keep_alive);
        }
        // 用于构造服务发现客户端&信道管理对象
        void make_discovery_object(const std::string &reg_host,
                                   const std::string &base_service_name,
                                   const std::string &file_service_name,
                                   const std::string &speech_service_name,
                                   const std::string &message_store_service_name,
                                   const std::string &friend_service_name,
                                   const std::string &user_service_name,
                                   const std::string &message_transmit_service_name)
        {
            _file_service_name = file_service_name;
            _speech_service_name = speech_service_name;
            _message_store_service_name = message_store_service_name;
            _friend_service_name = friend_service_name;
            _user_service_name = user_service_name;
            _message_transmit_service_name = message_transmit_service_name;
            _service_manager = std::make_shared<ServiceManager>();
            _service_manager->concern(file_service_name);
            _service_manager->concern(speech_service_name);
            _service_manager->concern(message_store_service_name);
            _service_manager->concern(friend_service_name);
            _service_manager->concern(user_service_name);
            _service_manager->concern(message_transmit_service_name);
            auto put_cb = std::bind(&ServiceManager::when_service_online, _service_manager.get(), std::placeholders::_1, std::placeholders::_2);
            auto del_cb = std::bind(&ServiceManager::when_service_offline, _service_manager.get(), std::placeholders::_1, std::placeholders::_2);
            _service_discoverer = std::make_shared<Discovery>(reg_host, base_service_name, put_cb, del_cb);
        }
        void make_server_object(int websocket_port, int http_port)
        {
            _websocket_port = websocket_port;
            _http_port = http_port;
        }
        // 构造RPC服务器对象
        GatewayServer::ptr build()
        {
            if (!_redis_client)
            {
                LOG_ERROR("还未初始化Redis客户端模块！");
                abort();
            }
            if (!_service_discoverer)
            {
                LOG_ERROR("还未初始化服务发现模块！");
                abort();
            }
            if (!_service_manager)
            {
                LOG_ERROR("还未初始化信道管理模块！");
                abort();
            }
            GatewayServer::ptr server = std::make_shared<GatewayServer>(
                _websocket_port, _http_port, _redis_client, _service_manager,
                _service_discoverer, _user_service_name, _file_service_name,
                _speech_service_name, _message_store_service_name,
                _message_transmit_service_name, _friend_service_name);
            return server;
        }

    private:
        int _websocket_port;
        int _http_port;

        std::shared_ptr<sw::redis::Redis> _redis_client;

        std::string _file_service_name;
        std::string _speech_service_name;
        std::string _message_store_service_name;
        std::string _friend_service_name;
        std::string _user_service_name;
        std::string _message_transmit_service_name;
        ServiceManager::ptr _service_manager;
        Discovery::ptr _service_discoverer;
    };
}