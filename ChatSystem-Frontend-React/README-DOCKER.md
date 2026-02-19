# 前端容器部署说明

## 构建与运行

```bash
# 在 ChatSystem-Frontend-React 目录下构建
docker build -t chatsystem-frontend:v1 .

# 运行（映射端口 10010）
docker run -d -p 10010:10010 --name chatsystem-frontend chatsystem-frontend:v1
```

## 访问方式

- **前端页面**：`http://<公网IP>:10010`
- **后端接口**：前端会默认使用当前访问的 hostname 连接后端（Gateway 9000/9001 端口）

## 后端连通性

确保宿主机上 C++ 后端（含 Gateway）已启动，并暴露以下端口：

- `9000` - HTTP API
- `9001` - WebSocket

若使用 `docker-compose` 部署后端，Gateway 会监听 `9000:9000` 和 `9001:9001`。

## 构建时自定义后端地址

若需在构建阶段固定后端地址：

```bash
docker build --build-arg VITE_HTTP_HOST=192.168.1.100 -t chatsystem-frontend:v1 .
```

未指定时，生产模式会使用用户访问页面时的 hostname 作为后端地址，便于公网访问。
