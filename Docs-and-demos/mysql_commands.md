# MySQL 容器操作指南

## 方法 1：直接执行单条 SQL 语句（最简单）

```bash
# 查看所有表
docker exec mysql mysql -uroot -p'Cydia4384!' -D chen_im -e "SHOW TABLES;"

# 查询数据
docker exec mysql mysql -uroot -p'Cydia4384!' -D chen_im -e "SELECT * FROM user LIMIT 5;"

# 执行更新
docker exec mysql mysql -uroot -p'Cydia4384!' -D chen_im -e "UPDATE user SET nickname='test' WHERE user_id='xxx';"
```

## 方法 2：执行 SQL 文件

```bash
# 将 SQL 文件复制到容器中执行
docker exec -i mysql mysql -uroot -p'Cydia4384!' -D chen_im < your_script.sql

# 或者使用 cat 管道
cat your_script.sql | docker exec -i mysql mysql -uroot -p'Cydia4384!' -D chen_im
```

## 方法 3：进入容器的交互式 shell（推荐用于复杂操作）

```bash
# 进入容器的 bash shell
docker exec -it mysql bash

# 然后在容器内执行
mysql -uroot -p'Cydia4384!' -D chen_im

# 或者直接进入 MySQL
docker exec -it mysql mysql -uroot -p'Cydia4384!' -D chen_im
```

## 方法 4：使用 docker-compose exec（如果使用 docker-compose）

```bash
# 进入 MySQL 容器
docker-compose exec mysql bash

# 或者直接进入 MySQL
docker-compose exec mysql mysql -uroot -p'Cydia4384!' -D chen_im
```

## 常用 SQL 操作示例

### 查看数据库
```bash
docker exec mysql mysql -uroot -p'Cydia4384!' -e "SHOW DATABASES;"
```

### 查看表结构
```bash
docker exec mysql mysql -uroot -p'Cydia4384!' -D chen_im -e "DESCRIBE user;"
```

### 查看表数据
```bash
docker exec mysql mysql -uroot -p'Cydia4384!' -D chen_im -e "SELECT * FROM user LIMIT 10;"
```

### 查看用户会话信息（从 Redis 同步到 MySQL 的测试）
```bash
docker exec mysql mysql -uroot -p'Cydia4384!' -D chen_im -e "SELECT * FROM user WHERE nickname LIKE 'test%';"
```

### 清空表数据（谨慎使用）
```bash
docker exec mysql mysql -uroot -p'Cydia4384!' -D chen_im -e "TRUNCATE TABLE user;"
```

## 连接信息

- **容器名**: `mysql`
- **数据库名**: `chen_im`
- **用户名**: `root`
- **密码**: `Cydia4384!`
- **端口**: `3306` (已映射到主机)

## 从主机直接连接（不使用容器）

如果 MySQL 客户端已安装在主机上：

```bash
mysql -h 127.0.0.1 -P 3306 -uroot -p'Cydia4384!' -D chen_im
```

## 导出/导入数据

### 导出数据库
```bash
docker exec mysql mysqldump -uroot -p'Cydia4384!' chen_im > backup.sql
```

### 导入数据库
```bash
docker exec -i mysql mysql -uroot -p'Cydia4384!' chen_im < backup.sql
```

## 查看 MySQL 日志

```bash
# 查看容器日志
docker logs mysql

# 实时查看日志
docker logs -f mysql
```

## 注意事项

1. **密码包含特殊字符**：密码 `Cydia4384!` 包含感叹号，在 shell 中需要用单引号包裹
2. **数据库名**：默认数据库是 `chen_im`
3. **字符集**：数据库使用 `utf8mb4` 字符集
4. **数据持久化**：数据存储在 Docker volume `mysql-data` 中
