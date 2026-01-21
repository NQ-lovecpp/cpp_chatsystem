# ChatSystem 快速开始指南

本指南提供最快速的部署方式，适合快速体验和开发测试。

## 前置要求

1. 已编译所有服务的可执行文件
2. 已运行 `depends.sh` 拷贝依赖库
3. 已停止本机的 MySQL、Redis、Elasticsearch 服务

## 单机快速部署（5 分钟）

### 1. 停止本机服务（如尚未执行）

```bash
sudo systemctl stop mysql redis-server elasticsearch etcd
sudo systemctl disable mysql redis-server elasticsearch
```

### 2. 创建数据目录

```bash
cd /home/chen/cpp_chatsystem/ChatSystem-Backend
mkdir -p docker_image_data/logs docker_image_data/data
```

### 3. 一键启动所有服务

```bash
docker-compose up -d --build
```

### 4. 查看服务状态

```bash
# 查看所有服务1
docker-compose ps

# 查看日志
docker-compose logs -f gateway_server

# 查看所有服务日志
docker-compose logs -f
```

### 5. 验证服务

访问以下地址验证服务是否正常：

- **RabbitMQ 管理界面**: http://localhost:15672 (用户名: root, 密码: czhuowen)
- **Elasticsearch**: http://localhost:9200
- **HTTP 网关**: http://localhost:9000
- **WebSocket 网关**: ws://localhost:9001

### 6. 停止服务

```bash
docker-compose down
```

## Swarm 集群部署（支持跨主机）

### 管理节点初始化

在主节点执行：

```bash
# 获取本机 IP（假设是 192.168.1.100）
docker swarm init --advertise-addr 192.168.1.100
```

记录输出的 `docker swarm join` 命令。

### 工作节点加入

在其他节点执行输出的命令：

```bash
docker swarm join --token SWMTKN-1-xxxx 192.168.1.100:2377
```

### 部署服务栈

回到管理节点：

```bash
cd /home/chen/cpp_chatsystem/ChatSystem-Backend
docker stack deploy -c docker-compose.yaml chatsystem
```

### 查看服务

```bash
# 查看所有服务
docker service ls

# 查看特定服务
docker service ps chatsystem_gateway_server

# 查看日志
docker service logs -f chatsystem_gateway_server
```

### 扩展服务

```bash
# 扩展 gateway 到 2 个副本
docker service scale chatsystem_gateway_server=2

# 扩展 user_server 到 2 个副本
docker service scale chatsystem_user_server=2
```

### 停止服务栈

```bash
docker stack rm chatsystem
```

## 常用命令速查

### Compose 模式

| 命令 | 说明 |
|------|------|
| `docker-compose up -d` | 启动所有服务 |
| `docker-compose down` | 停止并删除所有服务 |
| `docker-compose ps` | 查看服务状态 |
| `docker-compose logs -f <service>` | 查看服务日志 |
| `docker-compose restart <service>` | 重启特定服务 |
| `docker-compose exec <service> bash` | 进入容器 |

### Swarm 模式

| 命令 | 说明 |
|------|------|
| `docker stack deploy -c docker-compose.yaml chatsystem` | 部署服务栈 |
| `docker stack rm chatsystem` | 删除服务栈 |
| `docker service ls` | 查看所有服务 |
| `docker service ps <service>` | 查看服务运行位置 |
| `docker service logs -f <service>` | 查看服务日志 |
| `docker service scale <service>=<replicas>` | 扩展服务副本 |
| `docker service update <service>` | 更新服务 |
| `docker node ls` | 查看集群节点 |

## 故障排查

### 服务启动失败

```bash
# 查看详细错误日志
docker-compose logs <service_name>

# 或 Swarm 模式
docker service logs chatsystem_<service_name>
```

### 数据库连接失败

```bash
# 进入 MySQL 容器检查
docker exec -it mysql mysql -uroot -pCydia4384! -e "SHOW DATABASES;"

# 检查网络连通性
docker exec -it <service_container> nc -zv mysql 3306
```

### 端口冲突

确保本机服务已停止：

```bash
sudo netstat -tuln | grep -E '3306|6379|9200|5672'
```

如有进程占用，停止相应服务。

### 清理环境

```bash
# Compose 模式 - 删除所有容器和卷
docker-compose down -v

# Swarm 模式 - 删除服务栈和卷
docker stack rm chatsystem
docker volume prune
```

## 性能提示

1. **首次启动较慢**: 需要拉取镜像和初始化数据库，请耐心等待
2. **内存要求**: 建议至少 4GB 可用内存
3. **磁盘空间**: 建议至少 10GB 可用空间用于镜像和数据

## 下一步

- 详细部署说明: 参考 `DEPLOYMENT.md`
- 项目文档: 参考 `../README.md`
- 配置调优: 修改 `Configs/` 目录下的配置文件

## 获取帮助

遇到问题？

1. 查看 `DEPLOYMENT.md` 中的故障排查章节
2. 检查服务日志
3. 提交 GitHub Issue
