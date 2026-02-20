#pragma once
#include <ev.h>
#include <amqpcpp.h>
#include <amqpcpp/libev.h>
#include <openssl/ssl.h>
#include <openssl/opensslv.h>
#include <amqpcpp/message.h>

#include <functional>
#include <mutex>
#include <queue>
#include <string>
#include "logger.hpp"

namespace chen_im {

class MQClient
{
public:
    using ptr = std::shared_ptr<MQClient>;

private:
    struct ev_loop*     _loop;
    std::unique_ptr<AMQP::LibEvHandler > _handler;
    std::unique_ptr<AMQP::TcpConnection> _connection;
    std::unique_ptr<AMQP::TcpChannel   > _channel;
    std::thread _loop_thread;

    struct ev_async      _ack_watcher;
    std::mutex           _ack_mutex;
    std::queue<uint64_t> _pending_acks;

    struct PendingPublish {
        std::string exchange;
        std::string msg;
        std::string routing_key;
    };
    struct ev_async            _publish_watcher;
    std::mutex                 _publish_mutex;
    std::queue<PendingPublish> _pending_publishes;

public:
    using OnGetMessage = std::function<void(const char*, size_t)>;
    MQClient(const std::string &user, const std::string &password, const std::string &mq_host)
    {
        _loop = ev_loop_new(0);
        _handler = std::make_unique<AMQP::LibEvHandler>(_loop);
        AMQP::Address address("amqp://" + user + ":" + password + "@" + mq_host + "/");
        _connection = std::make_unique<AMQP::TcpConnection>(_handler.get(), address);
        _channel = std::make_unique<AMQP::TcpChannel>(_connection.get());

        _ack_watcher.data = this;
        ev_async_init(&_ack_watcher, _ack_watcher_cb);
        ev_async_start(_loop, &_ack_watcher);

        _publish_watcher.data = this;
        ev_async_init(&_publish_watcher, _publish_watcher_cb);
        ev_async_start(_loop, &_publish_watcher);
    }

    void declear_all_components(const std::string &exchange_name,
                                const std::string &queue_name,
                                const std::string &routing_key = "routing_key",
                                AMQP::ExchangeType exchange_type = AMQP::ExchangeType::direct)
    {
        _channel->declareExchange(exchange_name, exchange_type)
            .onError([=](const char *msg){
                LOG_ERROR("exchange {} fail: {}", exchange_name, msg);
                exit(0);
            })
            .onSuccess([=](){
                LOG_INFO("exchange {} ok!", exchange_name);
            });

        _channel->declareQueue(queue_name)
            .onError([=](const char *msg){
                LOG_ERROR("queue {} fail: {}", queue_name, msg);
                exit(0);
            })
            .onSuccess([=](){
                LOG_INFO("queue {} ok!", queue_name);
            });

        _channel->bindQueue(exchange_name, queue_name, routing_key)
            .onError([=](const char *msg){
                LOG_ERROR("bind {} {} fail: {}", exchange_name, queue_name, msg);
                exit(0);
            })
            .onSuccess([=](){
                LOG_INFO("bind {} {} ok!", exchange_name, queue_name);
            });

        LOG_DEBUG("declear all components done: {}, {}, {}", exchange_name, queue_name, routing_key);
        run();
    }

    void run()
    {
        _loop_thread = std::thread([this]{
            ev_run(_loop, 0);
        });
    }
    bool publish_message(const std::string &exchange_name,
                         const std::string &msg,
                         const std::string &routing_key = "routing_key")
    {
        {
            std::lock_guard<std::mutex> lock(_publish_mutex);
            _pending_publishes.push({exchange_name, msg, routing_key});
        }
        ev_async_send(_loop, &_publish_watcher);
        return true;
    }

    bool consume_message(const std::string &queue_name,
                         const std::string &tag,
                         std::function<void(const char*, size_t)> callback)
    {
        LOG_DEBUG("Consuming messages from queue: {} with tag: {}", queue_name, tag);
        _channel->consume(queue_name, tag)
            .onReceived([this, callback](const AMQP::Message &message, uint64_t deliveryTag, bool redelivered) {
                if (!callback) {
                    LOG_ERROR("Callback function is empty!");
                    abort();
                }
                std::vector<char> body(message.body(), message.body() + message.bodySize());
                std::thread([this, callback, body = std::move(body), deliveryTag]() mutable {
                    callback(body.data(), body.size());
                    _schedule_ack(deliveryTag);
                }).detach();
            })
            .onError([queue_name](const char* msg) {
                LOG_ERROR("subscribe {} failed: {}", queue_name, msg);
            });
        return true;
    }

    ~MQClient()
    {
        struct ev_async stop_watcher;
        ev_async_init(&stop_watcher, _stop_loop_cb);
        ev_async_start(_loop, &stop_watcher);
        ev_async_send(_loop, &stop_watcher);
        _loop_thread.join();
        ev_loop_destroy(_loop);
    }

private:
    void _schedule_ack(uint64_t deliveryTag)
    {
        {
            std::lock_guard<std::mutex> lock(_ack_mutex);
            _pending_acks.push(deliveryTag);
        }
        ev_async_send(_loop, &_ack_watcher);
    }

    static void _ack_watcher_cb(struct ev_loop *loop, ev_async *w, int revents)
    {
        MQClient *self = static_cast<MQClient*>(w->data);
        std::queue<uint64_t> acks;
        {
            std::lock_guard<std::mutex> lock(self->_ack_mutex);
            std::swap(acks, self->_pending_acks);
        }
        while (!acks.empty()) {
            self->_channel->ack(acks.front());
            acks.pop();
        }
    }

    static void _publish_watcher_cb(struct ev_loop *loop, ev_async *w, int revents)
    {
        MQClient *self = static_cast<MQClient*>(w->data);
        std::queue<PendingPublish> publishes;
        {
            std::lock_guard<std::mutex> lock(self->_publish_mutex);
            std::swap(publishes, self->_pending_publishes);
        }
        while (!publishes.empty()) {
            auto &p = publishes.front();
            bool ret = self->_channel->publish(p.exchange, p.routing_key, p.msg);
            if (!ret) {
                LOG_ERROR("async publish failed on exchange={}", p.exchange);
            }
            publishes.pop();
        }
    }

    static void _stop_loop_cb(struct ev_loop *loop, ev_async *watcher, int32_t revents)
    {
        ev_break(loop, EVBREAK_ALL);
    }
};

}
