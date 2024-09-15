#include "voice_recognizer.hpp"  // 语音识别的封装
#include "etcd.hpp"              // 服务注册封装
#include "logger.hpp"            // 日志封装
#include "speach_server.hpp"
#include "speech_recognition.pb.h"     // protobuf框架代码

#include <brpc/server.h>
#include <gflags/gflags.h>
#include <butil/logging.h>
#include <thread>

// log
DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace, "发布模式下，日志等级和刷新时机");

// etcd
DEFINE_string(etcd_host, "http://127.0.0.1:2379", "服务注册中心地址");
DEFINE_string(base_service, "/service", "服务监控根目录");
DEFINE_string(instance_name, "/speech/recognition/instance_1", "当前实例名称");

// 宣告的和实际开放的端口理应一致
DEFINE_string(access_host, "127.0.0.1:10001", "当前实例的外部访问地址(对外宣告的)"); // TODO：试一下公网和内网IP
DEFINE_uint32(rpc_listen_port, 10001, "Rpc服务器监听端口(实际开放的)");

// brpc
DEFINE_int32(rpc_timeout, -1, "rpc调用超时时间");
DEFINE_int32(rpc_threads, 1, "rpc服务IO线程数量");

// 语音平台
DEFINE_string(app_id, "115536313", "语音平台应用ID");
DEFINE_string(api_key, "uxPdTPAgRAZWoV16moQbIt1k", "语音平台API密钥");
DEFINE_string(secret_key, "Hg2prK8pIPxMGYWwJ97ULVd6wzUTgWkb", "语音平台加密密钥");



int main(int argc,char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    init_logger(FLAGS_run_mode,  FLAGS_log_file,  FLAGS_log_level);

    // 构造SpeechServer
    chen_im::SpeechServerFactory ssf_factory;
    ssf_factory.build_voice_client(FLAGS_app_id, FLAGS_api_key, FLAGS_secret_key);
    ssf_factory.build_brpc_server(FLAGS_rpc_listen_port, FLAGS_rpc_timeout, FLAGS_rpc_threads);
    ssf_factory.build_registry_client(FLAGS_etcd_host, FLAGS_base_service + FLAGS_instance_name, FLAGS_access_host);


    auto speech_server = ssf_factory.build();
    speech_server->run();
    return 0;
}
