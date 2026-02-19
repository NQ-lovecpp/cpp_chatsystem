# Agent Server - Python FastAPI 服务
FROM python:3.12-slim-bookworm

# 安装 uv 用于依赖管理
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# 工作目录
WORKDIR /app

# 复制工作区根目录的依赖声明（Agent Server 使用工作区 pyproject.toml）
COPY pyproject.toml uv.lock .python-version* ./
# 复制 Agent Server 源码
COPY ChatSystem-Backend/8.Agent_Server/ ./agent_server/

# 安装依赖（不安装 workspace 自身，仅安装依赖）
RUN uv sync --frozen --no-install-project 2>/dev/null || uv sync --no-install-project

# 工作目录设为 src
WORKDIR /app/agent_server/src

# 环境变量默认值（可被 docker-compose 覆盖）
ENV HOST=0.0.0.0
ENV PORT=8080
ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV DEBUG=false

# 暴露端口
EXPOSE 8080

# 使用 uv run 确保使用虚拟环境
CMD ["uv", "run", "--project", "/app", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
