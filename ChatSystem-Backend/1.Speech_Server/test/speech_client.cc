// 用于测试speech_server的客户端:
//   关心想关心的服务，并调用rpc服务
#include "etcd.hpp"
#include "logger.hpp"
#include "channel.hpp"  
#include "voice_recognizer.hpp"
#include "speech_recognition.pb.h"
#include "speech.h"
#include <gflags/gflags.h>
#include <functional>

// log
DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace, "发布模式下，日志等级和刷新时机");

// etcd
DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(service_to_call, "/service/speech/recognition", "服务监控根目录");


int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    // 1. 先构造Rpc信道管理对象，并关心语音服务
    auto service_manager = std::make_shared<ServiceManager>();
    service_manager->concern(FLAGS_service_to_call);

    // 2. 构造服务发现对象, 先定义新增和删除时的回调
    auto put_cb = std::bind(&ServiceManager::when_service_online, service_manager.get(), std::placeholders::_1, std::placeholders::_2);
    auto del_cb = std::bind(&ServiceManager::when_service_offline, service_manager.get(), std::placeholders::_1, std::placeholders::_2);
    std::shared_ptr<Discovery> dclient = std::make_shared<Discovery>(FLAGS_etcd_host, FLAGS_base_service, put_cb, del_cb);
    
    // 3. 通过Rpc信道管理对象，获取提供Echo服务的信道
    auto channel = service_manager->get(FLAGS_service_to_call);
    if (!channel) {
        LOG_ERROR("获取 {} 的brpc服务信道失败，retry...", FLAGS_service_to_call);
        abort();
    }

    // 4. 加载语音文件
    std::string file_content;
    aip::get_file_content("./16k.pcm", &file_content);

    // 5. 发起Echo方法的rpc调用(同步调用)
    chen_im::SpeechService_Stub stub(channel.get());

    chen_im::SpeechRecognitionReq req;
    req.set_speech_content(file_content);
    req.set_request_id("111111");
    std::cout << file_content.size() << std::endl;


    auto ctrl = new brpc::Controller;
    ctrl->set_timeout_ms(10000);
    auto resp = new chen_im::SpeechRecognitionRsp;
    stub.SpeechRecognition(ctrl, &req, resp, nullptr); // 这是真正的调用


    if (ctrl->Failed() == true) {
        LOG_ERROR("Rpc调用失败：{}", ctrl->ErrorText());
        delete ctrl;
        delete resp;
        std::this_thread::sleep_for(std::chrono::seconds(1));
        return -1;
    }
    if (resp->success() == false) {
        LOG_ERROR("语音识别失败：{}", resp->errmsg());
        return -1;
    }
    LOG_DEBUG("响应id: {}", resp->request_id());
    LOG_DEBUG("响应内容: {}", resp->recognition_result());
    

    std::this_thread::sleep_for(std::chrono::seconds(600));
    return 0;
}
