# Python 环境创建与启动教程（uv）

本教程说明如何使用 **uv** 在工作区根目录创建 Python 3.12 虚拟环境，并启动 Agent Server 及 MCP 服务器。

> **工作区路径**：下文中 `/home/chen/cpp_chatsystem` 为示例，请替换为你的 Cursor 工作区根路径。

## 1. 环境要求

- [uv](https://docs.astral.sh/uv/)（必需，工作区统一使用 uv 管理 Python 环境）
- Python 3.12（uv 会自动下载；若网络受限，可先安装系统 Python 3.12，见下方说明）

## 2. 安装 uv

```bash
# Linux/macOS
curl -LsSf https://astral.sh/uv/install.sh | sh

# 或使用 pip
pip install uv
```

### 若 uv sync 无法下载 Python 3.12（网络受限）

可先安装系统 Python 3.12，uv 会优先使用：

```bash
# Ubuntu 20.04+ (deadsnakes PPA)
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.12 python3.12-venv

# 或使用 pyenv
pyenv install 3.12
```

## 3. 创建虚拟环境（在工作区根目录）

虚拟环境创建在**工作区根目录**（`.venv`），供整个项目共用。

### 3.1 迁移步骤（从旧环境升级）

若已有 Python 3.9 的 `venv`，需先删除并重建：

```bash
# 进入工作区根目录
cd /home/chen/cpp_chatsystem

# 删除旧虚拟环境（可选，升级时执行）
rm -rf venv

# 使用 uv 同步依赖（自动创建 .venv，Python 3.12）
uv sync
```

### 3.2 全新安装

```bash
# 进入工作区根目录
cd /home/chen/cpp_chatsystem

# 一键创建 .venv 并安装所有依赖（含 MCP）
uv sync
```

`uv sync` 会：

- 读取工作区根目录的 `pyproject.toml` 和 `.python-version`
- 创建 `.venv`（Python 3.12）
- 安装全部依赖（含 `mcp[cli]` 等）

### 3.3 激活虚拟环境

```bash
source /home/chen/cpp_chatsystem/.venv/bin/activate   # Linux/macOS
# 或 Windows: .venv\Scripts\activate
```

## 4. 启动服务

### 4.1 启动 Agent Server

```bash
# 方式一：激活 venv 后启动
source /home/chen/cpp_chatsystem/.venv/bin/activate
cd /home/chen/cpp_chatsystem/ChatSystem-Backend/8.Agent_Server
uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload

# 方式二：使用 uv run（无需激活）
cd /home/chen/cpp_chatsystem/ChatSystem-Backend/8.Agent_Server
uv run --project /home/chen/cpp_chatsystem uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload
```

### 4.2 启动 MCP 服务器（可选）

```bash
source /home/chen/cpp_chatsystem/.venv/bin/activate
cd /home/chen/cpp_chatsystem/ChatSystem-Backend/8.Agent_Server/src/tools/mcp-servers

mcp run python_server.py:mcp   # Python 执行服务器
mcp run browser_server.py:mcp  # 浏览器搜索服务器
```

> **注意**：`python_server.py` 和 `browser_server.py` 依赖 `tools.python_docker` 与 `tools.simple_browser`，若项目未包含这些模块，MCP 服务器可能无法直接运行。此时可继续使用 Agent Server 内置的 `function_tool`。

## 5. 快速参考

| 步骤       | 命令 |
|------------|------|
| 安装 uv    | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| 创建/同步环境 | `cd /home/chen/cpp_chatsystem && uv sync` |
| 激活 venv  | `source /home/chen/cpp_chatsystem/.venv/bin/activate` |
| 启动 Agent | `cd ChatSystem-Backend/8.Agent_Server && uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload` |
| 添加依赖   | `uv add <package>`（在工作区根目录执行） |

## 6. 依赖说明

- **配置位置**：工作区根目录 `pyproject.toml`
- **Python 版本**：`.python-version` 指定 3.12
- **兼容性**：Python 3.12 满足主项目与 MCP 服务器（如 `mcp[cli]`）的版本要求
- **依赖管理**：工作区根目录 `pyproject.toml` 统一管理
