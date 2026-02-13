"""
SDK 工具定义 - 使用 @function_tool 装饰器包装工具函数
供 OpenAI Agents SDK 使用

注意: OpenAI Agents SDK 的 function_tool 期望返回字符串类型
"""
import os
import asyncio
import json
from typing import Annotated, Optional, List
from pydantic import BaseModel, Field

from agents import function_tool

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from tools.browser_tools import get_browser, BrowserTools
from tools.python_tools import execute_python, ExecutionResult


# ============== 搜索工具 ==============

@function_tool
async def web_search(
    query: Annotated[str, "搜索关键词"],
    topn: Annotated[int, "返回结果数量，默认为 5"] = 5
) -> str:
    """
    搜索网页信息。返回搜索结果列表，每个结果包含标题、URL 和摘要。
    使用此工具来查找互联网上的最新信息。
    """
    browser = get_browser("default")
    result = await browser.web_search(query, topn)
    
    if result.get("success"):
        return result.get("display", "搜索完成，但没有结果")
    else:
        return f"搜索失败: {result.get('error', '未知错误')}"


# ============== 网页打开工具 ==============

@function_tool
async def web_open(
    url_or_id: Annotated[str, "要打开的 URL 或搜索结果中的链接 ID（数字）"],
    start_line: Annotated[int, "从第几行开始显示，用于滚动浏览长页面"] = 0
) -> str:
    """
    打开搜索结果中的链接或直接打开 URL。
    可以指定起始行号来浏览长页面的不同部分。
    """
    browser = get_browser("default")
    
    # 尝试将 url_or_id 解析为整数（链接 ID）
    try:
        link_id = int(url_or_id)
        result = await browser.web_open(id_or_url=link_id, loc=start_line)
    except ValueError:
        # 是 URL
        result = await browser.web_open(id_or_url=url_or_id, loc=start_line)
    
    if result.get("success"):
        return result.get("display", "页面已打开")
    else:
        return f"打开页面失败: {result.get('error', '未知错误')}"


# ============== 页面查找工具 ==============

@function_tool
async def web_find(
    pattern: Annotated[str, "要查找的文本（大小写不敏感）"]
) -> str:
    """
    在当前打开的页面中查找文本。
    返回所有匹配的位置及其上下文。
    """
    browser = get_browser("default")
    result = await browser.web_find(pattern)
    
    if result.get("success"):
        return result.get("display", "查找完成，但没有结果")
    else:
        return f"查找失败: {result.get('error', '未知错误')}"


# ============== Python 执行工具 ==============

@function_tool
async def python_execute(
    code: Annotated[str, "要执行的 Python 代码"]
) -> str:
    """
    在隔离的 Docker 容器中执行 Python 代码。
    
    预装的库: numpy, pandas, scipy, sympy, matplotlib, requests, beautifulsoup4, lxml, pyyaml
    
    注意事项:
    - 使用 print() 输出结果
    - 代码是无状态的，每次执行都是独立的
    - 有 60 秒超时限制
    - 内存限制 512MB
    """
    result = await execute_python(
        code=code,
        user_id="agent",  # 在实际使用中应该传入真实的 user_id
        task_id="task"    # 在实际使用中应该传入真实的 task_id
    )
    
    if result.success:
        output = result.output.strip()
        return f"执行成功 (耗时 {result.duration_ms}ms):\n{output}" if output else "执行成功，无输出"
    else:
        return f"执行失败: {result.error}"


# ============== 导出所有工具 ==============

# 所有可用工具列表（供 Agent 使用）
ALL_TOOLS = [
    web_search,
    web_open, 
    web_find,
    python_execute
]

# 不需要审批的工具
SAFE_TOOLS = [
    web_search,
    web_open,
    web_find
]

# 需要审批的工具
APPROVAL_REQUIRED_TOOLS = [
    python_execute
]
