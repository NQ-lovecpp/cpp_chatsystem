//speech_server的测试客户端实现
//1. 进行服务发现--发现speech_server的服务器节点地址信息并实例化的通信信道
//2. 读取语音文件数据
//3. 发起语音识别RPC调用

#include "etcd.hpp"
#include "rpc_service_manager.hpp"
#include "utility.hpp"
#include <gflags/gflags.h>
#include <gtest/gtest.h>
#include <thread>
#include "message_transmit.pb.h"


DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(message_transmit_service, "/service/message_transmit_service", "服务监控根目录");

chen_im::ServiceManager::ptr sm;

void string_message(const std::string &uid, const std::string &sid, const std::string &msg) {
    auto channel = sm->get(FLAGS_message_transmit_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::MsgTransmitService_Stub stub(channel.get());
    chen_im::NewMessageReq req;
    chen_im::GetTransmitTargetRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid);
    req.set_chat_session_id(sid);
    req.mutable_message()->set_message_type(chen_im::MessageType::STRING);
    req.mutable_message()->mutable_string_message()->set_content(msg);
    brpc::Controller cntl;
    stub.GetTransmitTarget(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
}
void image_message(const std::string &uid, const std::string &sid, const std::string &msg) {
    auto channel = sm->get(FLAGS_message_transmit_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::MsgTransmitService_Stub stub(channel.get());
    chen_im::NewMessageReq req;
    chen_im::GetTransmitTargetRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid);
    req.set_chat_session_id(sid);
    req.mutable_message()->set_message_type(chen_im::MessageType::IMAGE);
    req.mutable_message()->mutable_image_message()->set_image_content(msg);
    brpc::Controller cntl;
    stub.GetTransmitTarget(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
}

void speech_message(const std::string &uid, const std::string &sid, const std::string &msg) {
    auto channel = sm->get(FLAGS_message_transmit_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::MsgTransmitService_Stub stub(channel.get());
    chen_im::NewMessageReq req;
    chen_im::GetTransmitTargetRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid);
    req.set_chat_session_id(sid);
    req.mutable_message()->set_message_type(chen_im::MessageType::SPEECH);
    req.mutable_message()->mutable_speech_message()->set_file_contents(msg);
    brpc::Controller cntl;
    stub.GetTransmitTarget(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
}

void file_message(const std::string &uid, const std::string &sid, 
    const std::string &filename, const std::string &content) {
    auto channel = sm->get(FLAGS_message_transmit_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::MsgTransmitService_Stub stub(channel.get());
    chen_im::NewMessageReq req;
    chen_im::GetTransmitTargetRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid);
    req.set_chat_session_id(sid);
    req.mutable_message()->set_message_type(chen_im::MessageType::FILE);
    req.mutable_message()->mutable_file_message()->set_file_contents(content);
    req.mutable_message()->mutable_file_message()->set_file_name(filename);
    req.mutable_message()->mutable_file_message()->set_file_size(content.size());
    brpc::Controller cntl;
    stub.GetTransmitTarget(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
}

TEST(case1, test1)
{
    //1. 先构造Rpc信道管理对象
    sm = std::make_shared<chen_im::ServiceManager>();
    sm->concern(FLAGS_message_transmit_service);
    sm->concern("/service/user_service");
    auto put_cb = std::bind(&chen_im::ServiceManager::when_service_online, sm.get(), std::placeholders::_1, std::placeholders::_2);
    auto del_cb = std::bind(&chen_im::ServiceManager::when_service_offline, sm.get(), std::placeholders::_1, std::placeholders::_2);
    
    //2. 构造服务发现对象
    chen_im::Discovery::ptr dclient = std::make_shared<chen_im::Discovery>(FLAGS_etcd_host, FLAGS_base_service, put_cb, del_cb);
    
    //3. 通过Rpc信道管理对象，获取提供Echo服务的信道
    string_message("uid1", "会话ID1", "吃饭了吗？");
    string_message("uid1", "会话ID1", "吃的盖浇饭！！");
    image_message("uid2", "会话ID1", "可爱表情图片数据");
    speech_message("uid2", "会话ID1", "动听猪叫声数据");
    file_message("uid1", "uid2", "猪爸爸的文件名称", "猪爸爸的文件数据");
    std::cout << "finished....." << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(600));
}

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    testing::InitGoogleTest();
    RUN_ALL_TESTS();


    return 0;
}