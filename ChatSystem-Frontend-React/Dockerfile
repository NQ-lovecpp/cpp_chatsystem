# 前端构建与运行
# 阶段1: 构建静态资源
FROM node:20-alpine AS builder

WORKDIR /app

# 镜像源：默认 npmmirror.com（淘宝镜像），避免容器内访问 registry.npmjs.org 超时。
# 想换源：docker compose build --build-arg NPM_REGISTRY=https://registry.npmjs.org frontend
ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

# 安装依赖（必须包含 devDependencies——构建期需要 vite 等工具）
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci --include=dev || npm install --include=dev

# 复制源码并构建
# 容器化部署下前端用相对路径访问 /service /ws /agent，统一由 nginx 反代，
# 因此不再需要 build-time 注入后端地址
COPY . .
RUN npm run build

# 阶段2: 运行（nginx 反代 + 静态托管）
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 引入仓库里维护的 nginx 反代配置（监听 10010，代理 /service /ws /agent）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 10010

CMD ["nginx", "-g", "daemon off;"]
