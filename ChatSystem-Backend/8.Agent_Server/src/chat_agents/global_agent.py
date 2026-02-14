"""
GlobalAgent - 用户个人的全局 Agent
从左侧边栏打开，独立于聊天会话

特点：
1. 用户专属：每个用户有自己的 GlobalAgent
2. 跨会话：可以访问用户的所有会话数据
3. 持久对话：维护用户与 Agent 之间的独立对话历史
4. 任务派发：可以创建 TaskAgent 执行具体任务

与 SessionAgent 的区别：
- GlobalAgent: 用户的私人助手，从左侧边栏访问，跨会话
- SessionAgent: 群聊/单聊中的成员，在特定会话中活动
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
    set_tool_context,
    current_task_id,
    current_user_id,
)
from tools.db_tools import (
    get_chat_history,
    get_session_members,
    get_user_info,
    search_messages,
    get_user_sessions,
)


# GlobalAgent 系统提示词
GLOBAL_AGENT_SYSTEM_PROMPT = """你是用户的私人 AI 助手。你可以帮助用户处理各种任务，包括查询聊天记录、分析数据、搜索信息等。

## 你的身份
- 你是用户的专属助手，为用户一人服务
- 你独立于聊天会话，可以访问用户的所有会话数据
- 你维护与用户之间的独立对话历史

## 你的能力

### 访问用户数据
- `get_user_sessions(user_id)` - 查看用户的所有聊天会话
- `get_chat_history(chat_session_id)` - 获取特定会话的聊天记录
- `get_session_members(chat_session_id)` - 查看会话成员
- `search_messages(chat_session_id, keyword)` - 搜索会话中的消息
- `get_user_info(user_id)` - 获取用户信息

### 任务管理
- `create_task(description)` - 创建后台任务，用于复杂的多步骤工作

### 信息检索
- `web_search(query)` - 搜索网页信息
- `web_open(url_or_id)` - 打开网页查看详情
- `web_find(pattern)` - 在页面中查找内容

### 代码执行
- `python_execute(code)` - 执行 Python 代码（需审批）

## 使用指南
1. 当用户询问聊天相关内容时，先用 `get_user_sessions` 找到相关会话
2. 然后用 `get_chat_history` 或 `search_messages` 获取具体内容
3. 复杂任务请创建 Task 在后台执行

## 回复风格
- 亲切友好，像私人助手
- 简洁高效，重点突出
- 使用中文回复

请开始为用户服务！
"""


# 用于存储待执行任务的队列
_pending_global_tasks: dict[str, dict] = {}


def get_pending_global_task(parent_task_id: str) -> Optional[dict]:
    """获取并移除待执行的子任务"""
    return _pending_global_tasks.pop(parent_task_id, None)


class GlobalAgentHooks(AgentHooks):
    """GlobalAgent 生命周期钩子"""
    
    def __init__(self, task_id: str, user_id: str):
        self.task_id = task_id
        self.user_id = user_id
    
    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        logger.info(f"[{self.task_id}] GlobalAgent started for user {self.user_id}")
    
    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        logger.info(f"[{self.task_id}] GlobalAgent ended")
    
    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        logger.info(f"[{self.task_id}] Tool {tool.name} started")
        await sse_bus.publish(self.task_id, "tool_call", {
            "tool_name": tool.name,
            "status": "executing"
        })
    
    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        logger.info(f"[{self.task_id}] Tool {tool.name} ended")
        await sse_bus.publish(self.task_id, "tool_output", {
            "tool_name": tool.name,
            "result_preview": result[:500] if len(result) > 500 else result,
            "status": "completed"
        })


# 创建任务的工具（GlobalAgent 专用）
@function_tool
async def create_global_task(
    description: Annotated[str, "任务描述，清晰说明需要完成什么"],
    target_session_id: Annotated[Optional[str], "目标会话 ID（如果任务与特定会话相关）"] = None
) -> str:
    """
    创建一个后台任务来执行复杂的多步骤工作。
    任务会在后台运行，用户可以在任务面板查看进度。
    
    使用场景：
    - 需要分析多个会话的复杂任务
    - 需要搜索+分析+总结的研究任务
    - 需要执行多段代码的数据处理
    - 任何需要较长时间的复杂工作
    
    参数：
    - description: 任务描述
    - target_session_id: 如果任务与特定会话相关，提供会话 ID
    
    返回任务 ID，用户可以用它查看任务进度。
    """
    parent_task_id = current_task_id.get()
    user_id = current_user_id.get()
    
    # 创建子任务
    child_task_id = f"task_{uuid.uuid4().hex[:12]}"
    
    # 存储待执行任务信息
    _pending_global_tasks[parent_task_id] = {
        "child_task_id": child_task_id,
        "description": description,
        "user_id": user_id,
        "chat_session_id": target_session_id
    }
    
    # 通知前端有新任务创建
    await sse_bus.publish(parent_task_id, "task_created", {
        "task_id": child_task_id,
        "description": description,
        "parent_task_id": parent_task_id,
        "target_session_id": target_session_id
    })
    
    logger.info(f"Created global child task {child_task_id} from {parent_task_id}")
    
    return f"任务已创建，ID: {child_task_id}。您可以在右侧任务面板查看进度。"


def create_global_agent(task_id: str, user_id: str) -> Agent:
    """
    创建全局 Agent 实例
    
    Args:
        task_id: 任务 ID
        user_id: 用户 ID
    """
    # 设置工具执行上下文
    set_tool_context(task_id, user_id)
    
    # 构建带用户信息的系统提示词
    instructions = GLOBAL_AGENT_SYSTEM_PROMPT + f"""

## 当前用户
- 用户 ID: {user_id}

使用数据库工具时，可以直接使用此用户 ID 查询用户相关数据。
"""
    
    # GlobalAgent 工具集
    tools = [
        # 数据库工具（访问用户数据）
        get_user_sessions,
        get_chat_history,
        get_session_members,
        get_user_info,
        search_messages,
        # 任务管理
        create_global_task,
        # 信息检索
        web_search,
        web_open,
        web_find,
        # 代码执行
        python_execute_with_approval,
    ]
    
    return Agent(
        name="GlobalAgent",
        instructions=instructions,
        tools=tools,
        hooks=GlobalAgentHooks(task_id, user_id),
    )


async def run_global_agent(task: Task) -> AsyncIterator[dict]:
    """
    运行全局 Agent（流式）
    
    这是用户的私人助手，从左侧边栏打开。
    """
    task_id = task.id
    user_id = task.user_id
    
    logger.info(f"Starting GlobalAgent for task {task_id}, user={user_id}")
    
    try:
        # 更新状态为运行中
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 发送初始化事件
        await sse_bus.publish(task_id, "init", {
            "task_id": task_id,
            "task_type": "global_agent",
            "user_id": user_id
        })
        
        # 创建 Agent
        agent = create_global_agent(task_id, user_id)
        
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
        
        # 流结束后处理
        final_text = full_response.strip() if full_response else "处理完成"
        
        # 检查是否有创建的子任务需要启动
        pending = get_pending_global_task(task_id)
        if pending:
            # 启动子任务（在后台）
            from .task_agent import run_task_agent
            
            child_task = Task(
                id=pending["child_task_id"],
                user_id=pending["user_id"],
                input_text=pending["description"],
                task_type="task",
                chat_session_id=pending.get("chat_session_id")
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
            asyncio.create_task(_run_global_child_task(child_task))
            
            logger.info(f"Started global child task {child_task.id}")
        
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
        logger.error(f"GlobalAgent error: {e}", exc_info=True)
        
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


async def _run_global_child_task(task: Task):
    """在后台运行子任务"""
    from .task_agent import run_task_agent
    
    try:
        async for _ in run_task_agent(task):
            pass  # 消费所有事件
    except Exception as e:
        logger.error(f"Global child task {task.id} failed: {e}")


# Agent 配置（用于导出）
global_agent_config = {
    "name": "global_agent",
    "instructions": GLOBAL_AGENT_SYSTEM_PROMPT,
    "model": settings.openrouter_model,
    "tools": [
        "get_user_sessions", "get_chat_history", "get_session_members",
        "get_user_info", "search_messages", "create_global_task",
        "web_search", "web_open", "web_find", "python_execute"
    ]
}
