#pragma once
#include <etcd/Client.hpp>
#include <etcd/Response.hpp>
#include <etcd/KeepAlive.hpp>
#include <etcd/Value.hpp>
#include <etcd/Watcher.hpp>

#include <atomic>
#include <chrono>
#include <condition_variable>
#include <map>
#include <mutex>
#include <thread>
#include <functional>

#include "./logger.hpp"


namespace chen_im {

// 服务注册客户端类。
// 旧实现只在启动时申请一次 30s 租约 + KeepAlive，etcd 一旦短暂不可用导致租约被吊销，
// 服务就会"上线但未注册"，再也回不来。这里在原 API 的基础上：
//   1. 把租约 TTL 提高到 90s，给 keepalive 更大重试窗口；
//   2. 启动一个后台 watchdog，每隔几秒巡检一次注册的 key 是否仍存在，
//      并校验 keepalive 是否仍然存活；任一异常则重建租约 + 重新 PUT 全部 KV。
// 这样即使发生 etcd 抖动或宿主机磁盘繁忙导致 lease 被 revoke，服务也能自愈。
class Registry
{
public:
    using ptr = std::shared_ptr<Registry>;
private:
    static constexpr int kLeaseTtlSec       = 90;
    static constexpr int kWatchdogIntervalS = 10;

    std::string                       _host_url;
    std::shared_ptr<etcd::Client>     _client;
    std::shared_ptr<etcd::KeepAlive>  _keep_alive;
    int64_t                           _lease_id{0};

    std::mutex                        _mtx;            // 保护 _registered / _keep_alive / _lease_id
    std::map<std::string,std::string> _registered;     // 已注册的 key->value，用于自愈时重发

    std::thread                       _watchdog;
    std::atomic<bool>                 _running{true};
    std::condition_variable           _cv;

private:
    // 调用方需持有 _mtx
    bool create_lease_locked()
    {
        try {
            if (_keep_alive) {
                try { _keep_alive->Cancel(); } catch (...) {}
            }
            _keep_alive = _client->leasekeepalive(kLeaseTtlSec).get();
            _lease_id   = _keep_alive->Lease();
            return true;
        } catch (const std::exception &e) {
            LOG_ERROR("申请 etcd 租约失败：{}", e.what());
            _keep_alive.reset();
            _lease_id = 0;
            return false;
        }
    }

    // 调用方需持有 _mtx
    bool put_locked(const std::string &k, const std::string &v)
    {
        if (_lease_id == 0) return false;
        try {
            auto resp = _client->put(k, v, _lease_id).get();
            if (!resp.is_ok()) {
                LOG_ERROR("向 etcd 注册 {} = {} 失败：{}", k, v, resp.error_message());
                return false;
            }
            return true;
        } catch (const std::exception &e) {
            LOG_ERROR("向 etcd 注册 {} 抛出异常：{}", k, e.what());
            return false;
        }
    }

    // KeepAlive 后台线程是否仍然存活；库内部异常会通过 Check() 抛出
    bool keepalive_healthy()
    {
        if (!_keep_alive) return false;
        try {
            _keep_alive->Check();
            return true;
        } catch (const std::exception &e) {
            LOG_WARN("etcd KeepAlive 异常：{}", e.what());
            return false;
        } catch (...) {
            LOG_WARN("etcd KeepAlive 抛出未知异常");
            return false;
        }
    }

    // 校验 etcd 中的 key 是否仍然挂在我们的租约上（防止 lease 被 revoke 后 key 被删）
    bool key_still_present(const std::string &k)
    {
        try {
            auto resp = _client->get(k).get();
            if (!resp.is_ok()) return false;
            return !resp.value().as_string().empty();
        } catch (const std::exception &e) {
            LOG_WARN("查询 etcd 键 {} 异常：{}", k, e.what());
            return false;
        } catch (...) {
            return false;
        }
    }

    void watchdog_loop()
    {
        while (_running.load()) {
            {
                std::unique_lock<std::mutex> lk(_mtx);
                _cv.wait_for(lk, std::chrono::seconds(kWatchdogIntervalS),
                             [this]{ return !_running.load(); });
                if (!_running.load()) break;
            }

            bool need_rebind = !keepalive_healthy();

            if (!need_rebind) {
                std::vector<std::string> keys;
                {
                    std::lock_guard<std::mutex> lk(_mtx);
                    keys.reserve(_registered.size());
                    for (const auto &kv : _registered) keys.push_back(kv.first);
                }
                for (const auto &k : keys) {
                    if (!key_still_present(k)) {
                        LOG_WARN("etcd 键 {} 已不存在（疑似租约过期），将重新注册", k);
                        need_rebind = true;
                        break;
                    }
                }
            }

            if (need_rebind) {
                std::lock_guard<std::mutex> lk(_mtx);
                if (!create_lease_locked()) continue;
                size_t ok = 0;
                for (const auto &kv : _registered) {
                    if (put_locked(kv.first, kv.second)) ++ok;
                }
                LOG_INFO("etcd 注册自愈完成：成功重写 {}/{} 条记录", ok, _registered.size());
            }
        }
    }

public:
    // 启动时阻塞最多 kInitWaitSec 等到第一次拿到租约，确保 register() 之后 KV 一定已经写到 etcd；
    // 调用方拿到这个对象后立刻 register()，再起 brpc 监听，gateway 侧 Discovery 就一定能看到我们。
    static constexpr int kInitWaitSec = 30;

    Registry(const std::string &host_url)
        : _host_url(host_url)
        , _client(std::make_shared<etcd::Client>(host_url))
    {
        {
            std::lock_guard<std::mutex> lk(_mtx);
            create_lease_locked();
        }
        // 首次拿不到租约就在构造里轮询，给 etcd 一些启动余地
        if (_lease_id == 0) {
            for (int i = 0; i < kInitWaitSec && _lease_id == 0; ++i) {
                std::this_thread::sleep_for(std::chrono::seconds(1));
                std::lock_guard<std::mutex> lk(_mtx);
                create_lease_locked();
            }
            if (_lease_id == 0) {
                LOG_WARN("etcd 启动 {}s 内仍未拿到租约，watchdog 会继续重试", kInitWaitSec);
            }
        }
        _watchdog = std::thread(&Registry::watchdog_loop, this);
    }

    // 注册 kv，返回是否成功；同时记入自愈表，租约失效时会被 watchdog 自动重发
    bool registry(const std::string &key, const std::string &val)
    {
        std::lock_guard<std::mutex> lk(_mtx);
        _registered[key] = val;
        if (_lease_id == 0) {
            // 启动时拿不到租约，先记下 KV，留给 watchdog 重试
            return false;
        }
        return put_locked(key, val);
    }

    ~Registry()
    {
        _running = false;
        _cv.notify_all();
        if (_watchdog.joinable()) _watchdog.join();
        if (_keep_alive) {
            try { _keep_alive->Cancel(); } catch (...) {}
        }
    }
};



// 服务发现客户端类，本质上是在获取数据。
// 旧实现的两个坑：
//   1. 构造里 ls("/service") 失败直接 abort()——网关启动时 etcd 哪怕短暂抖一下就崩溃；
//   2. Watcher 创建一次后再无重建/重连，事件丢一次就永远缺失。
// 这版改造：
//   - 初始拉取改成有界重试（kInitRetryMax × kInitRetryGapS），失败也只记日志、继续走 resync 兜底；
//   - 新增 resync_loop 后台线程，每 kResyncIntervalS 秒做一次全量 ls("/service") 与本地快照对账，
//     PUT 增量调用 _put_cb，DELETE 调用 _del_cb，覆盖 Watcher 漏事件 / 启动 race 等场景；
//   - Watcher 回调拿到错误响应时，置 _need_rebuild_watcher，由 resync 线程重建 Watcher。
class Discovery
{
public:
    using ptr = std::shared_ptr<Discovery>;
    using NotifyCallback = std::function<void(const std::string &, const std::string &)>;
private:
    static constexpr int kInitRetryMax    = 30;
    static constexpr int kInitRetryGapS   = 2;
    static constexpr int kResyncIntervalS = 30;

    std::shared_ptr<etcd::Client>  _client;
    std::shared_ptr<etcd::Watcher> _watcher;
    std::string                    _host_url;
    std::string                    _base_dir;
    NotifyCallback _put_cb;
    NotifyCallback _del_cb;

    std::mutex                          _mtx;          // 保护 _seen / _watcher
    std::map<std::string, std::string>  _seen;         // 本地快照：key -> value
    std::atomic<bool>                   _need_rebuild_watcher{false};

    std::thread                         _resync;
    std::atomic<bool>                   _running{true};
    std::condition_variable             _cv;

private:
    void apply_put(const std::string &k, const std::string &v)
    {
        bool changed = false;
        {
            std::lock_guard<std::mutex> lk(_mtx);
            auto it = _seen.find(k);
            if (it == _seen.end() || it->second != v) {
                _seen[k] = v;
                changed = true;
            }
        }
        if (changed && _put_cb) _put_cb(k, v);
    }

    void apply_delete(const std::string &k, const std::string &v_fallback)
    {
        std::string old_v = v_fallback;
        bool was_present = false;
        {
            std::lock_guard<std::mutex> lk(_mtx);
            auto it = _seen.find(k);
            if (it != _seen.end()) {
                old_v = it->second;
                _seen.erase(it);
                was_present = true;
            }
        }
        if (was_present && _del_cb) _del_cb(k, old_v);
    }

    // Watcher 回调：拿到事件就刷快照 + 通知；非 OK 则要求主循环重建 Watcher
    void callback(const etcd::Response &resp)
    {
        if (resp.is_ok() == false) {
            LOG_WARN("etcd Watcher 收到错误事件：{}（标记重建）", resp.error_message());
            _need_rebuild_watcher.store(true);
            _cv.notify_all();
            return;
        }
        for (const auto &ev : resp.events()) {
            if (ev.event_type() == etcd::Event::EventType::PUT) {
                apply_put(ev.kv().key(), ev.kv().as_string());
            } else if (ev.event_type() == etcd::Event::EventType::DELETE_) {
                apply_delete(ev.prev_kv().key(), ev.prev_kv().as_string());
            }
        }
    }

    bool create_watcher_locked()
    {
        try {
            _watcher = std::make_shared<etcd::Watcher>(
                *_client, _base_dir,
                std::bind(&Discovery::callback, this, std::placeholders::_1),
                true);
            return true;
        } catch (const std::exception &e) {
            LOG_ERROR("etcd Watcher 创建失败：{}", e.what());
            _watcher.reset();
            return false;
        }
    }

    // 全量拉取一次 _base_dir 下所有 KV，与本地 _seen 对账，缺的补 PUT，多的发 DELETE
    void resync_once()
    {
        etcd::Response resp;
        try {
            resp = _client->ls(_base_dir).get();
        } catch (const std::exception &e) {
            LOG_WARN("etcd resync ls({}) 抛异常：{}", _base_dir, e.what());
            return;
        }
        if (!resp.is_ok()) {
            LOG_WARN("etcd resync ls({}) 失败：{}", _base_dir, resp.error_message());
            return;
        }

        std::map<std::string, std::string> remote;
        size_t sz = resp.keys().size();
        for (size_t i = 0; i < sz; ++i) {
            remote.emplace(resp.key(i), resp.value(i).as_string());
        }

        // 增量 PUT：远端有 / 本地无或不一致
        for (const auto &kv : remote) apply_put(kv.first, kv.second);

        // 增量 DELETE：本地有 / 远端无
        std::vector<std::pair<std::string, std::string>> gone;
        {
            std::lock_guard<std::mutex> lk(_mtx);
            for (const auto &kv : _seen) {
                if (remote.find(kv.first) == remote.end()) {
                    gone.emplace_back(kv.first, kv.second);
                }
            }
        }
        for (const auto &kv : gone) apply_delete(kv.first, kv.second);
    }

    void resync_loop()
    {
        while (_running.load()) {
            {
                std::unique_lock<std::mutex> lk(_mtx);
                _cv.wait_for(lk, std::chrono::seconds(kResyncIntervalS),
                             [this]{ return !_running.load() || _need_rebuild_watcher.load(); });
                if (!_running.load()) break;
            }

            if (_need_rebuild_watcher.exchange(false)) {
                std::lock_guard<std::mutex> lk(_mtx);
                LOG_INFO("etcd Discovery 正在重建 Watcher...");
                create_watcher_locked();
            }

            resync_once();
        }
    }

public:
    Discovery(const std::string &host_url,
              const std::string &base_dir,
              const NotifyCallback &put_cb,
              const NotifyCallback &del_cb)
        : _client(std::make_shared<etcd::Client>(host_url))
        , _host_url(host_url)
        , _base_dir(base_dir)
        , _put_cb(put_cb)
        , _del_cb(del_cb)
    {
        // 1. 有界重试 + 兜底：拉不到也不再 abort，留给 resync 后台补齐
        bool initial_ok = false;
        for (int i = 0; i < kInitRetryMax && _running.load(); ++i) {
            try {
                auto resp = _client->ls(_base_dir).get();
                if (resp.is_ok()) {
                    LOG_DEBUG("服务发现初始化，拉取 {} 列表（{} 项）：", _base_dir, resp.keys().size());
                    size_t sz = resp.keys().size();
                    for (size_t k = 0; k < sz; ++k) {
                        LOG_DEBUG(" {} 可以提供 {} 服务", resp.value(k).as_string(), resp.key(k));
                        apply_put(resp.key(k), resp.value(k).as_string());
                    }
                    initial_ok = true;
                    break;
                }
                LOG_WARN("etcd 初始 ls({}) 失败：{}（{}/{} 重试）",
                         _base_dir, resp.error_message(), i + 1, kInitRetryMax);
            } catch (const std::exception &e) {
                LOG_WARN("etcd 初始 ls({}) 抛异常：{}（{}/{} 重试）",
                         _base_dir, e.what(), i + 1, kInitRetryMax);
            }
            std::this_thread::sleep_for(std::chrono::seconds(kInitRetryGapS));
        }
        if (!initial_ok) {
            LOG_ERROR("etcd 初始 ls({}) 持续失败，先用空快照启动，resync 后台会继续补齐", _base_dir);
        }

        // 2. 创建 Watcher（失败也由 resync 重建）
        {
            std::lock_guard<std::mutex> lk(_mtx);
            create_watcher_locked();
        }

        // 3. 启动后台 resync 线程
        _resync = std::thread(&Discovery::resync_loop, this);
    }

    ~Discovery()
    {
        _running.store(false);
        _cv.notify_all();
        if (_resync.joinable()) _resync.join();
    }
};


}
