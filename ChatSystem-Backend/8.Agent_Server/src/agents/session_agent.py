"""
会话 Agent - 处理会话内的 Agent 任务
"""
import asyncio
from typing import Optional, AsyncIterator
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from runtime import sse_bus, task_manager, Task, TaskStatus


# Agent 系统提示词
SESSION_AGENT_SYSTEM_PROMPT = """你是一个智能助手，帮助用户完成会话内的各种任务。

你的能力包括：
1. 理解用户的问题并给出清晰的回答
2. 帮助用户进行信息搜索和整理
3. 执行简单的计算和分析任务
4. 在需要时使用工具来完成任务

请保持回答简洁、准确、有帮助。如果不确定，请如实告知用户。
"""


async def run_session_agent(task: Task) -> AsyncIterator[dict]:
    """
    运行会话 Agent
    
    这是一个模拟实现，实际应该接入 OpenAI Agents SDK
    """
    task_id = task.id
    
    try:
        # 更新状态为运行中
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 发送 reasoning 开始
        await sse_bus.publish(task_id, "reasoning_delta", {
            "content": "正在思考..."
        })
        
        # 模拟思考过程
        await asyncio.sleep(0.5)
        
        await sse_bus.publish(task_id, "reasoning_delta", {
            "content": "分析用户请求..."
        })
        
        await asyncio.sleep(0.5)
        
        # 生成响应
        # 实际应该调用 OpenAI API
        response_text = f"收到您的消息：「{task.input_text}」\n\n"
        response_text += "这是一个测试响应。Agent Server 已成功接收并处理您的请求。\n\n"
        response_text += "**功能说明：**\n"
        response_text += "- ✅ 任务创建成功\n"
        response_text += "- ✅ SSE 事件流正常\n"
        response_text += "- ✅ 消息处理完成\n"
        
        # 流式发送响应
        for i, chunk in enumerate(response_text.split('\n')):
            if chunk:
                await sse_bus.publish(task_id, "message", {
                    "content": chunk + '\n',
                    "delta": True
                })
                yield {"type": "message_delta", "content": chunk + '\n'}
                await asyncio.sleep(0.1)
        
        # 任务完成
        await task_manager.update_task_status(
            task_id, 
            TaskStatus.DONE,
            result=response_text
        )
        
        await sse_bus.publish(task_id, "done", {
            "final_text": response_text
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
    "tools": []  # 后续添加工具
}
