#include "../../Common/voice_recognizer.hpp"
#include "../../Common/logger.hpp"
#include <gflags/gflags.h>

DEFINE_string(app_id, "115536313", "语音平台应用ID");
DEFINE_string(api_key, "uxPdTPAgRAZWoV16moQbIt1k", "语音平台API密钥");
DEFINE_string(secret_key, "Hg2prK8pIPxMGYWwJ97ULVd6wzUTgWkb", "语音平台加密密钥");

DEFINE_bool(run_mode, false, "程序的运行模式false-调试; true-发布；");
DEFINE_string(log_file, "", "发布模式下, 用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下, 用于指定日志输出等级");


int main(int argc,char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    init_logger(FLAGS_run_mode,  FLAGS_log_file,  FLAGS_log_level);


    VoiceRecognizerClient client(FLAGS_app_id, FLAGS_api_key, FLAGS_secret_key);

    std::string file_content;
    aip::get_file_content("./16k.pcm", &file_content);
    std::string ret = client.recognize(file_content);

    if(ret.empty() == true) {
        return -1;
    }

    LOG_INFO("转文字结果：{}", ret);

    return 0;
}
