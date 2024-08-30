#include "../Common/etcd.hpp"
#include "../Common/logger.hpp"
#include <gflags/gflags.h>

// log
DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace, "发布模式下，日志等级和刷新时机");

// etcd
DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");


void online(std::string_view service_name, std::string_view service_host)
{
    LOG_DEBUG("新服务{}在{}上，上线了", service_name, service_host);
}

void offline(std::string_view service_name, std::string_view service_host)
{
    LOG_DEBUG("新服务{}在{}上，下线了", service_name, service_host);
}

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    std::shared_ptr<Discovery> dclient = std::make_shared<Discovery>(FLAGS_etcd_host, FLAGS_base_service, online, offline);


    std::this_thread::sleep_for(std::chrono::seconds(600));
    return 0;
}
