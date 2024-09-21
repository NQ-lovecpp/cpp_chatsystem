#include "../../../common/data_es.hpp"
#include <gflags/gflags.h>

DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");


DEFINE_string(es_host, "http://127.0.0.1:9200/", "es服务器URL");

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    auto es_client = chen_im::ESClientFactory::create({FLAGS_es_host});

    auto es_msg = std::make_shared<chen_im::ESMessage>(es_client);
    es_msg->createIndex();
    // es_msg->appendData("用户ID1", "消息ID1", 1723025035, "会话ID1", "吃饭了吗？");
    // es_msg->appendData("用户ID2", "消息ID2", 1723025035 - 100, "会话ID1", "吃的盖浇饭！");
    // es_msg->appendData("用户ID3", "消息ID3", 1723025035, "会话ID2", "吃饭了吗？");
    // es_msg->appendData("用户ID4", "消息ID4", 1723025035 - 100, "会话ID2", "吃的盖浇饭！");
    auto res = es_msg->search("盖浇", "会话ID1");
    for (auto &u : res) {
        std::cout << "-----------------" << std::endl;
        std::cout << u.user_id() << std::endl;
        std::cout << u.message_id() << std::endl;
        std::cout << u.session_id() << std::endl;
        std::cout << boost::posix_time::to_simple_string(u.create_time()) << std::endl;
        std::cout << u.content() << std::endl;
    }
    return 0;
}