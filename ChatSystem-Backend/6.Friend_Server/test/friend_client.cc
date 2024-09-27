#include "etcd.hpp"
#include "rpc_service_manager.hpp"
#include "utility.hpp"
#include <gflags/gflags.h>
#include <gtest/gtest.h>
#include <thread>
#include "friend.pb.h"


DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(friend_service, "/service/friend_service", "服务监控根目录");

std::shared_ptr<chen_im::ServiceManager> sm;

void apply_test(const std::string &uid1, const std::string &uid2) {
    auto channel = sm->get(FLAGS_friend_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::FriendService_Stub stub(channel.get());
    chen_im::FriendAddReq req;
    chen_im::FriendAddRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid1);
    req.set_respondent_id(uid2);
    brpc::Controller cntl;
    stub.FriendAdd(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
}

void get_apply_list(const std::string &uid1) {
    auto channel = sm->get(FLAGS_friend_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::FriendService_Stub stub(channel.get());
    chen_im::GetPendingFriendEventListReq req;
    chen_im::GetPendingFriendEventListRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid1);
    brpc::Controller cntl;
    stub.GetPendingFriendEventList(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    for (int i = 0; i < rsp.event_size(); i++) {
        std::cout << "---------------\n";
        std::cout << rsp.event(i).sender().user_id() << std::endl;
        std::cout << rsp.event(i).sender().nickname() << std::endl;
        std::cout << rsp.event(i).sender().avatar() << std::endl;
    }
}

void process_apply_test(const std::string &uid1, bool agree, const std::string &apply_user_id) {
    auto channel = sm->get(FLAGS_friend_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::FriendService_Stub stub(channel.get());
    chen_im::FriendAddProcessReq req;
    chen_im::FriendAddProcessRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid1);
    req.set_agree(agree);
    req.set_apply_user_id(apply_user_id);
    brpc::Controller cntl;
    stub.FriendAddProcess(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    if (agree) {
        std::cout << rsp.new_session_id() << std::endl;
    }
}

void search_test(const std::string &uid1, const std::string &key) {
    auto channel = sm->get(FLAGS_friend_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::FriendService_Stub stub(channel.get());
    chen_im::FriendSearchReq req;
    chen_im::FriendSearchRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid1);
    req.set_search_key(key);
    brpc::Controller cntl;
    stub.FriendSearch(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    for (int i = 0; i < rsp.user_info_size(); i++) {
        std::cout << "-------------------\n";
        std::cout << rsp.user_info(i).user_id() << std::endl;
        std::cout << rsp.user_info(i).nickname() << std::endl;
        std::cout << rsp.user_info(i).avatar() << std::endl;
    }
}

void friend_list_test(const std::string &uid1) {
    auto channel = sm->get(FLAGS_friend_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::FriendService_Stub stub(channel.get());
    chen_im::GetFriendListReq req;
    chen_im::GetFriendListRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid1);
    brpc::Controller cntl;
    stub.GetFriendList(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    for (int i = 0; i < rsp.friend_list_size(); i++) {
        std::cout << "-------------------\n";
        std::cout << rsp.friend_list(i).user_id() << std::endl;
        std::cout << rsp.friend_list(i).nickname() << std::endl;
        std::cout << rsp.friend_list(i).avatar() << std::endl;
    }
}


void remove_test(const std::string &uid1, const std::string &uid2) {
    auto channel = sm->get(FLAGS_friend_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::FriendService_Stub stub(channel.get());
    chen_im::FriendRemoveReq req;
    chen_im::FriendRemoveRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid1);
    req.set_peer_id(uid2);
    brpc::Controller cntl;
    stub.FriendRemove(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
}
void create_css_test(const std::string &uid1, const std::vector<std::string> &uidlist) {
    auto channel = sm->get(FLAGS_friend_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::FriendService_Stub stub(channel.get());
    chen_im::ChatSessionCreateReq req;
    chen_im::ChatSessionCreateRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid1);
    req.set_chat_session_name("快乐一家人");
    for (auto &id : uidlist) {
        req.add_member_id_list(id);
    }
    brpc::Controller cntl;
    stub.ChatSessionCreate(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    std::cout << rsp.chat_session_info().chat_session_id() << std::endl;
    std::cout << rsp.chat_session_info().chat_session_name() << std::endl;
}


void cssmember_test(const std::string &uid1, const std::string &cssid) {
    auto channel = sm->get(FLAGS_friend_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::FriendService_Stub stub(channel.get());
    chen_im::GetChatSessionMemberReq req;
    chen_im::GetChatSessionMemberRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid1);
    req.set_chat_session_id(cssid);
    brpc::Controller cntl;
    stub.GetChatSessionMember(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    for (int i = 0; i < rsp.member_info_list_size(); i++) {
        std::cout << "-------------------\n";
        std::cout << rsp.member_info_list(i).user_id() << std::endl;
        std::cout << rsp.member_info_list(i).nickname() << std::endl;
        std::cout << rsp.member_info_list(i).avatar() << std::endl;
    }
}


void csslist_test(const std::string &uid1) {
    auto channel = sm->get(FLAGS_friend_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::FriendService_Stub stub(channel.get());
    chen_im::GetChatSessionListReq req;
    chen_im::GetChatSessionListRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid1);
    brpc::Controller cntl;
    std::cout << "发送获取聊天会话列表请求！！\n";
    stub.GetChatSessionList(&cntl, &req, &rsp, nullptr);
    std::cout << "请求发送完毕1！！\n";
    ASSERT_FALSE(cntl.Failed());
    std::cout << "请求发送完毕2！！\n";
    ASSERT_TRUE(rsp.success());
    std::cout << "请求发送完毕，且成功！！\n";
    for (int i = 0; i < rsp.chat_session_info_list_size(); i++) {
        std::cout << "-------------------\n";
        std::cout << rsp.chat_session_info_list(i).single_chat_friend_id() << std::endl;
        std::cout << rsp.chat_session_info_list(i).chat_session_id() << std::endl;
        std::cout << rsp.chat_session_info_list(i).chat_session_name() << std::endl;
        std::cout << rsp.chat_session_info_list(i).avatar() << std::endl;
        std::cout << "消息内容：\n";
        std::cout << rsp.chat_session_info_list(i).prev_message().message_id() << std::endl;
        std::cout << rsp.chat_session_info_list(i).prev_message().chat_session_id() << std::endl;
        std::cout << rsp.chat_session_info_list(i).prev_message().timestamp() << std::endl;
        std::cout << rsp.chat_session_info_list(i).prev_message().sender().user_id() << std::endl;
        std::cout << rsp.chat_session_info_list(i).prev_message().sender().nickname() << std::endl;
        std::cout << rsp.chat_session_info_list(i).prev_message().sender().avatar() << std::endl;
        std::cout << rsp.chat_session_info_list(i).prev_message().message().file_message().file_name() << std::endl;
        std::cout << rsp.chat_session_info_list(i).prev_message().message().file_message().file_contents() << std::endl;
    }
}

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    
    //1. 先构造Rpc信道管理对象
    sm = std::make_shared<chen_im::ServiceManager>();
    sm->concern(FLAGS_friend_service);
    auto put_cb = std::bind(&chen_im::ServiceManager::when_service_online, sm.get(), std::placeholders::_1, std::placeholders::_2);
    auto del_cb = std::bind(&chen_im::ServiceManager::when_service_offline, sm.get(), std::placeholders::_1, std::placeholders::_2);
    //2. 构造服务发现对象
    chen_im::Discovery::ptr dclient = std::make_shared<chen_im::Discovery>(FLAGS_etcd_host, FLAGS_base_service, put_cb, del_cb);
    

    // apply_test("731f-50086884-0000", "c4dc-68239a9a-0001");
    // apply_test("31ab-86a1209d-0000", "c4dc-68239a9a-0001");
    // apply_test("053f-04e5e4c5-0001", "c4dc-68239a9a-0001");
    // get_apply_list("c4dc-68239a9a-0001");
    // process_apply_test("c4dc-68239a9a-0001", true, "731f-50086884-0000");
    // process_apply_test("c4dc-68239a9a-0001", false, "31ab-86a1209d-0000");
    // process_apply_test("c4dc-68239a9a-0001", true, "053f-04e5e4c5-0001");
    // std::cout << "**********************\n";
    // search_test("c4dc-68239a9a-0001", "猪");
    // std::cout << "++++++++++++++++++++++\n";
    // search_test("731f-50086884-0000", "猪");
    // std::cout << "======================\n";
    // search_test("31ab-86a1209d-0000", "乔治");
    // friend_list_test("c4dc-68239a9a-0001");
    // std::cout << "++++++++++++++++++++++\n";
    // friend_list_test("731f-50086884-0000");
    // std::cout << "++++++++++++++++++++++\n";
    // friend_list_test("31ab-86a1209d-0000");
    // remove_test("c4dc-68239a9a-0001", "053f-04e5e4c5-0001");
    // std::vector<std::string> uidlist = {
    //     "731f-50086884-0000", 
    //     "c4dc-68239a9a-0001",
    //     "31ab-86a1209d-0000",
    //     "053f-04e5e4c5-0001"};
    // create_css_test("731f-50086884-0000", uidlist);
    // cssmember_test("731f-50086884-0000", "36b5-edaf4987-0000");
    // std::cout << "++++++++++++++++++++++\n";
    // cssmember_test("c4dc-68239a9a-0001", "36b5-edaf4987-0000");

    csslist_test("c4dc-68239a9a-0001");
    return 0;
}