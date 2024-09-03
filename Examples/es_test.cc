#include "../Common/icsearch.hpp"
#include "../Common/logger.hpp"

#include <gflags/gflags.h>



// log
DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace, "发布模式下，日志等级和刷新时机");


int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    // 1. 构造ES客户端
    std::shared_ptr<elasticlient::Client> client(new elasticlient::Client({"http://127.0.0.1:9200/"}));

    // POST /user/_doc
    ESIndex index("test_user", "_doc", client);

    bool ret = index.append("nickname")
                   .append("phone", "keyword", "standard", true)
                   .create_and_send();

    if(ret == true) {
        LOG_INFO("向ES服务器创建了一个索引，并且服务器发来了响应，成功！");
    }

    ret = ESInsert("test_user", "_doc", client)
            .append("nickname", "张三")
            .append("phone", "23125443532")
            .insert_and_send("00001");
    if(ret == true) {
        LOG_INFO("向ES服务器创建了一个索引，并且服务器发来了响应，成功！");
    }
    
    return 0;
}