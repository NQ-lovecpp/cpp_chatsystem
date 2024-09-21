#include "mysql_message.hpp"
#include <gflags/gflags.h>


DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

void insert_test(chen_im::MessageTable &tb) {
    chen_im::Message m1("消息ID1", "会话ID1", "用户ID1", 0, boost::posix_time::time_from_string("2002-01-20 23:59:59.000"));
    tb.insert(m1);
    chen_im::Message m2("消息ID2", "会话ID1", "用户ID2", 0, boost::posix_time::time_from_string("2002-01-21 23:59:59.000"));
    tb.insert(m2);
    chen_im::Message m3("消息ID3", "会话ID1", "用户ID3", 0, boost::posix_time::time_from_string("2002-01-22 23:59:59.000"));
    tb.insert(m3);

    chen_im::Message m4("消息ID4", "会话ID2", "用户ID4", 0, boost::posix_time::time_from_string("2002-01-20 23:59:59.000"));
    tb.insert(m4);
    chen_im::Message m5("消息ID5", "会话ID2", "用户ID5", 0, boost::posix_time::time_from_string("2002-01-21 23:59:59.000"));
    tb.insert(m5);
}
void remove_test(chen_im::MessageTable &tb) {
    tb.remove("会话ID2");
}

void recent_test(chen_im::MessageTable &tb) {
    auto res = tb.recent("会话ID1", 2);
    auto begin = res.rbegin();
    auto end = res.rend();
    for (; begin != end; ++begin) {
        std::cout << begin->message_id() << std::endl;
        std::cout << begin->session_id() << std::endl;
        std::cout << begin->user_id() << std::endl;
        std::cout << boost::posix_time::to_simple_string(begin->create_time()) << std::endl;
    }
}

void range_test(chen_im::MessageTable &tb) {
    boost::posix_time::ptime stime(boost::posix_time::time_from_string("2002-01-20 23:59:59.000"));
    boost::posix_time::ptime etime(boost::posix_time::time_from_string("2002-01-21 23:59:59.000"));
    auto res = tb.range("会话ID1", stime, etime);
    for (const auto &m : res) {
        std::cout << m.message_id() << std::endl;
        std::cout << m.session_id() << std::endl;
        std::cout << m.user_id() << std::endl;
        std::cout << boost::posix_time::to_simple_string(m.create_time()) << std::endl;
    }
}

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    auto db = chen_im::ODBFactory::create("root", "123456", "127.0.0.1", "chen_im", "utf8", 0, 1);
    chen_im::MessageTable tb(db);
    // insert_test(tb);
    // remove_test(tb);
    recent_test(tb);
    // range_test(tb);
    return 0;
}