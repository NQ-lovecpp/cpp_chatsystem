"""
SessionAgent - 会话 Agent（后台任务版）

作为聊天会话中的一个实际用户存在，特点：
1. 作为会话成员：在 user 表中有记录，可被添加到群聊
2. 上下文管理：从 Redis 缓存/MySQL 获取聊天上下文
3. 按钮触发机制：用户通过 @AI助手 按钮触发
4. 双写机制：消息同时写入 Redis 和 MySQL
5. 流式输出：支持 reasoning、tool_calls、ThoughtChain
6. 后台任务：复杂任务通过 create_background_task 在后台独立运行
"""
import asyncio
import uuid
import json
from typing import Optional, AsyncIterator, Any, Annotated, List, Dict
from datetime import datetime
from dataclasses import dataclass, asdict
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
from agents.items import ReasoningItem
from openai.types.responses import (
    ResponseTextDeltaEvent,
    ResponseFunctionCallArgumentsDeltaEvent,
)

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from runtime import sse_bus, task_manager, Task, TaskStatus
from runtime.context_manager import context_manager, ContextMessage
from runtime.dual_writer import (
    dual_writer,
    AgentMessage,
    TaskRecord,
    ThoughtChainNode,
    ThoughtChainNodeType,
    TodoItem
)
from providers import get_default_provider, get_openrouter_provider, get_openai_provider
from services.agent_user_service import agent_user_service, AgentUserConfig
from tools.sdk_tools import (
    web_search, web_open, web_find,
    python_execute, python_execute_with_approval,
    set_tool_context,
    current_task_id, current_user_id, current_chat_session_id,
)
from tools.db_tools import (
    get_chat_history,
    get_session_members,
    get_user_info,
    search_messages,
    get_user_sessions,
)


# SessionAgent 系统提示词
SESSION_AGENT_SYSTEM_PROMPT = """你是聊天会话中的 AI 助手成员。你直接参与对话，像其他群成员一样交流。

## 你的身份
- 你是这个聊天会话的成员之一
- 用户通过 @AI助手 按钮来请求你的帮助
- 你可以看到聊天历史，理解对话上下文

## 你的能力
1. **直接回答**：根据聊天上下文回答问题
2. **创建后台任务**：当需要多步骤工作时（搜索+分析+总结、数据处理等），调用 `create_background_task` 在后台独立执行
3. **搜索信息**：使用网页搜索获取最新信息
4. **执行代码**：执行 Python 代码（需要审批）

## 输出格式
- 使用 Markdown 格式输出
- 支持代码块、列表、表格
- 复杂图表可用 mermaid 代码块

## 何时创建后台任务
当请求涉及以下情况时，应调用 create_background_task：
- 需要多步骤处理（如研究报告、数据分析）
- 需要搜索多个信息源并综合分析
- 需要创建任务步骤清单并逐步执行
- 用户明确要求后台执行

调用 create_background_task 后，立即告知用户"已创建后台任务，正在执行中"，然后可继续与用户对话。

## 回复风格
- 简洁友好，像朋友聊天
- 使用中文回复（除非用户使用其他语言）
- 根据上下文自然回应

请自然地参与对话！
"""


@dataclass
class StreamState:
    """流式处理状态"""
    task_id: str
    chat_session_id: str
    agent_user_id: str

    # 内容累积
    full_response: str = ""
    reasoning_content: str = ""

    # ThoughtChain 追踪
    thought_chain_sequence: int = 0
    current_tool_chain_id: Optional[str] = None

    # 工具调用追踪
    tool_calls: List[Dict[str, Any]] = None
    current_tool_call: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        if self.tool_calls is None:
            self.tool_calls = []


class SessionAgentHooks(AgentHooks):
    """SessionAgent 生命周期钩子"""

    def __init__(self, state: StreamState):
        self.state = state
        self.event_counter = 0

    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        self.event_counter += 1
        logger.info(f"[{self.state.task_id}] SessionAgent started in session {self.state.chat_session_id}")

    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        self.event_counter += 1
        logger.info(f"[{self.state.task_id}] SessionAgent ended")

    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        self.event_counter += 1
        logger.info(f"[{self.state.task_id}] Tool {tool.name} started")

        # 创建 ThoughtChain 节点
        chain_id = str(uuid.uuid4())
        self.state.current_tool_chain_id = chain_id
        self.state.thought_chain_sequence += 1

        node = ThoughtChainNode(
            chain_id=chain_id,
            task_id=self.state.task_id,
            node_type=ThoughtChainNodeType.TOOL_CALL.value,
            title=f"调用工具: {tool.name}",
            description=f"正在执行 {tool.name}",
            status="running",
            sequence=self.state.thought_chain_sequence
        )
        await dual_writer.write_thought_chain_node(node)

        await sse_bus.publish(self.state.task_id, "thought_chain", {
            "node": node.to_dict()
        })

        self.state.current_tool_call = {
            "chain_id": chain_id,
            "tool_name": tool.name,
            "start_time": datetime.now().isoformat(),
            "arguments": ""
        }

        await sse_bus.publish(self.state.task_id, "tool_call", {
            "chain_id": chain_id,
            "tool_name": tool.name,
            "status": "executing"
        })

    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        self.event_counter += 1
        logger.info(f"[{self.state.task_id}] Tool {tool.name} ended")

        if self.state.current_tool_chain_id:
            await dual_writer.update_thought_chain_status(
                self.state.current_tool_chain_id,
                "success",
                result[:2000] if len(result) > 2000 else result
            )
            await sse_bus.publish(self.state.task_id, "thought_chain_update", {
                "chain_id": self.state.current_tool_chain_id,
                "status": "success",
                "content": result[:2000] if len(result) > 2000 else result
            })

        if self.state.current_tool_call:
            self.state.current_tool_call["result"] = result[:500] if len(result) > 500 else result
            self.state.current_tool_call["end_time"] = datetime.now().isoformat()
            self.state.tool_calls.append(self.state.current_tool_call)
            self.state.current_tool_call = None

        await sse_bus.publish(self.state.task_id, "tool_output", {
            "chain_id": self.state.current_tool_chain_id,
            "tool_name": tool.name,
            "result_preview": result[:500] if len(result) > 500 else result,
            "status": "completed"
        })

        self.state.current_tool_chain_id = None


# ─── 后台任务工具（在 session_agent.py 中定义） ──────────────────────────────

@function_tool
async def create_background_task(
    description: Annotated[str, "详细描述需要后台执行的任务，包括目标、数据来源和预期结果"]
) -> str:
    """
    创建后台任务，立即返回。TaskAgent 将在后台独立运行，完成后通知当前会话。
    适用于：多步骤搜索+分析、数据处理、需要长时间执行的任务。
    调用此工具后可继续与用户对话，无需等待任务完成。
    """
    from runtime import Task as WorkerTask, TaskType

    parent_task_id = current_task_id.get()
    user_id = current_user_id.get()
    chat_session_id = current_chat_session_id.get()

    task_id = f"task_{uuid.uuid4().hex[:12]}"
    task = WorkerTask(
        id=task_id,
        user_id=user_id,
        task_type=TaskType.TASK,
        input_text=description,
        chat_session_id=chat_session_id,
    )
    async with task_manager._lock:
        task_manager._tasks[task_id] = task

    await sse_bus.publish(parent_task_id, "task_created", {
        "task_id": task_id,
        "description": description[:100],
        "chat_session_id": chat_session_id,
    })

    asyncio.create_task(_run_background_task(task, parent_task_id))
    return f"已创建后台任务 (ID: {task_id})，正在独立执行中，完成后将通知您。"


async def _run_background_task(task, parent_task_id: str):
    """在后台运行 TaskAgent"""
    from chat_agents.task_agent import run_task_agent
    async for _ in run_task_agent(task, parent_task_id=parent_task_id):
        pass


# ─────────────────────────────────────────────────────────────────────────────

def create_session_agents(
    state: StreamState,
    context_messages: List[ContextMessage],
    use_approval: bool = True
) -> Agent:
    """
    创建 SessionAgent（不再含 TaskAgent/handoff，改用 create_background_task 工具）

    返回 session_agent（入口 agent）
    """
    set_tool_context(state.task_id, state.agent_user_id, state.chat_session_id)

    # 构建带上下文的 SessionAgent 提示词
    instructions = SESSION_AGENT_SYSTEM_PROMPT
    if context_messages:
        history_text = "\n## 近期聊天记录\n"
        for msg in context_messages[-20:]:
            sender = msg.nickname
            content = msg.content
            if content:
                prefix = "[AI]" if msg.is_agent else ""
                history_text += f"- {prefix}{sender}: {content[:200]}\n"
        instructions = SESSION_AGENT_SYSTEM_PROMPT + history_text

    python_tool = python_execute_with_approval if use_approval else python_execute

    session_agent = Agent(
        name="SessionAgent",
        instructions=instructions,
        tools=[web_search, web_open, web_find, python_tool, create_background_task],
        hooks=SessionAgentHooks(state),
    )

    return session_agent


async def run_session_agent(
    task: Task,
    agent_user_id: Optional[str] = None,
    use_approval: bool = True,
    chat_history: Optional[list] = None
) -> AsyncIterator[dict]:
    """
    运行会话 Agent（流式）

    SessionAgent 处理对话，复杂任务通过 create_background_task 在后台运行。
    """
    task_id = task.id
    user_id = task.user_id
    chat_session_id = task.chat_session_id

    if not agent_user_id:
        default_agent = agent_user_service.get_default_agent()
        agent_user_id = default_agent.user_id

    agent_config = await agent_user_service.get_agent_user(agent_user_id)
    if not agent_config:
        agent_config = agent_user_service.get_default_agent()

    logger.info(f"Starting SessionAgent for task {task_id}, session={chat_session_id}")

    state = StreamState(
        task_id=task_id,
        chat_session_id=chat_session_id,
        agent_user_id=agent_user_id
    )

    try:
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)

        task_record = TaskRecord(
            task_id=task_id,
            user_id=user_id,
            task_type="session",
            status="running",
            chat_session_id=chat_session_id,
            input_text=task.input_text
        )
        await dual_writer.write_task(task_record)

        await sse_bus.publish(task_id, "init", {
            "task_id": task_id,
            "task_type": "session_agent",
            "chat_session_id": chat_session_id,
            "agent_user_id": agent_user_id,
            "agent_nickname": agent_config.nickname
        })

        # 获取上下文
        context_messages = await context_manager.get_context(chat_session_id)
        logger.info(f"Loaded {len(context_messages)} context messages for session {chat_session_id}")

        # 创建 agent
        session_agent = create_session_agents(state, context_messages, use_approval=use_approval)

        # 运行
        provider = agent_user_service.get_provider_for_agent(agent_user_id)
        run_config = RunConfig(model_provider=provider)
        result = Runner.run_streamed(
            session_agent,
            input=task.input_text,
            run_config=run_config
        )

        reasoning_started = False
        output_started = False
        event_sequence = 0

        async for event in result.stream_events():
            event_sequence += 1

            if event.type == "raw_response_event":
                data = event.data

                # Reasoning 内容
                if data.type == "response.reasoning_text.delta":
                    delta = data.delta
                    if delta:
                        if not reasoning_started:
                            reasoning_started = True
                            state.thought_chain_sequence += 1
                            chain_id = str(uuid.uuid4())
                            node = ThoughtChainNode(
                                chain_id=chain_id,
                                task_id=task_id,
                                node_type=ThoughtChainNodeType.REASONING.value,
                                title="思考中...",
                                status="running",
                                sequence=state.thought_chain_sequence
                            )
                            await dual_writer.write_thought_chain_node(node)
                            state.current_tool_chain_id = chain_id

                            await sse_bus.publish(task_id, "thought_chain", {
                                "node": node.to_dict()
                            })

                        state.reasoning_content += delta
                        await sse_bus.publish(task_id, "reasoning_delta", {
                            "content": delta,
                            "delta": True
                        })
                        yield {"type": "reasoning_delta", "content": delta}

                # Reasoning 摘要
                elif data.type == "response.reasoning_summary_text.delta":
                    delta = data.delta
                    if delta:
                        await sse_bus.publish(task_id, "reasoning_summary", {
                            "content": delta,
                            "delta": True
                        })

                # 输出文本增量
                elif isinstance(data, ResponseTextDeltaEvent):
                    delta = data.delta
                    if delta:
                        if reasoning_started and not output_started:
                            output_started = True
                            if state.current_tool_chain_id:
                                await dual_writer.update_thought_chain_status(
                                    state.current_tool_chain_id,
                                    "success",
                                    state.reasoning_content[:2000]
                                )
                                await sse_bus.publish(task_id, "thought_chain_update", {
                                    "chain_id": state.current_tool_chain_id,
                                    "status": "success",
                                    "content": state.reasoning_content[:2000]
                                })

                        state.full_response += delta
                        await sse_bus.publish(task_id, "message", {
                            "content": delta,
                            "delta": True,
                            "format": "xmarkdown",
                            "agent": "SessionAgent"
                        })
                        yield {"type": "message_delta", "content": delta}

                # 工具调用参数流式
                elif isinstance(data, ResponseFunctionCallArgumentsDeltaEvent):
                    if state.current_tool_call:
                        state.current_tool_call["arguments"] += data.delta
                        await sse_bus.publish(task_id, "tool_args_delta", {
                            "chain_id": state.current_tool_chain_id,
                            "delta": data.delta
                        })

                elif data.type == "response.output_item.added":
                    if getattr(data.item, "type", None) == "function_call":
                        function_name = getattr(data.item, "name", "unknown")
                        logger.info(f"Function call started: {function_name}")

            elif event.type == "run_item_stream_event":
                if event.item.type == "tool_call_item":
                    tool_name = getattr(event.item.raw_item, 'name', 'unknown')
                    logger.debug(f"Tool called: {tool_name}")
                elif event.item.type == "tool_call_output_item":
                    output = event.item.output
                    logger.debug(f"Tool output: {output[:100]}...")

            await dual_writer.write_task_event(task_id, event.type, {"sequence": event_sequence}, event_sequence)

        # 流结束后处理
        final_text = state.full_response.strip() if state.full_response else "处理完成"

        # 构建 Agent 消息并双写
        message_metadata = {
            "model": agent_config.model,
            "provider": agent_config.provider,
            "tool_calls": state.tool_calls,
        }
        if state.reasoning_content:
            message_metadata["thinking"] = state.reasoning_content[:5000]

        agent_message = AgentMessage(
            message_id=str(uuid.uuid4()),
            session_id=chat_session_id,
            user_id=agent_user_id,
            content=final_text,
            content_type="xmarkdown",
            metadata=message_metadata
        )

        await dual_writer.write_agent_message(agent_message, agent_config.nickname)

        # 更新任务状态
        await task_manager.update_task_status(task_id, TaskStatus.DONE, result=final_text)
        await dual_writer.update_task_status(task_id, "completed", result=final_text)

        # 发送完成事件
        await sse_bus.publish(task_id, "done", {
            "final_text": final_text,
            "metadata": message_metadata
        })

        yield {"type": "done", "result": final_text, "metadata": message_metadata}

    except Exception as e:
        logger.error(f"SessionAgent error: {e}", exc_info=True)

        await task_manager.update_task_status(task_id, TaskStatus.FAILED, error=str(e))
        await dual_writer.update_task_status(task_id, "failed", error=str(e))
        await sse_bus.publish(task_id, "error", {"message": str(e)})

        yield {"type": "error", "error": str(e)}


async def run_session_agent_simple(
    input_text: str,
    task_id: str = "test",
    user_id: str = "test",
    chat_session_id: str = "test_session"
) -> str:
    """简单运行 Agent（非流式，用于测试）"""
    context_messages = await context_manager.get_context(chat_session_id)

    state = StreamState(
        task_id=task_id,
        chat_session_id=chat_session_id,
        agent_user_id=agent_user_service.get_default_agent().user_id
    )

    agent = create_session_agents(state, context_messages, use_approval=False)
    provider = get_default_provider()

    result = await Runner.run(
        agent,
        input=input_text,
        run_config=RunConfig(model_provider=provider)
    )

    return result.final_output


# Agent 配置导出
def get_session_agent_config() -> dict:
    """获取 SessionAgent 配置"""
    default_agent = agent_user_service.get_default_agent()
    return {
        "name": "session_agent",
        "instructions": SESSION_AGENT_SYSTEM_PROMPT,
        "model": default_agent.model,
        "provider": default_agent.provider,
        "tools": ["web_search", "web_open", "web_find", "python_execute", "create_background_task"],
        "user_info": default_agent.to_dict(),
    }
