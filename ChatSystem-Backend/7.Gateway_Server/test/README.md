# Gateway Server API 测试

本目录包含对 Gateway Server 的完整 API 测试，使用 Google Test (gtest) 框架编写。

## 测试覆盖范围

### 端口测试
- **9000 端口 (HTTP API)**: 测试所有 28 个 HTTP API 接口
- **9001 端口 (WebSocket)**: 测试 WebSocket 连接和端点可访问性

### API 测试分类

#### 1. 不需要鉴权的 API (5个)
- `GetPhoneVerifyCode` - 获取手机验证码
- `UsernameRegister` - 用户名注册
- `UsernameLogin` - 用户名登录
- `PhoneRegister` - 手机号注册
- `PhoneLogin` - 手机号登录

#### 2. 需要鉴权的用户相关 API (5个)
- `GetUserInfo` - 获取用户信息
- `SetUserNickname` - 设置用户昵称
- `SetUserDescription` - 设置用户描述
- `SetUserAvatar` - 设置用户头像
- `SetUserPhoneNumber` - 设置用户手机号

#### 3. 好友相关 API (8个)
- `GetFriendList` - 获取好友列表
- `FriendSearch` - 搜索好友
- `FriendAdd` - 添加好友申请
- `FriendAddProcess` - 处理好友申请
- `FriendRemove` - 删除好友
- `GetPendingFriendEventList` - 获取待处理好友申请列表
- `GetChatSessionList` - 获取聊天会话列表
- `GetChatSessionMember` - 获取聊天会话成员
- `ChatSessionCreate` - 创建聊天会话

#### 4. 消息相关 API (4个)
- `GetHistoryMsg` - 获取历史消息
- `GetRecentMsg` - 获取最近消息
- `MsgSearch` - 搜索消息
- `NewMessage` - 发送新消息

#### 5. 文件相关 API (4个)
- `GetSingleFile` - 获取单个文件
- `GetMultiFile` - 获取多个文件
- `PutSingleFile` - 上传单个文件
- `PutMultiFile` - 上传多个文件

#### 6. 语音识别 API (1个)
- `SpeechRecognition` - 语音转文字

#### 7. 其他测试
- `InvalidSessionId` - 测试无效的 session_id（鉴权失败）
- `InvalidPath` - 测试无效的请求路径
- `EmptyRequestBody` - 测试空请求体
- `CORSTest` - 测试 CORS 头
- `ConcurrentRequests` - 测试并发请求
- `WebSocketConnectionTest` - 测试 WebSocket 连接

## 构建测试

### 前置条件
1. 确保已安装以下依赖：
   - Google Test (gtest)
   - Google Flags (gflags)
   - Protobuf
   - httplib (包含在 Common/httplib.h)

2. 确保已生成 Protobuf 代码：
   ```bash
   cd ChatSystem-Backend/7.Gateway_Server/build
   # Protobuf 代码会在构建时自动生成
   ```

### 构建步骤

```bash
cd ChatSystem-Backend/7.Gateway_Server
mkdir -p build
cd build
cmake ..
make gateway_api_test
```

## 运行测试

### 前置条件
在运行测试之前，需要确保：
1. Gateway Server 正在运行（监听 9000 和 9001 端口）
2. 所有依赖的后端服务已启动（用户服务、好友服务、消息服务等）
3. 数据库和 Redis 等服务已启动

### 运行所有测试

```bash
cd ChatSystem-Backend/7.Gateway_Server/build
./gateway_api_test
```

### 运行特定测试

```bash
# 运行特定测试套件
./gateway_api_test --gtest_filter=GatewayAPITest.GetUserInfo

# 运行多个测试
./gateway_api_test --gtest_filter=GatewayAPITest.GetUserInfo:GatewayAPITest.UsernameLogin

# 排除某些测试
./gateway_api_test --gtest_filter=GatewayAPITest.*:-GatewayAPITest.ConcurrentRequests
```

### 自定义配置

```bash
# 指定网关服务器地址和端口
./gateway_api_test --gateway_host=192.168.1.100 --gateway_http_port=9000 --gateway_ws_port=9001
```

## 测试说明

### 测试顺序
测试用例的执行顺序是随机的（gtest 默认行为）。某些测试用例可能依赖于之前的测试结果（如登录后获取 session_id），这些测试会在依赖条件不满足时自动跳过。

### 测试数据
- 测试使用随机生成的用户名和 UUID，避免测试数据冲突
- 某些测试可能需要预先准备测试数据（如好友关系、会话等）

### 预期行为
- 大部分测试主要验证 API 接口是否可访问和响应格式是否正确
- 业务逻辑的正确性（如验证码验证、好友关系等）需要依赖后端服务的实现
- 如果后端服务未启动或配置不正确，测试可能会失败

## 故障排查

### 常见问题

1. **连接失败**
   - 检查 Gateway Server 是否正在运行
   - 检查端口是否正确（默认 9001）
   - 检查防火墙设置

2. **鉴权失败**
   - 确保先运行登录测试获取有效的 session_id
   - 检查 Redis 服务是否正常运行（session 信息存储在 Redis）

3. **服务不可用**
   - 检查所有后端服务是否已启动
   - 检查 etcd 服务发现是否正常工作
   - 查看 Gateway Server 日志

4. **Protobuf 序列化错误**
   - 确保 Protobuf 代码已正确生成
   - 检查 proto 文件版本是否匹配

## 测试报告

测试运行后会显示详细的测试结果，包括：
- 通过的测试数量
- 失败的测试数量
- 跳过的测试数量
- 每个测试的执行时间

示例输出：
```
[==========] Running 30 tests from 1 test suite.
[----------] Global test environment set-up.
[----------] 30 tests from GatewayAPITest
[ RUN      ] GatewayAPITest.GetPhoneVerifyCode
[       OK ] GatewayAPITest.GetPhoneVerifyCode (10 ms)
...
[==========] 30 tests from 1 test suite ran. (500 ms total)
[  PASSED  ] 28 tests.
[  FAILED  ] 2 tests.
[  SKIPPED ] 0 tests.
```

## 扩展测试

要添加新的测试用例，请在 `gateway_api_test.cc` 中添加新的 `TEST` 宏：

```cpp
TEST(GatewayAPITest, YourNewTest) {
    // 测试代码
    ASSERT_TRUE(condition);
}
```

## 注意事项

1. 测试会向服务器发送真实的请求，请确保在测试环境中运行
2. 某些测试可能会创建测试数据，建议使用测试数据库
3. WebSocket 测试目前只测试连接性，完整的 WebSocket 消息测试需要额外的客户端库支持
