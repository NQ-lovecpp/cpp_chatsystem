# MCP 服务器启动指南

本目录包含两个 MCP 服务器：
- `python_server.py` - Python 代码执行服务器
- `browser_server.py` - 基于 Exa 的网页浏览服务器

## 启动方式

### 方式 1: 使用 stdio 传输（推荐，用于前端集成）

这是默认的传输方式，适用于通过 `MCPServerStdio` 连接：

```bash
# 进入服务器目录
cd backend/gpt-oss-mcp-server

# 启动 Python 执行服务器
uv run mcp run python_server.py:mcp

# 启动浏览器服务器（在另一个终端）
uv run mcp run browser_server.py:mcp
```

### 方式 2: 使用 SSE 传输（用于 MCP Inspector 测试）

使用 Server-Sent Events 传输，可以通过 HTTP 访问：

```bash
# 启动 Python 执行服务器（默认端口 8000）
uv run mcp run -t sse python_server.py:mcp

# 启动浏览器服务器（端口 8001）
uv run mcp run -t sse browser_server.py:mcp
```

启动后可以通过以下 URL 访问：
- Python 服务器: `http://localhost:8000/sse`
- Browser 服务器: `http://localhost:8001/sse`

### 方式 3: 在后台运行（使用 nohup 或 screen）

```bash
# 使用 nohup 在后台运行
nohup uv run mcp run python_server.py:mcp > python_server.log 2>&1 &
nohup uv run mcp run browser_server.py:mcp > browser_server.log 2>&1 &

# 查看日志
tail -f python_server.log
tail -f browser_server.log
```

## 环境变量配置

### Browser 服务器

可以通过环境变量配置浏览器后端：

```bash
# 使用 Exa 后端（默认）
export BROWSER_BACKEND=exa
uv run mcp run browser_server.py:mcp

# 使用 YouCom 后端
export BROWSER_BACKEND=youcom
uv run mcp run browser_server.py:mcp
```

### Exa API Key

如果使用 Exa 后端，需要设置 API key：

```bash
export EXA_API_KEY=your_exa_api_key_here
```

## 验证服务器是否正常运行

### 测试 stdio 传输

```bash
# 测试 Python 服务器
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | uv run mcp run python_server.py:mcp

# 测试 Browser 服务器
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | uv run mcp run browser_server.py:mcp
```

### 测试 SSE 传输

在浏览器中访问：
- Python 服务器: `http://localhost:8000/sse`
- Browser 服务器: `http://localhost:8001/sse`

## 在前端中使用

前端代码已经配置为自动启动这些服务器。当调用 `getAgent()` 时，服务器会通过 `MCPServerStdio` 自动启动。

如果需要手动管理服务器生命周期，可以参考 `frontend/src/agents.ts` 中的实现。

## 故障排查

1. **依赖未安装**: 运行 `uv sync` 安装所有依赖
2. **Python 版本不兼容**: 确保使用 Python >= 3.11
3. **导入错误**: 确保 `backend/tools` 目录存在且包含所有必要的文件
4. **端口被占用**: 如果使用 SSE 传输，确保端口 8000 和 8001 未被占用
