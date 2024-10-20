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
    mq_client.declear_all_components("bug_testing_1", "bug_queue", "routing_queue");

    std::cout << "收到消息的回调函数即将设置" << std::endl;
    mq_client.consume_message("bug_queue", "consume_tag", [](const char* receive_buff, size_t buff_size) {
        chen_im::MessageInfo recieve_msg_info;
        
        // 5. 取出消息并反序列化
        bool ret = recieve_msg_info.ParseFromString(std::string(receive_buff, buff_size));
        if(!ret) {
            LOG_ERROR("反序列化失败！");
        } else {
            LOG_INFO("消息反序列化成功！");
        }
        
        LOG_INFO("msg_info.message_id: {}", recieve_msg_info.message_id());
        LOG_INFO("msg_info.chat_session_id: {}", recieve_msg_info.chat_session_id());
        LOG_INFO("timestamp: {}", recieve_msg_info.timestamp());
        LOG_INFO("sender userid: {}", recieve_msg_info.sender().user_id());
        LOG_INFO("sender nickname: {}", recieve_msg_info.sender().nickname());
        LOG_INFO("sender description: {}", recieve_msg_info.sender().description());
        LOG_INFO("sender phone: {}", recieve_msg_info.sender().phone());
        LOG_INFO("sender avatar: {}", recieve_msg_info.sender().avatar());
        LOG_INFO("message content type: {}", (int)recieve_msg_info.message().message_type());
        LOG_INFO("message content string_message content: {}", recieve_msg_info.message().string_message().content());

    });

    std::cout << "回调函数设置成功！" << std::endl;

    std::this_thread::sleep_for(std::chrono::seconds(500));
    return 0;
}