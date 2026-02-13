# My GPT Project

基于 OpenAI Agents SDK 的智能助手应用，支持 Python 代码执行和网页搜索功能。

## 项目结构

```
my-gpt-project/
├── frontend/          # Next.js 前端应用
│   └── src/
│       ├── agents.ts  # Agent 配置（连接 MCP 服务器）
│       └── app/       # Next.js 页面和 API
├── backend/           # Python 后端
│   ├── gpt-oss-mcp-server/  # MCP 服务器
│   │   ├── python_server.py # Python 执行服务
│   │   └── browser_server.py # 网页搜索服务
│   └── tools/         # 工具实现
```

## 环境要求

- Node.js >= 18
- Python >= 3.11
- [uv](https://docs.astral.sh/uv/) (Python 包管理器)
- Docker (用于安全执行 Python 代码)

## 快速开始

### 1. 配置 API Keys

编辑 `backend/gpt-oss-mcp-server/browser_server.py`，填写 Exa API Key：

```python
EXA_API_KEY = "your-exa-api-key"  # 获取地址: https://exa.ai/
```

设置 OpenAI API Key（前端需要）：

```bash
export OPENAI_API_KEY="your-openai-api-key"
```

### 2. 启动后端 MCP 服务器

需要开启两个终端分别运行 Python 执行服务和网页搜索服务：

**终端 1 - Python 执行服务 (端口 8000)**

```bash
cd backend/gpt-oss-mcp-server
uv sync  # 首次运行需要安装依赖
uv run mcp run -t sse python_server.py:mcp
```

**终端 2 - 网页搜索服务 (端口 8001)**

```bash
cd backend/gpt-oss-mcp-server
uv run mcp run -t sse browser_server.py:mcp
```

### 3. 启动前端

**终端 3 - Next.js 前端 (端口 3000)**

```bash
cd frontend
pnpm install  # 首次运行需要安装依赖
pnpm dev
```

### 4. 访问应用

打开浏览器访问 http://localhost:3000

## 功能说明

### 可用工具

| 工具名 | 描述 |
|--------|------|
| `execute_python` | 在 Docker 容器中执行 Python 代码 |
| `search` | 使用 Exa 搜索引擎搜索网页 |
| `open` | 打开搜索结果中的链接 |
| `find` | 在页面中查找文本 |
| `getWeather` | 获取城市天气（示例工具） |

### 示例对话

- "用 Python 写一个快速排序并执行"
- "搜索 2024 年最新的 AI 技术趋势"
- "帮我计算 123 的阶乘"

## 常见问题

### Docker 未运行

如果 Python 执行超时，请确保 Docker Desktop 已启动：

```bash
open -a Docker  # macOS
```

### MCP 服务器连接失败

检查后端服务是否正常运行：

```bash
curl http://127.0.0.1:8000/sse  # Python 服务
curl http://127.0.0.1:8001/sse  # Browser 服务
```

### uv 命令未找到

安装 uv：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```
