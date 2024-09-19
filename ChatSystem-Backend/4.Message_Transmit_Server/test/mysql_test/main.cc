#include "../../../common/data_mysql.hpp"
// #include "../../../odb/chat_session_member.hxx"
// #include "chat_session_member-odb.hxx"
#include <gflags/gflags.h>


DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

void append_test(chen_im::ChatSessionMemeberTable &tb) {
    chen_im::ChatSessionMember csm1("会话ID1", "用户ID1");
    tb.append(csm1);
    chen_im::ChatSessionMember csm2("会话ID1", "用户ID2");
    tb.append(csm2);
    chen_im::ChatSessionMember csm3("会话ID2", "用户ID3");
    tb.append(csm3);
}

void multi_append_test(chen_im::ChatSessionMemeberTable &tb) {
    chen_im::ChatSessionMember csm1("会话ID3", "用户ID1");
    chen_im::ChatSessionMember csm2("会话ID3", "用户ID2");
    chen_im::ChatSessionMember csm3("会话ID3", "用户ID3");
    std::vector<chen_im::ChatSessionMember> list = {csm1, csm2, csm3};
    tb.append(list);
}

void remove_test(chen_im::ChatSessionMemeberTable &tb) {
    chen_im::ChatSessionMember csm3("会话ID2", "用户ID3");
    tb.remove(csm3);
}

void ss_members(chen_im::ChatSessionMemeberTable &tb) {
    auto res = tb.members("会话ID1");
    for (auto &id : res) {
        std::cout << id << std::endl;
    }
}
void remove_all(chen_im::ChatSessionMemeberTable &tb) {
    tb.remove("会话ID3");
}


int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    auto db = chen_im::ODBFactory::create("root", "123456", "127.0.0.1", "chen_im", "utf8", 0, 1);
    
    chen_im::ChatSessionMemeberTable csmt(db);
    //append_test(csmt);
    // multi_append_test(csmt);
    // remove_test(csmt);
    // ss_members(csmt);
    remove_all(csmt);
    return 0;
}