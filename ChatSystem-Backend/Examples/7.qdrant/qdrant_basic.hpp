// Qdrant 基础封装：建集合 / Upsert / 检索 / 过滤检索 / 删除
//
// 设计目标：
//   * 与 Common/elasticsearch_basic.hpp 风格保持一致（链式 builder + 直接发请求）
//   * 仅依赖项目里已经在用的 cpr + jsoncpp + spdlog
//   * 走 Qdrant 的 REST API（默认 http://127.0.0.1:6333）
//
// 这是一份 PoC / 练习用的最小实现，不追求完整覆盖 Qdrant 全部 API。

#pragma once

#include <cpr/cpr.h>
#include <json/json.h>

#include <memory>
#include <sstream>
#include <string>
#include <vector>

#include "../../Common/logger.hpp"

namespace chen_im {
namespace qdrant {

// -------- json 序列化/反序列化小工具（与 ES 封装风格一致） --------
inline bool Serialize(const Json::Value &val, std::string *out_str) {
    Json::StreamWriterBuilder swb;
    swb["indentation"] = "";  // 紧凑输出
    std::unique_ptr<Json::StreamWriter> sw(swb.newStreamWriter());
    std::stringstream ss;
    if (sw->write(val, &ss) != 0) {
        LOG_ERROR("qdrant: json 序列化失败");
        return false;
    }
    *out_str = ss.str();
    return true;
}

inline bool Deserialize(const std::string &src, Json::Value *out_value) {
    Json::CharReaderBuilder crb;
    std::unique_ptr<Json::CharReader> cr(crb.newCharReader());
    std::string err;
    if (!cr->parse(src.c_str(), src.c_str() + src.size(), out_value, &err)) {
        LOG_ERROR("qdrant: json 反序列化失败：{}", err);
        return false;
    }
    return true;
}

// -------- 距离类型 --------
enum class Distance { Cosine, Dot, Euclid };

inline const char *DistanceToString(Distance d) {
    switch (d) {
        case Distance::Cosine: return "Cosine";
        case Distance::Dot:    return "Dot";
        case Distance::Euclid: return "Euclid";
    }
    return "Cosine";
}

// -------- HTTP 小封装 --------
class HttpClient {
public:
    explicit HttpClient(std::string base_url) : base_url_(std::move(base_url)) {
        if (!base_url_.empty() && base_url_.back() == '/') {
            base_url_.pop_back();
        }
    }

    cpr::Response Put(const std::string &path, const std::string &body) const {
        return cpr::Put(cpr::Url{base_url_ + path},
                        cpr::Header{{"Content-Type", "application/json"}},
                        cpr::Body{body},
                        cpr::Timeout{kTimeoutMs});
    }

    cpr::Response Post(const std::string &path, const std::string &body) const {
        return cpr::Post(cpr::Url{base_url_ + path},
                         cpr::Header{{"Content-Type", "application/json"}},
                         cpr::Body{body},
                         cpr::Timeout{kTimeoutMs});
    }

    cpr::Response Delete(const std::string &path) const {
        return cpr::Delete(cpr::Url{base_url_ + path}, cpr::Timeout{kTimeoutMs});
    }

    cpr::Response Get(const std::string &path) const {
        return cpr::Get(cpr::Url{base_url_ + path}, cpr::Timeout{kTimeoutMs});
    }

    const std::string &base_url() const { return base_url_; }

private:
    static constexpr int kTimeoutMs = 5000;
    std::string base_url_;
};

// -------- 集合管理（CreateCollection / DeleteCollection） --------
class Collection {
public:
    Collection(std::string name, std::shared_ptr<HttpClient> client)
        : name_(std::move(name)), client_(std::move(client)) {}

    // 设置向量维度（必须）
    Collection &vector_size(int size) {
        vector_size_ = size;
        return *this;
    }

    // 设置距离度量
    Collection &distance(Distance d) {
        distance_ = d;
        return *this;
    }

    // PUT /collections/{name}
    bool create_and_send() {
        Json::Value body;
        body["vectors"]["size"]     = vector_size_;
        body["vectors"]["distance"] = DistanceToString(distance_);

        std::string body_str;
        if (!Serialize(body, &body_str)) return false;

        auto resp = client_->Put("/collections/" + name_, body_str);
        if (resp.status_code != 200) {
            LOG_ERROR("qdrant: 创建集合 {} 失败，HTTP {}，响应：{}",
                      name_, resp.status_code, resp.text);
            return false;
        }
        LOG_INFO("qdrant: 集合 {} 创建成功（dim={}, distance={}）",
                 name_, vector_size_, DistanceToString(distance_));
        return true;
    }

    // DELETE /collections/{name}
    bool drop_and_send() {
        auto resp = client_->Delete("/collections/" + name_);
        if (resp.status_code != 200) {
            LOG_ERROR("qdrant: 删除集合 {} 失败，HTTP {}，响应：{}",
                      name_, resp.status_code, resp.text);
            return false;
        }
        LOG_INFO("qdrant: 集合 {} 删除成功", name_);
        return true;
    }

private:
    std::string name_;
    std::shared_ptr<HttpClient> client_;
    int vector_size_ = 0;
    Distance distance_ = Distance::Cosine;
};

// -------- Upsert（插入 / 覆盖更新都用这一个接口） --------
class Upsert {
public:
    Upsert(std::string collection, std::shared_ptr<HttpClient> client)
        : collection_(std::move(collection)), client_(std::move(client)) {
        points_ = Json::Value(Json::arrayValue);
    }

    // 添加一个点
    //   id     : 点的唯一标识（无符号整数 / uuid 字符串均可，这里用 uint64）
    //   vector : 向量
    //   payload: 业务字段，比如 nickname / phone / message_id 等
    Upsert &add_point(uint64_t id,
                      const std::vector<float> &vector,
                      const Json::Value &payload = Json::Value(Json::objectValue)) {
        Json::Value point;
        point["id"] = static_cast<Json::UInt64>(id);

        Json::Value vec(Json::arrayValue);
        for (float v : vector) vec.append(v);
        point["vector"] = vec;

        if (!payload.isNull() && !payload.empty()) {
            point["payload"] = payload;
        }
        points_.append(point);
        return *this;
    }

    // PUT /collections/{name}/points?wait=true
    bool send() {
        if (points_.empty()) {
            LOG_ERROR("qdrant: upsert 无任何点");
            return false;
        }
        Json::Value body;
        body["points"] = points_;

        std::string body_str;
        if (!Serialize(body, &body_str)) return false;

        auto resp = client_->Put("/collections/" + collection_ + "/points?wait=true",
                                 body_str);
        if (resp.status_code != 200) {
            LOG_ERROR("qdrant: upsert 到 {} 失败，HTTP {}，响应：{}",
                      collection_, resp.status_code, resp.text);
            return false;
        }
        LOG_INFO("qdrant: 集合 {} upsert {} 个点成功", collection_, points_.size());
        return true;
    }

private:
    std::string collection_;
    std::shared_ptr<HttpClient> client_;
    Json::Value points_;
};

// -------- Search：向量检索 + 可选 payload 过滤 --------
class Search {
public:
    Search(std::string collection, std::shared_ptr<HttpClient> client)
        : collection_(std::move(collection)), client_(std::move(client)) {}

    Search &vector(const std::vector<float> &vec) {
        vector_ = vec;
        return *this;
    }

    Search &top_k(int k) {
        top_k_ = k;
        return *this;
    }

    Search &with_payload(bool with) {
        with_payload_ = with;
        return *this;
    }

    // 添加一个 payload 等值过滤条件（must）
    //   例如 must_match("nickname", "张三")
    Search &must_match(const std::string &key, const std::string &value) {
        Json::Value cond;
        cond["key"]              = key;
        cond["match"]["value"]   = value;
        must_.append(cond);
        return *this;
    }

    // POST /collections/{name}/points/search
    // 返回结果数组（每个元素含 id / score / payload）
    Json::Value send() {
        Json::Value body;
        Json::Value vec(Json::arrayValue);
        for (float v : vector_) vec.append(v);
        body["vector"]       = vec;
        body["limit"]        = top_k_;
        body["with_payload"] = with_payload_;

        if (!must_.empty()) {
            body["filter"]["must"] = must_;
        }

        std::string body_str;
        if (!Serialize(body, &body_str)) return Json::Value(Json::arrayValue);

        auto resp = client_->Post("/collections/" + collection_ + "/points/search",
                                  body_str);
        if (resp.status_code != 200) {
            LOG_ERROR("qdrant: 检索集合 {} 失败，HTTP {}，响应：{}",
                      collection_, resp.status_code, resp.text);
            return Json::Value(Json::arrayValue);
        }

        Json::Value root;
        if (!Deserialize(resp.text, &root)) {
            return Json::Value(Json::arrayValue);
        }
        // Qdrant 响应格式：{ "result": [ {id,score,payload}, ... ], "status": "ok", "time": ... }
        return root["result"];
    }

private:
    std::string collection_;
    std::shared_ptr<HttpClient> client_;
    std::vector<float> vector_;
    int top_k_ = 5;
    bool with_payload_ = true;
    Json::Value must_{Json::arrayValue};
};

// -------- 删除点 --------
class Remove {
public:
    Remove(std::string collection, std::shared_ptr<HttpClient> client)
        : collection_(std::move(collection)), client_(std::move(client)) {
        ids_ = Json::Value(Json::arrayValue);
    }

    Remove &add_id(uint64_t id) {
        ids_.append(static_cast<Json::UInt64>(id));
        return *this;
    }

    // POST /collections/{name}/points/delete?wait=true
    bool send() {
        if (ids_.empty()) {
            LOG_ERROR("qdrant: 删除请求未指定任何 id");
            return false;
        }
        Json::Value body;
        body["points"] = ids_;

        std::string body_str;
        if (!Serialize(body, &body_str)) return false;

        auto resp = client_->Post(
            "/collections/" + collection_ + "/points/delete?wait=true", body_str);
        if (resp.status_code != 200) {
            LOG_ERROR("qdrant: 删除点失败，HTTP {}，响应：{}",
                      resp.status_code, resp.text);
            return false;
        }
        LOG_INFO("qdrant: 集合 {} 删除 {} 个点成功", collection_, ids_.size());
        return true;
    }

private:
    std::string collection_;
    std::shared_ptr<HttpClient> client_;
    Json::Value ids_;
};

}  // namespace qdrant
}  // namespace chen_im
