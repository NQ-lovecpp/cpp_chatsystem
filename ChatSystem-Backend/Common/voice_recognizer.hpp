// 封装出一个语音识别客户端类
// 1. 在构造函数中，输入语音识别平台的key相关信息
// 2. 提供一个语音识别的接口（输入参数就是语音数据）

#pragma once
#include "speech.h"
#include "logger.hpp"

class VoiceRecognizerClient
{
private:
    aip::Speech _client;
public:
    VoiceRecognizerClient(const std::string &app_id, 
                          const std::string &api_key, 
                          const std::string &secret_key) 
        :_client(app_id, api_key, secret_key)
    {}

    std::string recognize(const std::string &speech_data)
    {
        Json::Value result = _client.recognize(speech_data,"pcm",16000,aip::null);
        if (result["err_no"].asInt() != 0)
        {
            LOG_ERROR("语音识别失败：{}", result["err_msg"].asString());
            return std::string();
        }
        return result["result"][0].asString();
    }

    ~VoiceRecognizerClient() {}
};