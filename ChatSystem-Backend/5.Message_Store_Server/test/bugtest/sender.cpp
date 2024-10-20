#include "base.pb.h"

#include "rabbitmq.hpp"
#include "logger.hpp"
#include <gflags/gflags.h>
#include <gtest/gtest.h>
#include <time.h>

#include <iostream>

DEFINE_string(mq_user, "chen", "");
DEFINE_string(mq_passwd, "czhuowen", "");
DEFINE_string(mq_host, "127.0.0.1:5672", "");

// 需要解决protobuf内容经过消息队列后不能正确解析的问题

// 1. 初始化mqclient
// 2. 填充并序列化MessageInfo结构
// 3. publish——message
// 4. consume——message
// 5. 取出消息并反序列化


int main(int argc, char *argv[])
{
    chen_im::init_logger(false, "null", spdlog::level::level_enum::trace);
    gflags::ParseCommandLineFlags(&argc, &argv, true);


    // 1. 初始化mqclient
    chen_im::MQClient mq_client("chen", "czhuowen", "127.0.0.1:5672");
    mq_client.declear_all_components("bug_testing_1", "bug_queue", "routing_key");

    // 2. 填充并序列化MessageInfo结构
    chen_im::MessageInfo msg_info;
    msg_info.set_message_id("message_11111");
    msg_info.set_chat_session_id("session_id_1234");
    msg_info.set_timestamp(time(nullptr));

    auto msg_info_sender = msg_info.mutable_sender();
         msg_info_sender->set_user_id("1234");
         msg_info_sender->set_nickname("name");
         msg_info_sender->set_description("hello world");
         msg_info_sender->set_phone("123455643523");
         msg_info_sender->set_avatar("this is an avatar");
    
    auto msg_info_message = msg_info.mutable_message();
         msg_info_message->set_message_type(chen_im::MessageType::STRING);
         auto msg_str_msg = msg_info_message->mutable_string_message();
         msg_str_msg->set_content("我是消息本体");

    std::string msg_info_serialized(msg_info.SerializeAsString());

    // 3. publish——message
    std::this_thread::sleep_for(std::chrono::seconds(1));

    try {
        bool ret = mq_client.publish_message("bug_testing_1", msg_info_serialized, "routing_key");  
        if(!ret) {
            LOG_ERROR("发送消息失败");
        } else {
            LOG_INFO("发送消息成功！");
        }
    } catch (const std::exception& e) {
        LOG_ERROR("消息解析过程中出现异常: {}", e.what());
    }

    std::this_thread::sleep_for(std::chrono::seconds(500));
    return 0;
}

