#include <etcd/Client.hpp>
#include <etcd/Response.hpp>
#include <etcd/KeepAlive.hpp>  
#include <etcd/Value.hpp>  
#include <etcd/Watcher.hpp>

#include <thread>
#include <functional>

#include "./logger.hpp"

// 服务注册客户端类，本质上是在放数据
class Registry
{
private:
    std::shared_ptr<etcd::Client> _client; // etcd的客户端对象
    std::shared_ptr<etcd::KeepAlive> _keep_alive; // 一个租约的保活对象
    int64_t _lease_id; // 保活对象的租约ID
public:
    Registry(const string &host_url)
        :_client(make_shared<etcd::Client>(host_url))
        ,_keep_alive(_client->leasekeepalive(3).get()) // 它的创建伴随着创建一个指定时长的租约（3s）
        ,_lease_id(_keep_alive->Lease())
    {}

    bool registry(const std::string &key, const std::string &val);

    ~Registry()
    {
        _keep_alive->Cancel(); // 取消租约
    }
};


// 服务发现客户端类
class Discovery
{
    using NotifyCallback = std::function<void(std::string, std::string)>;
private:
    std::shared_ptr<etcd::Client> _client;
    std::shared_ptr<etcd::Watcher> _watcher;
    NotifyCallback _put_cb;
    NotifyCallback _del_cb;

private:
    // std::function<void(etcd::Response)> callback
    void callback(const etcd::Response &resp)
    {
        if(resp.is_ok() == false)
        {
            LOG_ERROR("收到一个错误的事件通知：{}", resp.error_message());
            return;
        }
        for(const auto& ev : resp.events())
        {
            if(ev.event_type() == etcd::Event::EventType::PUT) {
                if(_put_cb) _put_cb(ev.kv().key(), ev.kv().as_string());
                LOG_DEBUG("新增业务节点：{} -> {}", ev.kv().key(), ev.kv().as_string());
            } else if(ev.event_type() == etcd::Event::EventType::DELETE_) {
                if(_del_cb) _del_cb(ev.prev_kv().key(), ev.prev_kv().as_string()); // 看的是被删除的kv，因此用prev_kv
                LOG_DEBUG("业务节点下线：{} -> {}", ev.kv().key(), ev.kv().as_string());
            }
        }
    }

public:
    Discovery(const std::string &host_url, 
    const std::string &base_dir, 
    const NotifyCallback &put_cb, 
    const NotifyCallback &del_cb)
        :_client(std::make_shared<etcd::Client>(host_url))
        ,_watcher(std::make_shared<etcd::Watcher>(*_client, base_dir, 
                  std::bind(&Discovery::callback, this, std::placeholders::_1)))
        ,_put_cb()
        ,_del_cb()
    {
        // 1. 先拉取服务（服务发现）
        auto resp = _client->ls("/service").get();
        if(resp.is_ok() == false)
        {
            LOG_ERROR("获取服务信息数据失败：{}", resp.error_message());
        }

        // 2. 打印服务列表
        size_t sz = resp.keys().size();
        for(int i = 0; i < sz; i++)
        {
            std::cout << resp.value(i).as_string() << "->可以提供：" << resp.key(i) << " 服务\n";
            if(_put_cb) _put_cb(resp.key(i), resp.value(i).as_string());
        }

        // 3. 然后进行事件监控
        _watcher = std::make_shared<etcd::Watcher>(*_client, base_dir, std::bind(&Discovery::callback, this, std::placeholders::_1));
    }

    ~Discovery() { }
};


