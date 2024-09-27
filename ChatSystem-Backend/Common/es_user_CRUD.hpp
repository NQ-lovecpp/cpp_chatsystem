// ES数据管理：（二次封装一下icsearch.hpp，做用户索引的CRUD，这份头文件更加贴近业务）
//     在用户注册成功的时候，将用户的元信息，向ES也进行一份存储，以便于进行用户的搜索
//     搜索关键字：是一个字符串，可能是一个用户ID,也可能是一个手机号，也可能是一个昵称的一部分
//                且搜索的时候，不能搜索到自己，以及自己的好友，过滤条件其实就是一组用户ID

//     ES存放的是用户元信息：用户ID，用户昵称，手机号，签名，头像ID

//     ES的管理操作:
//          1.创建用户索引
//          2.新增数据／更新数据
//          3.搜索用户 (输入一个关键字，以及一组过滤用户ID)
#pragma once
#include "icsearch.hpp"
#include "user.hxx"
#include "message.hxx"
#include "message-odb.hxx"

namespace chen_im
{
    class ESClientFactory
    {
    public:
        static std::shared_ptr<elasticlient::Client> create(const std::vector<std::string> host_list)
        {
            return std::make_shared<elasticlient::Client>(host_list);
        }
    };

    // ES的管理操作:
    //  1.创建用户索引
    //  2.新增数据／更新数据
    //  3.搜索用户 (输入一个关键字，以及一组过滤用户ID)
    class ESUser
    {
    public:
        using ptr = std::shared_ptr<ESUser>;
        ESUser(const std::shared_ptr<elasticlient::Client> &client) 
            : _es_client(client) 
        {}
        bool create_index()
        {
            bool ret = ESIndex("user", "_doc", _es_client)
                        .append("user_id", "keyword", "standard", true)
                        .append("nickname")
                        .append("phone", "keyword", "standard", true)
                        .append("description", "text", "standard", false)
                        .append("avatar_id", "keyword", "standard", false)
                        .create_and_send();
            if (ret == false)
            {
                LOG_INFO("用户信息索引创建失败!");
                return false;
            }
            LOG_INFO("用户信息索引创建成功!");
            return true;
        }

        bool append_user(const std::string &uid,
                        const std::string &phone,
                        const std::string &nickname,
                        const std::string &description,
                        const std::string &avatar_id)
        {
            bool ret = ESInsert("user", "_doc", _es_client)
                           .append("user_id", uid)
                           .append("nickname", nickname)
                           .append("phone", phone)
                           .append("description", description)
                           .append("avatar_id", avatar_id)
                           .insert_and_send(uid);
            if (ret == false)
            {
                LOG_ERROR("用户数据插入/更新失败!");
                return false;
            }
            LOG_INFO("用户数据新增/更新成功!");
            return true;
        }

        /// @brief 通过关键词key，找用户手机号、用户
        /// @param key 
        /// @param uid_list 要去除的用户ID（自己、自己的好友）
        std::vector<User> search(const std::string &key, const std::vector<std::string> &uid_list)
        {
            std::vector<User> res;
            Json::Value json_user = ESSearch("user", "_doc", _es_client)
                                        .append_should_match("phone.keyword", key)
                                        .append_should_match("user_id.keyword", key)
                                        .append_should_match("nickname", key)
                                        .append_must_not_terms("user_id.keyword", uid_list)
                                        .search();
            if (json_user.isArray() == false)
            {
                LOG_ERROR("用户搜索结果为空，或者结果不是数组类型");
                return res;
            }
            int sz = json_user.size();
            LOG_DEBUG("检索结果条目数量：{}", sz);
            
            for (int i = 0; i < sz; i++)
            {
                User user;
                user.user_id(json_user[i]["_source"]["user_id"].asString());
                user.nickname(json_user[i]["_source"]["nickname"].asString());
                user.description(json_user[i]["_source"]["description"].asString());
                user.phone(json_user[i]["_source"]["phone"].asString());
                user.avatar_id(json_user[i]["_source"]["avatar_id"].asString());
                res.push_back(user);
            }
            return res;
        }

    private:
        // const std::string _uid_key = "user_id";
        // const std::string _desc_key = "user_id";
        // const std::string _phone_key = "user_id";
        // const std::string _name_key = "user_id";
        // const std::string _avatar_key = "user_id";
        std::shared_ptr<elasticlient::Client> _es_client;
    };

    class ESMessage
    {
    public:
        using ptr = std::shared_ptr<ESMessage>;
        ESMessage(const std::shared_ptr<elasticlient::Client> &es_client) : _es_client(es_client) {}
        bool create_index()
        {
            bool ret = ESIndex("message", "_doc", _es_client)
                           .append("user_id", "keyword", "standard", false)
                           .append("message_id", "keyword", "standard", false)
                           .append("create_time", "long", "standard", false)
                           .append("chat_session_id", "keyword", "standard", true)
                           .append("content")
                           .create_and_send();
            if (ret == false)
            {
                LOG_INFO("消息信息索引创建失败!");
                return false;
            }
            LOG_INFO("消息信息索引创建成功!");
            return true;
        }
        bool append_message(const std::string &user_id,
                        const std::string &message_id,
                        const long create_time,
                        const std::string &chat_session_id,
                        const std::string &content)
        {
            bool ret = ESInsert("message", "_doc", _es_client)
                           .append("message_id", message_id)
                           .append("create_time", std::to_string(create_time))
                           .append("user_id", user_id)
                           .append("chat_session_id", chat_session_id)
                           .append("content", content)
                           .insert_and_send(message_id);

            if (ret == false)
            {
                LOG_ERROR("消息数据插入/更新失败!");
                return false;
            }
            LOG_INFO("消息数据新增/更新成功!");
            return true;
        }
        bool remove(const std::string &mid)
        {
            bool ret = ESRemove("message", "_doc", _es_client).remove(mid);
            if (ret == false)
            {
                LOG_ERROR("消息数据删除失败!");
                return false;
            }
            LOG_INFO("消息数据删除成功!");
            return true;
        }
        std::vector<chen_im::Message> search(const std::string &key, const std::string &ssid)
        {
            std::vector<chen_im::Message> res;
            Json::Value json_user = ESSearch("message", "_doc", _es_client)
                                        .append_should_match("chat_session_id.keyword", ssid)
                                        .append_must_not_terms("content", {key})
                                        .search();
            if (json_user.isArray() == false)
            {
                LOG_ERROR("用户搜索结果为空，或者结果不是数组类型");
                return res;
            }
            int sz = json_user.size();
            LOG_DEBUG("检索结果条目数量：{}", sz);
            for (int i = 0; i < sz; i++)
            {
                chen_im::Message message;
                message.user_id(json_user[i]["_source"]["user_id"].asString());
                message.message_id(json_user[i]["_source"]["message_id"].asString());
                boost::posix_time::ptime ctime(boost::posix_time::from_time_t(
                    stoi(json_user[i]["_source"]["create_time"].asString())));
                message.create_time(ctime);
                message.session_id(json_user[i]["_source"]["chat_session_id"].asString());
                message.content(json_user[i]["_source"]["content"].asString());
                res.push_back(message);
            }
            return res;
        }

    private:
        std::shared_ptr<elasticlient::Client> _es_client;
    };
}