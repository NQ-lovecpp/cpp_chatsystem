// 实现语音识别子服务
#include <brpc/server.h>
#include <butil/logging.h>

#include "etcd.hpp"   // 服务注册模块封装
#include "logger.hpp" // 日志模块封装
#include "rabbitmq.hpp"
#include "channel.hpp"
#include "utility.hpp"
#include "mysql_chat_session_member.hpp"

#include "base.pb.h"             // protobuf框架代码
#include "user.pb.h"             // protobuf框架代码
#include "message_transmit.pb.h" // protobuf框架代码

namespace chen_im
{
    class TransmiteServiceImpl : public chen_im::MsgTransmitService
    {
    public:
        TransmiteServiceImpl(const std::string &user_service_name,
                             const ServiceManager::ptr &channels,
                             const std::shared_ptr<odb::core::database> &mysql_client,
                             const std::string &exchange_name,
                             const std::string &routing_key,
                             const MQClient::ptr &mq_client) : _user_service_name(user_service_name),
                                                               _mm_channels(channels),
                                                               _mysql_session_member_table(std::make_shared<ChatSessionMemeberTable>(mysql_client)),
                                                               _exchange_name(exchange_name),
                                                               _routing_key(routing_key),
                                                               _mq_client(mq_client) {}
        ~TransmiteServiceImpl() {}
        void GetTransmitTarget(google::protobuf::RpcController *controller,
                               const ::chen_im::NewMessageReq *request,
                               ::chen_im::GetTransmitTargetRsp *response,
                               ::google::protobuf::Closure *done) override
        {
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &rid,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(rid);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 从请求中获取关键信息：用户ID，所属会话ID，消息内容
            std::string rid = request->request_id();
            std::string uid = request->user_id();
            std::string chat_ssid = request->chat_session_id();
            const MessageContent &content = request->message();
            // 进行消息组织：发送者-用户子服务获取信息，所属会话，消息内容，产生时间，消息ID
            auto channel = _mm_channels->get(_user_service_name);
            if (!channel)
            {
                LOG_ERROR("{}-{} 没有可供访问的用户子服务节点！", rid, _user_service_name);
                return err_response(rid, "没有可供访问的用户子服务节点！");
            }
            UserService_Stub stub(channel.get());
            GetUserInfoReq req;
            GetUserInfoRsp rsp;
            req.set_request_id(rid);
            req.set_user_id(uid);
            brpc::Controller cntl;
            stub.GetUserInfo(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed() == true || rsp.success() == false)
            {
                LOG_ERROR("{} - 用户子服务调用失败：{}！", request->request_id(), cntl.ErrorText());
                return err_response(request->request_id(), "用户子服务调用失败!");
            }
            MessageInfo message;
            message.set_message_id(generate_uuid());
            message.set_chat_session_id(chat_ssid);
            message.set_timestamp(time(nullptr));
            message.mutable_sender()->CopyFrom(rsp.user_info());
            message.mutable_message()->CopyFrom(content);
            // 获取消息转发客户端用户列表
            auto target_list = _mysql_session_member_table->members(chat_ssid);
            // 将封装完毕的消息，发布到消息队列，待消息存储子服务进行消息持久化
            bool ret = _mq_client->publish_message(_exchange_name, message.SerializeAsString(), _routing_key);
            if (ret == false)
            {
                LOG_ERROR("{} - 持久化消息发布失败：{}！", request->request_id(), cntl.ErrorText());
                return err_response(request->request_id(), "持久化消息发布失败：!");
            }
            // 组织响应
            response->set_request_id(rid);
            response->set_success(true);
            response->mutable_message()->CopyFrom(message);
            for (const auto &id : target_list)
            {
                response->add_target_id_list(id);
            }
        }

    private:
        // 用户子服务调用相关信息
        std::string _user_service_name;
        ServiceManager::ptr _mm_channels;

        // 聊天会话成员表的操作句柄
        ChatSessionMemeberTable::ptr _mysql_session_member_table;

        // 消息队列客户端句柄
        std::string _exchange_name;
        std::string _routing_key;
        MQClient::ptr _mq_client;
    };

    class TransmiteServer
    {
    public:
        using ptr = std::shared_ptr<TransmiteServer>;
        TransmiteServer(
            const std::shared_ptr<odb::core::database> &mysql_client,
            const Discovery::ptr discovery_client,
            const Registry::ptr &registry_client,
            const std::shared_ptr<brpc::Server> &server) : _service_discoverer(discovery_client),
                                                           _registry_client(registry_client),
                                                           _mysql_client(mysql_client),
                                                           _rpc_server(server) {}
        ~TransmiteServer() {}
        // 搭建RPC服务器，并启动服务器
        void start()
        {
            _rpc_server->RunUntilAskedToQuit();
        }

    private:
        Discovery::ptr _service_discoverer;                 // 服务发现客户端
        Registry::ptr _registry_client;                     // 服务注册客户端
        std::shared_ptr<odb::core::database> _mysql_client; // mysql数据库客户端
        std::shared_ptr<brpc::Server> _rpc_server;
    };

    class TransmiteServerBuilder
    {
    public:
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
                                   const std::string &user_service_name)
        {
            _user_service_name = user_service_name;
            _mm_channels = std::make_shared<ServiceManager>();
            _mm_channels->concern(user_service_name);
            _mm_channels->concern("/service/transmite_service");  // bug
            LOG_DEBUG("设置用户子服务为需关心的子服务：{}", user_service_name);
            auto put_cb = std::bind(&ServiceManager::when_service_online, _mm_channels.get(), std::placeholders::_1, std::placeholders::_2);
            auto del_cb = std::bind(&ServiceManager::when_service_offline, _mm_channels.get(), std::placeholders::_1, std::placeholders::_2);
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
        // 用于构造rabbitmq客户端对象
        void make_mq_object(const std::string &user,
                            const std::string &passwd,
                            const std::string &host,
                            const std::string &exchange_name,
                            const std::string &queue_name,
                            const std::string &binding_key)
        {
            _routing_key = binding_key;
            _exchange_name = exchange_name;
            _mq_client = std::make_shared<MQClient>(user, passwd, host);
            _mq_client->declear_all_components(exchange_name, queue_name, binding_key);
        }
        // 构造RPC服务器对象
        void make_rpc_server(uint16_t port, int32_t timeout, uint8_t num_threads)
        {
            if (!_mq_client)
            {
                LOG_ERROR("还未初始化消息队列客户端模块！");
                abort();
            }
            if (!_mm_channels)
            {
                LOG_ERROR("还未初始化信道管理模块！");
                abort();
            }
            if (!_mysql_client)
            {
                LOG_ERROR("还未初始化Mysql数据库模块！");
                abort();
            }

            _rpc_server = std::make_shared<brpc::Server>();

            TransmiteServiceImpl *transmite_service = new TransmiteServiceImpl(
                _user_service_name, _mm_channels, _mysql_client, _exchange_name, _routing_key, _mq_client);

            int ret = _rpc_server->AddService(transmite_service,
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
                LOG_ERROR("服务启动失败！");
                abort();
            }
        }
        TransmiteServer::ptr build()
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
            TransmiteServer::ptr server = std::make_shared<TransmiteServer>(
                _mysql_client, _service_discoverer, _registry_client, _rpc_server);
            return server;
        }

    private:
        std::string _user_service_name;
        ServiceManager::ptr _mm_channels;
        Discovery::ptr _service_discoverer;

        std::string _routing_key;
        std::string _exchange_name;
        MQClient::ptr _mq_client;

        Registry::ptr _registry_client;                     // 服务注册客户端
        std::shared_ptr<odb::core::database> _mysql_client; // mysql数据库客户端
        std::shared_ptr<brpc::Server> _rpc_server;
    };
}