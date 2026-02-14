"""
SessionAgent - 会话 Agent
作为聊天会话中的一个特殊用户存在，拥有以下特点：

1. 作为会话成员：可以被添加到群聊中，有自己的用户身份
2. 直接拥有聊天上下文：收到消息时自动包含近期聊天历史
3. @ 触发机制：用户在消息中 @ 该 Agent 时触发流式回复
4. 可派生 TaskAgent：复杂任务可以创建 TaskAgent 执行

与 TaskAgent 的区别：
- SessionAgent: 直接在聊天中回复，拥有实时上下文
- TaskAgent: 在右侧边栏执行任务，通过工具查询上下文
"""
import asyncio
import uuid
from typing import Optional, AsyncIterator, Any, Annotated, List, Dict
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


# SessionAgent 的用户 ID 前缀（用于标识 Agent 用户）
SESSION_AGENT_USER_ID_PREFIX = "agent_"

# 默认 SessionAgent 用户信息
DEFAULT_SESSION_AGENT_INFO = {
    "user_id": "agent_assistant",
    "nickname": "AI 助手",
    "description": "我是智能助手，可以帮助解答问题、执行任务",
    "avatar_id": None,  # 可以设置默认头像
}


def get_session_agent_user_id(chat_session_id: str) -> str:
    """获取会话的 Agent 用户 ID"""
    return f"{SESSION_AGENT_USER_ID_PREFIX}{chat_session_id[:8]}"


# SessionAgent 系统提示词
SESSION_AGENT_SYSTEM_PROMPT = """你是聊天会话中的 AI 助手成员。你直接参与对话，像其他群成员一样交流。

## 你的身份
- 你是这个聊天会话的成员之一
- 用户通过 @你 来请求你的帮助
- 你可以看到聊天历史，理解对话上下文

## 你的能力
1. **直接回答**：根据聊天上下文回答问题
2. **创建任务**：复杂任务使用 `create_task` 创建后台任务
3. **搜索信息**：使用网页搜索获取最新信息
4. **执行代码**：执行 Python 代码（需要审批）

## 何时创建任务
当请求涉及以下情况时，应创建任务：
- 需要多步骤处理（如研究报告、数据分析）
- 需要较长执行时间
- 用户明确要求后台执行

## 回复风格
- 简洁友好，像朋友聊天
- 使用中文回复
- 根据上下文自然回应
- 回复不要太长，保持对话感

请自然地参与对话！
"""


# 用于存储待执行任务的队列
_pending_tasks: dict[str, dict] = {}


def get_pending_task(parent_task_id: str) -> Optional[dict]:
    """获取并移除待执行的子任务"""
    return _pending_tasks.pop(parent_task_id, None)


class SessionAgentHooks(AgentHooks):
    """SessionAgent 生命周期钩子"""
    
    def __init__(self, task_id: str, chat_session_id: str):
        self.task_id = task_id
        self.chat_session_id = chat_session_id
        self.event_counter = 0
    
    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        self.event_counter += 1
        logger.info(f"[{self.task_id}] SessionAgent started in session {self.chat_session_id}")
    
    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        self.event_counter += 1
        logger.info(f"[{self.task_id}] SessionAgent ended")
    
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


# 创建任务的工具
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


def create_session_agent(
    task_id: str, 
    user_id: str, 
    chat_session_id: str,
    chat_history: Optional[List[Dict]] = None,
    use_approval: bool = True
) -> Agent:
    """
    创建会话 Agent 实例
    
    Args:
        task_id: 任务 ID
        user_id: 请求用户 ID
        chat_session_id: 聊天会话 ID
        chat_history: 聊天历史（可选，用于构建上下文）
        use_approval: 是否需要审批才能执行危险操作
    """
    # 设置工具执行上下文
    set_tool_context(task_id, user_id)
    
    # 构建带上下文的系统提示词
    instructions = SESSION_AGENT_SYSTEM_PROMPT
    
    if chat_history:
        # 将聊天历史加入提示词
        history_text = "\n## 近期聊天记录\n"
        for msg in chat_history[-20:]:  # 最多取最近 20 条
            sender = msg.get("sender_nickname", msg.get("sender_id", "未知"))
            content = msg.get("content", "")
            if content:
                history_text += f"- {sender}: {content}\n"
        
        instructions = SESSION_AGENT_SYSTEM_PROMPT + history_text
    
    # 选择工具集
    python_tool = python_execute_with_approval if use_approval else python_execute
    
    tools = [
        create_task,  # 创建后台任务
        web_search,
        web_open,
        web_find,
        python_tool,
    ]
    
    return Agent(
        name="SessionAgent",
        instructions=instructions,
        tools=tools,
        hooks=SessionAgentHooks(task_id, chat_session_id),
    )


async def run_session_agent(
    task: Task, 
    chat_history: Optional[List[Dict]] = None,
    use_approval: bool = True
) -> AsyncIterator[dict]:
    """
    运行会话 Agent（流式）
    
    这是在聊天会话中触发的 Agent，直接拥有聊天上下文。
    
    Args:
        task: 任务对象
        chat_history: 聊天历史列表，每项包含 sender_id, sender_nickname, content, timestamp
        use_approval: 是否需要审批
    """
    task_id = task.id
    user_id = task.user_id
    chat_session_id = task.chat_session_id
    
    logger.info(f"Starting SessionAgent for task {task_id}, session={chat_session_id}, use_approval={use_approval}")
    
    try:
        # 更新状态为运行中
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 发送初始化事件
        await sse_bus.publish(task_id, "init", {
            "task_id": task_id,
            "task_type": "session_agent",
            "chat_session_id": chat_session_id
        })
        
        # 创建 Agent
        agent = create_session_agent(
            task_id, user_id, chat_session_id, 
            chat_history=chat_history,
            use_approval=use_approval
        )
        
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
                chat_session_id=chat_session_id
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
        logger.error(f"SessionAgent error: {e}", exc_info=True)
        
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
    agent = create_session_agent(task_id, user_id, "test_session", use_approval=False)
    provider = get_default_provider()
    
    result = await Runner.run(
        agent,
        input=input_text,
        run_config=RunConfig(model_provider=provider)
    )
    
    return result.final_output


# Agent 配置（用于导出）
session_agent_config = {
    "name": "session_agent",
    "instructions": SESSION_AGENT_SYSTEM_PROMPT,
    "model": settings.openrouter_model,
    "tools": ["create_task", "web_search", "web_open", "web_find", "python_execute"],
    "user_info": DEFAULT_SESSION_AGENT_INFO,
}
