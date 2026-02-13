"""
会话 Agent - 处理会话内的 Agent 任务
支持工具调用 (web_search, web_open, web_find, python_execute)
"""
import asyncio
import json
from typing import Optional, AsyncIterator
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from runtime import sse_bus, task_manager, Task, TaskStatus
from runtime.approval_store import approval_store, ApprovalStatus
from .tool_executor import execute_tool, get_tool_definitions, get_tool_by_name, format_tool_result_for_display


# Agent 系统提示词
SESSION_AGENT_SYSTEM_PROMPT = """你是一个智能助手，帮助用户完成会话内的各种任务。

你可以使用以下工具：
1. web_search(query, topn) - 搜索网页信息
2. web_open(id_or_url, cursor, loc, num_lines) - 打开链接或滚动页面
3. web_find(pattern, cursor) - 在页面中查找文本
4. python_execute(code) - 执行 Python 代码（需要用户审批）

使用工具时：
- 先分析用户需求，决定是否需要使用工具
- 如果需要搜索信息，使用 web_search
- 如果需要计算或数据处理，使用 python_execute
- 给出清晰的回答，引用工具结果时标注来源

请保持回答简洁、准确、有帮助。
"""


async def run_session_agent(task: Task) -> AsyncIterator[dict]:
    """
    运行会话 Agent
    
    这是一个模拟实现，展示工具调用流程
    实际应该接入 OpenAI Agents SDK
    """
    task_id = task.id
    user_id = task.user_id
    session_id = task.chat_session_id or f"session_{user_id}"
    
    try:
        # 更新状态为运行中
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 发送 reasoning 开始
        await sse_bus.publish(task_id, "reasoning_delta", {
            "content": "分析用户请求..."
        })
        
        await asyncio.sleep(0.3)
        
        input_text = task.input_text.lower()
        
        # 简单的意图识别（模拟）
        needs_search = any(kw in input_text for kw in ["搜索", "查找", "search", "find", "什么是", "who is", "how to"])
        needs_python = any(kw in input_text for kw in ["计算", "算", "python", "代码", "执行", "calculate", "compute"])
        
        response_parts = []
        tool_results = []
        
        # 工具调用流程
        if needs_search:
            await sse_bus.publish(task_id, "reasoning_delta", {
                "content": "需要搜索相关信息..."
            })
            
            # 提取搜索关键词（简单实现）
            query = task.input_text
            for prefix in ["搜索", "查找", "search", "find", "什么是", "who is", "how to"]:
                if prefix in input_text:
                    idx = input_text.find(prefix)
                    query = task.input_text[idx + len(prefix):].strip()
                    break
            
            if not query:
                query = task.input_text
            
            # 执行搜索
            result = await execute_tool(
                "web_search",
                {"query": query, "topn": 5},
                task_id,
                user_id,
                session_id
            )
            tool_results.append(("web_search", result))
            
            if result.get("success"):
                response_parts.append(f"**搜索结果：**\n{result.get('display', '')[:1000]}")
            else:
                response_parts.append(f"搜索失败: {result.get('error', 'Unknown error')}")
        
        if needs_python:
            await sse_bus.publish(task_id, "reasoning_delta", {
                "content": "需要执行 Python 代码..."
            })
            
            # 检查是否需要审批
            tool_def = get_tool_by_name("python_execute")
            if tool_def and tool_def.get("requires_approval"):
                # 提取代码（简单实现，实际应该用 LLM 生成）
                code = """
# 示例代码
import numpy as np

# 简单计算
result = np.sqrt(2) * np.pi
print(f"计算结果: {result:.6f}")

# 数组操作
arr = np.array([1, 2, 3, 4, 5])
print(f"数组平均值: {arr.mean()}")
print(f"数组标准差: {arr.std():.4f}")
"""
                
                # 创建审批请求
                approval = await approval_store.create_approval(
                    task_id=task_id,
                    user_id=user_id,
                    tool_name="python_execute",
                    tool_args={"code": code},
                    reason="Python 代码执行需要您的确认"
                )
                
                # 更新任务状态
                await task_manager.update_task_status(task_id, TaskStatus.WAITING_APPROVAL)
                
                # 等待审批
                await sse_bus.publish(task_id, "reasoning_delta", {
                    "content": "等待用户审批..."
                })
                
                approval_result = await approval_store.wait_for_approval(approval.id)
                
                if approval_result == ApprovalStatus.APPROVED:
                    await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
                    
                    # 执行代码
                    result = await execute_tool(
                        "python_execute",
                        {"code": code},
                        task_id,
                        user_id,
                        session_id
                    )
                    tool_results.append(("python_execute", result))
                    
                    if result.get("success"):
                        response_parts.append(f"**执行结果：**\n{format_tool_result_for_display('python_execute', result)}")
                    else:
                        response_parts.append(f"执行失败: {result.get('error', 'Unknown error')}")
                else:
                    response_parts.append("⚠️ 代码执行已被取消")
        
        # 生成最终响应
        if not response_parts:
            # 没有使用工具的普通响应
            response_parts.append(f"收到您的消息：「{task.input_text}」\n\n")
            response_parts.append("这是一个测试响应。Agent Server 已成功处理您的请求。\n")
            response_parts.append("\n**可用功能：**\n")
            response_parts.append("- 🔍 网页搜索 (输入包含\"搜索\"关键词)\n")
            response_parts.append("- 🐍 Python 执行 (输入包含\"计算\"或\"python\"关键词)\n")
        
        response_text = "\n".join(response_parts)
        
        # 流式发送响应
        for line in response_text.split('\n'):
            if line:
                await sse_bus.publish(task_id, "message", {
                    "content": line + '\n',
                    "delta": True
                })
                yield {"type": "message_delta", "content": line + '\n'}
                await asyncio.sleep(0.05)
        
        # 任务完成
        await task_manager.update_task_status(
            task_id, 
            TaskStatus.DONE,
            result=response_text
        )
        
        await sse_bus.publish(task_id, "done", {
            "final_text": response_text,
            "tool_calls": [
                {"tool": name, "success": r.get("success", False)}
                for name, r in tool_results
            ]
        })
        
        yield {"type": "done", "result": response_text}
        
    except Exception as e:
        logger.error(f"Session agent error: {e}")
        await task_manager.update_task_status(
            task_id,
            TaskStatus.FAILED,
            error=str(e)
        )
        await sse_bus.publish(task_id, "error", {
            "message": str(e)
        })
        yield {"type": "error", "error": str(e)}


# Agent 配置（用于未来接入真实 SDK）
session_agent = {
    "name": "session_agent",
    "instructions": SESSION_AGENT_SYSTEM_PROMPT,
    "model": settings.openai_model,
    "tools": get_tool_definitions()
}
