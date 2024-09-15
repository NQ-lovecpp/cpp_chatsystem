#pragma once
#include <brpc/channel.h>
#include <string>
#include <vector>

#include "./logger.hpp"

namespace chen_im {

// 信道管理对象
// 1. 把一种服务的所有提供该服务的信道管理起来，因为提供同一种服务的主机可能有很多(目前只设计一对多)
// 一个ChannelManager对象管理一种服务，但是管理多个信道，而信道和一个套接字是对应的
class ChannelManager
{
public:
    using ChannelPtr = std::shared_ptr<brpc::Channel>;
private:
    std::mutex _mutex;                 // 保证增删查改的线程安全
    int32_t _index;                    // 当前轮转的下标计数器
    std::string _service_name;         // 服务名称
    std::vector<ChannelPtr> _channels; // 所有的信道的集合
    std::unordered_map<std::string, ChannelPtr> _host_to_channle; // 存放主机名称到channel智能指针的映射
public:
    ChannelManager(const std::string &name) 
        :_service_name(name), _index(0)
    {}
    ~ChannelManager() {}

    /// @brief  上线一个服务节点后，调用append新增对应信道
    /// @param host 主机+端口号，例如："127.0.0.1:8787"
    void append_host(const std::string &host)
    {
        // 1. 构造一个channel，用于连接服务器
        ChannelPtr channel = std::make_shared<brpc::Channel>();
        brpc::ChannelOptions options;
        options.connect_timeout_ms = -1;
        options.max_retry = 3;
        options.protocol = "baidu_std";

        int ret = channel->Init(host.c_str(), &options);
        if (ret == -1) {
            LOG_ERROR("初始化{}-{}的信道失败！", _service_name, host);
        }

        // 插入操作，加锁
        std::unique_lock<std::mutex> _lock(_mutex);
        _host_to_channle.insert(std::make_pair(host, channel));
        _channels.push_back(channel);
    }
    // 下线一个服务节点后，调用remove删除对应信道
    void remove_host(const std::string &host)
    {
        // 删除操作，加锁
        std::unique_lock<std::mutex> _lock(_mutex);
        auto hash_iter = _host_to_channle.find(host);
        if (hash_iter == _host_to_channle.end()) {
            LOG_WARN("没有找到信道{}-{}，无法删除信道", _service_name, host);
        }

        for (auto vector_iter = _channels.begin(); vector_iter != _channels.end(); vector_iter++)
        {
            if (*vector_iter == hash_iter->second) {
                _channels.erase(vector_iter);
                _host_to_channle.erase(hash_iter);
                break;
            }
        }
    }

    // 获取信道的智能指针，以便调用服务
    ChannelPtr get()
    {
        std::unique_lock<std::mutex> lock(_mutex);
        if (_channels.size() == 0) {
            return nullptr;
        }
        std::size_t i = _index++ %_channels.size();
        return _channels[i];
    }
};


// 2. 把各种服务管理起来
class ServiceManager
{
public:
    using Ptr = std::shared_ptr<ServiceManager>;
private:
    std::mutex _mutex;
    std::unordered_set<std::string> _concern; // 关心的服务
    std::unordered_map<std::string, std::shared_ptr<ChannelManager>> _services; // <服务名称, 该服务的信道管理对象>

    std::string get_service_name(const std::string &service_instance)
    {
        auto pos = service_instance.find_last_of('/');
        if(pos == std::string::npos) {
            return service_instance;
        }
        return service_instance.substr(0, pos);
    }
public:
    ServiceManager() {}
    ~ServiceManager() {}

    // 声明需要关心上下线的服务，不关心的服务不会被管理起来
    void concern(const std::string &service_name)
    {
        std::unique_lock<std::mutex> _lock(_mutex);
        _concern.insert(service_name);
    }

    // 某个服务的某个节点上线的时候被etcd回调的接口，如果这个服务被设置为“关心”，则会被管理起来
    void when_service_online(const std::string &service_instance_name, const std::string &host)
    {
        std::string service_name = get_service_name(service_instance_name);
        std::shared_ptr<ChannelManager> s;
        {        
            std::unique_lock<std::mutex> _lock(_mutex);

            auto cit = _concern.find(service_name);
            if (cit == _concern.end()) {
                LOG_DEBUG("节点 {}-{} 上线了，但是服务管理对象并不关心它！", service_name, host);
                return;
            }

            // 先获取管理对象，没有则创建新的管理对象
            auto sit = _services.find(service_name);
            if (sit == _services.end()) {// 没有则创建新的管理对象
                s = std::make_shared<ChannelManager>(service_name);
                _services.insert({service_name, s});
            } else {
                s = sit->second;    
            } 
        }

        if(!s) {
            LOG_ERROR("新增 {} 信道管理对象失败！", service_name);
        }

        // 往管理对象中添加该节点
        s->append_host(host); // 添加主机操作的线程安全已经由servicechannel类保证了
    }



    // 某个服务的某个节点下线的时候被etcd回调的接口，如果这个服务被设置为“关心”，则会被管理起来
    void when_service_offline(const std::string &service_instance_name, const std::string &host)
    {
        std::string service_name = get_service_name(service_instance_name);
        std::shared_ptr<ChannelManager> s;
        {        
            std::unique_lock<std::mutex> _lock(_mutex);
            auto sit = _services.find(service_name);
            if (sit == _services.end()) {
                LOG_WARN("删除 {}-{} 信道时，没有找到它的信道管理对象", service_name, host);
            }
            s = sit->second;
        }
        s->remove_host(host);
    }

    // 获取指定服务的原生brpc的channel的智能指针
    ChannelManager::ChannelPtr get(const std::string &service_name)
    {
        std::unique_lock<std::mutex> _lock(_mutex);
        auto sit = _services.find(service_name);
        if (sit == _services.end()) {
            LOG_ERROR("当前没有能够提供 {} 服务的节点！", service_name);
            return nullptr;
        }
        return sit->second->get();
    }
};

}