# 前端构建与运行
# 阶段1: 构建
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci 2>/dev/null || npm install

# 复制源码并构建
COPY . .

# 支持构建时注入后端地址（可选）
# 如: docker build --build-arg VITE_HTTP_HOST=192.168.1.100
ARG VITE_HTTP_HOST=
ARG VITE_HTTP_PORT=9000
ARG VITE_WS_PORT=9001

ENV VITE_HTTP_HOST=$VITE_HTTP_HOST
ENV VITE_HTTP_PORT=$VITE_HTTP_PORT
ENV VITE_WS_PORT=$VITE_WS_PORT

RUN npm run build

# 阶段2: 运行
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 自定义 nginx 配置：监听 10010，支持 SPA 路由
RUN echo 'server { \
    listen 10010; \
    listen [::]:10010; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 10010

CMD ["nginx", "-g", "daemon off;"]
