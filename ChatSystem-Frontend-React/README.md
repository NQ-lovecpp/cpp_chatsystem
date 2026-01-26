# ChatSystem Frontend (React)

基于 C++ 后端的即时通讯系统的 React 前端实现。

---

## 📑 目录

- [项目架构](#项目架构)
- [开发状态](#开发状态)
- [API 协议覆盖率](#api-协议覆盖率)
- [已知问题与限制](#已知问题与限制)
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
│   ├── Sidebar.jsx         # 左侧导航栏
│   ├── SessionList.jsx     # 会话列表（含群聊创建）
│   ├── FriendList.jsx      # 好友列表（含搜索/申请）
│   ├── MessageArea.jsx     # 聊天消息区域
│   ├── MessageInput.jsx    # 消息输入框
│   ├── SettingsPanel.jsx   # 设置面板
│   └── ServerConfig.jsx    # 服务器配置组件
├── contexts/               # React Context 状态管理
│   ├── AuthContext.jsx     # 认证状态
│   └── ChatContext.jsx     # 聊天数据状态
├── pages/                  # 页面组件
│   ├── Home.jsx            # 主页面
│   └── Login.jsx           # 登录页面
└── proto/                  # Protobuf 协议定义文件
    ├── base.proto          # 基础数据结构
    ├── user.proto          # 用户服务协议
    ├── friend.proto        # 好友服务协议
    ├── gateway.proto       # 网关协议
    ├── message_transmit.proto
    ├── message_storage.proto
    ├── file.proto          # 文件服务协议
    ├── notify.proto        # WebSocket 通知
    └── speech_recognition.proto
```

---

## 开发状态

### ✅ 已完成功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户登录 | ✅ 完成 | 用户名/密码登录 |
| 用户注册 | ✅ 完成 | 用户名注册 |
| 好友列表 | ✅ 完成 | 显示好友列表 |
| 好友搜索 | ✅ 完成 | 按昵称搜索用户 |
| 发送好友申请 | ✅ 完成 | 向搜索到的用户发送申请 |
| 处理好友申请 | ✅ 完成 | 同意/拒绝好友申请 |
| 会话列表 | ✅ 完成 | 显示聊天会话列表 |
| 创建群聊 | ✅ 完成 | 选择好友创建群组 |
| WebSocket 连接 | ✅ 完成 | 实时通知推送 |

### ⚠️ 部分完成

| 功能 | 状态 | 问题 |
|------|------|------|
| 发送消息 | ⚠️ 不完整 | 编码器存在，但 UI 未正确触发 |
| 消息显示 | ⚠️ 不完整 | 解码器需要完善 |

### ❌ 未实现功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 查看好友信息 | 高 | 点击好友查看详情 |
| 查看个人信息 | 高 | 左下角用户信息展示 |
| 修改头像 | 中 | set_avatar API |
| 修改昵称 | 中 | set_nickname API |
| 修改签名 | 中 | set_description API |
| 绑定手机 | 低 | set_phone API |
| 文件上传/下载 | 中 | file.proto 相关 |
| 语音转文字 | 低 | speech_recognition API |
| 会话信息查看 | 中 | 右上角按钮功能 |
| 消息搜索 | 低 | 右上角搜索功能 |

---

## API 协议覆盖率

### httpClient.js 编码器实现状态

#### user.proto (用户服务)

| API 路径 | 编码器 | 解码器 | 状态 |
|----------|--------|--------|------|
| `/service/user/username_login` | ✅ | ✅ | 完成 |
| `/service/user/username_register` | ✅ | ✅ | 完成 |
| `/service/user/get_user_info` | ✅ | ✅ | 完成 |
| `/service/user/set_avatar` | ❌ | ❌ | **未实现** |
| `/service/user/set_nickname` | ❌ | ❌ | **未实现** |
| `/service/user/set_description` | ❌ | ❌ | **未实现** |
| `/service/user/set_phone` | ❌ | ❌ | **未实现** |
| `/service/user/phone_login` | ❌ | ❌ | 未实现 |
| `/service/user/phone_register` | ❌ | ❌ | 未实现 |
| `/service/user/get_phone_verify_code` | ❌ | ❌ | 未实现 |

#### friend.proto (好友服务)

| API 路径 | 编码器 | 解码器 | 状态 |
|----------|--------|--------|------|
| `/service/friend/get_friend_list` | ✅ | ✅ | 完成 |
| `/service/friend/search_friend` | ✅ | ✅ | 完成 |
| `/service/friend/add_friend_apply` | ✅ | ✅ | 完成 |
| `/service/friend/add_friend_process` | ✅ | ✅ | 完成 |
| `/service/friend/remove_friend` | ✅ | ✅ | 完成 |
| `/service/friend/get_pending_friend_events` | ✅ | ⚠️ | 需测试 |
| `/service/friend/get_chat_session_list` | ✅ | ✅ | 完成 |
| `/service/friend/create_chat_session` | ✅ | ✅ | 完成 |
| `/service/friend/get_chat_session_member` | ✅ | ⚠️ | 需测试 |

#### message_storage.proto (消息存储)

| API 路径 | 编码器 | 解码器 | 状态 |
|----------|--------|--------|------|
| `/service/message_storage/get_recent` | ✅ | ⚠️ | 需完善解码 |
| `/service/message_storage/get_history` | ✅ | ⚠️ | 需完善解码 |
| `/service/message_storage/search_history` | ✅ | ⚠️ | 需完善解码 |

#### message_transmit.proto (消息发送)

| API 路径 | 编码器 | 解码器 | 状态 |
|----------|--------|--------|------|
| `/service/message_transmit/new_message` | ✅ | ✅ | 编码器存在，需测试 |

#### file.proto (文件服务) - **全部未实现**

| API 路径 | 编码器 | 解码器 | 状态 |
|----------|--------|--------|------|
| `/service/file/get_single_file` | ❌ | ❌ | **未实现** |
| `/service/file/get_multi_file` | ❌ | ❌ | **未实现** |
| `/service/file/put_single_file` | ❌ | ❌ | **未实现** |
| `/service/file/put_multi_file` | ❌ | ❌ | **未实现** |

#### WebSocket 通知 (notify.proto)

| 通知类型 | 处理器 | 状态 |
|----------|--------|------|
| `FRIEND_ADD_APPLY_NOTIFY` | ⚠️ | 部分实现 |
| `FRIEND_ADD_PROCESS_NOTIFY` | ⚠️ | 部分实现 |
| `CHAT_SESSION_CREATE_NOTIFY` | ⚠️ | 部分实现 |
| `CHAT_MESSAGE_NOTIFY` | ⚠️ | 部分实现 |
| `FRIEND_REMOVE_NOTIFY` | ❌ | 未实现 |

---

## 已知问题与限制

### 1. Protobuf 解码器问题
- `httpClient.js` 使用手写的 Protobuf 解码器，针对不同消息类型需要不同的解析逻辑
- 当前实现了 `decodeUserInfo`, `decodeChatSessionInfo`, `decodeMessageInfo`, `decodeFriendEvent`
- **问题**: 某些复杂嵌套消息可能解析不完整

### 2. 组件功能缺失
- `MessageArea.jsx`: 右上角搜索和会话信息按钮无功能
- `SettingsPanel.jsx`: 个人资料查看/修改未实现
- `Sidebar.jsx`: 左下角用户头像/信息展示不完整

### 3. 消息发送流程
- 编码器 `encodeNewMessageReq` 已实现
- 但 `MessageInput.jsx` 到 `wsClient.js` 的调用链需要验证

---

## 开发路线图

### 阶段 1: 核心功能完善 (高优先级)

1. **修复消息发送**
   - 文件: `MessageInput.jsx`, `messageApi.js`
   - 验证 `new_message` 编码器和 WebSocket 交互
   
2. **完善消息显示**
   - 文件: `MessageArea.jsx`, `httpClient.js`
   - 完善 `MessageInfo` 解码，支持文本/图片/文件消息

3. **实现个人信息查看**
   - 文件: `SettingsPanel.jsx`, `Sidebar.jsx`
   - 调用 `get_user_info` 显示当前用户信息

4. **实现好友信息查看**
   - 新增组件或模态框
   - 点击好友显示详细信息

### 阶段 2: 用户资料管理 (中优先级)

5. **添加用户信息修改 API**
   - 在 `httpClient.js` 添加编码器:
     - `encodeSetUserAvatarReq`
     - `encodeSetUserNicknameReq`
     - `encodeSetUserDescriptionReq`
   - 在 `userApi.js` 添加对应函数

6. **实现设置面板**
   - 文件: `SettingsPanel.jsx`
   - 添加头像上传、昵称修改、签名修改功能

### 阶段 3: 文件功能 (中优先级)

7. **实现文件上传/下载**
   - 添加 `fileApi.js`
   - 在 `httpClient.js` 添加编码器:
     - `encodePutSingleFileReq`
     - `encodeGetSingleFileReq`
   - 支持图片消息预览

### 阶段 4: 高级功能 (低优先级)

8. **会话搜索和信息**
   - 右上角搜索框实现消息搜索
   - 会话信息按钮显示群成员列表

9. **WebSocket 通知优化**
   - 完善所有通知类型处理
   - 添加消息已读状态

---

## 如何继续开发

### 添加新 API 编码器

1. 查看 `src/proto/` 中对应的 `.proto` 文件
2. 在 `src/api/httpClient.js` 中:
   ```javascript
   // 1. 添加编码函数
   function encodeXxxReq(data) {
       const parts = [];
       // field 1: request_id (string)
       if (data.request_id) parts.push(encodeString(1, data.request_id));
       // ... 其他字段
       return new Uint8Array(parts.flat());
   }
   
   // 2. 注册到 encoders 对象
   const encoders = {
       // 现有编码器...
       '/service/xxx/xxx': encodeXxxReq,
   };
   ```

3. 如果响应有嵌套消息，需要添加解码函数

### 添加新组件功能

1. 在对应组件中导入 API 函数
2. 使用 `useAuth()` 获取 `sessionId` 和 `user`
3. 调用 API 并处理响应

### 调试技巧

- 浏览器控制台查看 `[HTTP]` 和 `[WS]` 前缀的日志
- 检查 Protobuf 编码后的二进制数据
- 使用后端日志验证请求是否正确到达

---

## 后端连接配置

默认连接到 `http://117.72.15.209:9000` (HTTP) 和 `117.72.15.209:9001` (WebSocket)

可以通过登录页面的服务器配置面板修改。

---

## 运行项目

```bash
cd ChatSystem-Frontend-React
npm install
npm run dev
```

访问 http://localhost:5173

---

## 联系方式

项目后端仓库: `ChatSystem-Backend/`
