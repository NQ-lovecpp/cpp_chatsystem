#include "etcd.hpp"
#include "rpc_service_manager.hpp"
#include "utility.hpp"
#include <gflags/gflags.h>
#include <gtest/gtest.h>
#include <thread>
#include "user.pb.h"
#include "base.pb.h"

DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(user_service, "/service/user_service", "服务监控根目录");

std::shared_ptr<chen_im::ServiceManager> _user_channels;

chen_im::UserInfo user_info;

std::string login_ssid;
std::string new_nickname = "小猪佩奇";

TEST(User_Subservice_Tests, User_Register_Test) {
    auto channel = _user_channels->get(FLAGS_user_service);//获取通信信道
    ASSERT_TRUE(channel);
    user_info.set_nickname("猪妈妈");

    chen_im::UserRegisterReq req;
    req.set_request_id(chen_im::generate_uuid());
    req.set_nickname(user_info.nickname());
    req.set_password("123456");
    chen_im::UserRegisterRsp rsp;
    brpc::Controller cntl;
    chen_im::UserService_Stub stub(channel.get());
    stub.UserRegister(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
}

TEST(User_Subservice_Tests, User_Login_Test)
{
    auto channel = _user_channels->get(FLAGS_user_service); // Obtain communication channel
    ASSERT_TRUE(channel);

    chen_im::UserLoginReq req;
    req.set_request_id(chen_im::generate_uuid());
    req.set_nickname("猪妈妈");
    req.set_password("123456");
    chen_im::UserLoginRsp rsp;
    brpc::Controller cntl;
    chen_im::UserService_Stub stub(channel.get());

    stub.UserLogin(&cntl, &req, &rsp, nullptr);
    
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    login_ssid = rsp.login_session_id();
}

// TEST(User_Subservice_Tests, User_Avatar_Setting_Test)
// {
//     auto channel = _user_channels->get(FLAGS_user_service); // Obtain communication channel
//     ASSERT_TRUE(channel);

//     chen_im::SetUserAvatarReq req;
//     req.set_request_id(chen_im::generate_uuid());
//     req.set_user_id(user_info.user_id());
//     req.set_session_id(login_ssid);
//     req.set_avatar(user_info.avatar());
//     chen_im::SetUserAvatarRsp rsp;
//     brpc::Controller cntl;
//     chen_im::UserService_Stub stub(channel.get());
//     stub.SetUserAvatar(&cntl, &req, &rsp, nullptr);
//     ASSERT_FALSE(cntl.Failed());
//     ASSERT_TRUE(rsp.success());
// }
// TEST(User_Subservice_Tests, User_Description_Setting_Test)
// {
//     auto channel = _user_channels->get(FLAGS_user_service); // Obtain communication channel
//     ASSERT_TRUE(channel);

//     chen_im::SetUserDescriptionReq req;
//     req.set_request_id(chen_im::generate_uuid());
//     req.set_user_id(user_info.user_id());
//     req.set_session_id(login_ssid);
//     req.set_description(user_info.description());
//     chen_im::SetUserDescriptionRsp rsp;
//     brpc::Controller cntl;
//     chen_im::UserService_Stub stub(channel.get());
//     stub.SetUserDescription(&cntl, &req, &rsp, nullptr);
//     ASSERT_FALSE(cntl.Failed());
//     ASSERT_TRUE(rsp.success());
// }
// TEST(User_Subservice_Tests, User_Nickname_Setting_Test)
// {
//     auto channel = _user_channels->get(FLAGS_user_service); // Obtain communication channel
//     ASSERT_TRUE(channel);

//     chen_im::SetUserNicknameReq req;
//     req.set_request_id(chen_im::generate_uuid());
//     req.set_user_id(user_info.user_id());
//     req.set_session_id(login_ssid);
//     req.set_nickname(new_nickname);
//     chen_im::SetUserNicknameRsp rsp;
//     brpc::Controller cntl;
//     chen_im::UserService_Stub stub(channel.get());
//     stub.SetUserNickname(&cntl, &req, &rsp, nullptr);
//     ASSERT_FALSE(cntl.Failed());
//     ASSERT_TRUE(rsp.success());
// }

TEST(User_Subservice_Tests, User_Info_Retrieval_Test)
{
    auto channel = _user_channels->get(FLAGS_user_service); // Obtain communication channel
    ASSERT_TRUE(channel);

    chen_im::GetUserInfoReq req;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(user_info.user_id());
    req.set_session_id(login_ssid);
    chen_im::GetUserInfoRsp rsp;
    brpc::Controller cntl;
    chen_im::UserService_Stub stub(channel.get());
    stub.GetUserInfo(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    ASSERT_EQ(user_info.user_id(), rsp.user_info().user_id());
    ASSERT_EQ(new_nickname, rsp.user_info().nickname());
    ASSERT_EQ(user_info.description(), rsp.user_info().description());
    ASSERT_EQ("", rsp.user_info().phone());
    ASSERT_EQ(user_info.avatar(), rsp.user_info().avatar());
}

void set_user_avatar(const std::string &uid, const std::string &avatar)
{
    auto channel = _user_channels->get(FLAGS_user_service); // Obtain communication channel
    ASSERT_TRUE(channel);
    chen_im::SetUserAvatarReq req;
    req.set_request_id(chen_im::generate_uuid());
    req.set_user_id(uid);
    req.set_session_id(login_ssid);
    req.set_avatar(avatar);
    chen_im::SetUserAvatarRsp rsp;
    brpc::Controller cntl;
    chen_im::UserService_Stub stub(channel.get());
    stub.SetUserAvatar(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
}

TEST(User_Subservice_Tests, Batch_User_Info_Retrieval_Test)
{
    set_user_avatar("UserID1", "Peppa Pig's Avatar Data");
    set_user_avatar("UserID2", "George Pig's Avatar Data");
    auto channel = _user_channels->get(FLAGS_user_service); // Obtain communication channel
    ASSERT_TRUE(channel);

    chen_im::GetMultiUserInfoReq req;
    req.set_request_id(chen_im::generate_uuid());
    req.add_users_id("UserID1");
    req.add_users_id("UserID2");
    req.add_users_id("34cc-e65243b7-0000");
    chen_im::GetMultiUserInfoRsp rsp;
    brpc::Controller cntl;
    chen_im::UserService_Stub stub(channel.get());
    stub.GetMultiUserInfo(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    auto users_map = rsp.mutable_users_info();
    chen_im::UserInfo fuser = (*users_map)["34cc-e65243b7-0000"];
    ASSERT_EQ(fuser.user_id(), "34cc-e65243b7-0000");
    ASSERT_EQ(fuser.nickname(), "Daddy Pig");
    ASSERT_EQ(fuser.description(), "");
    ASSERT_EQ(fuser.phone(), "");
    ASSERT_EQ(fuser.avatar(), "");

    chen_im::UserInfo puser = (*users_map)["UserID1"];
    ASSERT_EQ(puser.user_id(), "UserID1");
    ASSERT_EQ(puser.nickname(), "Peppa Pig");
    ASSERT_EQ(puser.description(), "This is a little pig");
    ASSERT_EQ(puser.phone(), "Phone Number 1");
    ASSERT_EQ(puser.avatar(), "Peppa Pig's Avatar Data");

    chen_im::UserInfo quser = (*users_map)["UserID2"];
    ASSERT_EQ(quser.user_id(), "UserID2");
    ASSERT_EQ(quser.nickname(), "George Pig");
    ASSERT_EQ(quser.description(), "This is a little baby pig");
    ASSERT_EQ(quser.phone(), "Phone Number 2");
    ASSERT_EQ(quser.avatar(), "George Pig's Avatar Data");
}

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    // 1. 先构造Rpc信道管理对象
    _user_channels = std::make_shared<chen_im::ServiceManager>();
    _user_channels->concern(FLAGS_user_service);
    auto put_cb = std::bind(&chen_im::ServiceManager::when_service_online, _user_channels.get(), std::placeholders::_1, std::placeholders::_2);
    auto del_cb = std::bind(&chen_im::ServiceManager::when_service_offline, _user_channels.get(), std::placeholders::_1, std::placeholders::_2);

    // 2. 构造服务发现对象
    std::shared_ptr<chen_im::Discovery> dclient = std::make_shared<chen_im::Discovery>(FLAGS_etcd_host, FLAGS_base_service, put_cb, del_cb);

    user_info.set_nickname("test_user");
    user_info.set_user_id("34cc-e65243b7-0000");
    user_info.set_description("这是一个美丽的猪妈妈");
    user_info.set_phone("15929917272");
    user_info.set_avatar("猪妈妈头像数据");
    testing::InitGoogleTest(&argc, argv);
    LOG_DEBUG("开始测试！");
    return RUN_ALL_TESTS();
}