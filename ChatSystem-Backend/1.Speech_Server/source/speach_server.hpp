// 实现语音识别子服务
#pragma once
#include "voice_recognizer.hpp"  // 语音识别的封装
#include "etcd.hpp"              // 服务注册封装
#include "logger.hpp"            // 日志封装
#include "speech_recognition.pb.h"     // protobuf框架代码

#include <brpc/server.h>

// 1. 创建子类，继承于SpeechService创建一个子类，并实现rpc调用
namespace chen_im
{
    class SpeechServiceImpl : public chen_im::SpeechService // implementation
    {
    private:
        std::shared_ptr<VoiceRecognizerClient> _voice_client;
    public:
        SpeechServiceImpl(std::shared_ptr<VoiceRecognizerClient> &voice_client)
            :_voice_client(voice_client)
        {}
        ~SpeechServiceImpl() {}
        virtual void SpeechRecognition(::google::protobuf::RpcController* controller,
                       const ::chen_im::SpeechRecognitionReq* request,
                       ::chen_im::SpeechRecognitionRsp* response,
                       ::google::protobuf::Closure* done) override
        {
            // 把Closure指针管理起来
            brpc::ClosureGuard closure_guard(done);

            // 处理业务
            // 1. 取出请求中的语音数据
            std::string data = request->speech_content();

            // 2. 调用sdk，进行语音转文字，得到文字响应
            std::string res = _voice_client->recognize(data);

            // 3. 组织响应
            if (res.empty()) {
                LOG_ERROR("语音识别失败, request_id:{}", request->request_id());
                response->set_request_id(request->request_id());
                response->set_success(false);
                response->set_errmsg("语音识别失败了");
                return;
            } else {
                
                LOG_INFO("语音识别成功, result:{}, request_id:{}", res, request->request_id());
                response->set_request_id(request->request_id());
                response->set_success(true);
                response->set_recognition_result(res);
                return;
            }

        }
    };



    class SpeechServer
    {
    private:
        std::shared_ptr<VoiceRecognizerClient> _voice_client;    // 作为一个语音识别客户端
        std::shared_ptr<Registry>              _registry_client; // 作为注册中心的客户端
        std::shared_ptr<brpc::Server>          _brpc_server;     // 作为一个brpc服务器
    public:
        SpeechServer(const std::shared_ptr<VoiceRecognizerClient> &voice_client,   
                     const std::shared_ptr<Registry>              &registry_client, 
                     const std::shared_ptr<brpc::Server>          &brpc_server)
            :_voice_client(voice_client)
            , _registry_client(registry_client)
            , _brpc_server(brpc_server)
        {}

        ~SpeechServer() {}

        // 启动服务，就是在启动brpc服务器
        void run()
        {
            // 等待运行结束
            _brpc_server->RunUntilAskedToQuit();
        }
    };

    // SpeechServer的工厂类
    class SpeechServerFactory
    {
    private:
        std::shared_ptr<VoiceRecognizerClient> _voice_client;    // 作为一个语音识别客户端
        std::shared_ptr<Registry>              _registry_client; // 作为注册中心的客户端
        std::shared_ptr<brpc::Server>          _brpc_server;     // 作为一个brpc服务器
    public:
        // 构造一个SpeechServer智能指针
        std::shared_ptr<SpeechServer> build()
        {
            if (!_voice_client) {
                LOG_ERROR("未初始化语音服务器！");
                abort();
            }
            if (!_registry_client) {
                LOG_ERROR("未初始化注册中心客户端！");
                abort();
            }
            if (!_brpc_server) {
                LOG_ERROR("未初始化brpc服务器！");
                abort();
            }

            std::shared_ptr<SpeechServer> ret_ptr = std::make_shared<SpeechServer>(_voice_client, _registry_client, _brpc_server);
            return ret_ptr;
        }

        // 构造语音识别客户端
        void build_voice_client(const std::string &app_id, 
                                const std::string &api_key, 
                                const std::string &secret_key) 
        {
            _voice_client = std::make_shared<VoiceRecognizerClient>(app_id, api_key, secret_key);
        }

        
        /// @brief 构造注册中心的客户端
        /// @param etcd_host etcd服务器的地址
        /// @param access_host 键值对中的value，即本语音服务器实际提供服务的地址
        void build_registry_client(const std::string &etcd_host, 
                                   const std::string &service_name, 
                                   const std::string &access_host)
        {
            _registry_client = std::make_shared<Registry>(etcd_host);
            _registry_client->registry(service_name, access_host);
        }

        /// @brief 构造brpc服务器
        /// @param idle_timeout_sec 连接空闲超时事件，超时后连接被关闭
        /// @param num_threads io线程数量
        /// @param port brpc服务的端口号
        void build_brpc_server(uint16_t port, int timeout_sec, int num_threads)
        {
            _brpc_server = std::make_shared<brpc::Server>();
            auto speach_service = new chen_im::SpeechServiceImpl(_voice_client);
            int ret = _brpc_server->AddService(speach_service, brpc::ServiceOwnership::SERVER_OWNS_SERVICE); // service应当被server管理起来
            if(ret == -1) {
                LOG_ERROR("添加服务失败!");
                abort();
            }

            brpc::ServerOptions options;
            options.idle_timeout_sec = timeout_sec; 
            options.num_threads = num_threads;
            // 启动服务 
            ret = _brpc_server->Start(port, &options);
            if(ret == -1) {
                LOG_ERROR("brpc服务启动失败!");
                abort();
            }
        }


        SpeechServerFactory() {}
        ~SpeechServerFactory() {}
    };

};



