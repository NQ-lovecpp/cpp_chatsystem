// redis中存放了两种信息，一个是用户是否登录，直接存key（user_id）
// 第二个是<session_id, user_id>，这个是用来通过会话id找到用户id的，客户端是通过session_id来隐式地告知服务器自己的身份的
// 但是上面这种情况是在知道websocket长连接信息的情况下，通过解析报文中的session_id内容，来得知发送者的消息
// 解决了消息怎么来，还要解决消息往哪里去
// 因此需要实现：通过用户ID能够找到这个用户客户端的websocket长连接，以便推送消息

// 实现：
//   1. 管理 <用户id, 长连接> 键值对
//   2. 在断开连接的时候，将 <user_id>、<session_id, user_id> 这两组键值对清理（只是清理Connection对象中的键值对）
//   （长连接创建的时候，在用户子服务的用户登录逻辑中，已经将这两个键值对写入redis了
//     长连接销毁的时候，在websocket的连接关闭回调onClose中，实现了清理这两个键值对的缓存）

// 接口：
//   1. 新增数据
//   2. 通过用户id获取对应的websocket长连接
//   3. 通过长连接获取用户id和会话id
#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>
#include "logger.hpp"

namespace chen_im
{
    typedef websocketpp::server<websocketpp::config::asio> websocket_server_t;
    // websocket的长连接类型： server_t::connection_ptr
    
    // 实现websocket连接管理
    class Connection
    {    
    public:        
        using ptr = std::shared_ptr<Connection>;

        struct Client
        {
            Client(const std::string &u, const std::string &s) : uid(u), ssid(s) {}
            std::string uid;  // 用户id
            std::string ssid; // 会话id
        };

        Connection() {}
        ~Connection() {}

        // 添加一个 <websocket连接、用户id、会话id> 的管理
        void insert(const websocket_server_t::connection_ptr &conn,
                    const std::string &uid, const std::string &ssid)
        {
            std::unique_lock<std::mutex> lock(_mutex);
            _uid_to_connection.insert(std::make_pair(uid, conn));
            _connection_to_client.insert(std::make_pair(conn, Client(uid, ssid)));
            LOG_DEBUG("新增长连接用户信息，长连接句柄：{}，用户id：{}，会话id：{}", (size_t)conn.get(), uid, ssid);
        }

        
        /// @brief 通过用户id获取其对应的websocket长连接对象
        /// @param uid 用户id
        /// @return websocket长连接对象
        websocket_server_t::connection_ptr get_connection(const std::string &uid)
        {
            std::unique_lock<std::mutex> lock(_mutex);
            auto it = _uid_to_connection.find(uid);
            if (it == _uid_to_connection.end()) {
                LOG_ERROR("未找到用户id为 {} 的客户端的长连接！", uid);
                return websocket_server_t::connection_ptr();
            }
            LOG_DEBUG("已找到用户id为 {} 的客户端的长连接！", uid);
            return it->second;
        }

        /// @brief 通过websocket长连接对象获取用户的user_id、session_id
        /// @param conn 长连接对象
        /// @param uid 用户id（输出型）
        /// @param ssid 会话id（输出型）
        /// @return 是否成功
        bool get_client_info(const websocket_server_t::connection_ptr &conn, std::string &uid, std::string &ssid)
        {
            std::unique_lock<std::mutex> lock(_mutex);
            auto it = _connection_to_client.find(conn);
            if (it == _connection_to_client.end())
            {
                LOG_ERROR("获取长连接对应客户端信息时，未能找到长连接 {} 对应的客户端信息！", (size_t)conn.get());
                return false;
            }
            uid = it->second.uid;
            ssid = it->second.ssid;
            LOG_DEBUG("获取长连接客户端信息成功！");
            return true;
        }

        // 删除 <websocket连接、用户id、会话id>
        void remove_connection(const websocket_server_t::connection_ptr &conn)
        {
            std::unique_lock<std::mutex> lock(_mutex);
            auto it = _connection_to_client.find(conn);
            if (it == _connection_to_client.end())
            {
                LOG_ERROR("删除-未找到长连接 {} 对应的客户端信息！", (size_t)conn.get());
                return;
            }
            _uid_to_connection.erase(it->second.uid);
            _connection_to_client.erase(it);
            LOG_DEBUG("删除长连接信息完毕！");
        }

    private:
        std::mutex _mutex;
        std::unordered_map<std::string, websocket_server_t::connection_ptr> _uid_to_connection;
        std::unordered_map<websocket_server_t::connection_ptr, Client> _connection_to_client;
    };
}