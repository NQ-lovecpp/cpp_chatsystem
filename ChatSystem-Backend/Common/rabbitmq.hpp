#pragma once
#include <ev.h>
#include <amqpcpp.h>
#include <amqpcpp/libev.h>
#include <openssl/ssl.h>
#include <openssl/opensslv.h>
#include <amqpcpp/message.h>

#include <functional>
#include "logger.hpp"

namespace chen_im {

class MQClient
{
public:
    using ptr = std::shared_ptr<MQClient>;
private:
    struct ev_loop*     _loop;       // 实例化底层网络通信框架的I/O事件监控句柄
    std::unique_ptr<AMQP::LibEvHandler > _handler;    // libEventHandler句柄，将AMQP框架与事件监控关联起来
    std::unique_ptr<AMQP::TcpConnection> _connection; // TCP连接对象
    std::unique_ptr<AMQP::TcpChannel   > _channel;    // TCP信道对象
    std::thread _loop_thread; // 用来执行网络IO框架的执行流

public:
    using OnGetMessage = std::function<void(const char*, size_t)>;
    
    /// @param user chen
    /// @param password czhuowen
    /// @param mq_host 127.0.0.1:5672
    MQClient(const std::string &user, const std::string &password, const std::string &mq_host) 
    {
        // 1.实例化底层网络通信框架的I/O事件监控句柄
        // 使用 ev_loop_new 创建独立的事件循环，避免多个 MQClient 共享 EV_DEFAULT 导致递归冲突
        _loop = ev_loop_new(0);

        // 2.实例化libEventHandler句柄，将AMQP框架与事件监控关联起来
        _handler = std::make_unique<AMQP::LibEvHandler>(_loop);

        // 3.实例化连接对象
        AMQP::Address address("amqp://" + user + ":" + password + "@" + mq_host + "/"); // "amqp://guest:guest@localhost/"
        _connection = std::make_unique<AMQP::TcpConnection>(_handler.get(), address);

        // 4.实例化信道对象
        _channel = std::make_unique<AMQP::TcpChannel>(_connection.get());
    }

    // 初始化交换机和一个队列，并把队列绑定到交换机上
    void declear_all_components(const std::string &exchange_name, 
                                const std::string &queue_name, 
                                const std::string &routing_key = "routing_key", 
                                AMQP::ExchangeType exchange_type = AMQP::ExchangeType::direct)
    {
        // 这里本来有个bug，就是在lambda表达式里面想要访问exchange_name这个函数参数
        // onError、onSuccess只是设置了回调，什么时候调用，不知道的
        // 有可能调用的时候exchange_name已经销毁了
        // 再访问exchange_name就变成悬垂引用了，正确的方法是使用

        // 声明交换机
        _channel->declareExchange(exchange_name, exchange_type)
            .onError([=](const char *msg){
                LOG_ERROR("声明交换机 {} 失败: {}", exchange_name, msg);
                exit(0);
            })
            .onSuccess([=](){
                LOG_INFO("声明交换机 {} 成功！", exchange_name);
            });

        // 声明队列
        _channel->declareQueue(queue_name)
            .onError([=](const char *msg){
                LOG_ERROR("声明队列 {} 失败: {}", queue_name, msg);
                exit(0);
            })
            .onSuccess([=](){
                LOG_INFO("声明队列 {} 成功！", queue_name);
            });

        // 交换机和队列进行绑定到信道中
        _channel->bindQueue(exchange_name, queue_name, routing_key)
            .onError([=](const char *msg){
                LOG_ERROR("交换机 {} 和队列 {} 绑定失败: {}", exchange_name, queue_name, msg);
                exit(0);
            })
            .onSuccess([=](){
                LOG_INFO("交换机 {} 和队列 {} 绑定成功!", exchange_name, queue_name);
            });

        // 主执行流不阻塞，直接返回
        LOG_DEBUG("declear all components执行完毕，{}, {}, {}", exchange_name, queue_name, routing_key);
        run();
    }

    // 启动网络通信框架，开启IO
    void run()
    {
        _loop_thread = std::thread([this]{
            ev_run(_loop, 0);
        });
    }

    // 发布一个消息
    bool publish_message(const std::string &exchange_name,
                         const std::string &msg, 
                         const std::string &routing_key = "routing_key")
    {
        AMQP::Envelope env(msg.c_str(), msg.size());
        env.setContentType("application/octet-stream");

        bool ret = _channel->publish(exchange_name, routing_key, msg);
        if (ret == false) {
            LOG_ERROR("publish失败!");
            return false;
        }
        return true;
    }

    // 设置某个消息队列消费一条消息的回调函数
    bool consume_message(const std::string &queue_name, 
                         const std::string &tag, 
                         std::function<void(const char*, size_t)> callback)
    {
        LOG_DEBUG("Consuming messages from queue: {} with tag: {}", queue_name, tag);
        _channel->consume(queue_name, tag)
            .onReceived([&, callback](const AMQP::Message &message, uint64_t deliveryTag, bool redelivered) {
                if (!callback) {
                    LOG_ERROR("Callback function is empty!");
                    abort();
                }
                callback(message.body(), message.bodySize());
                _channel->ack(deliveryTag);
            })
            .onError([&](const char* msg) {
                LOG_ERROR("订阅 {} 失败, 原因: {}", queue_name, msg);
                return false;
            });
        return true;
    }
    ~MQClient()
    {
        struct ev_async async_wather;
        ev_async_init(&async_wather, watcher_callback);
        ev_async_start(_loop, &async_wather);
        ev_async_send(_loop, &async_wather);
        _loop_thread.join();
        // 释放独立创建的事件循环（使用 ev_loop_new 创建的需要手动销毁）
        ev_loop_destroy(_loop);
    }

private:
    static void watcher_callback(struct ev_loop *loop, ev_async *watcher, int32_t revents)
    {
        ev_break(loop, EVBREAK_ALL);
    }

};

}