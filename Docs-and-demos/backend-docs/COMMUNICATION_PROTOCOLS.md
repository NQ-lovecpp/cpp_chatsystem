# 项目通信方式说明：HTTP、SSE、WebSocket

本文档描述项目中 HTTP、SSE、WebSocket 的用途、实现细节、接口定义与关键差异。

---

## 一、概览与对照表

| 通信方式 | 用途 | 后端服务 | 前端入口 | 数据格式 |
|----------|------|----------|----------|----------|
| **HTTP** | 请求/响应式 API（登录、好友、消息、文件等） | C++ Gateway (:9000) | `httpClient.js` | Protobuf |
| **SSE** | Agent 任务/会话流式事件推送 | Python Agent Server (:8080) | `agentApi.js` | text/event-stream + JSON |
| **WebSocket** | 即时通讯事件推送（新消息、好友、会话） | C++ Gateway (:9001) | `wsClient.js` | Protobuf 二进制 |

### 代理路由（Vite 开发模式）

```text
/service  → http://127.0.0.1:9000   # C++ Gateway HTTP
/ws       → ws://127.0.0.1:9001     # C++ Gateway WebSocket
/agent    → http://127.0.0.1:8080   # Python Agent Server
```

---

## 二、HTTP

### 2.1 使用场景

- 用户注册/登录、获取验证码
- 好友列表、好友申请、会话列表、会话成员
- 消息发送、历史消息、最近消息、消息搜索
- 文件上传/下载、语音识别
- Agent 任务创建、取消、列表、审批等

### 2.2 实现细节

**后端**：C++ Gateway 使用 `httplib` 提供 HTTP Server，路由以 `/service/xxx` 形式注册（如 `/service/message_transmit/new_message`）。请求体为 Protobuf，鉴权通过 `session_id` 查 Redis 得到 `user_id`。

**前端**：
- `httpClient.js`：`httpPost` / `httpPostWithSession`
- 按 `path` 选择对应 Protobuf 编码器（`encoders[path]`），无编码器则退化为 JSON
- 请求：`Content-Type: application/x-protobuf`，序列化 Protobuf
- 响应：`arrayBuffer` → `decodeProtobufResponse(path, buffer)` 解码

### 2.3 接口定义

- **Proto 文件**：`APIs/*.proto`（user.proto, friend.proto, message_transmit.proto, message_storage.proto, file.proto, speech_recognition.proto 等）
- **路径约定**：`/service/<服务名>/<方法名>`，与 Gateway 注册的 `Post` 路径一一对应
- **鉴权**：请求体需包含 `session_id`（部分接口需 `user_id`），由 Gateway 校验

### 2.4 值得注意的细节

- 前端未使用 protobufjs 生成代码，而是**手写 varint/field 编码**，与后端 Protobuf 兼容
- `httpPostWithSession` 自动注入 `session_id`、`user_id`，避免每个调用方重复传参
- Agent 相关 HTTP 走 `/agent` 代理，使用 `fetch` + JSON，不走 Protobuf

---

## 三、SSE（Server-Sent Events）

### 3.1 使用场景

- **任务级 SSE**：订阅单个 Agent 任务的事件流（`task_id`）
  - 事件：`init`、`thought_chain`、`todo_added`、`todo_progress`、`done`、`error`、`task_created`、`task_callback` 等
- **会话级 SSE**：进入聊天会话后订阅该会话下所有 Agent 的实时输出
  - 事件：`agent_start`、`content_delta`、`agent_done`、`agent_error`、`interruption` 等

### 3.2 实现细节

**后端**（Python Agent Server）：
- `routers/events.py`：`GET /events?task_id=X`、`GET /events/session/{chat_session_id}`
- 使用 FastAPI `StreamingResponse`，`media_type="text/event-stream"`
- `runtime/sse_bus.py`：`SSEBus` 管理发布/订阅，支持 `task_id` 或 `session:{chat_session_id}` 频道
- 事件格式：`event: <type>\ndata: <JSON>\n\n`

**前端**：
- `agentApi.js`：`subscribeTaskEvents`、`subscribeSessionEvents`
- 使用 `fetch` + `ReadableStream` 实现 SSE（**未使用原生 EventSource**），以便传入 `X-Session-Id` 等自定义 header
- 手动解析 `event:`、`data:`、`id:` 行，按 `event` 类型分发到不同 handler

### 3.3 接口定义

| 端点 | 方法 | 用途 |
|------|------|------|
| `GET /agent/events?task_id={taskId}` | SSE | 订阅任务级事件 |
| `GET /agent/events/session/{chat_session_id}` | SSE | 订阅会话级事件 |

**Header**：`Accept: text/event-stream`，`X-Session-Id: <sessionId>`（鉴权）

**事件格式**（标准 SSE）：
```
event: todo_added
data: {"task_id":"xxx","title":"..."}
id: xxx_timestamp

```

### 3.4 值得注意的细节

- SSE 仅**服务端 → 客户端**单向推送，无客户端上行消息
- 使用 `fetch` 而非 `EventSource`：需携带 `X-Session-Id`，EventSource 不支持自定义 header
- `sse_bus` 支持 `last_event_id` 断线重连补发，30 秒心跳 `: heartbeat\n\n`
- 会话级与任务级使用不同 channel（`session:{id}` vs `task_id`）

---

## 四、WebSocket

### 4.1 使用场景

- 即时消息推送（`CHAT_MESSAGE_NOTIFY`）
- 好友申请、好友申请处理结果、新会话创建、好友删除
- 需在**用户在线**时实时推送，不能依赖轮询

### 4.2 实现细节

**后端**（C++ Gateway）：
- `websocketpp` 搭建 WS 服务器，端口 9001
- 连接建立后，客户端发送 `ClientAuthenticationReq`（含 `session_id`），Gateway 用 Redis 校验并建立 `user_id ↔ connection` 映射
- 推送：`_connections->get_connection(user_id)` 获取连接，`conn->send(NotifyMessage.SerializeAsString(), binary)` 发送二进制 Protobuf

**前端**：
- `wsClient.js`：单例 `WebSocketClient`，`connect(sessionId)`、`sendAuth()`、`onMessage(type, handler)`
- 接收：`ws.binaryType = 'arraybuffer'`，`decodeNotifyMessage` 解析 Protobuf，按 `notify_type` 分发
- 断线重连：`attemptReconnect`，最多 5 次，间隔 3 秒

### 4.3 接口定义

- **Proto**：`APIs/notify.proto` — `NotifyMessage`、`NotifyType`、`NotifyNewMessage` 等
- **URL**：`ws://host/ws`（开发模式经 Vite 代理到 `ws://127.0.0.1:9001`）
- **首次消息**：`ClientAuthenticationReq`（`session_id`），建立身份绑定
- **下行**：`NotifyMessage`（`notify_type` + `oneof` 载荷），二进制 Protobuf

| notify_type | 含义 |
|-------------|------|
| 0 | FRIEND_ADD_APPLY_NOTIFY |
| 1 | FRIEND_ADD_PROCESS_NOTIFY |
| 2 | CHAT_SESSION_CREATE_NOTIFY |
| 3 | CHAT_MESSAGE_NOTIFY |
| 4 | FRIEND_REMOVE_NOTIFY |

### 4.4 值得注意的细节

- **双向**：连接建立后，理论上可双向通信，当前主要使用**服务端 → 客户端**推送
- **二进制 Protobuf**：与 HTTP 的 Protobuf 共用 `base.proto` 等定义，但 WebSocket 顶层是 `NotifyMessage`
- 前端 `decodeNotifyMessage` 手写解析，只提取 `notify_type` 和 `field_6_data` 等，再交给 `decodeMessageInfo` 解析嵌套 `MessageInfo`
- 用户离线时 `get_connection` 返回空，消息不推送；上线后需通过 HTTP 拉取最近消息补偿

---

## 五、三者差异与选择依据

| 维度 | HTTP | SSE | WebSocket |
|------|------|-----|-----------|
| **方向** | 请求-响应 | 服务端 → 客户端 | 双向（项目主要用下行） |
| **连接** | 短连接 | 长连接（单工） | 长连接（全双工） |
| **格式** | Protobuf | JSON (text/event-stream) | Protobuf 二进制 |
| **鉴权** | 每请求 body 中 session_id | Header X-Session-Id | 首条消息 ClientAuthenticationReq |
| **适用** | CRUD、一次性操作 | 流式事件（Agent 输出） | 即时通知（消息、好友） |
| **服务** | C++ Gateway | Python Agent Server | C++ Gateway |

- **HTTP**：所有需要明确请求/响应的接口，如登录、发消息、查历史
- **SSE**：Agent 流式输出，单向、基于 HTTP，易于代理和鉴权
- **WebSocket**：需要服务端主动推送给已连接客户端的场景，如新消息、好友变动

---

## 六、相关文件索引

| 通信方式 | 前端 | 后端 |
|----------|------|------|
| HTTP | `api/httpClient.js`, `api/*Api.js`, `api/config.js` | `7.Gateway_Server/source/gateway_server.hpp`, `APIs/*.proto` |
| SSE | `api/agentApi.js`, `contexts/AgentContext.jsx` | `8.Agent_Server/src/routers/events.py`, `runtime/sse_bus.py` |
| WebSocket | `api/wsClient.js`, `contexts/ChatContext.jsx`, `contexts/AuthContext.jsx` | `7.Gateway_Server/source/gateway_server.hpp`, `connection.hpp`, `APIs/notify.proto` |
