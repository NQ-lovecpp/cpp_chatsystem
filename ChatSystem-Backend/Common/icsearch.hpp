#include <elasticlient/client.h>
#include <json/json.h>
#include <cpr/cpr.h>
#include <iostream>
#include <memory>

#include "logger.hpp"



bool Serialize(const Json::Value &val, std::string *out_str)
{
    // 先定义
    Json::StreamWriterBuilder swb;
    std::unique_ptr<Json::StreamWriter> stream_writer(swb.newStreamWriter());
    // 通过streamwriter中的write接口进行序列化
    std::stringstream ss;
    int ret = stream_writer->write(val, &ss);
    if(ret != 0) {
        LOG_ERROR("反序列化失败!");
        return false;
    }
    *out_str = ss.str();
    return true;
}

bool Deserialize(const std::string &src, Json::Value *out_value)
{
    Json::CharReaderBuilder crb;
    std::unique_ptr<Json::CharReader> cr(crb.newCharReader());
    std::string err;
    bool ret = cr->parse(src.c_str(), src.c_str() + src.size(), out_value, &err);
    if (ret == false) {
        LOG_ERROR("json反序列化失败，原因：{}", err);
        return false;
    }
    return true;
}


// 封装创建索引的接口，类似于创建数据库中的表
//   索引如何创建:
//   1.能够设定索引名称，索引类型
//   2.能够添加字段，并设置字段类型，设置分词器类型，给出“是否构造索引”的选项
// 创建索引的本质是根据请求体的json格式，对应构造Value对象
class ESIndex
{
private:
    std::string _name;
    std::string _type;
    Json::Value _index;
    Json::Value _properties;
    std::shared_ptr<elasticlient::Client> _client; // ES客户端

public:
    // 初始化一个索引
    ESIndex(const std::string &index_name, 
    const std::string &index_type, 
    std::shared_ptr<elasticlient::Client> es_client_ptr)
        :_name(index_name)
        , _type(index_type)
        , _client(es_client_ptr)
    {
        Json::Value settings;
        Json::Value analysis;
        Json::Value analyzer;
        Json::Value ik;
        Json::Value tokenizer;
        
        // "settings" : {
        //     "analysis" : {
        //         "analyzer" : {
        //             "ik" : {
        //                 "tokenizer" : "ik_max_word" 
        //             }
        //         }   
        //     }
        // },

        tokenizer = "ik_max_word";
        ik["tokenizer"] = tokenizer;
        analyzer["ik"] = ik;
        analysis["analyzer"] = analyzer;
        settings["analysis"] = analysis;
        _index["settings"] = settings;

        std::string output;
        Serialize(_index, &output);
        LOG_DEBUG("_index被序列化后：{}", output);
    }
    ~ESIndex() {}

    // 往properties中添加内容
    ESIndex& append(const std::string &key, 
                const std::string &type = "text", 
                const std::string &analyzer = "ik_max_word", 
                bool enabled = true)
    {
        // "mappings" : {
        //     "dynamic" : true,
        //     "properties" : {
        //         "nickname" : {
        //             "type" : "text", 
        //             "analyzer" : "ik_max_word"
        //         },
        //         "user_id" : {
        //             "type" : "keyword",
        //             "analyzer" : "standard"
        //         },
        //         "phone" : {
        //             "type" : "keyword",
        //             "analyzer" : "standard"
        //         },
        //         "description" : {
        //             "type" : "text",
        //             "enabled" : false 
        //         },
        //         "avatar_id" : {
        //             "type" : "keyword",
        //             "enabled" : false
        //         }
        //     }
        // }
        Json::Value fields; // “nickname/user_id/phone”中的内容
        fields["type"]= type;
        fields["analyzer"] = analyzer;
        if (enabled == false) fields["enabled"] = enabled;
        _properties[key] = fields;

        return *this; // 支持连续调用
    }

    // 构建mappings，并将mappings放入响应体中，最后序列化整个索引，并发送
    bool create_and_send()
    {
        Json::Value mappings;
        mappings["dynamic"] = true;
        mappings["properties"] = _properties;
        _index["mappings"] = mappings;

        std::string body; // 请求体
        bool ret = Serialize(_index, &body);
        if (ret == false) {
            LOG_ERROR("索引序列化失败！");
            return false;
        } else {
            LOG_DEBUG("索引序列化成功！");
        }

        try {
            // 2. 发起搜索请求
            auto resp = _client->index(_name, _type, "", body);
            if (resp.status_code < 200 | resp.status_code >= 300) {
                LOG_ERROR("创建ES索引 {} 失败，响应状态码：", _name, resp.status_code);
                return false;
            } else {
                // 3. 打印响应状态码和响应正文
                LOG_DEBUG("创建ES索引 {} 成功，ES服务器发回响应：", _name);
                LOG_DEBUG("状态码: {}", resp.status_code);
                LOG_DEBUG("响应正文：\n{}", resp.text);
            }
        } catch(std::exception &e) {
            LOG_ERROR("创建ES索引 {} 失败，失败原因：{}", _name, e.what());
            return false;
        }

        return true;
    }
}; 


// 数据新增：
// 1. 提供用户一个新增字段及数据的接口即可
// 2. 提供一个发起请求的接口

class ESInsert
{
private:
    std::string _name;
    std::string _type;
    Json::Value _item;
    std::shared_ptr<elasticlient::Client> _client; // ES客户端
public:
    ESInsert(const std::string &index_name, 
             const std::string &index_type, 
             std::shared_ptr<elasticlient::Client> es_client_ptr)
        :_name(index_name)
        , _type(index_type)
        , _client(es_client_ptr)
    {}
    ~ESInsert() {}

    ESInsert& append(const std::string &key, const std::string &value)
    {
        _item[key] = value;
        return *this;
    }

    bool insert_and_send(const std::string &id)
    {
        // 1. 序列化请求体
        std::string body;
        bool ret = Serialize(_item, &body);
        if (ret == false) {
            LOG_ERROR("索引序列化失败！");
            return false;
        } else {
            LOG_DEBUG("索引序列化成功！");
        }

        try {
            // 2. 发起搜索请求
            auto resp = _client->index(_name, _type, id, body);
            if (resp.status_code < 200 | resp.status_code >= 300) {
                LOG_ERROR("新增数据 {} 失败，响应状态码：", _name, resp.status_code);
                return false;
            } else {
                // 3. 打印响应状态码和响应正文
                LOG_DEBUG("搜索 {} 成功，ES服务器发回响应：", _name);
                LOG_DEBUG("状态码: {}", resp.status_code);
                LOG_DEBUG("响应正文：\n{}", resp.text);
            }
        } catch(std::exception &e) {
            LOG_ERROR("搜索 {} 失败，失败原因：{}", _name, e.what());
            return false;
        }

        return true;
    }
};


// 封装数据删除
class ESRemove
{
private:
    std::string _name;
    std::string _type;
    Json::Value _item;
    std::shared_ptr<elasticlient::Client> _client; // ES客户端
public:
    ESRemove(const std::string &index_name, 
             const std::string &index_type, 
             std::shared_ptr<elasticlient::Client> es_client_ptr)
        :_name(index_name)
        , _type(index_type)
        , _client(es_client_ptr)
    {}
    ~ESRemove() {}

    bool remove(const std::string &id)
    {
        // 1. 序列化请求体
        std::string body;
        bool ret = Serialize(_item, &body);
        if (ret == false) {
            LOG_ERROR("索引序列化失败！");
            return false;
        } else {
            LOG_DEBUG("索引序列化成功！");
        }

        try {
            // 2. 发起搜索请求
            auto resp = _client->remove(_name, _type, id);
            if (resp.status_code < 200 | resp.status_code >= 300) {
                LOG_ERROR("删除数据 {} 失败，响应状态码：", id, resp.status_code);
                return false;
            } else {
                // 3. 打印响应状态码和响应正文
                LOG_DEBUG("删除数据 {} 成功，ES服务器发回响应：", id);
                LOG_DEBUG("状态码: {}", resp.status_code);
                LOG_DEBUG("响应正文：\n{}", resp.text);
            }
        } catch(std::exception &e) {
            LOG_ERROR("删除数据 {} 失败，失败原因：{}", id, e.what());
            return false;
        }

        return true;
    }
};

class ESSearch
{
private:
    std::string _name;
    std::string _type;
    Json::Value _must_not;
    Json::Value _should;
    std::shared_ptr<elasticlient::Client> _client; // ES客户端
public:
    ESSearch(const std::string &index_name, 
             const std::string &index_type, 
             std::shared_ptr<elasticlient::Client> es_client_ptr)
        :_name(index_name)
        , _type(index_type)
        , _client(es_client_ptr)
    {}
    ~ESSearch() {}

    ESSearch& append_must_not_terms(const std::string &key, const std::string &value)
    {
        Json::Value fields;
        for(const auto& val:value)
        {
            fields["key"].append(val);
        }
        Json::Value terms;
        terms["terms"]=fields;
        _must_not["must_not"].append(terms);

        return *this;
    }

    ESSearch& append_should_match(const std::string &key, const std::string &val)
    {
        Json::Value field;
        field[key] = val;
        Json::Value match;
        match["match"] = field;
        _should.append(match);
        return*this;
    }

    Json::Value search()
    {
        Json::Value cond;
        if (_must_not.empty() == false) {
            cond["must_not"] = _must_not;
        }
        if(_should.empty() == false) {
            cond["should"] = _should;
        }
        Json::Value query;
        query["bool"] = cond;
        Json::Value req_body;
        req_body["query"] = query;

        // 1. 序列化请求体
        std::string body;
        bool ret = Serialize(req_body, &body);
        if (ret == false) {
            LOG_ERROR("索引序列化失败！");
            return Json::Value();
        } else {
            LOG_DEBUG("索引序列化成功！");
        }

        try {
            // 2. 发起搜索请求
            auto resp = _client->search(_name, _type, body);
            if (resp.status_code < 200 | resp.status_code >= 300) {
                LOG_ERROR("查找数据 {} 失败，响应状态码：", body, resp.status_code);
                LOG_DEBUG("响应正文：\n{}", resp.text);
                return Json::Value();
            } else {
                // 3. 打印响应状态码和响应正文
                LOG_DEBUG("查找数据 {} 成功，查询query：{}", _name, body);
                LOG_DEBUG("ES服务器发回响应，状态码: {}", resp.status_code);
                LOG_DEBUG("响应正文：\n{}", resp.text);
            }
            // 4. 反序列化
            Json::Value json_result;
            ret = Deserialize(resp.text, &json_result);
            if (ret == false) {
                LOG_ERROR("检索数据 {} 结果的反序列化失败", resp.text);
                return Json::Value();
            }
            return json_result["hits"]["hits"];

        } catch(std::exception &e) {
            LOG_ERROR("查找数据 {} 失败，失败原因：{}", body, e.what());
            return Json::Value();
        }
        return Json::Value();
    }
};