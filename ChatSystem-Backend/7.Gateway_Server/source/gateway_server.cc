#include "gateway_server.hpp"
#include <csignal>

DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

DEFINE_int32(http_listen_port, 9000, "HTTP服务器监听端口");
DEFINE_int32(websocket_listen_port, 9001, "Websocket服务器监听端口");

DEFINE_string(registry_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(file_service, "/service/file_service", "文件存储子服务名称");
DEFINE_string(friend_service, "/service/friend_service", "好友管理子服务名称");
DEFINE_string(message_store_service, "/service/message_store_service", "消息存储子服务名称");
DEFINE_string(user_service, "/service/user_service", "用户管理子服务名称");
DEFINE_string(speech_service, "/service/speech/recognition", "语音识别子服务名称");
DEFINE_string(message_transmit_service, "/service/message_transmit_service", "转发管理子服务名称");

DEFINE_string(redis_host, "127.0.0.1", "Redis服务器访问地址");
DEFINE_int32(redis_port, 6379, "Redis服务器访问端口");
DEFINE_int32(redis_db, 0, "Redis默认库号");
DEFINE_bool(redis_keep_alive, true, "Redis长连接保活选项");

// Agent Server webhook（Gateway 在 Docker 内时需用 host.docker.internal 或宿主机 IP）
DEFINE_string(agent_server_host, "127.0.0.1", "Agent Server 主机（容器内访问宿主机请用 host.docker.internal）");
DEFINE_int32(agent_server_port, 8080, "Agent Server 端口");

chen_im::GatewayServer::ptr g_gateway_server = nullptr;

void signal_handler(int signum)
{
    if (g_gateway_server) {
        g_gateway_server->when_server_exit();
    }
    // 恢复默认处理并重新发送信号，确保进程正常终止
    std::signal(signum, SIG_DFL);
    std::raise(signum);
}

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    chen_im::GatewayServerFactory gsb;
    gsb.make_redis_object(FLAGS_redis_host, FLAGS_redis_port, FLAGS_redis_db, FLAGS_redis_keep_alive);
    gsb.make_discovery_object(FLAGS_registry_host, FLAGS_base_service, FLAGS_file_service,
        FLAGS_speech_service, FLAGS_message_store_service, FLAGS_friend_service, 
        FLAGS_user_service, FLAGS_message_transmit_service);
    gsb.make_server_object(FLAGS_websocket_listen_port, FLAGS_http_listen_port,
        FLAGS_agent_server_host, FLAGS_agent_server_port);
    auto server = gsb.build();
    g_gateway_server = server;

    std::signal(SIGINT, signal_handler);
    std::signal(SIGTERM, signal_handler);

    server->start();
    return 0;
}