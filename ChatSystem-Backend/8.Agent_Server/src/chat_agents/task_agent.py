"""
TaskAgent - 任务执行 Agent
由 SessionAgent 派生，负责执行具体任务
支持 Todo 进度管理、工具调用、流式输出
"""
import asyncio
from typing import Optional, AsyncIterator, Any, List
from dataclasses import dataclass, field
from datetime import datetime
from loguru import logger

from agents import (
    Agent,
    Runner,
    RunConfig,
    ItemHelpers,
    AgentHooks,
    AgentHookContext,
    RunContextWrapper,
    Tool,
    handoff,
)
from openai.types.responses import ResponseTextDeltaEvent

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from runtime import sse_bus, task_manager, Task, TaskStatus
from providers import get_default_provider
from tools.sdk_tools import (
    web_search, web_open, web_find, 
    python_execute_with_approval,
    set_tool_context
)
from tools.todo_tools import add_todos, update_todo, list_todos, _clear_task_todos


# TaskAgent 系统提示词
TASK_AGENT_SYSTEM_PROMPT = """你是一个专注的任务执行助手。你的职责是高效完成分配给你的具体任务。

## 工作流程
1. **规划**：收到任务后，首先使用 `add_todos` 创建任务步骤清单
2. **执行**：按顺序执行每个步骤，执行前用 `update_todo` 标记为 running
3. **完成**：步骤完成后用 `update_todo` 标记为 completed
4. **汇报**：所有步骤完成后，总结任务结果

## 可用工具
- `add_todos(texts)` - 添加任务步骤清单，每步 4-8 字
- `update_todo(todo_id, status)` - 更新步骤状态 (running/completed/failed)
- `list_todos()` - 查看当前所有步骤
- `web_search(query)` - 搜索网页信息
- `web_open(url_or_id)` - 打开网页查看详情
- `web_find(pattern)` - 在页面中查找内容
- `python_execute(code)` - 执行 Python 代码（需审批）

## 注意事项
- 始终先规划再执行
- 每个步骤执行时更新状态，让用户了解进度
- 如遇到问题，标记为 failed 并说明原因
- 回复简洁专业，使用中文

请开始执行任务。
"""


class TaskAgentHooks(AgentHooks):
    """TaskAgent 生命周期钩子"""
    
    def __init__(self, task_id: str):
        self.task_id = task_id
    
    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        logger.info(f"[{self.task_id}] TaskAgent started")
        await sse_bus.publish(self.task_id, "task_status", {"status": "running"})
    
    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        logger.info(f"[{self.task_id}] TaskAgent ended")
    
    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        logger.info(f"[{self.task_id}] Tool {tool.name} starting")
        # Todo 工具的调用不需要额外发送 tool_call 事件，它们自己会发送 todo 事件
        if tool.name not in ['add_todos', 'update_todo', 'list_todos']:
            await sse_bus.publish(self.task_id, "tool_call", {
                "tool_name": tool.name,
                "status": "executing"
            })
    
    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        logger.info(f"[{self.task_id}] Tool {tool.name} completed")
        if tool.name not in ['add_todos', 'update_todo', 'list_todos']:
            await sse_bus.publish(self.task_id, "tool_output", {
                "tool_name": tool.name,
                "result_preview": result[:300] if len(result) > 300 else result,
                "status": "completed"
            })


def create_task_agent(task_id: str, user_id: str) -> Agent:
    """创建 TaskAgent 实例"""
    # 设置工具上下文
    set_tool_context(task_id, user_id)
    
    # TaskAgent 工具集：包含 Todo 工具和其他工具
    tools = [
        add_todos,
        update_todo,
        list_todos,
        web_search,
        web_open,
        web_find,
        python_execute_with_approval,
    ]
    
    return Agent(
        name="TaskAgent",
        instructions=TASK_AGENT_SYSTEM_PROMPT,
        tools=tools,
        hooks=TaskAgentHooks(task_id),
    )


async def run_task_agent(task: Task) -> AsyncIterator[dict]:
    """
    运行 TaskAgent（流式）
    """
    task_id = task.id
    user_id = task.user_id
    
    logger.info(f"Starting TaskAgent for task {task_id}")
    
    try:
        # 更新状态
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 发送初始化事件
        await sse_bus.publish(task_id, "init", {
            "task_id": task_id,
            "task_type": "task_agent"
        })
        
        # 创建 Agent
        agent = create_task_agent(task_id, user_id)
        
        # 运行
        provider = get_default_provider()
        run_config = RunConfig(model_provider=provider)
        result = Runner.run_streamed(
            agent,
            input=task.input_text,
            run_config=run_config
        )
        
        full_response = ""
        
        async for event in result.stream_events():
            if event.type == "raw_response_event":
                if isinstance(event.data, ResponseTextDeltaEvent):
                    delta = event.data.delta
                    if delta:
                        full_response += delta
                        await sse_bus.publish(task_id, "message", {
                            "content": delta,
                            "delta": True
                        })
                        yield {"type": "message_delta", "content": delta}
            
            elif event.type == "run_item_stream_event":
                if event.item.type == "tool_call_item":
                    tool_name = getattr(event.item.raw_item, 'name', 'unknown')
                    logger.debug(f"Tool call: {tool_name}")
                elif event.item.type == "tool_call_output_item":
                    logger.debug(f"Tool output received")
        
        # 任务完成
        final_text = full_response.strip() if full_response else "任务完成"
        
        await task_manager.update_task_status(
            task_id,
            TaskStatus.DONE,
            result=final_text
        )
        
        await sse_bus.publish(task_id, "done", {
            "final_text": final_text
        })
        
        # 清理 Todo 缓存
        _clear_task_todos(task_id)
        
        yield {"type": "done", "result": final_text}
        
    except Exception as e:
        logger.error(f"TaskAgent error: {e}", exc_info=True)
        
        await task_manager.update_task_status(
            task_id,
            TaskStatus.FAILED,
            error=str(e)
        )
        
        await sse_bus.publish(task_id, "error", {
            "message": str(e)
        })
        
        _clear_task_todos(task_id)
        
        yield {"type": "error", "error": str(e)}


# 导出配置
task_agent_config = {
    "name": "task_agent",
    "instructions": TASK_AGENT_SYSTEM_PROMPT,
    "model": settings.openrouter_model,
    "tools": [
        "add_todos", "update_todo", "list_todos",
        "web_search", "web_open", "web_find", "python_execute"
    ]
}
