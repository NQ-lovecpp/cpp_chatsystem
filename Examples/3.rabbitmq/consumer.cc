/**
 *  @author czw
 */

/**
 *  Dependencies
 */
#include <ev.h>
#include <amqpcpp.h>
#include <amqpcpp/libev.h>
#include <openssl/ssl.h>
#include <openssl/opensslv.h>
#include <amqpcpp/message.h>

#include <functional>
#include <gflags/gflags.h>

#include "../../Common/logger.hpp"
#include "../../Common/rabbitmq.hpp"

// log
DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace, "发布模式下，日志等级和刷新时机");


// mq
DEFINE_string(user, "chen", "rabbitmq的用户名");
DEFINE_string(password, "czhuowen", "rabbitmq的密码");
DEFINE_string(rabbitmq_host, "127.0.0.1:5672", "rabbitmq的服务器地址");



void my_cb(const char *msg, size_t size) {
    LOG_INFO("consumer收到消息：{}", msg);
}

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    // 定义一个客户端
    MQClient rabbit_client(FLAGS_user, FLAGS_password, FLAGS_rabbitmq_host);
    rabbit_client.declear_all_components("exchange1", "queue1");
    rabbit_client.consume_message("queue1", "consume-tag", my_cb);

    std::this_thread::sleep_for(std::chrono::seconds(2));
    return 0;
}