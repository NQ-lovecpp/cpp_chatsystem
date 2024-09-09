#include "../../Common/icsearch.hpp"
#include "../../Common/logger.hpp"

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

    // 2. 创建索引 POST /user/_doc
    ESIndex index("test_user", "_doc", client);

    bool ret = index.append("nickname")
                    .append("phone", "keyword", "standard", true)
                    .create_and_send();

    if(ret == true) {
        LOG_INFO("向ES服务器创建了一个索引，并且服务器发来了响应，成功！");
    } else {
        LOG_INFO("向ES服务器创建一个索引失败！");
        return -1;
    }
    
    // 3. 新增数据
    ret = ESInsert("test_user", "_doc", client)
            .append("nickname", "张三")
            .append("phone", "23125443532")
            .insert_and_send("00001");
    if(ret == false) {
        LOG_INFO("数据插入失败！");
        return -2;
    }

    // 3. 新增数据
    ret = ESInsert("test_user", "_doc", client)
            .append("nickname", "李四")
            .append("phone", "11122223333")
            .insert_and_send("00002");
    if(ret == false) {
        LOG_INFO("数据插入失败！");
        return -2;
    }

    // 3. 数据修改，依然用insert
    ret = ESInsert("test_user", "_doc", client)
            .append("nickname", "张三")
            .append("phone", "11122223333")
            .insert_and_send("00001");
    if(ret == false) {
        LOG_INFO("数据插入失败！");
        return -3;
    }


    // 4. 数据检索（搜索）
    Json::Value ret_user = ESSearch("test_user", "_doc", client)
        .append_should_match("phone.keyword", "11122223333") // keyword表示phone这个词作为关键字搜索
        .search();
    if (ret_user.empty()  || ret_user.isArray() == false ) {
        LOG_ERROR("数据检索的结果为空，或者返回结果不是数组类型");
        return -4;
    } else {
        LOG_DEBUG("打印检索结果");
        int sz = ret_user.size();
        for(int i = 0; i < sz; i++) {
            std::cout << ret_user[i]["_source"]["nickname"].asString() << std::endl;
            std::cout << ret_user[i]["_source"]["phone"].asString() << std::endl;
        }
        LOG_DEBUG("检索结果打印完毕");
    }


    // // 5. 数据删除

    // ret = ESRemove("test_user", "_doc", client)
    //     .remove("00001");
    // if (ret == false) {
    //     LOG_ERROR("删除00001数据失败");
    //     return -5;
    // } else {
    //     LOG_DEBUG("删除00001数据成功");
    // }


    return 0;
}