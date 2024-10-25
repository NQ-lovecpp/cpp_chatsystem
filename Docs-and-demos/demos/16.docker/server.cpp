#include "httplib.h"
#include <fstream>
#include <streambuf>
#include <iostream>

#include "gflags.h" // -lgflags
#include <iostream>

//          变量名      默认值  备注
DEFINE_bool(reuse_addr, false, "是否开始网络地址重用选项");
DEFINE_int32(log_level, 1, "日志等级：1-DEBUG, 2-WARN, 3-ERROR");
DEFINE_string(log_file, "stdout", "日志输出位置设置，默认为标准输出");


std::string load_html(const std::string& filename) {
    std::ifstream file(filename);
    if (!file) {
        throw std::runtime_error("Could not open file: " + filename);
    }
    return std::string((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
}

int main(int argc, char* argv[]) {
    
    google::ParseCommandLineFlags(&argc, &argv, true);
    std::cout << "reuse: " << FLAGS_reuse_addr << std::endl;
    std::cout << "日志等级: " << FLAGS_log_level << std::endl;
    std::cout << "日志输出位置: " << FLAGS_log_file << std::endl;

    httplib::Server server;

    server.Get("/", [](const httplib::Request& req, httplib::Response& res) {
        try {
            std::string html = load_html("liarsbar.html");
            res.set_content(html, "text/html");
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content("Error loading HTML: " + std::string(e.what()), "text/plain");
        }
    });

    server.listen("0.0.0.0", 24355);
    return 0;
}
