"""
TaskAgent - 任务执行 Agent
可由 SessionAgent 派生，也可由用户在右侧边栏直接创建
支持 Todo 进度管理、工具调用、流式输出
通过数据库工具获取聊天上下文

特点：
- 不直接拥有聊天上下文，通过 function_tool 访问 MySQL 获取
- 可以自定义任务清单（todos）
- 支持网页搜索、Python 执行等工具
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
from tools.db_tools import (
    get_chat_history,
    get_session_members,
    get_user_info,
    search_messages,
    get_user_sessions,
)


# TaskAgent 系统提示词
TASK_AGENT_SYSTEM_PROMPT = """你是一个专注的任务执行助手。你的职责是高效完成分配给你的具体任务。

## 重要：获取上下文
你不直接拥有聊天历史，需要主动使用数据库工具获取上下文：
- 当任务涉及"总结对话"、"回顾讨论"等时，**必须先调用 `get_chat_history`** 获取聊天记录
- 当需要了解会话成员时，使用 `get_session_members`
- 当需要查找特定话题时，使用 `search_messages`

## 工作流程
1. **理解任务**：分析用户需求，确定需要哪些信息
2. **获取上下文**：如需要，调用数据库工具获取相关聊天记录
3. **规划步骤**：使用 `add_todos` 创建任务步骤清单（可选，复杂任务建议使用）
4. **执行任务**：按步骤执行，使用各类工具完成任务
5. **汇报结果**：总结任务结果

## 可用工具

### 数据库工具（获取项目数据）
- `get_chat_history(chat_session_id, limit, offset)` - 获取会话的聊天历史
- `get_session_members(chat_session_id)` - 获取会话成员列表
- `get_user_info(user_id)` - 获取用户详细信息
- `search_messages(chat_session_id, keyword)` - 搜索会话中的消息
- `get_user_sessions(user_id)` - 获取用户的会话列表

### 任务管理工具
- `add_todos(texts)` - 添加任务步骤清单，每步 4-8 字
- `update_todo(todo_id, status)` - 更新步骤状态 (running/completed/failed)
- `list_todos()` - 查看当前所有步骤

### 信息检索工具
- `web_search(query)` - 搜索网页信息
- `web_open(url_or_id)` - 打开网页查看详情
- `web_find(pattern)` - 在页面中查找内容

### 代码执行工具
- `python_execute(code)` - 执行 Python 代码（需审批）

## 注意事项
- **对于需要聊天上下文的任务，必须先调用数据库工具获取信息**
- 任务步骤可以由你自己定义，根据实际需要灵活调整
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


def create_task_agent(task_id: str, user_id: str, chat_session_id: Optional[str] = None) -> Agent:
    """
    创建 TaskAgent 实例
    
    Args:
        task_id: 任务 ID
        user_id: 用户 ID
        chat_session_id: 聊天会话 ID（可选，用于在提示词中提供上下文）
    """
    # 设置工具上下文
    set_tool_context(task_id, user_id)
    
    # TaskAgent 工具集：包含数据库工具、Todo 工具和其他工具
    tools = [
        # 数据库工具（获取聊天上下文）
        get_chat_history,
        get_session_members,
        get_user_info,
        search_messages,
        get_user_sessions,
        # 任务管理工具
        add_todos,
        update_todo,
        list_todos,
        # 信息检索工具
        web_search,
        web_open,
        web_find,
        # 代码执行工具
        python_execute_with_approval,
    ]
    
    # 如果有 chat_session_id，在提示词中添加上下文提示
    instructions = TASK_AGENT_SYSTEM_PROMPT
    if chat_session_id:
        context_hint = f"""

## 当前上下文
- 当前用户 ID: {user_id}
- 关联会话 ID: {chat_session_id}

如果任务需要了解聊天内容，请使用 `get_chat_history("{chat_session_id}")` 获取。
"""
        instructions = TASK_AGENT_SYSTEM_PROMPT + context_hint
    
    return Agent(
        name="TaskAgent",
        instructions=instructions,
        tools=tools,
        hooks=TaskAgentHooks(task_id),
    )


async def run_task_agent(task: Task) -> AsyncIterator[dict]:
    """
    运行 TaskAgent（流式）
    """
    task_id = task.id
    user_id = task.user_id
    chat_session_id = task.chat_session_id  # 获取关联的会话 ID
    
    logger.info(f"Starting TaskAgent for task {task_id}, chat_session_id={chat_session_id}")
    
    try:
        # 更新状态
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 发送初始化事件
        await sse_bus.publish(task_id, "init", {
            "task_id": task_id,
            "task_type": "task_agent",
            "chat_session_id": chat_session_id
        })
        
        # 创建 Agent，传递 chat_session_id
        agent = create_task_agent(task_id, user_id, chat_session_id)
        
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
