// 启动一个brpc服务器并注册rpc调用逻辑
// 不仅注册了服务，还提供了服务
#include "../Common/etcd.hpp"
#include "../Common/logger.hpp"
#include "main.pb.h"
#include <gflags/gflags.h>
#include <brpc/server.h>
#include <butil/logging.h>
#include <thread>

// log
DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace, "发布模式下，日志等级和刷新时机");

// etcd
DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(instance_name, "/echo/instance_1", "当前实例名称");

// 开放的端口理应一致
DEFINE_string(access_host, "127.0.0.1:7777", "当前实例的外部访问地址(对外宣告的)");
DEFINE_uint32(listen_port, 7777, "Rpc服务器监听端口(实际开放的)");


// 创建子类，继承于EchoService创建一个子类，并实现rpc调用
class EchoServiceImpl : public example::EchoService 
{
private:
    /* data */
public:
    virtual void Echo(::google::protobuf::RpcController* controller,
                       const ::example::EchoRequest* request,
                       ::example::EchoResponse* response,
                       ::google::protobuf::Closure* done)
    {
        // 把Closure指针管理起来
        brpc::ClosureGuard closure_guard(done);

        // 处理业务
        std::cout << "处理业务中..." << std::endl;
        std::cout << "收到消息：" << request->message() << std::endl;
        std::string ret = request->message() + "，这是响应!";
        response->set_message(ret);

        // done->Run(); 不需要显式run了，因为closureguard析构的时候自动run了
    }
    EchoServiceImpl() {}
    ~EchoServiceImpl() {}
};


int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    //服务端改造思想
    //1.构造Echo服务
    //2.搭建Rpc服务器
    //3.运行Rpc服务
    //4.注册服务


    // 1. 关闭brpc的日志输出
    logging::LoggingSettings settings;
    settings.logging_dest = logging::LoggingDestination::LOG_TO_NONE;
    logging::InitLogging(settings);

    // 2. 构造服务器对象
    brpc::Server server;

    // 3. 向brpc服务器对象中，新增EchoService服务
    EchoServiceImpl echo_service;
    int ret = server.AddService(&echo_service, brpc::ServiceOwnership::SERVER_DOESNT_OWN_SERVICE); // service是局部变量，不需要被server占有
    if(ret == -1) {
        std::cerr << "添加服务失败" << std::endl;
        return -1;
    }
    brpc::ServerOptions options;
    options.idle_timeout_sec = -1; // 连接空闲超时事件，超时后连接被关闭
    options.num_threads = 1; // io线程数量

    // 4. 启动brpc服务器
    ret = server.Start(FLAGS_listen_port, &options);
    if(ret == -1) {
        std::cerr << "服务启动失败" << std::endl;
        return -1;
    }

    // 5. 向etcd注册键值对 <服务名称:url>
    std::shared_ptr<Registry> rclient = std::make_shared<Registry>(FLAGS_etcd_host);
    rclient->registry(FLAGS_base_service + FLAGS_instance_name, FLAGS_access_host);

    // 6. 等待运行结束
    server.RunUntilAskedToQuit();

    // std::this_thread::sleep_for(std::chrono::seconds(600));
    return 0;
}
