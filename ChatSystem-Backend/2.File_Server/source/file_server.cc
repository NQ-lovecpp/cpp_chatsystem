//按照流程完成服务器的搭建
//1. 参数解析
//2. 日志初始化
//3. 构造服务器对象，启动服务器
#include "file_server.hpp"


// log
DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace, "发布模式下，日志等级和刷新时机");

// etcd
DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(instance_name, "/file_service/instance1", "当前实例名称");

// 宣告的和实际开放的端口理应一致
DEFINE_string(access_host, "127.0.0.1:10002", "当前实例的外部访问地址(对外宣告的)"); // TODO：试一下公网和内网IP
DEFINE_uint32(rpc_listen_port, 10002, "Rpc服务器监听端口(实际开放的)");

// brpc
DEFINE_int32(rpc_timeout, -1, "rpc调用超时时间");
DEFINE_int32(rpc_threads, 1, "rpc服务IO线程数量");

// 存储
DEFINE_string(storage_path, "./data/", "上传的文件存放的位置");

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    chen_im::FileServerFactory file_server_factory;
    file_server_factory.build_brpc_server(FLAGS_rpc_listen_port, FLAGS_rpc_timeout, FLAGS_rpc_threads, FLAGS_storage_path);
    file_server_factory.build_registry_client(FLAGS_etcd_host, FLAGS_base_service + FLAGS_instance_name, FLAGS_access_host);
    auto file_server = file_server_factory.build();
    
    file_server->run();
    return 0;
}