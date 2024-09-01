// 关心想关心的服务，调用rpc服务，是rpc的客户端
#include "../Common/etcd.hpp"
#include "../Common/logger.hpp"
#include "../Common/channel.hpp"
#include "main.pb.h"
#include <gflags/gflags.h>
#include <functional>

// log
DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace, "发布模式下，日志等级和刷新时机");

// etcd
DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(service_to_call, "/service/echo", "服务监控根目录");


int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    // 1. 先构造Rpc信道管理对象，并关心echo服务
    auto service_manager = std::make_shared<ServiceManager>();
    service_manager->concern(FLAGS_service_to_call);

    // 2. 构造服务发现对象, 先定义新增和删除时的回调
    auto put_cb = std::bind(&ServiceManager::when_service_online, service_manager.get(), std::placeholders::_1, std::placeholders::_2);
    auto del_cb = std::bind(&ServiceManager::when_service_offline, service_manager.get(), std::placeholders::_1, std::placeholders::_2);
    std::shared_ptr<Discovery> dclient = std::make_shared<Discovery>(FLAGS_etcd_host, FLAGS_base_service, put_cb, del_cb);
    
    while(true) {
        std::this_thread::sleep_for(std::chrono::seconds(1));
        // 3. 通过Rpc信道管理对象，获取提供Echo服务的信道
        auto channel = service_manager->get(FLAGS_service_to_call);
        if (!channel) {
            LOG_ERROR("获取信道失败，retry...");
            continue;
        }

        // 4. 发起Echo方法的rpc调用(同步调用)
        example::EchoService_Stub stub(channel.get());

        example::EchoRequest req;
        req.set_message("hello server, I'm client.");

        brpc::Controller ctrl;
        example::EchoResponse resp;
        stub.Echo(&ctrl, &req, &resp, nullptr); // 这是真正的调用

        if (ctrl.Failed()) 
        {
            LOG_DEBUG("调用rpc服务 {} 失败，原因：{}", FLAGS_service_to_call, ctrl.ErrorText());
        } 
        else 
        {
            LOG_DEBUG("收到同步响应：{}", resp.message());
        }
    }
    
    std::this_thread::sleep_for(std::chrono::seconds(600));
    return 0;
}
