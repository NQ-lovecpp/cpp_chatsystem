#include "etcd.hpp"
#include "es_user_CRUD.hpp"
#include "mysql_message.hpp"
#include "mysql_odb_factory.hpp"
#include "rpc_service_manager.hpp"
#include "utility.hpp"
#include <gflags/gflags.h>
#include <gtest/gtest.h>
#include <thread>
#include <boost/date_time/posix_time/posix_time.hpp>
#include "message_storage.pb.h"
#include "base.pb.h"
#include "user.pb.h"


DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(message_store_service, "/service/message_store_service", "");

DEFINE_string(es_host, "http://127.0.0.1:9200/", "es服务器URL");




chen_im::ServiceManager::ptr sm;

void init_es()
{
    auto es_client = chen_im::ESClientFactory::create({FLAGS_es_host});

    auto es_msg = std::make_shared<chen_im::ESMessage>(es_client);
    es_msg->create_index();
    es_msg->append_message("用户ID1", "消息ID1", 1723025035, "会话ID1", "吃饭了吗？");
    es_msg->append_message("用户ID2", "消息ID2", 1723025035 - 100, "会话ID1", "吃的盖浇饭！");
    es_msg->append_message("用户ID3", "消息ID3", 1723025035, "会话ID2", "吃饭了吗？");
    es_msg->append_message("用户ID4", "消息ID4", 1723025035 - 100, "会话ID2", "吃的盖浇饭！");
    
    auto res = es_msg->search("盖浇", "会话ID1");
    for (auto &u : res) {
        std::cout << "-----------------" << std::endl;
        std::cout << u.user_id() << std::endl;
        std::cout << u.message_id() << std::endl;
        std::cout << u.session_id() << std::endl;
        std::cout << boost::posix_time::to_simple_string(u.create_time()) << std::endl;
        std::cout << u.content() << std::endl;
    }
}

void init_mysql()
{
    auto db = chen_im::ODBFactory::create("chen", "Cydia4384!", "chen_im", "127.0.0.1", 3306, "utf8", 4);
    chen_im::MessageTable tb(db);
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

void range_test(const std::string &ssid, 
    const boost::posix_time::ptime &stime,
    const boost::posix_time::ptime &etime) 
{
    auto channel = sm->get(FLAGS_message_store_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::MsgStorageService_Stub stub(channel.get());
    chen_im::GetHistoryMsgReq req;
    chen_im::GetHistoryMsgRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_chat_session_id(ssid);
    req.set_start_time(boost::posix_time::to_time_t(stime));
    req.set_over_time(boost::posix_time::to_time_t(etime));
    brpc::Controller cntl;
    stub.GetHistoryMsg(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    for (int i = 0; i < rsp.msg_list_size(); i++) {
        std::cout << "-----------------------获取区间消息--------------------------\n";
        auto msg = rsp.msg_list(i);
        std::cout << msg.message_id() << std::endl;
        std::cout << msg.chat_session_id() << std::endl;
        std::cout << boost::posix_time::to_simple_string(boost::posix_time::from_time_t(msg.timestamp())) << std::endl;
        std::cout << msg.sender().user_id() << std::endl;
        std::cout << msg.sender().nickname() << std::endl;
        std::cout << msg.sender().avatar() << std::endl;
        if (msg.message().message_type() == chen_im::MessageType::STRING) {
            std::cout << "文本消息：" << msg.message().string_message().content() << std::endl;
        }else if (msg.message().message_type() == chen_im::MessageType::IMAGE) {
            std::cout << "图片消息：" << msg.message().image_message().image_content() << std::endl;
        }else if (msg.message().message_type() == chen_im::MessageType::FILE) {
            std::cout << "文件消息：" << msg.message().file_message().file_contents() << std::endl;
            std::cout << "文件名称：" << msg.message().file_message().file_name() << std::endl;
        }else if (msg.message().message_type() == chen_im::MessageType::SPEECH) {
            std::cout << "语音消息：" << msg.message().speech_message().file_contents() << std::endl;
        }else {
            std::cout << "类型错误！！\n";
        }
    }
}

void recent_test(const std::string &ssid, int count) 
{
    auto channel = sm->get(FLAGS_message_store_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::MsgStorageService_Stub stub(channel.get());
    chen_im::GetRecentMsgReq req;
    chen_im::GetRecentMsgRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_chat_session_id(ssid);
    req.set_msg_count(count);
    brpc::Controller cntl;
    stub.GetRecentMsg(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    for (int i = 0; i < rsp.msg_list_size(); i++) {
        std::cout << "----------------------获取最近消息---------------------------\n";
        auto msg = rsp.msg_list(i);
        std::cout << msg.message_id() << std::endl;
        std::cout << msg.chat_session_id() << std::endl;
        std::cout << boost::posix_time::to_simple_string(boost::posix_time::from_time_t(msg.timestamp())) << std::endl;
        std::cout << msg.sender().user_id() << std::endl;
        std::cout << msg.sender().nickname() << std::endl;
        std::cout << msg.sender().avatar() << std::endl;
        if (msg.message().message_type() == chen_im::MessageType::STRING) {
            std::cout << "文本消息：" << msg.message().string_message().content() << std::endl;
        }else if (msg.message().message_type() == chen_im::MessageType::IMAGE) {
            std::cout << "图片消息：" << msg.message().image_message().image_content() << std::endl;
        }else if (msg.message().message_type() == chen_im::MessageType::FILE) {
            std::cout << "文件消息：" << msg.message().file_message().file_contents() << std::endl;
            std::cout << "文件名称：" << msg.message().file_message().file_name() << std::endl;
        }else if (msg.message().message_type() == chen_im::MessageType::SPEECH) {
            std::cout << "语音消息：" << msg.message().speech_message().file_contents() << std::endl;
        }else {
            std::cout << "类型错误！！\n";
        }
    }
}


void search_test(const std::string &ssid, const std::string &key) 
{
    auto channel = sm->get(FLAGS_message_store_service);
    if (!channel) {
        std::cout << "获取通信信道失败！" << std::endl;
        return;
    }
    chen_im::MsgStorageService_Stub stub(channel.get());
    chen_im::MsgSearchReq req;
    chen_im::MsgSearchRsp rsp;
    req.set_request_id(chen_im::generate_uuid());
    req.set_chat_session_id(ssid);
    req.set_search_key(key);
    brpc::Controller cntl;
    stub.MsgSearch(&cntl, &req, &rsp, nullptr);
    ASSERT_FALSE(cntl.Failed());
    ASSERT_TRUE(rsp.success());
    for (int i = 0; i < rsp.msg_list_size(); i++) {
        std::cout << "----------------------关键字搜索消息---------------------------\n";
        auto msg = rsp.msg_list(i);
        std::cout << msg.message_id() << std::endl;
        std::cout << msg.chat_session_id() << std::endl;
        std::cout << boost::posix_time::to_simple_string(boost::posix_time::from_time_t(msg.timestamp())) << std::endl;
        std::cout << msg.sender().user_id() << std::endl;
        std::cout << msg.sender().nickname() << std::endl;
        std::cout << msg.sender().avatar() << std::endl;
        if (msg.message().message_type() == chen_im::MessageType::STRING) {
            std::cout << "文本消息：" << msg.message().string_message().content() << std::endl;
        }else if (msg.message().message_type() == chen_im::MessageType::IMAGE) {
            std::cout << "图片消息：" << msg.message().image_message().image_content() << std::endl;
        }else if (msg.message().message_type() == chen_im::MessageType::FILE) {
            std::cout << "文件消息：" << msg.message().file_message().file_contents() << std::endl;
            std::cout << "文件名称：" << msg.message().file_message().file_name() << std::endl;
        }else if (msg.message().message_type() == chen_im::MessageType::SPEECH) {
            std::cout << "语音消息：" << msg.message().speech_message().file_contents() << std::endl;
        }else {
            std::cout << "类型错误！！\n";
        }
    }
}

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    
    //1. 先构造Rpc信道管理对象
    sm = std::make_shared<chen_im::ServiceManager>();
    sm->concern(FLAGS_message_store_service);
    auto put_cb = std::bind(&chen_im::ServiceManager::when_service_online, sm.get(), std::placeholders::_1, std::placeholders::_2);
    auto del_cb = std::bind(&chen_im::ServiceManager::when_service_offline, sm.get(), std::placeholders::_1, std::placeholders::_2);
    //2. 构造服务发现对象
    chen_im::Discovery::ptr dclient = std::make_shared<chen_im::Discovery>(FLAGS_etcd_host, FLAGS_base_service, put_cb, del_cb);
    

    init_es();
    init_mysql();

    // boost::posix_time::ptime stime(boost::posix_time::time_from_string("2024-08-02 00:00:00"));
    // boost::posix_time::ptime etime(boost::posix_time::time_from_string("2024-08-09 00:00:00"));
    // range_test("会话ID1", stime, etime);
    // recent_test("会话ID1", 2);
    // search_test("会话ID1", "盖浇");

    std::this_thread::sleep_for(std::chrono::seconds(600));
    return 0;
}