"""
SDK 工具定义 - 使用 @function_tool 装饰器包装工具函数
供 OpenAI Agents SDK 使用

注意: OpenAI Agents SDK 的 function_tool 期望返回字符串类型

工具分为两类:
1. SAFE_TOOLS - 不需要审批，可直接执行
2. APPROVAL_REQUIRED_TOOLS - 需要用户审批后才能执行

当前实现中，python_execute 使用 SDK 自带的 function_tool，
但实际执行时会通过 tool_executor 的审批流程。
"""
import os
import asyncio
import json
from typing import Annotated, Optional, List
from pydantic import BaseModel, Field
from contextvars import ContextVar

from agents import function_tool

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from tools.browser_tools import get_browser, BrowserTools
from tools.python_tools import execute_python, ExecutionResult

# 上下文变量，用于在工具执行时获取当前任务和用户信息
current_task_id: ContextVar[str] = ContextVar("current_task_id", default="unknown")
current_user_id: ContextVar[str] = ContextVar("current_user_id", default="unknown")


# ============== 搜索工具 ==============

def _get_browser_session_id() -> str:
    """按任务隔离浏览器状态，避免多任务共享导致 link id 失效"""
    try:
        tid = current_task_id.get()
        if tid and tid != "unknown":
            return tid
    except LookupError:
        pass
    return "default"


@function_tool
async def web_search(
    query: Annotated[str, "搜索关键词"],
    topn: Annotated[int, "返回结果数量，默认为 5"] = 5
) -> str:
    """
    搜索网页信息。返回搜索结果列表，每个结果包含标题、URL 和摘要。
    使用此工具来查找互联网上的最新信息。
    """
    browser = get_browser(_get_browser_session_id())
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
    注意：必须先调用 web_search 获取结果后，才能用链接 ID 打开；否则请直接传入完整 URL。
    """
    browser = get_browser(_get_browser_session_id())
    
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
    browser = get_browser(_get_browser_session_id())
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
    - 此工具需要用户审批才能执行
    """
    # 获取当前任务上下文
    task_id = current_task_id.get()
    user_id = current_user_id.get()
    
    result = await execute_python(
        code=code,
        user_id=user_id,
        task_id=task_id
    )
    
    if result.success:
        output = result.output.strip()
        return f"执行成功 (耗时 {result.duration_ms}ms):\n{output}" if output else "执行成功，无输出"
    else:
        return f"执行失败: {result.error}"


# ============== 带审批的 Python 执行工具 ==============
# 这个版本会等待用户审批后才执行

@function_tool
async def python_execute_with_approval(
    code: Annotated[str, "要执行的 Python 代码"]
) -> str:
    """
    在隔离的 Docker 容器中执行 Python 代码（需要用户审批）。
    
    预装的库: numpy, pandas, scipy, sympy, matplotlib, requests, beautifulsoup4, lxml, pyyaml
    
    注意事项:
    - 使用 print() 输出结果
    - 代码是无状态的，每次执行都是独立的
    - 有 60 秒超时限制
    - 内存限制 512MB
    - 此工具需要用户审批才能执行
    """
    # 获取当前任务上下文
    task_id = current_task_id.get()
    user_id = current_user_id.get()
    
    # 导入审批相关模块
    from runtime.approval_store import approval_store, ApprovalStatus
    from runtime import task_manager, TaskStatus
    from runtime.sse_bus import sse_bus
    
    # 发送需要审批的事件
    await sse_bus.publish(task_id, "tool_call", {
        "tool_name": "python_execute",
        "arguments": {"code": code[:500] + "..." if len(code) > 500 else code},
        "status": "pending_approval",
        "requires_approval": True
    })
    
    # 创建审批请求
    code_preview = code[:200] + "..." if len(code) > 200 else code
    reason = f"执行 Python 代码需要您的批准。代码片段：\n```python\n{code_preview}\n```"
    
    approval = await approval_store.create_approval(
        task_id=task_id,
        user_id=user_id,
        tool_name="python_execute",
        tool_args={"code": code},
        reason=reason
    )
    
    # 更新任务状态
    await task_manager.update_task_status(task_id, TaskStatus.WAITING_APPROVAL)
    
    # 等待审批结果
    approval_status = await approval_store.wait_for_approval(approval.id)
    
    if approval_status == ApprovalStatus.APPROVED:
        # 更新任务状态
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 执行代码
        result = await execute_python(
            code=code,
            user_id=user_id,
            task_id=task_id
        )
        
        if result.success:
            output = result.output.strip()
            return f"执行成功 (耗时 {result.duration_ms}ms):\n{output}" if output else "执行成功，无输出"
        else:
            return f"执行失败: {result.error}"
    
    elif approval_status == ApprovalStatus.REJECTED:
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        return "用户拒绝了代码执行请求"
    
    else:  # EXPIRED
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        return "审批请求已超时"


# ============== 导入 Todo 工具 ==============

from tools.todo_tools import add_todos, update_todo, list_todos, TODO_TOOLS


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

# 需要审批的工具（使用带审批版本）
APPROVAL_REQUIRED_TOOLS = [
    python_execute_with_approval
]

# 包含审批工具的完整工具集
ALL_TOOLS_WITH_APPROVAL = [
    web_search,
    web_open, 
    web_find,
    python_execute_with_approval
]

# 包含 Todo 工具的完整工具集（用于复杂任务）
ALL_TOOLS_WITH_TODO = [
    web_search,
    web_open,
    web_find,
    python_execute_with_approval,
    add_todos,
    update_todo,
    list_todos
]

# 设置上下文的辅助函数
def set_tool_context(task_id: str, user_id: str):
    """设置工具执行上下文"""
    current_task_id.set(task_id)
    current_user_id.set(user_id)
