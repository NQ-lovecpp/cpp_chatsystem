"""
会话 Agent - 使用 OpenAI Agents SDK 实现
作为聊天会话中的 AI 联系人，可以派生 TaskAgent 执行具体任务
支持工具调用、流式输出、SSE 事件推送、任务派生
"""
import asyncio
import uuid
from typing import Optional, AsyncIterator, Any, Annotated
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
    function_tool,
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
from providers import get_default_provider, get_openrouter_provider
from tools.sdk_tools import (
    web_search, web_open, web_find, 
    python_execute, python_execute_with_approval,
    set_tool_context
)


# SessionAgent 系统提示词
SESSION_AGENT_SYSTEM_PROMPT = """你是聊天会话中的智能助手。你可以直接回答问题，也可以创建任务来处理复杂请求。

## 你的能力
1. **直接回答**：对于简单问题，直接给出回答
2. **创建任务**：对于需要多步骤处理的复杂请求，使用 `create_task` 创建后台任务
3. **使用工具**：搜索网页、执行代码等

## 何时创建任务
当用户请求涉及以下情况时，应该创建任务：
- 需要多步骤完成（如研究报告、数据分析）
- 需要较长时间（搜索+分析+总结）
- 用户明确要求"帮我做..."或"任务是..."

## 可用工具
- `create_task(description)` - 创建后台任务，返回任务 ID
- `web_search(query)` - 搜索网页
- `web_open(url_or_id)` - 打开网页
- `web_find(pattern)` - 页面查找
- `python_execute(code)` - 执行 Python（需审批）

## 回复风格
- 使用中文回复
- 简洁友好
- 创建任务时告知用户任务 ID 和预期

开始吧！
"""


# 用于存储待执行任务的队列
_pending_tasks: dict[str, dict] = {}


def get_pending_task(parent_task_id: str) -> Optional[dict]:
    """获取并移除待执行的子任务"""
    return _pending_tasks.pop(parent_task_id, None)


class SessionAgentHooks(AgentHooks):
    """Agent 生命周期钩子"""
    
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.event_counter = 0
    
    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        self.event_counter += 1
        logger.info(f"[{self.task_id}] Agent {agent.name} started")
        await sse_bus.publish(self.task_id, "reasoning_delta", {
            "content": "正在分析您的请求..."
        })
    
    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        self.event_counter += 1
        logger.info(f"[{self.task_id}] Agent {agent.name} ended")
    
    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        self.event_counter += 1
        logger.info(f"[{self.task_id}] Tool {tool.name} started")
        await sse_bus.publish(self.task_id, "tool_call", {
            "tool_name": tool.name,
            "status": "executing"
        })
    
    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        self.event_counter += 1
        logger.info(f"[{self.task_id}] Tool {tool.name} ended")
        await sse_bus.publish(self.task_id, "tool_output", {
            "tool_name": tool.name,
            "result_preview": result[:500] if len(result) > 500 else result,
            "status": "completed"
        })


# 创建任务的工具（作为独立函数，通过上下文获取 task_id）
from tools.sdk_tools import current_task_id, current_user_id

@function_tool
async def create_task(
    description: Annotated[str, "任务描述，清晰说明需要完成什么"]
) -> str:
    """
    创建一个后台任务来执行复杂的多步骤工作。
    任务会在后台运行，用户可以在任务面板查看进度。
    
    使用场景：
    - 需要搜索+分析+总结的研究任务
    - 需要执行多段代码的数据处理
    - 任何需要较长时间的复杂工作
    
    返回任务 ID，用户可以用它查看任务进度。
    """
    parent_task_id = current_task_id.get()
    user_id = current_user_id.get()
    
    # 创建子任务
    child_task_id = f"task_{uuid.uuid4().hex[:12]}"
    
    # 存储待执行任务信息
    _pending_tasks[parent_task_id] = {
        "child_task_id": child_task_id,
        "description": description,
        "user_id": user_id
    }
    
    # 通知前端有新任务创建
    await sse_bus.publish(parent_task_id, "task_created", {
        "task_id": child_task_id,
        "description": description,
        "parent_task_id": parent_task_id
    })
    
    logger.info(f"Created child task {child_task_id} from {parent_task_id}")
    
    return f"任务已创建，ID: {child_task_id}。用户可以在右侧任务面板查看进度。"


def create_session_agent(task_id: str, user_id: str, use_approval: bool = True) -> Agent:
    """
    创建会话 Agent 实例
    """
    # 设置工具执行上下文
    set_tool_context(task_id, user_id)
    
    # 选择工具集
    python_tool = python_execute_with_approval if use_approval else python_execute
    
    tools = [
        create_task,  # 创建任务工具
        web_search,
        web_open,
        web_find,
        python_tool,
    ]
    
    return Agent(
        name="SessionAgent",
        instructions=SESSION_AGENT_SYSTEM_PROMPT,
        tools=tools,
        hooks=SessionAgentHooks(task_id),
    )


async def run_session_agent(task: Task, use_approval: bool = True) -> AsyncIterator[dict]:
    """
    运行会话 Agent（流式）
    """
    task_id = task.id
    user_id = task.user_id
    
    logger.info(f"Starting session agent for task {task_id}, use_approval={use_approval}")
    
    try:
        # 更新状态为运行中
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 创建 Agent
        agent = create_session_agent(task_id, user_id, use_approval)
        
        # 获取模型提供者
        provider = get_default_provider()
        
        # 运行流式 Agent
        run_config = RunConfig(model_provider=provider)
        result = Runner.run_streamed(
            agent,
            input=task.input_text,
            run_config=run_config
        )
        
        # 收集完整响应
        full_response = ""
        
        # 处理流式事件
        async for event in result.stream_events():
            # 处理文本增量
            if event.type == "raw_response_event":
                if isinstance(event.data, ResponseTextDeltaEvent):
                    delta = event.data.delta
                    if delta:
                        full_response += delta
                        # 发送消息增量
                        await sse_bus.publish(task_id, "message", {
                            "content": delta,
                            "delta": True
                        })
                        yield {"type": "message_delta", "content": delta}
            
            # 处理 run_item 事件
            elif event.type == "run_item_stream_event":
                if event.item.type == "tool_call_item":
                    tool_name = getattr(event.item.raw_item, 'name', 'unknown')
                    logger.info(f"Tool called: {tool_name}")
                    
                elif event.item.type == "tool_call_output_item":
                    output = event.item.output
                    logger.info(f"Tool output received: {output[:100]}...")
                    
                elif event.item.type == "message_output_item":
                    message = ItemHelpers.text_message_output(event.item)
                    if message and message != full_response:
                        pass
            
            # Agent 更新事件
            elif event.type == "agent_updated_stream_event":
                logger.info(f"Agent updated: {event.new_agent.name}")
        
        # 流结束后处理
        final_text = full_response.strip() if full_response else "处理完成"
        
        # 检查是否有创建的子任务需要启动
        pending = get_pending_task(task_id)
        if pending:
            # 启动子任务（在后台）
            from .task_agent import run_task_agent
            
            child_task = Task(
                id=pending["child_task_id"],
                user_id=pending["user_id"],
                input_text=pending["description"],
                task_type="task",
                chat_session_id=task.chat_session_id
            )
            
            # 注册子任务
            await task_manager.create_task(
                task_id=child_task.id,
                user_id=child_task.user_id,
                input_text=child_task.input_text,
                task_type="task",
                chat_session_id=child_task.chat_session_id
            )
            
            # 在后台运行子任务
            asyncio.create_task(_run_child_task(child_task))
            
            logger.info(f"Started child task {child_task.id}")
        
        # 更新任务状态
        await task_manager.update_task_status(
            task_id,
            TaskStatus.DONE,
            result=final_text
        )
        
        # 发送完成事件
        await sse_bus.publish(task_id, "done", {
            "final_text": final_text
        })
        
        yield {"type": "done", "result": final_text}
        
    except Exception as e:
        logger.error(f"Session agent error: {e}", exc_info=True)
        
        # 更新任务状态为失败
        await task_manager.update_task_status(
            task_id,
            TaskStatus.FAILED,
            error=str(e)
        )
        
        # 发送错误事件
        await sse_bus.publish(task_id, "error", {
            "message": str(e)
        })
        
        yield {"type": "error", "error": str(e)}


async def _run_child_task(task: Task):
    """在后台运行子任务"""
    from .task_agent import run_task_agent
    
    try:
        async for _ in run_task_agent(task):
            pass  # 消费所有事件
    except Exception as e:
        logger.error(f"Child task {task.id} failed: {e}")


async def run_session_agent_simple(input_text: str, task_id: str = "test", user_id: str = "test") -> str:
    """
    简单运行 Agent（非流式，用于测试）
    """
    agent = create_session_agent(task_id, user_id, use_approval=False)
    provider = get_default_provider()
    
    result = await Runner.run(
        agent,
        input=input_text,
        run_config=RunConfig(model_provider=provider)
    )
    
    return result.final_output


# Agent 配置（用于导出）
session_agent = {
    "name": "session_agent",
    "instructions": SESSION_AGENT_SYSTEM_PROMPT,
    "model": settings.openrouter_model,
    "tools": ["create_task", "web_search", "web_open", "web_find", "python_execute"]
}
