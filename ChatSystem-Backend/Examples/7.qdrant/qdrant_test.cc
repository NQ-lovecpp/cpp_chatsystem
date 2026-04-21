// Qdrant 练习 demo
//
// 与 Examples/2.elasticsearch/es_test.cc 对照阅读：
//   ES 那边演示的是“倒排索引 + 关键字检索”；
//   Qdrant 这边演示的是“向量索引 + 语义/相似度检索”，并附带按 payload 字段过滤。
//
// 业务场景假设：
//   假设我们想把聊天消息的 embedding 灌进 Qdrant，做语义搜索。
//   每条消息变成一个 point：id=消息id，vector=embedding，payload={message_id, user_id, text}
//
// 这里用人造的 4 维向量代替真实 embedding，便于无 GPU 单机跑通。

#include <gflags/gflags.h>

#include <iostream>
#include <vector>

#include "../../Common/logger.hpp"
#include "qdrant_basic.hpp"

// 日志相关 flag，与现有 examples 保持一致
DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace,
             "发布模式下，日志等级和刷新时机");

// Qdrant 服务地址
DEFINE_string(qdrant_url, "http://127.0.0.1:6333", "Qdrant REST API 地址");
DEFINE_string(collection, "chat_messages_demo", "演示用的集合名");

using chen_im::qdrant::Collection;
using chen_im::qdrant::Distance;
using chen_im::qdrant::HttpClient;
using chen_im::qdrant::Remove;
using chen_im::qdrant::Search;
using chen_im::qdrant::Upsert;

int main(int argc, char *argv[]) {
    google::ParseCommandLineFlags(&argc, &argv, true);
    init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    // 1. 构造 Qdrant 客户端
    auto client = std::make_shared<HttpClient>(FLAGS_qdrant_url);
    LOG_INFO("Qdrant endpoint = {}", client->base_url());

    // 2. （幂等）先尝试删除一次旧集合，再创建
    Collection(FLAGS_collection, client).drop_and_send();  // 不存在也没关系

    bool ok = Collection(FLAGS_collection, client)
                  .vector_size(4)
                  .distance(Distance::Cosine)
                  .create_and_send();
    if (!ok) {
        LOG_ERROR("创建集合失败，退出（请确认 Qdrant 已经在 {} 启动）",
                  FLAGS_qdrant_url);
        return -1;
    }

    // 3. Upsert 几条“消息”
    //    实际项目里 vector 应该来自 embedding 模型；这里用手写向量便于直观对比。
    auto make_payload = [](const std::string &user, const std::string &text) {
        Json::Value p;
        p["user"] = user;
        p["text"] = text;
        return p;
    };

    ok = Upsert(FLAGS_collection, client)
             .add_point(1, {0.10f, 0.20f, 0.30f, 0.40f},
                        make_payload("zhangsan", "今晚一起吃火锅吗？"))
             .add_point(2, {0.11f, 0.19f, 0.31f, 0.39f},
                        make_payload("lisi", "晚上去吃顿火锅怎么样"))
             .add_point(3, {0.90f, 0.10f, 0.05f, 0.02f},
                        make_payload("zhangsan", "我在改 brpc 的 bug"))
             .add_point(4, {0.88f, 0.12f, 0.04f, 0.03f},
                        make_payload("wangwu", "RPC 框架今天又崩了"))
             .send();
    if (!ok) {
        LOG_ERROR("Upsert 失败，退出");
        return -2;
    }

    // 4. 纯向量检索：查询向量与 1/2 号点接近，应该把“火锅”相关的两条排前面
    {
        LOG_INFO("---- 检索 1：纯向量，topK=3 ----");
        auto results = Search(FLAGS_collection, client)
                           .vector({0.12f, 0.18f, 0.30f, 0.40f})
                           .top_k(3)
                           .with_payload(true)
                           .send();
        for (const auto &hit : results) {
            std::cout << "id=" << hit["id"].asUInt64()
                      << " score=" << hit["score"].asFloat()
                      << " user=" << hit["payload"]["user"].asString()
                      << " text=" << hit["payload"]["text"].asString()
                      << std::endl;
        }
    }

    // 5. 向量 + payload 过滤：只看 zhangsan 发的消息
    {
        LOG_INFO("---- 检索 2：向量 + filter(user==zhangsan) ----");
        auto results = Search(FLAGS_collection, client)
                           .vector({0.12f, 0.18f, 0.30f, 0.40f})
                           .top_k(3)
                           .with_payload(true)
                           .must_match("user", "zhangsan")
                           .send();
        for (const auto &hit : results) {
            std::cout << "id=" << hit["id"].asUInt64()
                      << " score=" << hit["score"].asFloat()
                      << " user=" << hit["payload"]["user"].asString()
                      << " text=" << hit["payload"]["text"].asString()
                      << std::endl;
        }
    }

    // 6. 删除一个点，再次检索验证
    {
        LOG_INFO("---- 删除 id=2 ----");
        Remove(FLAGS_collection, client).add_id(2).send();

        LOG_INFO("---- 检索 3：删除后再查同样向量 ----");
        auto results = Search(FLAGS_collection, client)
                           .vector({0.12f, 0.18f, 0.30f, 0.40f})
                           .top_k(3)
                           .with_payload(true)
                           .send();
        for (const auto &hit : results) {
            std::cout << "id=" << hit["id"].asUInt64()
                      << " score=" << hit["score"].asFloat()
                      << " user=" << hit["payload"]["user"].asString()
                      << " text=" << hit["payload"]["text"].asString()
                      << std::endl;
        }
    }

    LOG_INFO("Qdrant 练习 demo 跑完");
    return 0;
}
