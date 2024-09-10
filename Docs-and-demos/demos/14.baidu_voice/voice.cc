#include "../../Third-party/aip-cpp-sdk-4.16.7/speech.h"


void asr(aip::Speech &client)
{
    // 无可选参数调用接口
    std::string file_content;
    aip::get_file_content("./16k.pcm", &file_content);
    // Json::Value result = client.recognize(file_content, "pcm", 16000, aip::null);

    // 极速版调用函数
    // Json::Value result = client.recognize_pro(file_content, "pcm", 16000, aip::null);

    // 如果需要覆盖或者加入参数
    std::map<std::string, std::string> options;
    options["dev_pid"] = "1537";
    Json::Value result = client.recognize(file_content, "pcm", 16000, options);

    if (result["err_no"].asInt() != 0) {
        std::cerr << result["err_msg"] << std::endl; 
        return;
    }

    std::cout << result["result"][0].asString() << std::endl;
}


int main()
{
    // 设置APPID/AK/SK
    std::string app_id = "115536313";
    std::string api_key = "uxPdTPAgRAZWoV16moQbIt1k";
    std::string secret_key = "Hg2prK8pIPxMGYWwJ97ULVd6wzUTgWkb";

    aip::Speech client(app_id, api_key, secret_key);

    asr(client);

    return 0;
}
