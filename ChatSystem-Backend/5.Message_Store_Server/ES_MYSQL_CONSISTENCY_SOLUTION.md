# ES与MySQL双写一致性解决方案

## 问题背景

原有实现存在严重的双写一致性问题：
- ES写入失败直接return，MySQL未写入 → **消息丢失**
- ES写入成功但MySQL失败 → **数据不一致**
- 无事务保证、无回滚、无重试机制

## 解决方案

采用**RabbitMQ可靠消息 + 最终一致性**方案：

### 核心设计

```
消息流转：
┌──────────┐     ┌──────────────┐
│ 主消息队列 │ ──→ │ 消息存储处理器 │
└──────────┘     └──────────────┘
                        ↓
                 ┌──────────────┐
                 │ MySQL写入(带重试)│
                 └──────────────┘
                        ↓
                 ┌──────────────┐
                 │ 尝试写入ES    │
                 └──────────────┘
                   ↙         ↘
            [成功]           [失败]
                ↓               ↓
            [完成]      ┌──────────────┐
                        │ES同步队列     │
                        └──────────────┘
                               ↓
                        ┌──────────────┐
                        │ES同步消费者   │
                        │(指数退避重试)  │
                        └──────────────┘
                          ↙         ↘
                   [成功完成]    [超限失败]
                                      ↓
                              ┌──────────────┐
                              │  死信队列     │
                              │ (需人工处理)  │
                              └──────────────┘
```

### 设计原则

1. **MySQL为主** - 唯一真实数据源，优先保证写入成功
2. **ES为辅** - 提供搜索加速，异步最终一致
3. **最终一致性** - 短期可能不一致，但最终会同步
4. **失败重试** - 指数退避，最多5次重试
5. **死信处理** - 重试失败进入死信队列，支持告警和人工介入

## 实施内容

### 1. 配置文件变更

**message_store_server.conf** 新增：
```conf
# ES同步队列配置
-mq_es_sync_exchange  = es_sync_exchange    # ES同步交换机
-mq_es_sync_queue     = es_sync_queue       # ES同步队列
-mq_es_sync_routing   = es_sync_routing     # ES同步路由键
-es_sync_retry_max    = 5                   # 最大重试5次
-es_sync_retry_delay  = 1000                # 基础延迟1秒
```

### 2. 核心代码变更

#### 2.1 重构 `when_get_an_message()` 函数

**变更前**：
```cpp
// 先写ES，失败直接return
ret = _es_message->append_message(...);
if (!ret) {
    LOG_ERROR("ES写入失败！");
    return;  // ❌ MySQL未写入，消息丢失
}

// 再写MySQL
ret = _mysql_message_table->insert(msg);
if (!ret) {
    LOG_ERROR("MySQL写入失败！");  // ❌ ES已写入，数据不一致
}
```

**变更后**：
```cpp
// 1. 优先写MySQL（带重试）
bool mysql_success = _write_to_mysql_with_retry(msg, 3);
if (!mysql_success) {
    LOG_ERROR("MySQL写入失败，消息丢弃");
    return;  // ✅ MySQL失败才放弃
}

// 2. 尝试写ES（非阻塞）
if (message.message().message_type() == MessageType::STRING) {
    bool es_success = _try_write_to_es(message);
    if (!es_success) {
        // ✅ ES失败发送到同步队列异步重试
        _publish_to_es_sync_queue(message, 0);
        LOG_WARN("ES写入失败，已加入同步队列");
    }
}
```

#### 2.2 新增 `when_es_sync_message()` 消费者

ES同步队列消费者，负责：
- 解析重试计数
- 指数退避延迟：1s → 2s → 4s → 8s → 16s
- 重试写入ES
- 失败重新入队或进入死信队列

#### 2.3 新增辅助方法

- `_write_to_mysql_with_retry()` - MySQL写入带重试
- `_try_write_to_es()` - 尝试写入ES（捕获异常）
- `_publish_to_es_sync_queue()` - 发布到ES同步队列

### 3. 架构组件

#### 3.1 队列结构

| 队列名称 | 用途 | 消费者 |
|---------|------|--------|
| msg_queue | 主消息队列 | when_get_an_message |
| es_sync_queue | ES同步队列 | when_es_sync_message |
| es_sync_dlq | 死信队列 | 人工处理/告警 |

#### 3.2 重试策略

**MySQL重试**（同步）：
- 最多3次
- 固定间隔100ms
- ⚠️ 失败则放弃消息（存在消息丢失风险，待修复）

**ES重试**（异步）：
- 最多5次
- 指数退避：1s, 2s, 4s, 8s, 16s
- 失败进入死信队列

### 4. 失败场景处理

| 场景 | MySQL | ES | 处理方式 | 最终结果 |
|------|-------|-----|---------|---------|
| 正常 | ✅成功 | ✅成功 | 直接完成 | 强一致 |
| ES暂时故障 | ✅成功 | ❌失败 | 进入同步队列 | 最终一致 |
| ES长期故障 | ✅成功 | ❌失败 | 死信队列+告警 | 需人工介入 |
| MySQL故障 | ❌失败 | - | ⚠️ 消息丢弃+日志 | ⚠️ **消息丢失**（待修复） |

**注意**：MySQL故障场景存在消息丢失风险，详见"已知问题"章节。

## 监控和日志

### 关键日志

```cpp
// 消息处理完成
LOG_INFO("消息存储完成 - message_id={}, MySQL:成功, ES:{}", 
         message_id, es_success ? "成功" : "异步同步中");

// ES同步重试
LOG_INFO("ES同步重试延迟: {}ms, message_id={}, retry_count={}/{}", 
         delay_ms, message_id, retry_count + 1, max_retry);

// ES同步成功
LOG_INFO("ES同步成功: message_id={}, retry_count={}", 
         message_id, retry_count + 1);

// 最终失败
LOG_ERROR("ES同步重试次数超限，放弃: message_id={}, retry_count={}/{}", 
          message_id, retry_count, max_retry);
```

### 监控指标

1. **队列积压**：监控 `es_sync_queue` 长度
   ```bash
   rabbitmqctl list_queues name messages | grep es_sync_queue
   ```

2. **死信统计**：统计 `es_sync_dlq` 数量
   ```bash
   rabbitmqctl list_queues | grep dlq
   ```

3. **ES成功率**：统计ES写入成功率
4. **同步延迟**：记录ES同步延迟时间

## 部署步骤

### 1. 编译

```bash
cd /home/chen/cpp_chatsystem/ChatSystem-Backend/5.Message_Store_Server
mkdir -p build && cd build
cmake ..
make
```

### 2. 配置

确保 `message_store_server.conf` 包含ES同步队列配置。

### 3. 启动服务

```bash
./message_store_server
```

### 4. 验证

检查日志：
```bash
tail -f /im/logs/message_store_server.log | grep "ES同步"
```

检查队列：
```bash
rabbitmqctl list_queues name messages consumers
```

### 5. 灰度验证

1. 观察ES同步队列是否正常消费
2. 发送测试消息，验证双写是否正常
3. 模拟ES故障，验证同步队列机制
4. 检查死信队列是否有积压

## 运维建议

### 日常监控

1. **队列长度告警**：es_sync_queue > 1000 条告警
2. **死信告警**：es_sync_dlq 有新消息时告警
3. **延迟监控**：ES同步延迟 > 60秒告警

### 故障处理

#### ES长期故障

如果ES长期不可用，消息会进入死信队列：

1. 修复ES服务
2. 从死信队列获取消息
3. 重新发布到es_sync_queue进行补偿

#### 队列积压

如果es_sync_queue积压：

1. 检查ES服务状态
2. 检查ES写入性能
3. 考虑增加消费者并发（修改代码支持）

### 数据一致性检查

```sql
-- 检查MySQL文本消息数量
SELECT COUNT(*) FROM tb_message WHERE message_type = 0;
```

```bash
# 检查ES文档数量
curl -X GET "localhost:9200/message/_count"
```

## 性能影响

- **写入性能**：略有提升（ES异步，不阻塞）
- **读取性能**：无影响
- **资源消耗**：增加1个消费者线程
- **延迟**：MySQL实时，ES最终一致（通常<5秒）

## 兼容性

- ✅ RPC接口完全兼容
- ✅ 客户端无需修改
- ✅ 搜索功能透明
- ✅ 支持平滑升级

## 未来优化

1. **批量同步**：改为批量消费es_sync_queue
2. **补全机制**：定期对比MySQL和ES，自动补全缺失数据
3. **监控面板**：接入Grafana展示监控指标
4. **配置热更新**：支持动态调整重试次数和延迟

## ⚠️ 已知问题

### MySQL失败时消息丢失风险

**问题描述**：

当前实现中，MySQL写入失败后直接`return`，但RabbitMQ消费者会无条件ACK消息，导致消息被确认消费但实际未存储，造成消息丢失。

**问题位置**：

- 代码位置：`message_store_server.hpp:454-458`
- 触发条件：MySQL写入失败（连接超时、连接池耗尽、数据库故障等）

**影响范围**：

- 如果MySQL临时故障，消息会永久丢失
- 无法通过重试机制恢复
- 用户发送的消息可能无法存储

**解决方案（待实现）**：

#### 方案A：修改RabbitMQ消费者支持手动ACK

**优点**：
- 实现简单，改动小
- 利用RabbitMQ原生重试机制

**缺点**：
- 需要修改`rabbitmq.hpp`，可能影响其他使用方
- 重试间隔由RabbitMQ控制，不够灵活

**实现要点**：
```cpp
// 修改rabbitmq.hpp的consume_message方法
// callback返回bool，成功才ACK，失败则NACK
```

#### 方案B：创建MySQL重试队列（推荐）

**优点**：
- 与ES同步队列机制保持一致，架构统一
- 重试策略灵活可控（指数退避、最大重试次数等）
- 不影响现有RabbitMQ客户端代码

**缺点**：
- 需要新增队列和消费者
- 代码复杂度略有增加

**实现要点**：
```cpp
// 1. 创建mysql_retry_queue队列
// 2. MySQL失败时发送到重试队列
// 3. 添加MySQL重试消费者，支持重试和死信队列
```

#### 方案C：MySQL失败时发送到死信队列

**优点**：
- 实现简单
- 支持人工介入和补偿

**缺点**：
- 需要人工处理，自动化程度低
- 不适合高频失败场景

**优先级**：低（作为兜底方案）

**推荐方案**：方案B（MySQL重试队列）

与ES同步队列机制保持一致，架构统一，易于维护和扩展。

## 总结

通过引入ES同步队列和重试机制，解决了ES与MySQL的双写一致性问题：

✅ **ES最终一致**：ES异步同步，最终达到一致
✅ **故障容错**：ES失败自动重试，失败告警
✅ **性能优化**：ES异步写入，不阻塞主流程
✅ **可监控**：完整日志，便于排查问题

⚠️ **待改进**：MySQL失败时存在消息丢失风险，需要实现MySQL重试队列机制（见"已知问题"章节）
