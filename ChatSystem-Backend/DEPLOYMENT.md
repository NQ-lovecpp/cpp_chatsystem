# ChatSystem 部署指南

本文档说明如何使用 Docker Swarm + Overlay 网络部署 ChatSystem 聊天系统集群。

## 架构概览

- **网络模式**: Docker Swarm Overlay 网络（支持跨主机通信）
- **服务发现**: etcd
- **数据持久化**: 所有数据存储在 `docker_image_data/` 和 Docker volumes 中
- **负载均衡**: Docker Swarm 原生支持

## 部署前准备

### 1. 停止并禁用本机服务

在部署前，需要停止并禁用本机的 MySQL、Redis、Elasticsearch 服务，避免端口冲突：

```bash
# 停止服务
sudo systemctl stop mysql
sudo systemctl stop redis-server
sudo systemctl stop elasticsearch

# 禁用开机自启动
sudo systemctl disable mysql
sudo systemctl disable redis-server
sudo systemctl disable elasticsearch
```

### 2. 准备编译产物

确保所有服务已编译完成，可执行文件位于各自的 `build/` 目录下：

```
ChatSystem-Backend/
├── 1.Speech_Server/build/speech_server
├── 2.File_Server/build/file_server
├── 3.User_Server/build/user_server
├── 4.Message_Transmit_Server/build/message_transmit_server
├── 5.Message_Store_Server/build/message_store_server
├── 6.Friend_Server/build/friend_server
└── 7.Gateway_Server/build/gateway_server
```

### 3. 拷贝依赖库

运行 `depends.sh` 脚本，将每个可执行文件的依赖库拷贝到对应的 `build/depends/` 目录：

```bash
cd /home/chen/cpp_chatsystem/ChatSystem-Backend
bash depends.sh
```

执行后，每个服务的 `build/depends/` 目录将包含所需的共享库文件。

### 4. 创建数据目录

创建用于存放日志和数据的目录：

```bash
mkdir -p /home/chen/cpp_chatsystem/ChatSystem-Backend/docker_image_data/logs
mkdir -p /home/chen/cpp_chatsystem/ChatSystem-Backend/docker_image_data/data
```

## 部署步骤

### 方式一：单机部署（Compose）

适用于开发/测试环境或单机部署场景。

```bash
cd /home/chen/cpp_chatsystem/ChatSystem-Backend

# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose down
```

### 方式二：Swarm 集群部署（推荐，支持跨主机）

适用于生产环境，支持跨主机通信和高可用。

#### 初始化 Swarm 集群

**在管理节点（Manager）上执行：**

```bash
# 初始化 Swarm，指定管理节点 IP
docker swarm init --advertise-addr <MANAGER_IP>

# 例如：
# docker swarm init --advertise-addr 192.168.1.100
```

执行后会输出类似以下内容，包含 worker 节点加入命令：

```
Swarm initialized: current node (xxx) is now a manager.

To add a worker to this swarm, run the following command:
    docker swarm join --token SWMTKN-1-xxxxx <MANAGER_IP>:2377
```

**在工作节点（Worker）上执行：**

将输出的 `docker swarm join` 命令复制到其他主机执行，加入集群：

```bash
docker swarm join --token SWMTKN-1-xxxxx <MANAGER_IP>:2377
```

#### 查看集群状态

```bash
# 查看集群节点
docker node ls

# 应该看到类似输出：
# ID            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS
# xxx *         node1      Ready     Active         Leader
# yyy           node2      Ready     Active
```

#### 部署服务栈

```bash
cd /home/chen/cpp_chatsystem/ChatSystem-Backend

# 部署服务栈
docker stack deploy -c docker-compose.yaml chatsystem

# 查看服务状态
docker stack services chatsystem

# 查看服务详情
docker service ls

# 查看特定服务的日志
docker service logs -f chatsystem_gateway_server

# 查看服务运行在哪个节点
docker service ps chatsystem_gateway_server
```

#### 扩展服务（可选）

Swarm 支持动态扩容，可根据负载调整服务副本数：

```bash
# 扩展 gateway_server 到 3 个副本
docker service scale chatsystem_gateway_server=3

# 扩展 user_server 到 2 个副本
docker service scale chatsystem_user_server=2

# Swarm 会自动负载均衡请求到多个副本
```

#### 更新服务

当需要更新某个服务时：

```bash
# 重新编译服务
cd /home/chen/cpp_chatsystem/ChatSystem-Backend/3.User_Server
# ... 编译步骤 ...

# 重新构建镜像
docker build -t user_server:v3 .

# 更新服务（滚动更新）
docker service update --image user_server:v3 chatsystem_user_server
```

#### 停止集群

```bash
# 删除服务栈
docker stack rm chatsystem

# 如需离开 Swarm
docker swarm leave

# 在管理节点上解散集群
docker swarm leave --force
```

## 服务端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| etcd | 2379, 2380 | 服务注册与发现 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |
| Elasticsearch | 9200, 9300 | 搜索引擎 |
| RabbitMQ | 5672, 15672 | 消息队列（15672 为管理界面） |
| Speech Server | 10001 | 语音识别服务（内部） |
| File Server | 10002 | 文件存储服务（内部） |
| User Server | 10003 | 用户管理服务（内部） |
| Message Transmit | 10004 | 消息转发服务（内部） |
| Message Store | 10005 | 消息存储服务（内部） |
| Friend Server | 10006 | 好友管理服务（内部） |
| Gateway Server | 9000, 9001 | HTTP/WebSocket 网关（对外） |

**注意：** 
- 内部服务端口（10001-10006）仅在 overlay 网络内可访问
- 对外暴露的端口为 9000（HTTP）和 9001（WebSocket）

## 配置说明

所有服务配置文件位于 `Configs/` 目录：

```
Configs/
├── speech_server.conf
├── file_server.conf
├── user_server.conf
├── message_transmit_server.conf
├── message_store_server.conf
├── friend_server.conf
└── gateway_server.conf
```

**重要：** 配置文件已更新为使用容器服务名（如 `mysql`、`redis`、`etcd`），无需修改。

## 数据持久化

### Docker Volumes

以下服务使用 Docker 管理的卷存储数据：

- `mysql-data`: MySQL 数据库文件
- `redis-data`: Redis 持久化文件
- `es-data`: Elasticsearch 索引数据
- `rabbitmq-data`: RabbitMQ 数据
- `etcd-data`: etcd 配置数据

### 宿主机目录

业务服务的日志和数据文件映射到宿主机：

- `./docker_image_data/logs/`: 所有服务日志
- `./docker_image_data/data/`: 上传文件等业务数据

## 数据库初始化

MySQL 数据库会在首次启动时自动执行 `SQL_Code/init_all.sql` 脚本，创建以下表：

- `user`: 用户表
- `relation`: 好友关系表
- `chat_session`: 聊天会话表
- `message`: 消息表
- `friend_apply`: 好友申请表
- `chat_session_member`: 会话成员表

数据库名称为 `chen_im`。

## 故障排查

### 查看服务日志

```bash
# Compose 模式
docker-compose logs -f <service_name>

# Swarm 模式
docker service logs -f chatsystem_<service_name>
```

### 进入容器调试

```bash
# Compose 模式
docker exec -it <container_name> /bin/bash

# Swarm 模式（找到容器 ID）
docker ps | grep <service_name>
docker exec -it <container_id> /bin/bash
```

### 检查网络连通性

在容器内测试网络：

```bash
# 测试 MySQL 连接
nc -zv mysql 3306

# 测试 Redis 连接
nc -zv redis 6379

# 测试 etcd 连接
nc -zv etcd 2379
```

### 常见问题

**Q: 服务启动失败，提示端口被占用**

A: 确保已停止本机的 MySQL、Redis、ES 服务。

**Q: 服务无法连接数据库**

A: 检查配置文件中的数据库地址是否正确（应为 `mysql` 而非 `127.0.0.1`）。

**Q: Swarm 模式下服务无法互相访问**

A: 确保所有服务都连接到 `chatsystem-overlay` 网络。

**Q: 数据库初始化失败**

A: 检查 `SQL_Code/init_all.sql` 文件是否存在，MySQL 容器日志是否有错误。

## 跨主机部署注意事项

### 网络要求

- 所有节点之间网络互通
- 开放必要端口：
  - TCP 2377: 集群管理通信
  - TCP/UDP 7946: 节点间通信
  - UDP 4789: overlay 网络流量

### 防火墙配置

```bash
# Ubuntu/Debian
sudo ufw allow 2377/tcp
sudo ufw allow 7946/tcp
sudo ufw allow 7946/udp
sudo ufw allow 4789/udp

# CentOS/RHEL
sudo firewall-cmd --add-port=2377/tcp --permanent
sudo firewall-cmd --add-port=7946/tcp --permanent
sudo firewall-cmd --add-port=7946/udp --permanent
sudo firewall-cmd --add-port=4789/udp --permanent
sudo firewall-cmd --reload
```

### 服务分布策略

Swarm 会自动在节点间分配服务。你可以通过约束控制服务运行位置：

```yaml
deploy:
  placement:
    constraints:
      - node.role == manager  # 仅在管理节点运行
      - node.labels.type == storage  # 在标记为 storage 的节点运行
```

## 监控与维护

### 查看资源使用

```bash
# 查看服务资源使用
docker stats

# Swarm 模式查看服务状态
docker service ps chatsystem_gateway_server
```

### 日志轮转

建议配置日志轮转，避免日志文件过大：

```bash
# 在 docker-compose.yaml 中添加日志配置
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 备份

重要数据备份：

```bash
# 备份 MySQL
docker exec mysql sh -c 'exec mysqldump -uroot -p"Cydia4384!" chen_im' > backup.sql

# 备份 Docker volumes
docker run --rm -v mysql-data:/data -v $(pwd):/backup ubuntu tar czf /backup/mysql-backup.tar.gz /data
```

## 性能优化建议

1. **资源限制**: 在 docker-compose.yaml 中为服务设置合理的内存和 CPU 限制
2. **连接池**: 调整各服务配置文件中的数据库连接池大小
3. **ES 内存**: 根据实际需求调整 Elasticsearch 的 JVM 堆内存（默认 512MB）
4. **Redis 持久化**: 根据需求选择 RDB 或 AOF 持久化策略
5. **副本数量**: 生产环境建议关键服务运行多个副本

## 联系与支持

如有问题，请参考项目 README.md 或提交 Issue。
