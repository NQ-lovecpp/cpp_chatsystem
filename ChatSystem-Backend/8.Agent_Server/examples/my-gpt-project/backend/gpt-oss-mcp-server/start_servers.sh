#!/bin/bash

# MCP 服务器启动脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "启动 MCP 服务器..."
echo ""

# 检查虚拟环境
if [ ! -d ".venv" ]; then
    echo "虚拟环境不存在，正在创建..."
    uv sync
fi

# 启动 Python 服务器（后台运行）
echo "启动 Python 执行服务器..."
nohup uv run mcp run python_server.py:mcp > python_server.log 2>&1 &
PYTHON_PID=$!
echo "Python 服务器已启动，PID: $PYTHON_PID"

# 等待一秒
sleep 1

# 启动 Browser 服务器（后台运行）
echo "启动 Browser 服务器..."
nohup uv run mcp run browser_server.py:mcp > browser_server.log 2>&1 &
BROWSER_PID=$!
echo "Browser 服务器已启动，PID: $BROWSER_PID"

echo ""
echo "服务器已启动！"
echo "Python 服务器 PID: $PYTHON_PID"
echo "Browser 服务器 PID: $BROWSER_PID"
echo ""
echo "查看日志:"
echo "  tail -f python_server.log"
echo "  tail -f browser_server.log"
echo ""
echo "停止服务器:"
echo "  kill $PYTHON_PID $BROWSER_PID"
