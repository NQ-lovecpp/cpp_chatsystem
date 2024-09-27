// 
#pragma once
#include <brpc/server.h>
#include <butil/logging.h>

#include "es_user_CRUD.hpp"         // es数据管理客户端封装
#include "mysql_message.hpp"        // mysql数据管理客户端封装
#include "etcd.hpp"                 // 服务注册模块封装
#include "logger.hpp"               // 日志模块封装
#include "utility.hpp"              // 基础工具接口
#include "rpc_service_manager.hpp"  // 信道管理模块封装
#include "rabbitmq.hpp"

#include "message_storage.pb.h" // protobuf框架代码
#include "base.pb.h"            // protobuf框架代码
#include "file.pb.h"            // protobuf框架代码
#include "user.pb.h"            // protobuf框架代码

namespace chen_im
{
    class MessageServiceImpl : public chen_im::MsgStorageService
    {    
    private:
        ESMessage::ptr _es_message;              // es的消息表
        MessageTable::ptr _mysql_message_table;  // mysql的user表

        // 下面是rpc调用客户端相关
        std::string _user_service_name;          // 用户子服务名称
        std::string _file_service_name;          // 文件子服务名称
        ServiceManager::ptr _service_manager;    // 服务管理对象

    public:
        MessageServiceImpl(const std::shared_ptr<elasticlient::Client> &es_client,
                           const std::shared_ptr<odb::mysql::database> &mysql_client,
                           const ServiceManager::ptr &channel_manager,
                           const std::string &file_service_name,
                           const std::string &user_service_name) 
            :_es_message(std::make_shared<ESMessage>(es_client)), 
            _mysql_message_table(std::make_shared<MessageTable>(mysql_client)), 
            _file_service_name(file_service_name), 
            _user_service_name(user_service_name), 
            _service_manager(channel_manager)
        {
            _es_message->create_index();
        }
        ~MessageServiceImpl() {}

        // 聊天会话的历史消息搜索功能，从“起始时间”到“结束时间”，查询mysql数据库
        virtual void GetHistoryMsg(::google::protobuf::RpcController *controller,
                                   const ::chen_im::GetHistoryMsgReq *request,
                                   ::chen_im::GetHistoryMsgRsp *response,
                                   ::google::protobuf::Closure *done) override
        {
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 1. 提取请求中的关键要素：会话ID，起始时间，结束时间
            std::string request_id = request->request_id();
            std::string chat_ssid = request->chat_session_id();
            boost::posix_time::ptime stime = boost::posix_time::from_time_t(request->start_time());
            boost::posix_time::ptime etime = boost::posix_time::from_time_t(request->over_time());

            // 2. 在数据库中，查询指定chat_session_id下，指定时间段内的所有消息(发起mysql事务)
            std::vector<chen_im::Message> msg_lists = _mysql_message_table->range(chat_ssid, stime, etime);
            if (msg_lists.empty()) 
            {
                response->set_request_id(request_id);
                response->set_success(true);
                return;
            }

            // 从mysql中获取到的消息对象中，没有文件内容，只有文件id，因此要调用文件子服务把文件正真的内容塞进去
            // 3. 统计所有文件类型消息的文件ID，并从文件子服务进行批量文件下载
            std::unordered_set<std::string> file_id_lists;
            for (const auto &msg : msg_lists)
            {
                if (msg.file_id().empty()) // 如果文件id存在的话，说明该消息是文件消息
                    continue;
                LOG_DEBUG("需要从文件管理子服务下载的文件ID： {}", msg.file_id());
                file_id_lists.insert(msg.file_id());
            }
            std::unordered_map<std::string, std::string> file_data_lists;
            bool ret = _GetFile(request_id, file_id_lists, &file_data_lists);
            if (ret == false)
            {
                LOG_ERROR("{} 批量文件数据下载失败！", request_id);
                return err_response(request_id, "批量文件数据下载失败!");
            }



            // 从mysql中获取到的消息对象中，没有用户信息，只有用户id，
            // 而响应体应当填充UserInfo字段，UserInfo是完整的用户信息，如下：

            // //消息结构
            // message MessageInfo {
            //     string message_id = 1;//消息ID
            //     string chat_session_id = 2;//消息所属聊天会话ID
            //     int64 timestamp = 3;//消息产生时间
            //     UserInfo sender = 4;//消息发送者信息
            //     MessageContent message = 5;
            // }

            // //用户信息结构
            // message UserInfo {
            //     string user_id = 1;//用户ID
            //     string nickname = 2;//昵称
            //     string description = 3;//个人签名/描述
            //     string phone = 4; //绑定手机号
            //     bytes  avatar = 5;//头像照片，文件内容使用二进制
            // }

            // 4. 统计所有消息的发送者用户ID，从用户子服务进行批量用户信息获取
            //（本质上是先把数据准备好，因为后面要把完整的一个个的用户信息填充到响应体里的）
            std::unordered_set<std::string> user_id_lists;
            for (const auto &msg : msg_lists)
            {
                user_id_lists.insert(msg.user_id());
            }
            std::unordered_map<std::string, UserInfo> user_lists;
            ret = _GetUser(request_id, user_id_lists, &user_lists);
            if (ret == false)
            {
                LOG_ERROR("{} 批量用户数据获取失败！", request_id);
                return err_response(request_id, "批量用户数据获取失败!");
            }

            // 5. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
            for (const auto &msg : msg_lists) // 逐个地把消息元信息 + 文件内容 + 用户信息
            {
                auto message_info = response->add_msg_list();
                message_info->set_message_id(msg.message_id());
                message_info->set_chat_session_id(msg.session_id());
                message_info->set_timestamp(boost::posix_time::to_time_t(msg.create_time()));
                message_info->mutable_sender()->CopyFrom(user_lists[msg.user_id()]); // 含义是：要填充sender字段，所以调用mutable_sender()，上面的user_lists已经获取了从id到UserInfo的映射，所以使用当前遍历到的msg中的userid作为key去拿到对应的UserInfo
                switch (msg.message_type())
                {
                case MessageType::STRING:
                    message_info->mutable_message()->set_message_type(MessageType::STRING);
                    message_info->mutable_message()->mutable_string_message()->set_content(msg.content());
                    break;
                case MessageType::IMAGE:
                    message_info->mutable_message()->set_message_type(MessageType::IMAGE);
                    message_info->mutable_message()->mutable_image_message()->set_file_id(msg.file_id());
                    message_info->mutable_message()->mutable_image_message()->set_image_content(file_data_lists[msg.file_id()]);
                    break;
                case MessageType::FILE:
                    message_info->mutable_message()->set_message_type(MessageType::FILE);
                    message_info->mutable_message()->mutable_file_message()->set_file_id(msg.file_id());
                    message_info->mutable_message()->mutable_file_message()->set_file_size(msg.file_size());
                    message_info->mutable_message()->mutable_file_message()->set_file_name(msg.file_name());
                    message_info->mutable_message()->mutable_file_message()->set_file_contents(file_data_lists[msg.file_id()]);
                    break;
                case MessageType::SPEECH:
                    message_info->mutable_message()->set_message_type(MessageType::SPEECH);
                    message_info->mutable_message()->mutable_speech_message()->set_file_id(msg.file_id());
                    message_info->mutable_message()->mutable_speech_message()->set_file_contents(file_data_lists[msg.file_id()]);
                    break;
                default:
                    LOG_ERROR("消息类型错误！！");
                    return;
                }
            }
            return;
        }

        // 获取最近消息，即聊天框里要显示的消息
        virtual void GetRecentMsg(::google::protobuf::RpcController *controller,
                                  const ::chen_im::GetRecentMsgReq *request,
                                  ::chen_im::GetRecentMsgRsp *response,
                                  ::google::protobuf::Closure *done) override
        {
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 1. 提取请求中的关键要素：请求ID，会话ID，要获取的消息数量
            std::string request_id = request->request_id();
            std::string chat_ssid = request->chat_session_id();
            int msg_count = request->msg_count();
            // 2. 从数据库，获取最近的消息元信息
            auto msg_lists = _mysql_message_table->recent(chat_ssid, msg_count);
            if (msg_lists.empty())
            {
                response->set_request_id(request_id);
                response->set_success(true);
                return;
            }
            // 3. 统计所有消息中文件类型消息的文件ID列表，从文件子服务下载文件
            std::unordered_set<std::string> file_id_lists;
            for (const auto &msg : msg_lists)
            {
                if (msg.file_id().empty())
                    continue;
                LOG_DEBUG("需要下载的文件ID: {}", msg.file_id());
                file_id_lists.insert(msg.file_id());
            }
            std::unordered_map<std::string, std::string> file_data_lists;
            bool ret = _GetFile(request_id, file_id_lists, &file_data_lists);
            if (ret == false)
            {
                LOG_ERROR("{} 批量文件数据下载失败！", request_id);
                return err_response(request_id, "批量文件数据下载失败!");
            }
            // 4. 统计所有消息的发送者用户ID，从用户子服务进行批量用户信息获取
            std::unordered_set<std::string> user_id_lists;
            for (const auto &msg : msg_lists)
            {
                user_id_lists.insert(msg.user_id());
            }
            std::unordered_map<std::string, UserInfo> user_lists;
            ret = _GetUser(request_id, user_id_lists, &user_lists);
            if (ret == false)
            {
                LOG_ERROR("{} 批量用户数据获取失败！", request_id);
                return err_response(request_id, "批量用户数据获取失败!");
            }
            // 5. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
            for (const auto &msg : msg_lists)
            {
                auto message_info = response->add_msg_list();
                message_info->set_message_id(msg.message_id());
                message_info->set_chat_session_id(msg.session_id());
                message_info->set_timestamp(boost::posix_time::to_time_t(msg.create_time()));
                message_info->mutable_sender()->CopyFrom(user_lists[msg.user_id()]);
                switch (msg.message_type())
                {
                case MessageType::STRING:
                    message_info->mutable_message()->set_message_type(MessageType::STRING);
                    message_info->mutable_message()->mutable_string_message()->set_content(msg.content());
                    break;
                case MessageType::IMAGE:
                    message_info->mutable_message()->set_message_type(MessageType::IMAGE);
                    message_info->mutable_message()->mutable_image_message()->set_file_id(msg.file_id());
                    message_info->mutable_message()->mutable_image_message()->set_image_content(file_data_lists[msg.file_id()]);
                    break;
                case MessageType::FILE:
                    message_info->mutable_message()->set_message_type(MessageType::FILE);
                    message_info->mutable_message()->mutable_file_message()->set_file_id(msg.file_id());
                    message_info->mutable_message()->mutable_file_message()->set_file_size(msg.file_size());
                    message_info->mutable_message()->mutable_file_message()->set_file_name(msg.file_name());
                    message_info->mutable_message()->mutable_file_message()->set_file_contents(file_data_lists[msg.file_id()]);
                    break;
                case MessageType::SPEECH:
                    message_info->mutable_message()->set_message_type(MessageType::SPEECH);
                    message_info->mutable_message()->mutable_speech_message()->set_file_id(msg.file_id());
                    message_info->mutable_message()->mutable_speech_message()->set_file_contents(file_data_lists[msg.file_id()]);
                    break;
                default:
                    LOG_ERROR("消息类型错误！！");
                    return;
                }
            }
            return;
        }
        
        // 消息的关键字搜索
        virtual void MsgSearch(::google::protobuf::RpcController *controller,
                               const ::chen_im::MsgSearchReq *request,
                               ::chen_im::MsgSearchRsp *response,
                               ::google::protobuf::Closure *done) override
        {
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 关键字的消息搜索只针对文本消息，所以得到消息元数据 + 用户信息后，就可以组织响应体了
            // 1. 从请求中提取关键要素：请求ID，会话ID, 关键字
            std::string request_id = request->request_id();
            std::string chat_ssid = request->chat_session_id();
            std::string keyword = request->search_key();
            // 2. 从ES搜索引擎中进行关键字消息搜索，得到消息列表
            auto msg_lists = _es_message->search(keyword, chat_ssid);
            if (msg_lists.empty())
            {
                response->set_request_id(request_id);
                response->set_success(true);
                return;
            }
            // 3. 组织所有消息的用户ID，从用户子服务获取用户信息
            std::unordered_set<std::string> user_id_lists;
            for (const auto &msg : msg_lists)
            {
                user_id_lists.insert(msg.user_id());
            }
            std::unordered_map<std::string, UserInfo> user_lists;
            bool ret = _GetUser(request_id, user_id_lists, &user_lists);
            if (ret == false)
            {
                LOG_ERROR("{} 批量用户数据获取失败！", request_id);
                return err_response(request_id, "批量用户数据获取失败!");
            }
            // 4. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
            for (const auto &msg : msg_lists)
            {
                auto message_info = response->add_msg_list();
                message_info->set_message_id(msg.message_id());
                message_info->set_chat_session_id(msg.session_id());
                message_info->set_timestamp(boost::posix_time::to_time_t(msg.create_time()));
                message_info->mutable_sender()->CopyFrom(user_lists[msg.user_id()]);
                message_info->mutable_message()->set_message_type(MessageType::STRING);
                message_info->mutable_message()->mutable_string_message()->set_content(msg.content());
            }
            return;
        }
        
        // 消息队列的消费者收到消息时的回调函数，这里涉及到了mysql与es的双写！！！
        void when_get_an_message(const char *body, size_t sz)
        {
            LOG_DEBUG("收到新消息，进行存储处理！");
            // 1. 取出序列化的消息内容，进行反序列化
            chen_im::MessageInfo message;
            bool ret = message.ParseFromArray(body, sz);
            if (ret == false)
            {
                LOG_ERROR("消息反序列化失败！");
                return;
            }
            // 2. 根据不同的消息类型进行不同的处理
            std::string file_id, file_name, content;
            int64_t file_size;
            switch (message.message().message_type())
            {
            //  2.1 如果是一个文本类型消息，取元信息存储到ES中
            case MessageType::STRING:
                content = message.message().string_message().content();
                ret = _es_message->append_message(
                    message.sender().user_id(),
                    message.message_id(),
                    message.timestamp(),
                    message.chat_session_id(),
                    content);
                if (ret == false)
                {
                    LOG_ERROR("文本消息向存储引擎进行存储失败！");
                    return;
                }
                break;
            //  2.2 如果是一个图片/语音/文件消息，则取出数据存储到文件子服务中，并获取文件ID
            case MessageType::IMAGE:
            {
                const auto &msg = message.message().image_message();
                ret = _PutFile("", msg.image_content(), msg.image_content().size(), file_id);
                if (ret == false)
                {
                    LOG_ERROR("上传图片到文件子服务失败！");
                    return;
                }
            }
            break;
            case MessageType::FILE:
            {
                const auto &msg = message.message().file_message();
                file_name = msg.file_name();
                file_size = msg.file_size();
                ret = _PutFile(file_name, msg.file_contents(), file_size, file_id);
                if (ret == false)
                {
                    LOG_ERROR("上传文件到文件子服务失败！");
                    return;
                }
            }
            break;
            case MessageType::SPEECH:
            {
                const auto &msg = message.message().speech_message();
                ret = _PutFile("", msg.file_contents(), msg.file_contents().size(), file_id);
                if (ret == false)
                {
                    LOG_ERROR("上传语音到文件子服务失败！");
                    return;
                }
            }
            break;
            default:
                LOG_ERROR("消息类型错误！");
                return;
            }
            // 3. 提取消息的元信息，存储到mysql数据库中
            chen_im::Message msg(message.message_id(),
                                 message.chat_session_id(),
                                 message.sender().user_id(),
                                 message.message().message_type(),
                                 boost::posix_time::from_time_t(message.timestamp()));
            msg.content(content);
            msg.file_id(file_id);
            msg.file_name(file_name);
            msg.file_size(file_size);
            ret = _mysql_message_table->insert(msg);
            if (ret == false)
            {
                LOG_ERROR("向数据库插入新消息失败！");
                return;
            }
        }

    private:

        /// @brief 根据一批用户id，获取<用户id, 用户信息>
        /// @param request_id 请求id
        /// @param user_id_lists 输入型参数，一批用户id
        /// @param user_lists 输出型参数，一批<用户id, 用户信息>
        /// @return 是否成功
        bool _GetUser(const std::string &request_id,
                      const std::unordered_set<std::string> &user_id_lists,
                      std::unordered_map<std::string, UserInfo> *user_lists)
        {
            auto channel = _service_manager->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 没有可供访问的用户子服务节点！", _user_service_name);
                return false;
            }

            // 准备调用用户子服务
            UserService_Stub stub(channel.get());
            GetMultiUserInfoReq req;
            GetMultiUserInfoRsp rsp;
            req.set_request_id(request_id);
            for (const auto &id : user_id_lists)
            {
                req.add_users_id(id);
            }
            brpc::Controller cntl;
            stub.GetMultiUserInfo(&cntl, &req, &rsp, nullptr); // 真正调用
            if (cntl.Failed() == true || rsp.success() == false) {
                LOG_ERROR("用户子服务调用失败：{}！", cntl.ErrorText());
                return false;
            }
            const auto &umap = rsp.users_info();
            for (auto it = umap.begin(); it != umap.end(); ++it)
            {
                user_lists->insert(std::make_pair(it->first, it->second));
            }
            return true;
        }

        /// @brief 根据一批文件id获取<文件id, 文件内容>
        /// @param request_id 
        /// @param file_id_lists 输入型参数，表示所有想要获取的文件id
        /// @param file_data_lists 输出型参数，一批<文件id, 文件内容>的键值对
        /// @return 是否成功
        bool _GetFile(const std::string &request_id,
                      const std::unordered_set<std::string> &file_id_lists,
                      std::unordered_map<std::string, std::string> *file_data_lists)
        {
            auto service_manager = _service_manager->get(_file_service_name);
            if (!service_manager)
            {
                LOG_ERROR("没有提供文件子服务 {} 的节点！", _file_service_name);
                return false;
            }

            // 准备调用文件子服务
            FileService_Stub stub(service_manager.get());
            GetMultiFileReq req;
            GetMultiFileRsp rsp;
            req.set_request_id(request_id);
            for (const auto &fid : file_id_lists) {
                req.add_file_id_list(fid);
            }
            brpc::Controller cntl;
            stub.GetMultiFile(&cntl, &req, &rsp, nullptr); // 真正的调用
            if (cntl.Failed() == true || rsp.success() == false) {
                LOG_ERROR("文件子服务调用失败，原因：{}！", cntl.ErrorText());
                return false;
            }
            const google::protobuf::Map<std::string, chen_im::FileDownloadData> &file_map = rsp.file_data();
            for (auto it = file_map.begin(); it != file_map.end(); ++it)
            {
                file_data_lists->insert(std::make_pair(it->first, it->second.file_content()));
            }
            return true;
        }


        /// @brief 文件的上传至文件管理子服务
        /// @param filename 文件名
        /// @param body 文件内容
        /// @param fsize 文件大小
        /// @param file_id 文件id
        /// @return 
        bool _PutFile(const std::string &filename,
                      const std::string &body,
                      const int64_t fsize,
                      std::string &file_id)
        {
            
            auto channel = _service_manager->get(_file_service_name);
            if (!channel)
            {
                LOG_ERROR("{} 没有可供访问的文件子服务节点！", _file_service_name);
                return false;
            }
            FileService_Stub stub(channel.get());
            PutSingleFileReq req;
            PutSingleFileRsp rsp;
            req.mutable_file_data()->set_file_name(filename);
            req.mutable_file_data()->set_file_size(fsize);
            req.mutable_file_data()->set_file_content(body);
            brpc::Controller cntl;
            stub.PutSingleFile(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed() == true || rsp.success() == false)
            {
                LOG_ERROR("文件子服务调用失败，原因：{}！", cntl.ErrorText());
                return false;
            }
            file_id = rsp.file_info().file_id();
            return true;
        }
    };

    class MessageServer
    {
    private:
        Discovery::ptr _service_discoverer;
        Registry::ptr _registry_client;
        MQClient::ptr _mq_client;
        std::shared_ptr<elasticlient::Client> _es_client;
        std::shared_ptr<odb::mysql::database> _mysql_client;
        std::shared_ptr<brpc::Server> _rpc_server;

    public:
        using ptr = std::shared_ptr<MessageServer>;
        MessageServer(const MQClient::ptr &mq_client,
                      const Discovery::ptr service_discoverer,
                      const Registry::ptr &reg_client,
                      const std::shared_ptr<elasticlient::Client> &es_client,
                      const std::shared_ptr<odb::mysql::database> &mysql_client,
                      const std::shared_ptr<brpc::Server> &server) 
            : _mq_client(mq_client),
            _service_discoverer(service_discoverer),
            _registry_client(reg_client),
            _es_client(es_client),
            _mysql_client(mysql_client),
            _rpc_server(server) 
        {}
        
        ~MessageServer() {}
        // 搭建RPC服务器，并启动服务器
        void start()
        {
            _rpc_server->RunUntilAskedToQuit();
        }
    };

    class MessageServerFactory
    {
    private:
        Registry::ptr _registry_client;

        std::shared_ptr<elasticlient::Client> _es_client;
        std::shared_ptr<odb::mysql::database> _mysql_client;

        std::string _user_service_name;
        std::string _file_service_name;
        ServiceManager::ptr _service_manager;
        Discovery::ptr _service_discoverer;

        std::string _exchange_name;
        std::string _queue_name;
        MQClient::ptr _mq_client;
        std::shared_ptr<brpc::Server> _rpc_server;

    public:
        // 构造es客户端对象
        void make_es_object(const std::vector<std::string> host_list)
        {
            _es_client = ESClientFactory::create(host_list);
        }
        // 构造mysql客户端对象
        void make_mysql_object(
            const std::string &user,
            const std::string &pswd,
            const std::string &host,
            const std::string &db,
            const std::string &cset,
            int port,
            int conn_pool_count)
        {
            _mysql_client = ODBFactory::create(user, pswd, db, host, port, cset, conn_pool_count);
        }
        // 用于构造服务发现客户端&信道管理对象
        void make_discovery_object(const std::string &reg_host,
                                   const std::string &base_service_name,
                                   const std::string &file_service_name,
                                   const std::string &user_service_name)
        {
            _user_service_name = user_service_name;
            _file_service_name = file_service_name;
            _service_manager = std::make_shared<ServiceManager>();
            _service_manager->concern(file_service_name);
            _service_manager->concern(user_service_name);
            LOG_DEBUG("设置文件子服务为需添加管理的子服务：{}", file_service_name);
            auto put_cb = std::bind(&ServiceManager::when_service_online, _service_manager.get(), std::placeholders::_1, std::placeholders::_2);
            auto del_cb = std::bind(&ServiceManager::when_service_offline, _service_manager.get(), std::placeholders::_1, std::placeholders::_2);
            _service_discoverer = std::make_shared<Discovery>(reg_host, base_service_name, put_cb, del_cb);
        }
        // 用于构造服务注册客户端对象
        void make_registry_object(const std::string &reg_host,
                                  const std::string &service_name,
                                  const std::string &access_host)
        {
            _registry_client = std::make_shared<Registry>(reg_host);
            _registry_client->registry(service_name, access_host);
        }
        // 用于构造消息队列客户端对象
        void make_mq_object(const std::string &user,
                            const std::string &passwd,
                            const std::string &host,
                            const std::string &exchange_name,
                            const std::string &queue_name,
                            const std::string &binding_key)
        {
            _exchange_name = exchange_name;
            _queue_name = queue_name;
            _mq_client = std::make_shared<MQClient>(user, passwd, host);
            _mq_client->declear_all_components(exchange_name, queue_name, binding_key);
        }
        void make_rpc_server(uint16_t port, int32_t timeout, uint8_t num_threads)
        {
            if (!_es_client)
            {
                LOG_ERROR("还未初始化ES搜索引擎模块！");
                abort();
            }
            if (!_mysql_client)
            {
                LOG_ERROR("还未初始化Mysql数据库模块！");
                abort();
            }
            if (!_service_manager)
            {
                LOG_ERROR("还未初始化信道管理模块！");
                abort();
            }
            _rpc_server = std::make_shared<brpc::Server>();

            MessageServiceImpl *msg_service = new MessageServiceImpl(_es_client,
                                                                     _mysql_client, _service_manager, _file_service_name, _user_service_name);
            int ret = _rpc_server->AddService(msg_service,
                                              brpc::ServiceOwnership::SERVER_OWNS_SERVICE);
            if (ret == -1)
            {
                LOG_ERROR("添加Rpc服务失败！");
                abort();
            }
            brpc::ServerOptions options;
            options.idle_timeout_sec = timeout;
            options.num_threads = num_threads;
            ret = _rpc_server->Start(port, &options);
            if (ret == -1)
            {
                LOG_ERROR("rpc服务启动失败！");
                abort();
            }

            std::function<void(const char*, size_t)> callback = std::bind(&MessageServiceImpl::when_get_an_message, msg_service,
                                      std::placeholders::_1, std::placeholders::_2);
            if(!callback) {
                LOG_WARN("callback是无效的！！！");
            }
            
            // 当brpc服务器启动后再设置消息队列客户端的回调函数
            _mq_client->consume_message(_queue_name, "test-tag", callback);
        }
        // 构造RPC服务器对象
        MessageServer::ptr build()
        {
            if (!_service_discoverer)
            {
                LOG_ERROR("还未初始化服务发现模块！");
                abort();
            }
            if (!_registry_client)
            {
                LOG_ERROR("还未初始化服务注册模块！");
                abort();
            }
            if (!_rpc_server)
            {
                LOG_ERROR("还未初始化RPC服务器模块！");
                abort();
            }

            MessageServer::ptr server = std::make_shared<MessageServer>(
                _mq_client, _service_discoverer, _registry_client,
                _es_client, _mysql_client, _rpc_server);
            return server;
        }
    };
}