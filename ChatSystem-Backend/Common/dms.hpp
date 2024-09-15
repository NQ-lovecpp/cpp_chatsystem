// 封装一个DMS客户端类：
//   1. 构造时候，传入访问密钥相关信息
//   2. 向外提供调用接口（手机号，验证码）---用于向平台发送请求
#pragma once
#include <cstdlib>
#include <iostream>
#include <memory>
#include <alibabacloud/core/AlibabaCloud.h>
#include <alibabacloud/core/CommonRequest.h>
#include <alibabacloud/core/CommonClient.h>
#include <alibabacloud/core/CommonResponse.h>

#include "logger.hpp"

namespace chen_im {

class DMSClient
{
private:
    std::unique_ptr<AlibabaCloud::CommonClient> _client;
    const std::string _access_key_id;     // 阿里云的密钥
    const std::string _access_key_secret; // 阿里云的密钥
public:
    DMSClient(const std::string &AccessKeyID, const std::string &AccessKeySecret) 
    {
        AlibabaCloud::InitializeSdk();
        AlibabaCloud::ClientConfiguration configuration("cn-shanghai");
        // specify timeout when create client.
        configuration.setConnectTimeout(1500);
        configuration.setReadTimeout(4000);

        AlibabaCloud::Credentials credential(AccessKeyID, AccessKeySecret);

        _client = std::make_unique<AlibabaCloud::CommonClient>(credential, configuration);
    }

    // 向指定手机号发送验证码
    bool send(const std::string &phone, const std::string &code)
    {
        AlibabaCloud::CommonRequest request(AlibabaCloud::CommonRequest::RequestPattern::RpcPattern);
        request.setHttpMethod(AlibabaCloud::HttpRequest::Method::Post);
        request.setDomain("dysmsapi.aliyuncs.com");
        request.setVersion("2017-05-25");
        request.setQueryParameter("Action", "SendSms");
        request.setQueryParameter("SignName", "微服务项目");
        request.setQueryParameter("TemplateCode", "SMS_472720179");
        request.setQueryParameter("PhoneNumbers", phone);
        request.setQueryParameter("TemplateParam", "{\"code\":\"" + code + "\"}");

        auto response = _client->commonResponse(request);
        if (response.isSuccess())
        {
            LOG_DEBUG("短信验证码发送成功！");
            LOG_DEBUG("返回结果: {}", response.result().payload().c_str());
            return true;
        }
        else
        {
            LOG_ERROR("短信验证码发送失败: %s", response.error().errorMessage().c_str());
            LOG_ERROR("request id: {}", response.error().requestId().c_str());
            return false;
        }
    }

    ~DMSClient() 
    {
        AlibabaCloud::ShutdownSdk();
    }
};

}