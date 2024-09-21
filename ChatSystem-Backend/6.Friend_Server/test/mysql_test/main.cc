#include "mysql_chat_session.hpp"
#include "mysql_apply.hpp"
#include "mysql_relation.hpp"
#include <gflags/gflags.h>

DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

void r_insert_test(chen_im::RelationTable &tb) {
    tb.insert("用户ID1", "用户ID2");
    tb.insert("用户ID1", "用户ID3");
}
void r_select_test(chen_im::RelationTable &tb) {
    auto res = tb.friends("c4dc-68239a9a-0001");
    for (auto &uid:res) {
        std::cout << uid << std::endl;
    }
}
void r_remove_test(chen_im::RelationTable &tb) {
    tb.remove("用户ID2", "用户ID1");
}
 
void r_exists_test(chen_im::RelationTable &tb) {
    std::cout << tb.exists("用户ID2", "用户ID1") << std::endl;
    std::cout << tb.exists("用户ID3", "用户ID1") << std::endl;
}

void a_insert_test(chen_im::FriendApplyTable &tb) {
    chen_im::FriendApply fa1("uuid1", "用户ID1", "用户ID2");
    tb.insert(fa1);
    
    chen_im::FriendApply fa2("uuid2", "用户ID1", "用户ID3");
    tb.insert(fa2);

    chen_im::FriendApply fa3("uuid3", "用户ID2", "用户ID3");
    tb.insert(fa3);
}
void a_remove_test(chen_im::FriendApplyTable &tb) {
    tb.remove("用户ID2", "用户ID3");
}

void a_select_test(chen_im::FriendApplyTable &tb) {
    // chen_im::FriendApply fa3("uuid3", "用户ID2", "用户ID3");
    // tb.insert(fa3);

    auto res = tb.applyUsers("用户ID2");
    for (auto &uid:res) {
        std::cout << uid << std::endl;
    }
}
void a_exists_test(chen_im::FriendApplyTable &tb) {
    std::cout << tb.exists("731f-50086884-0000", "c4dc-68239a9a-0001") << std::endl;
    std::cout << tb.exists("31ab-86a1209d-0000", "c4dc-68239a9a-0001") << std::endl;
    std::cout << tb.exists("053f-04e5e4c5-0001", "c4dc-68239a9a-0001") << std::endl;
}

void c_insert_test(chen_im::ChatSessionTable &tb) {
    chen_im::ChatSession cs1("会话ID1", "会话名称1", chen_im::ChatSessionType::SINGLE);
    tb.insert(cs1);
    chen_im::ChatSession cs2("会话ID2", "会话名称2", chen_im::ChatSessionType::GROUP);
    tb.insert(cs2);
}


void c_select_test(chen_im::ChatSessionTable &tb) {
    auto res = tb.select("会话ID1");
    std::cout << res->chat_session_id() << std::endl;
    std::cout << res->chat_session_name() << std::endl;
    std::cout << (int)res->chat_session_type() << std::endl;
}

void c_single_test(chen_im::ChatSessionTable &tb) {
    auto res = tb.singleChatSession("731f-50086884-0000");
    for (auto &info : res) {
        std::cout << info.chat_session_id << std::endl;
        std::cout << info.friend_id << std::endl;
    }
}
void c_group_test(chen_im::ChatSessionTable &tb) {
    auto res = tb.groupChatSession("用户ID1");
    for (auto &info : res) {
        std::cout << info.chat_session_id << std::endl;
        std::cout << info.chat_session_name << std::endl;
    }
}
void c_remove_test(chen_im::ChatSessionTable &tb) {
    tb.remove("会话ID3");
}
void c_remove_test2(chen_im::ChatSessionTable &tb) {
    tb.remove("731f-50086884-0000", "c4dc-68239a9a-0001");
}
 

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);
    
    auto db = chen_im::ODBFactory::create("root", "123456", "127.0.0.1", "chen_im", "utf8", 0, 1);
    chen_im::RelationTable rtb(db);
    chen_im::FriendApplyTable fatb(db);
    chen_im::ChatSessionTable cstb(db);

    // r_insert_test(rtb);
    r_select_test(rtb);
    // r_remove_test(rtb);
    // r_exists_test(rtb);
    // a_insert_test(fatb);
    // a_remove_test(fatb);
    // a_select_test(fatb);
    // a_exists_test(fatb);
    // c_insert_test(cstb);
    // c_select_test(cstb);
    // c_single_test(cstb);
    // std::cout << "--------------\n";
    // c_group_test(cstb);
    // c_remove_test(cstb);
    // c_remove_test2(cstb);
    return 0;
}