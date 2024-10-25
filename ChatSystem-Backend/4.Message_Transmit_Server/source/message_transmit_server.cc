//主要实现语音识别子服务的服务器的搭建
#include "message_transmit_server.hpp"

DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

DEFINE_string(registry_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(instance_name, "/message_transmit_service/instance", "当前实例名称");
DEFINE_string(access_host, "127.0.0.1:10004", "当前实例的外部访问地址");

DEFINE_int32(listen_port, 10004, "Rpc服务器监听端口");
DEFINE_int32(rpc_timeout, -1, "Rpc调用超时时间");
DEFINE_int32(rpc_threads, 1, "Rpc的IO线程数量");

DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(user_service, "/service/user_service", "用户管理子服务名称");

DEFINE_string(mysql_host, "127.0.0.1", "Mysql服务器访问地址");
DEFINE_string(mysql_user, "chen", "Mysql服务器访问用户名");
DEFINE_string(mysql_pswd, "Cydia4384!", "Mysql服务器访问密码");
DEFINE_string(mysql_db, "chen_im", "Mysql默认库名称");
DEFINE_string(mysql_cset, "utf8", "Mysql客户端字符集");
DEFINE_int32(mysql_access_port, 0, "Mysql服务器访问端口");
DEFINE_int32(mysql_pool_count, 4, "Mysql连接池最大连接数量");

DEFINE_string(mq_user, "chen", "消息队列服务器访问用户名");
DEFINE_string(mq_pswd, "czhuowen", "消息队列服务器访问密码");
DEFINE_string(mq_host, "127.0.0.1:5672", "消息队列服务器访问地址");
DEFINE_string(mq_msg_exchange, "msg_exchange", "持久化消息的发布交换机名称");
DEFINE_string(mq_msg_queue, "msg_queue", "持久化消息的发布队列名称");
DEFINE_string(mq_msg_binding_key, "msg_queue", "持久化消息的发布队列名称");


int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    chen_im::TransmiteServerFactory tsb;
    tsb.make_mq_object(FLAGS_mq_user, FLAGS_mq_pswd, FLAGS_mq_host,
        FLAGS_mq_msg_exchange, FLAGS_mq_msg_queue, FLAGS_mq_msg_binding_key);
    tsb.make_mysql_object(FLAGS_mysql_user, FLAGS_mysql_pswd, FLAGS_mysql_host, 
        FLAGS_mysql_db, FLAGS_mysql_cset, FLAGS_mysql_access_port, FLAGS_mysql_pool_count);
    tsb.make_discovery_object(FLAGS_registry_host, FLAGS_base_service, FLAGS_user_service);
    tsb.make_rpc_server(FLAGS_listen_port, FLAGS_rpc_timeout, FLAGS_rpc_threads);
    tsb.make_registry_object(FLAGS_registry_host, FLAGS_base_service + FLAGS_instance_name, FLAGS_access_host);
    auto server = tsb.build();
    server->start();
    return 0;
}