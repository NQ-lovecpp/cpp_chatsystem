# WebSocket 连接管理与 Session 生命周期分析

## 1. 架构概述

### 1.1 核心组件

```
┌──────────────┐     HTTP/WS      ┌─────────────────┐     gRPC      ┌─────────────────┐
│   Frontend   │ ───────────────► │  Gateway Server │ ────────────► │  User Server    │
│  (React)     │                  │   (Port 8080)   │               │  (Port 10003)   │
└──────────────┘                  └─────────────────┘               └─────────────────┘
       │                                  │
       │                                  │
       │                                  ▼
       │                          ┌─────────────────┐
       │                          │     Redis       │
       │                          │  (Session/Status)│
       │                          └─────────────────┘
       │
       └──────────────────────────────────────────────────────────────────────►
                                    WebSocket 长连接
```

### 1.2 数据存储结构

**Redis 中存储三类数据：**

| 键类型 | 键 | 值 | 用途 | 生命周期管理 |
|--------|----|----|------|-------------|
| Session | `session_id` | `user_id` | 通过会话ID找用户ID | **无 TTL（问题点）** |
| Status | `user_id` | `""` | 判断用户是否在线 | **无 TTL（问题点）** |
| Codes | `code_id` | `code` | 验证码 | 有 TTL (300秒) |

**Gateway Server 内存数据（Connection 类）：**

| 映射 | 键 | 值 |
|------|----|----|
| `_uid_to_connection` | `user_id` | `connection_ptr` |
| `_connection_to_client` | `connection_ptr` | `{uid, ssid}` |

---

## 2. 当前流程分析

### 2.1 用户登录流程

```
Frontend                Gateway                 User Server              Redis
   │                       │                        │                      │
   │── POST /user/login ──►│                        │                      │
   │                       │── gRPC UserLogin() ───►│                      │
   │                       │                        │── SET ssid uid ─────►│ Session
   │                       │                        │── SET uid "" ───────►│ Status
   │                       │◄── {ssid, success} ────│                      │
   │◄── {ssid, success} ───│                        │                      │
   │                       │                        │                      │
   │══ WebSocket Connect ═►│                        │                      │
   │── Auth(ssid) ────────►│                        │                      │
   │                       │── GET ssid ──────────────────────────────────►│
   │                       │◄── uid ──────────────────────────────────────│
   │                       │                        │                      │
   │                       │ [Connection.insert(conn, uid, ssid)]          │
   │                       │ [Start keepAlive timer]                       │
```

### 2.2 WebSocket 连接关闭流程（正常情况）

```
Frontend                Gateway                                          Redis
   │                       │                                               │
   │══ WebSocket Close ═══►│                                               │
   │                       │ [when_websocket_connection_close() called]    │
   │                       │                                               │
   │                       │── DEL ssid ──────────────────────────────────►│ 删除 Session
   │                       │── DEL uid ───────────────────────────────────►│ 删除 Status
   │                       │ [Connection.remove_connection(conn)]          │
   │                       │                                               │
```

### 2.3 问题场景：异常断开

**场景1：浏览器直接关闭/崩溃**

```
Frontend                Gateway                                          Redis
   │                       │                                               │
   │ [Browser force close] │                                               │
   │      ╳                │                                               │
   │                       │ [TCP FIN/RST may not be sent properly]        │
   │                       │ [on_close callback MAY NOT be triggered]      │
   │                       │                                               │
   │                       │ [keepAlive ping fails eventually]             │
   │                       │ [但 keepAlive 只打印日志，不清理 Redis]       │
   │                       │                                               │
   │                       │                        Redis 数据残留：        │
   │                       │                        - session_id → user_id │
   │                       │                        - user_id → ""         │
```

**场景2：网络异常（如断网、NAT超时）**

```
Frontend                Gateway                                          Redis
   │                       │                                               │
   │ [Network disconnect]  │                                               │
   │      ╳╳╳╳╳╳           │                                               │
   │                       │ [Connection appears alive but dead]           │
   │                       │ [keepAlive ping times out]                    │
   │                       │ [但没有主动清理机制]                           │
```

---

## 3. 发现的问题

### 3.1 Session 无 TTL 导致数据残留

**代码位置：** `Common/redis_CRUD.hpp:81-84`

```cpp
void append(const std::string &ssid, const std::string &uid)
{
    _redis_client->set(ssid, uid);  // 无 TTL！
}
```

**影响：**
- 用户异常退出后，session 永久保留在 Redis
- 下次用户访问时，旧 session 可能导致身份混乱

### 3.2 Status 无 TTL 导致重复登录判断失败

**代码位置：** `Common/redis_CRUD.hpp:106-109`

```cpp
void append(const std::string &uid)
{
    _redis_client->set(uid, "");  // 无 TTL！
}
```

**影响：**
- 用户异常退出后，登录状态永久保留
- 下次登录时会提示 "用户已在其他地方登录"
- 只有手动清理 Redis 或重启 Gateway（开启 flush 模式）才能恢复

### 3.3 keepAlive 无实际清理能力

**代码位置：** `7.Gateway_Server/source/gateway_server.hpp:224-233`

```cpp
void keepAlive(websocket_server_t::connection_ptr conn)
{
    if (!conn || conn->get_state() != websocketpp::session::state::value::open)
    {
        LOG_DEBUG("非正常连接状态，结束连接保活");
        return;  // 只是退出，没有清理 Redis 和 Connection！
    }
    conn->ping("");
    _ws_server.set_timer(60000, std::bind(&GatewayServer::keepAlive, this, conn));
}
```

**影响：**
- 当检测到连接异常时，只打印日志并退出
- 没有触发 `when_websocket_connection_close` 逻辑
- Redis 数据和 Connection 内存数据都不会被清理

### 3.4 单用户单连接限制的副作用

**代码位置：** `3.User_Server/source/user_server.hpp:183-188`

```cpp
bool ret = _redis_status->exists(user->user_id());
if (ret == true) {
    LOG_ERROR("{} - 用户已在其他地方登录 - {}！", request->request_id(), nickname);
    return err_response(request->request_id(), "用户已在其他地方登录!");
}
```

**影响：**
- 结合上述 Status 无 TTL 问题，用户异常退出后无法重新登录
- 必须等待管理员清理 Redis 或重启服务

---

## 4. 修复方案

### 4.1 为 Session 和 Status 添加 TTL

**修改 `Common/redis_CRUD.hpp`：**

```cpp
class Session
{
public:
    // 建议 TTL：24 小时（根据业务需求调整）
    static constexpr auto DEFAULT_TTL = std::chrono::hours(24);

    void append(const std::string &ssid, const std::string &uid,
                const std::chrono::milliseconds &ttl = std::chrono::duration_cast<std::chrono::milliseconds>(DEFAULT_TTL))
    {
        _redis_client->set(ssid, uid, ttl);
    }

    // 刷新 TTL（每次 WebSocket 活动时调用）
    void refresh(const std::string &ssid)
    {
        _redis_client->expire(ssid, DEFAULT_TTL);
    }
    // ... 其他方法
};

class Status
{
public:
    // 建议 TTL：2 小时（略大于 keepAlive 超时判定时间）
    static constexpr auto DEFAULT_TTL = std::chrono::hours(2);

    void append(const std::string &uid,
                const std::chrono::milliseconds &ttl = std::chrono::duration_cast<std::chrono::milliseconds>(DEFAULT_TTL))
    {
        _redis_client->set(uid, "", ttl);
    }

    // 刷新 TTL
    void refresh(const std::string &uid)
    {
        _redis_client->expire(uid, DEFAULT_TTL);
    }
    // ... 其他方法
};
```

### 4.2 修复 keepAlive 清理逻辑

**修改 `7.Gateway_Server/source/gateway_server.hpp`：**

```cpp
void keepAlive(websocket_server_t::connection_ptr conn)
{
    if (!conn || conn->get_state() != websocketpp::session::state::value::open)
    {
        LOG_DEBUG("非正常连接状态，结束连接保活");
        
        // 新增：主动清理资源
        cleanupConnection(conn);
        return;
    }
    
    // 刷新 Redis TTL
    std::string uid, ssid;
    if (_connections->get_client_info(conn, uid, ssid)) {
        _redis_session->refresh(ssid);
        _redis_status->refresh(uid);
    }
    
    conn->ping("");
    _ws_server.set_timer(60000, std::bind(&GatewayServer::keepAlive, this, conn));
}

// 新增：统一清理方法
void cleanupConnection(websocket_server_t::connection_ptr conn)
{
    std::string uid, ssid;
    bool ret = _connections->get_client_info(conn, uid, ssid);
    if (ret) {
        _redis_session->remove(ssid);
        _redis_status->remove(uid);
        _connections->remove_connection(conn);
        LOG_INFO("清理异常连接资源，用户: {}, 会话: {}", uid, ssid);
    }
}
```

### 4.3 前端增加 beforeunload 处理

**修改 `ChatSystem-Frontend-React/src/api/wsClient.js`：**

```javascript
class WebSocketClient {
    constructor() {
        // ... 现有代码 ...
        
        // 添加页面卸载处理
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.gracefulDisconnect();
            });
            
            window.addEventListener('pagehide', () => {
                this.gracefulDisconnect();
            });
        }
    }

    /**
     * 优雅断开连接
     */
    gracefulDisconnect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            // 发送正常关闭
            this.ws.close(1000, 'User navigating away');
        }
    }

    // ... 其他方法 ...
}
```

### 4.4 添加连接健康检查机制

**修改 Gateway Server，添加定时扫描：**

```cpp
// 每 5 分钟扫描一次所有连接
void connectionHealthCheck()
{
    std::vector<websocket_server_t::connection_ptr> deadConnections;
    
    _connections->forEach([&](const websocket_server_t::connection_ptr &conn, 
                              const std::string &uid, const std::string &ssid) {
        if (!conn || conn->get_state() != websocketpp::session::state::value::open) {
            deadConnections.push_back(conn);
        }
    });
    
    for (auto &conn : deadConnections) {
        cleanupConnection(conn);
    }
    
    // 下次检查
    _ws_server.set_timer(300000, std::bind(&GatewayServer::connectionHealthCheck, this));
}
```

---

## 5. 日志中的具体错误分析

### 5.1 `获取登录会话关联用户信息失败！`

**日志示例：**
```
[gateway_server.hpp:498] 3de3-9980b633-000d 获取登录会话关联用户信息失败！
```

**原因分析：**
1. 用户 A 登录，获得 session_id `3de3-9980b633-000d`
2. 用户 A 异常退出（如直接关闭浏览器）
3. WebSocket close 回调未触发，Redis 中 session 被清理
4. 但用户 A 的前端 localStorage 仍保存着旧 session_id
5. 用户 A 刷新页面，前端尝试用旧 session_id 验证身份
6. Redis 中已无此 session，返回错误

**解决方案：**
- 前端收到此错误时，应清除 localStorage 并跳转登录页
- 后端应为 session 设置 TTL，即使没有清理也会自动过期

### 5.2 `好友子服务调用失败！`

**日志示例：**
```
[gateway_server.hpp:1035] Rmkzp48shyktncxyf1 好友子服务调用失败！
```

**原因分析：**
1. friend_server 之前因 ODB 断言失败而崩溃
2. 虽然 Docker 会自动重启，但重启期间所有请求都会失败
3. brpc 连接超时（`Fail to wait EPOLLOUT`）

**解决方案：**
- 修复 friend_server 的 ODB 断言问题（`result.one()` 在无结果时断言失败）
- 添加服务健康检查和熔断机制

---

## 6. 完整的连接生命周期设计（建议）

### 6.1 正常流程

```
1. 用户登录 → User Server 创建 session/status (带 TTL)
2. 前端建立 WebSocket → Gateway 验证并管理连接
3. 每 60s keepAlive → 刷新 Redis TTL
4. 用户登出/关闭页面 → 前端优雅关闭 WebSocket
5. Gateway 收到 close → 清理 Redis 和内存
```

### 6.2 异常恢复流程

```
1. 连接异常断开 → keepAlive 检测到状态异常 → 主动清理
2. Redis TTL 过期 → session/status 自动删除
3. 用户重新登录 → 正常流程
```

### 6.3 TTL 设计建议

| 数据类型 | 建议 TTL | 理由 |
|----------|----------|------|
| Session | 24 小时 | 支持一天内免登录恢复 |
| Status | 2 小时 | 略大于连接异常检测时间 |
| Codes | 5 分钟 | 验证码有效期 |

---

## 7. 总结

当前项目的 WebSocket 连接管理存在以下主要问题：

1. **Redis 数据无 TTL** - 导致异常退出后数据残留
2. **keepAlive 无清理能力** - 检测到异常但不处理
3. **缺少主动健康检查** - 只有被动的连接状态判断
4. **前端缺少优雅退出** - 页面关闭时可能不触发 WebSocket close

建议按照第 4 节的修复方案逐步改进，优先级：
1. **高**：为 Session/Status 添加 TTL
2. **高**：修复 keepAlive 清理逻辑
3. **中**：前端添加 beforeunload 处理
4. **低**：添加定时健康检查
