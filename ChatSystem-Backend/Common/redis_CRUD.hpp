// redis数据管理：
// 1.会话信息的管理：会话ID和用户ID的键值对
// - 用户登录的时候创建登录会话：分配一个登录会话ID出来，向redis中添加键值
// - 对用户进行其他的操作的时候：发送会话ID过来；通过会话ID在redis中查找键值对;
// - 操作：会话信息的新增/删除/获取;

// 2.登录状态的管理：用户ID和空值的键值对
// - 用户登录的时候，添加用户ID进去;
// - 用户长连接断开的时候，删除这个用户ID的键值
// - 对重复登录的时候，查询对应的用户ID信息是否存在，如果存在就是重复登录
// - 操作：登录状态的新增/删除/判断是否存在

// 3.验证码的管理：验证码ID和验证码的键值对
// - 用户获取短信验证码的时候：生成验证码和ID，添加redis管理(验证码信息具有时效)
// - 手机号注册/登录/修改绑定手机号的时候：进行验证码及ID的验证
// - 当验证验证码的时候：删除验证码
// - 操作：验证码信息的新增/删除/获取

#include <sw/redis++/redis.h>
#include <iostream>
#include <vector>
#include <string>

namespace chen_im
{
    class RedisDatabaseUtility
    {
    private:
        std::shared_ptr<sw::redis::Redis> _sw_redis_client;
    
    public:
        using ptr = std::shared_ptr<RedisDatabaseUtility>;

        RedisDatabaseUtility(const std::shared_ptr<sw::redis::Redis> &sw_redis_client)
            : _sw_redis_client(sw_redis_client)
        {}
        ~RedisDatabaseUtility() {}

        // 清理所有 status:* 键（不影响 session、验证码等其他数据）
        void flush_all_status()
        {
            long long cursor = 0;
            do {
                std::vector<std::string> keys;
                cursor = _sw_redis_client->scan(
                    cursor, "status:*", 1000, std::back_inserter(keys));
                if (!keys.empty()) {
                    _sw_redis_client->del(keys.begin(), keys.end());
                }
            } while (cursor != 0);
        }

    };
    

    class RedisClientFactory
    {
    public:
        /// @brief 构建Redis客户端
        /// @param host redis服务器地址
        /// @param port redis服务器端口号
        /// @param db 
        /// @param keep_alive 是否进行长连接保活
        /// @return 
        static std::shared_ptr<sw::redis::Redis> create(
            const std::string &host,
            int port,
            int db,
            bool keep_alive)
        {
            sw::redis::ConnectionOptions opts;
            opts.host = host;
            opts.port = port;
            opts.db = db;
            opts.keep_alive = keep_alive;
            auto res = std::make_shared<sw::redis::Redis>(opts);
            return res;
        }
    };

    // 会话ID和用户ID的键值对
    class Session
    {
    public:
        using ptr = std::shared_ptr<Session>;
        // 默认 TTL：24 小时（支持用户一天内免登录恢复）
        static constexpr auto DEFAULT_TTL = std::chrono::hours(24);

        Session(const std::shared_ptr<sw::redis::Redis> &redis_client) 
            : _redis_client(redis_client) 
        {}

        void append(const std::string &ssid, const std::string &uid)
        {
            // 添加 TTL 防止异常退出时数据残留
            _redis_client->set(ssid, uid, DEFAULT_TTL);
        }

        void remove(const std::string &ssid)
        {
            _redis_client->del(ssid);
        }

        sw::redis::OptionalString get_uid(const std::string &ssid)
        {
            return _redis_client->get(ssid);
        }

        // 刷新 TTL（用于 keepAlive 时调用）
        void refresh(const std::string &ssid)
        {
            _redis_client->expire(ssid, DEFAULT_TTL);
        }

    private:
        std::shared_ptr<sw::redis::Redis> _redis_client;
    };

    // 用户ID和空值的键值对，使用 "status:" 前缀区分命名空间
    class Status
    {
    public:
        using ptr = std::shared_ptr<Status>;
        static constexpr std::string_view KEY_PREFIX = "status:";
        // TTL 10 分钟：gateway 异常重启后最多等 10 分钟即可自动过期
        static constexpr auto DEFAULT_TTL = std::chrono::minutes(10);

        Status(const std::shared_ptr<sw::redis::Redis> &redis_client) : _redis_client(redis_client) {}
        
        void append(const std::string &uid)
        {
            _redis_client->set(std::string(KEY_PREFIX) + uid, "", DEFAULT_TTL);
        }

        void remove(const std::string &uid)
        {
            _redis_client->del(std::string(KEY_PREFIX) + uid);
        }

        bool exists(const std::string &uid)
        {
            auto res = _redis_client->get(std::string(KEY_PREFIX) + uid);
            return (bool)res;
        }

        // 刷新 TTL（用于 keepAlive 时调用）
        void refresh(const std::string &uid)
        {
            _redis_client->expire(std::string(KEY_PREFIX) + uid, DEFAULT_TTL);
        }

    private:
        std::shared_ptr<sw::redis::Redis> _redis_client;
    };

    // 验证码ID和验证码的键值对
    class Codes
    {
    public:
        using ptr = std::shared_ptr<Codes>;
        Codes(const std::shared_ptr<sw::redis::Redis> &redis_client) 
            : _redis_client(redis_client) 
        {}


        /// @param ttl 键值对过期时间
        void append(const std::string &cid, const std::string &code,
                    const std::chrono::milliseconds &ttl = std::chrono::milliseconds(300000))
        {
            _redis_client->set(cid, code, ttl);
        }

        void remove(const std::string &cid)
        {
            _redis_client->del(cid);
        }

        sw::redis::OptionalString code(const std::string &cid)
        {
            return _redis_client->get(cid);
        }

    private:
        std::shared_ptr<sw::redis::Redis> _redis_client;
    };
}