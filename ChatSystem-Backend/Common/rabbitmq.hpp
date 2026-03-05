#pragma once
#include <ev.h>
#include <amqpcpp.h>
#include <amqpcpp/libev.h>
#include <openssl/ssl.h>
#include <openssl/opensslv.h>
#include <amqpcpp/message.h>

#include <atomic>
#include <functional>
#include <mutex>
#include <queue>
#include <string>
#include <vector>
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

    // ack 机制：带 generation 防止旧 delivery tag 污染新 channel
    struct AckItem {
        uint64_t deliveryTag;
        uint64_t generation;
    };
    struct ev_async      _ack_watcher;
    std::mutex           _ack_mutex;
    std::queue<AckItem>  _pending_acks;
    std::atomic<uint64_t> _channel_generation{0};

    struct PendingPublish {
        std::string exchange;
        std::string msg;
        std::string routing_key;
    };
    struct ev_async            _publish_watcher;
    std::mutex                 _publish_mutex;
    std::queue<PendingPublish> _pending_publishes;

    // channel 重连机制
    struct ev_async _recreate_channel_watcher;
    struct ConsumerReg {
        std::string queue_name;
        std::string tag;
        std::function<void(const char*, size_t)> callback;
    };
    std::vector<ConsumerReg> _registered_consumers;

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

        _recreate_channel_watcher.data = this;
        ev_async_init(&_recreate_channel_watcher, _recreate_channel_cb);
        ev_async_start(_loop, &_recreate_channel_watcher);
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
        _registered_consumers.push_back({queue_name, tag, callback});
        _do_consume(queue_name, tag, callback);
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
    void _do_consume(const std::string& queue_name, const std::string& tag,
                     const std::function<void(const char*, size_t)>& callback)
    {
        _channel->consume(queue_name, tag)
            .onReceived([this, callback](const AMQP::Message &message, uint64_t deliveryTag, bool redelivered) {
                if (!callback) {
                    LOG_ERROR("Callback function is empty!");
                    abort();
                }
                uint64_t gen = _channel_generation.load();
                std::vector<char> body(message.body(), message.body() + message.bodySize());
                std::thread([this, callback, body = std::move(body), deliveryTag, gen]() mutable {
                    callback(body.data(), body.size());
                    _schedule_ack(deliveryTag, gen);
                }).detach();
            })
            .onError([this, queue_name](const char* msg) {
                LOG_ERROR("subscribe {} failed: {}, scheduling channel reconnect", queue_name, msg);
                _schedule_channel_recreate();
            });
    }

    void _schedule_ack(uint64_t deliveryTag, uint64_t generation)
    {
        {
            std::lock_guard<std::mutex> lock(_ack_mutex);
            _pending_acks.push({deliveryTag, generation});
        }
        ev_async_send(_loop, &_ack_watcher);
    }

    void _schedule_channel_recreate()
    {
        ev_async_send(_loop, &_recreate_channel_watcher);
    }

    static void _ack_watcher_cb(struct ev_loop *loop, ev_async *w, int revents)
    {
        MQClient *self = static_cast<MQClient*>(w->data);
        std::queue<AckItem> acks;
        {
            std::lock_guard<std::mutex> lock(self->_ack_mutex);
            std::swap(acks, self->_pending_acks);
        }
        uint64_t current_gen = self->_channel_generation.load();
        while (!acks.empty()) {
            const auto& item = acks.front();
            if (item.generation == current_gen) {
                self->_channel->ack(item.deliveryTag);
            } else {
                LOG_DEBUG("Discarding stale ack: delivery_tag={}, gen={} (current={})",
                          item.deliveryTag, item.generation, current_gen);
            }
            acks.pop();
        }
    }

    static void _recreate_channel_cb(struct ev_loop *loop, ev_async *w, int revents)
    {
        MQClient *self = static_cast<MQClient*>(w->data);
        LOG_WARN("AMQP channel error detected, recreating channel and re-registering {} consumers...",
                 self->_registered_consumers.size());

        // 递增 generation，使所有来自旧 channel 的 ack 在 _ack_watcher_cb 中被丢弃
        self->_channel_generation.fetch_add(1);

        self->_channel = std::make_unique<AMQP::TcpChannel>(self->_connection.get());

        for (const auto& reg : self->_registered_consumers) {
            LOG_INFO("Re-registering consumer for queue: {}", reg.queue_name);
            self->_do_consume(reg.queue_name, reg.tag, reg.callback);
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
