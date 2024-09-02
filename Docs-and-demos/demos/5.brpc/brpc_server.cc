#include <brpc/server.h>
#include <butil/logging.h>
#include "./main.pb.h"

// 1. 创建子类，继承于EchoService创建一个子类，并实现rpc调用
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
        // ~ClosureGuard() {
        // if (_done) {
        //     _done->Run();
        // }
    }
    EchoServiceImpl() {}
    ~EchoServiceImpl() {}
};



int main(int argc, char *argv[])
{
    // 关闭brpc的日志输出
    logging::LoggingSettings settings;
    settings.logging_dest = logging::LoggingDestination::LOG_TO_NONE;
    logging::InitLogging(settings);

    // 2. 构造服务器对象
    brpc::Server server;
    // 3. 向服务器对象中，新增EchoService服务
    EchoServiceImpl echo_service;
    int ret = server.AddService(&echo_service, brpc::ServiceOwnership::SERVER_DOESNT_OWN_SERVICE); // service是局部变量，不需要被server占有
    if(ret == -1) {
        std::cerr << "添加服务失败" << std::endl;
        return -1;
    }
    brpc::ServerOptions options;
    options.idle_timeout_sec = -1; // 连接空闲超时事件，超时后连接被关闭
    options.num_threads = 1; // io线程数量

    // 4. 启动服务 
    ret = server.Start(8787, &options);
    if(ret == -1) {
        std::cerr << "服务启动失败" << std::endl;
        return -1;
    }

    // 5.等待运行结束
    server.RunUntilAskedToQuit();
    return 0;
}
