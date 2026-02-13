"""
全局 Agent - 处理跨会话的全局任务
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
GLOBAL_AGENT_SYSTEM_PROMPT = """你是一个全局智能助手，负责处理跨会话的复杂任务。

你的能力包括：
1. 分析和总结用户的历史对话
2. 执行需要多步骤的复杂任务
3. 使用各种工具完成任务（网页搜索、代码执行等）
4. 创建和管理待办事项

在执行可能有风险的操作（如运行代码、访问外部服务）时，你会先请求用户审批。
"""


async def run_global_agent(task: Task) -> AsyncIterator[dict]:
    """
    运行全局 Agent
    
    这是一个模拟实现，实际应该接入 OpenAI Agents SDK
    """
    task_id = task.id
    
    try:
        # 更新状态为运行中
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 发送 reasoning 开始
        await sse_bus.publish(task_id, "reasoning_delta", {
            "content": "全局任务开始处理..."
        })
        
        await asyncio.sleep(0.5)
        
        # 模拟添加待办
        todos = [
            {"id": "todo_1", "text": "分析用户请求", "status": "completed"},
            {"id": "todo_2", "text": "收集相关信息", "status": "in_progress"},
            {"id": "todo_3", "text": "生成响应", "status": "pending"}
        ]
        
        for todo in todos:
            await sse_bus.publish(task_id, "todo_added", {
                "todo": todo
            })
            yield {"type": "todo_added", "todo": todo}
            await asyncio.sleep(0.3)
        
        # 更新待办状态
        await sse_bus.publish(task_id, "todo_status", {
            "todoId": "todo_2",
            "status": "completed"
        })
        
        await asyncio.sleep(0.5)
        
        await sse_bus.publish(task_id, "todo_status", {
            "todoId": "todo_3",
            "status": "completed"
        })
        
        # 生成响应
        response_text = f"全局任务处理完成！\n\n"
        response_text += f"**任务内容：**{task.input_text}\n\n"
        response_text += "**执行结果：**\n"
        response_text += "- 任务分析完成\n"
        response_text += "- 信息收集完成\n"
        response_text += "- 响应生成完成\n"
        
        # 流式发送响应
        for chunk in response_text.split('\n'):
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
            "final_text": response_text,
            "todos": todos
        })
        
        yield {"type": "done", "result": response_text}
        
    except Exception as e:
        logger.error(f"Global agent error: {e}")
        await task_manager.update_task_status(
            task_id,
            TaskStatus.FAILED,
            error=str(e)
        )
        await sse_bus.publish(task_id, "error", {
            "message": str(e)
        })
        yield {"type": "error", "error": str(e)}


# Agent 配置
global_agent = {
    "name": "global_agent",
    "instructions": GLOBAL_AGENT_SYSTEM_PROMPT,
    "model": settings.openai_model,
    "tools": []  # 后续添加工具
}
