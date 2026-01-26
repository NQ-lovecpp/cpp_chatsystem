# ChatSystem Frontend (React)

基于 C++ 后端的即时通讯系统的 React 前端实现。

---

## 📑 目录

- [项目架构](#项目架构)
- [开发状态](#开发状态)
- [已知严重问题](#已知严重问题)
- [API 协议覆盖率](#api-协议覆盖率)
- [开发路线图](#开发路线图)
- [如何继续开发](#如何继续开发)

---

## 项目架构

```
src/
├── api/                    # API 层 - 与后端通信
│   ├── config.js           # 服务器配置管理
│   ├── httpClient.js       # HTTP 客户端 + Protobuf 编解码器（核心）
│   ├── wsClient.js         # WebSocket 客户端（实时通知）
│   ├── userApi.js          # 用户相关 API
│   ├── friendApi.js        # 好友相关 API
│   ├── sessionApi.js       # 会话相关 API
│   ├── messageApi.js       # 消息相关 API
│   └── protoHelper.js      # Protobuf 辅助函数
├── components/             # UI 组件
│   ├── Sidebar.jsx         # 左侧导航栏 - 含用户信息入口
│   ├── SessionList.jsx     # 会话列表
│   ├── FriendList.jsx      # 好友列表 - 含查看详情入口
│   ├── MessageArea.jsx     # 聊天消息区域
│   ├── MessageInput.jsx    # 消息输入框
│   ├── SettingsPanel.jsx   # 设置面板 - 暂时仅占位
│   ├── UserProfileModal.jsx # 个人资料修改弹窗
│   ├── FriendInfoModal.jsx  # 好友信息弹窗
│   ├── SessionInfoModal.jsx # 会话信息弹窗
│   └── ServerConfig.jsx    # 服务器配置组件
├── contexts/               # React Context 状态管理
│   ├── AuthContext.jsx     # 认证状态 - 含 Session 验证逻辑
│   └── ChatContext.jsx     # 聊天数据状态 - 含历史及实时消息处理
├── pages/                  # 页面组件
│   ├── Home.jsx            # 主页面
│   └── Login.jsx           # 登录页面
└── proto/                  # Protobuf 协议定义文件
```

---

## 开发状态

### ✅ 已完成功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户登录 | ✅ 完成 | 实现了 Session 验证与自动恢复 |
| 用户注册 | ✅ 完成 | 用户名注册 |
| 好友列表 | ✅ 完成 | 显示好友列表 |
| 好友搜索 | ✅ 完成 | 按昵称搜索用户 |
| 发送好友申请 | ✅ 完成 | 向搜索到的用户发送申请 |
| 处理好友申请 | ✅ 完成 | 同意/拒绝好友申请，实时更新 |
| 会话列表 | ✅ 完成 | 显示聊天会话列表 |
| 创建群聊 | ✅ 完成 | 选择好友创建群组 |
| WebSocket 连接 | ✅ 完成 | 实时通知推送（连接不稳定，见下文） |
| 个人信息查看/修改 | ✅ 完成 | 昵称、描述、头像设置已实现 |
| 消息历史加载 | ✅ 完成 | 切换为 `get_history` 接口 |
| 消息搜索 | ✅ 完成 | 界面搜索栏已实现 |

### ❌ 未解决及待办事项

| 功能 | 优先级 | 状态 | 说明 |
|------|--------|------|------|
| **消息发送 (后端报错)** | 🔥 **Critical** | ❌ 阻塞 | 前端发送成功，后端报 `消息反序列化失败` & `未找到客户端长连接` |
| **Session 稳定性** | 🔥 **Critical** | ⚠️ 处理中 | 刷新页面导致 WebSocket 断开进而 Session 失效。已增加自动登出保护 |
| **消息反序列化** | 🔥 **Critical** | ❌ 阻塞 | `message_store_server` 报错，导致消息无法落盘和读取 |
| 文件上传/下载 | 中 | ❌ 未开始 | 依赖 `file.proto`，需后端配合 |
| 语音识别 | 低 | ❌ 未开始 | 暂无 |

---

## 已知严重问题

### 1. 消息反序列化失败
- **现象**: 发送消息时，前端请求成功，但后端 `message_store_server` 报错 `[error] 消息反序列化失败！`。
- **影响**: 消息无法存储，虽有乐观更新，但刷新后消息丢失；历史记录也可能受到脏数据影响。
- **疑似原因**: `messageApi.js` 中构建的 `MessageContent` 结构可能与后端定义不完全匹配，或存在特殊字符处理问题。

### 2. Session 失效与 WebSocket 断开
- **现象**: 后端机制决定 WebSocket 断开即删除 Session。
- **影响**: 
  - 刷新页面会导致 HTTP API 报错 `获取登录会话关联用户信息失败`。
  - 网络波动导致 WS 断连后，需要重新登录才能继续使用。
- **当前缓解措施**: `AuthContext.jsx` 在应用初始化时会验证 Session，若无效则自动登出引导用户重登。

### 3. 未找到客户端长连接
- **现象**: Gateway 日志频繁出现 `未找到用户id为 ... 的客户端的长连接！`。
- **影响**: 实时消息推送失败（对方收不到消息，除非轮询历史记录）。

---

## API 协议覆盖率

### user.proto
| API | 状态 |
|-----|------|
| `/service/user/username_login` | ✅ |
| `/service/user/get_user_info` | ✅ |
| `/service/user/set_avatar` | ✅ (新增) |
| `/service/user/set_nickname` | ✅ (新增) |
| `/service/user/set_description` | ✅ (新增) |

### message_transmit.proto
| API | 状态 | 备注 |
|-----|------|------|
| `/service/message_transmit/new_message` | ⚠️ | 编码器存在，但后端反序列化报错 |

### message_storage.proto
| API | 状态 |
|-----|------|
| `/service/message_storage/get_history` | ✅ | 已替换原 `get_recent` |
| `/service/message_storage/search_history` | ✅ | 界面已集成 |

---

## 开发路线图

### 下一步计划 (Debug Phase)

1. **解决消息反序列化问题**
   - 抓包分析前端发送的 Protobuf 二进制数据。
   - 对比后端 `MessageContent` 定义。
   - 尝试简化消息结构（仅发送纯文本，不含任何 extra data）进行测试。

2. **解决 WebSocket 连接管理**
   - 优化前端 WS 重连机制。
   - 探讨后端是否能放宽 "WS 断开即删 Session" 的策略，或前端实现静默重登。

### 后续功能开发

- [ ] **文件服务对接**: 实现 `file.proto` 相关 API。
- [ ] **多媒体消息**: 图片、文件消息的完整 UI 支持。

---

## 如何运行

```bash
cd ChatSystem-Frontend-React
npm install
npm run dev
```

访问 http://localhost:5173
