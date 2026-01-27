#include <iostream>
#include <fstream>
#include <string>
#include "base.pb.h"

int main() {
    // 读取 buglog_producer.bin 文件
    std::ifstream file("/tmp/buglog_producer.bin", std::ios::binary);
    if (!file.is_open()) {
        std::cerr << "无法打开文件" << std::endl;
        return 1;
    }
    
    std::string content((std::istreambuf_iterator<char>(file)),
                         std::istreambuf_iterator<char>());
    file.close();
    
    std::cout << "文件大小: " << content.size() << " 字节" << std::endl;
    
    // 打印十六进制
    std::cout << "十六进制内容: ";
    for (size_t i = 0; i < content.size(); i++) {
        printf("%02x ", (unsigned char)content[i]);
    }
    std::cout << std::endl;
    
    // 尝试反序列化
    chen_im::MessageInfo message;
    bool ret = message.ParseFromString(content);
    
    if (ret) {
        std::cout << "反序列化成功!" << std::endl;
        std::cout << "message_id: " << message.message_id() << std::endl;
        std::cout << "chat_session_id: " << message.chat_session_id() << std::endl;
        std::cout << "timestamp: " << message.timestamp() << std::endl;
        std::cout << "sender.user_id: " << message.sender().user_id() << std::endl;
        std::cout << "sender.nickname: " << message.sender().nickname() << std::endl;
        std::cout << "message_type: " << message.message().message_type() << std::endl;
        if (message.message().has_string_message()) {
            std::cout << "string_message.content: " << message.message().string_message().content() << std::endl;
        }
    } else {
        std::cerr << "反序列化失败!" << std::endl;
    }
    
    // 测试 ParseFromArray
    chen_im::MessageInfo message2;
    ret = message2.ParseFromArray(content.data(), content.size());
    if (ret) {
        std::cout << "ParseFromArray 成功!" << std::endl;
    } else {
        std::cerr << "ParseFromArray 失败!" << std::endl;
    }
    
    return 0;
}
