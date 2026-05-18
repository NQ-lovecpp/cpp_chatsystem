# ChatSystem Docker 架构说明

本文档详细说明 ChatSystem 的 Docker 部署架构、网络设计和服务间通信机制。

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Overlay Network (chatsystem-overlay)      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   etcd       │  │    MySQL     │  │    Redis     │      │
│  │   (2379)     │  │   (3306)     │  │   (6379)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Elasticsearch│  │  RabbitMQ    │                         │
│  │  (9200)      │  │   (5672)     │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              业务服务层                              │   │
│  │                                                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │ Speech   │ │  File    │ │  User    │            │   │
│  │  │ (10001)  │ │ (10002)  │ │ (10003)  │            │   │
│  │  └──────────┘ └──────────┘ └──────────┘            │   │
│  │                                                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │ MsgTrans │ │ MsgStore │ │ Friend   │            │   │
│  │  │ (10004)  │ │ (10005)  │ │ (10006)  │            │   │
│  │  └──────────┘ └──────────┘ └──────────┘            │   │
│  │                                                       │   │
│  │  ┌──────────────────────────┐                       │   │
│  │  │     Gateway Server       │                       │   │
│  │  │  HTTP(9000) WS(9001)     │◄──────────────────┐  │   │
│  │  └──────────────────────────┘                    │  │   │
│  └─────────────────────────────────────────────────┼──┘   │
│                                                      │      │
└──────────────────────────────────────────────────┼──┼──────┘
                                                    │  │
                                                    │  │
                                            ┌───────▼──▼───────┐
                                            │   客户端请求     │
                                            │  (外部访问)      │
                                            └──────────────────┘
```

## 网络架构

### Overlay 网络

使用 Docker Swarm 的 **Overlay 网络**实现跨主机容器通信：

- **网络名称**: `chatsystem-overlay`
- **驱动**: overlay
- **特性**: 
  - 支持跨主机容器通信
  - 自动服务发现（容器可通过服务名互相访问）
  - 内置负载均衡
  - 加密通信（可选）

### 服务发现机制

在 overlay 网络中，所有服务可以通过**服务名**直接访问，无需知道具体 IP：

```yaml
# 示例：user_server 访问 MySQL
-mysql_host = mysql  # 直接使用服务名
-redis_host = redis
-registry_host = http://etcd:2379
```

Docker 内置 DNS 会自动解析服务名到对应的容器 IP。

## 服务分层

### 基础设施层

| 服务 | 端口 | 用途 | 持久化 |
|------|------|------|--------|
| etcd | 2379, 2380 | 服务注册与发现、配置中心 | etcd-data volume |
| MySQL | 3306 | 关系型数据库 | mysql-data volume |
| Redis | 6379 | 缓存、会话存储 | redis-data volume |
| Elasticsearch | 9200, 9300 | 全文搜索、用户搜索 | es-data volume |
| RabbitMQ | 5672, 15672 | 消息队列、异步任务 | rabbitmq-data volume |

### 业务服务层

| 服务 | 端口 | 依赖 | 功能 |
|------|------|------|------|
| speech_server | 10001 | etcd | 语音识别服务 |
| file_server | 10002 | etcd | 文件存储服务 |
| user_server | 10003 | etcd, MySQL, Redis, ES | 用户管理 |
| message_transmit_server | 10004 | etcd, MySQL, RabbitMQ | 消息转发 |
| message_store_server | 10005 | etcd, MySQL, ES, RabbitMQ | 消息持久化 |
| friend_server | 10006 | etcd, MySQL, ES | 好友管理 |
| gateway_server | 9000, 9001 | etcd, Redis, 所有业务服务 | HTTP/WebSocket 网关 |

## 服务注册与发现流程

```
1. 服务启动
   ↓
2. 向 etcd 注册服务信息
   - 服务名称: /service/<service_type>/instance
   - 服务地址: <container_name>:<port>
   - 租约保活: 3秒心跳
   ↓
3. 其他服务通过 etcd 发现服务
   - Watch /service/ 目录
   - 获取可用服务列表
   - 建立 brpc Channel 连接
   ↓
4. 服务下线
   - 租约过期自动删除
   - Watch 触发服务列表更新
```

**示例：user_server 注册到 etcd**

```
Key: /service/user_service/instance1
Value: user_server:10003
Lease: 3秒（持续 KeepAlive）
```

**示例：gateway_server 发现 user_server**

```
1. gateway 启动时 Watch /service/user_service/
2. etcd 返回: user_server:10003
3. gateway 创建 brpc::Channel 连接到 user_server:10003
4. 通过 Channel 发起 RPC 调用
```

## RPC 调用流程

### 服务间 RPC 调用（以 gateway → user_server 为例）

```
┌─────────────┐                                  ┌─────────────┐
│   Gateway   │                                  │ User Server │
└─────────────┘                                  └─────────────┘
       │                                                  │
       │ 1. 从 ServiceManager 获取 user_server Channel  │
       ├──────────────────────────────────────────────►│
       │                                                  │
       │ 2. 通过 Channel 发起 RPC 调用                  │
       │    (GetUserInfo)                                │
       ├──────────────────────────────────────────────►│
       │                                                  │
       │                                         3. 处理请求
       │                                         4. 查询 MySQL
       │                                         5. 返回响应
       │                                                  │
       │◄─────────────────────────────────────────────┤
       │                                                  │
```

### Overlay 网络中的数据包流转

```
Container A (gateway_server)
    ↓
Docker 内核 (VXLAN 封装)
    ↓
物理网络 (跨主机通信)
    ↓
Docker 内核 (VXLAN 解封装)
    ↓
Container B (user_server)
```

**关键技术：**
- **VXLAN**: 虚拟可扩展局域网，端口 4789
- **Overlay 驱动**: 自动处理跨主机路由
- **服务网格**: Swarm 内置负载均衡

## 数据持久化策略

### Docker Volumes（推荐用于数据库）

优点：
- Docker 管理，自动挂载
- 支持跨主机卷驱动（如 NFS、Ceph）
- 备份恢复方便

```yaml
volumes:
  mysql-data:
  redis-data:
  es-data:
```

### 宿主机目录挂载（用于日志和业务数据）

优点：
- 直接访问文件
- 便于日志分析
- 易于备份

```yaml
volumes:
  - ./docker_image_data/logs:/im/logs:rw
  - ./docker_image_data/data:/im/data:rw
```

## 高可用设计

### 服务副本

Swarm 支持运行多个服务副本：

```bash
# 扩展 user_server 到 3 个副本
docker service scale chatsystem_user_server=3
```

**自动负载均衡：**
- Swarm 内置 Load Balancer
- 请求自动分发到健康的副本
- 副本失败自动重启

### 健康检查

所有服务配置了健康检查：

```yaml
healthcheck:
  test: ["CMD-SHELL", "nc -z localhost 10003 || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 3
```

**行为：**
- 连续 3 次失败 → 标记为不健康
- 不健康的容器不接收流量
- Swarm 自动重启不健康的容器

### 故障恢复

**场景 1：容器崩溃**
```
容器退出 → Swarm 检测 → 自动重启 → 服务恢复
```

**场景 2：节点宕机**
```
节点失联 → Swarm 标记节点下线 → 在其他节点重新调度服务
```

**场景 3：网络分区**
```
Manager 节点保持 Raft 共识 → 分区恢复后自动同步状态
```

## 扩展性

### 水平扩展

任何业务服务都可以水平扩展：

```bash
# 扩展到 5 个副本
docker service scale chatsystem_user_server=5

# Swarm 会：
# 1. 在不同节点启动新副本
# 2. 自动注册到 overlay 网络
# 3. 自动负载均衡请求
```

### 跨区域部署

通过标签控制服务分布：

```bash
# 给节点打标签
docker node update --label-add zone=beijing node1
docker node update --label-add zone=shanghai node2

# 约束服务运行位置
docker service update --constraint-add 'node.labels.zone==beijing' service_name
```

## 性能优化

### 资源限制

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

### 网络优化

1. **MTU 配置**: 确保 MTU 正确设置（通常 1450 for VXLAN）
2. **网络模式**: 高性能场景可考虑 `host` 模式（牺牲隔离性）
3. **长连接**: brpc 使用长连接池，减少连接开销

### 数据库优化

1. **连接池**: 调整各服务的 `mysql_pool_count`
2. **索引优化**: 确保 SQL 查询命中索引
3. **读写分离**: 可配置 MySQL 主从复制（需要额外配置）

## 监控建议

### 日志聚合

所有日志统一输出到 `./docker_image_data/logs/`：

```bash
# 实时查看所有日志
tail -f docker_image_data/logs/*.log
```

### 指标监控（可选）

建议集成监控系统：

- **Prometheus + Grafana**: 收集容器和服务指标
- **ELK Stack**: 日志分析和可视化
- **Jaeger**: 分布式追踪

## 安全建议

1. **网络隔离**: overlay 网络自动隔离外部访问
2. **密码管理**: 使用 Docker Secrets 存储敏感信息（生产环境）
3. **TLS 加密**: overlay 网络可启用加密（`--opt encrypted`）
4. **访问控制**: 限制对外暴露的端口（仅 9000/9001）

## 总结

ChatSystem 的 Docker 架构充分利用了 Swarm 和 Overlay 网络的特性：

- ✅ **跨主机通信**: Overlay 网络无缝支持
- ✅ **服务发现**: etcd + Docker DNS 双重保障
- ✅ **高可用**: 多副本 + 自动故障恢复
- ✅ **可扩展**: 水平扩展简单直接
- ✅ **易维护**: 统一的部署和管理接口

这套架构既适合单机开发测试，也支持生产环境的多节点集群部署。
