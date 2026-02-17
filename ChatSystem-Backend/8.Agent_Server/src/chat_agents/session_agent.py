"""
SessionAgent - 会话 Agent

作为聊天会话中的一个实际用户存在，特点：
1. 作为会话成员：在 user 表中有记录，可被添加到群聊
2. 上下文管理：从 Redis 缓存/MySQL 获取聊天上下文
3. 按钮触发机制：用户通过 @AI助手 按钮触发
4. 双写机制：消息同时写入 Redis 和 MySQL
5. 流式输出：支持 reasoning、tool_calls、ThoughtChain
"""
import uuid
import json
from typing import Optional, AsyncIterator, Any, List, Dict
from datetime import datetime
from dataclasses import dataclass
from loguru import logger

from agents import (
    Agent,
    Runner,
    RunConfig,
    AgentHooks,
    AgentHookContext,
    RunContextWrapper,
    Tool,
    function_tool,
)
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
from runtime import sse_bus, stream_registry, AgentStream
from runtime.context_manager import context_manager, ContextMessage
from runtime.dual_writer import (
    dual_writer,
    AgentMessage,
    ThoughtChainNode,
    ThoughtChainNodeType,
)
from providers import get_default_provider
from services.agent_user_service import agent_user_service
from tools.sdk_tools import (
    web_search, web_open, web_find,
    python_execute, python_execute_with_approval,
    set_tool_context,
    add_todos, update_todo, list_todos,
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
2. **规划步骤**：复杂任务先用 `add_todos` 列出执行步骤，然后逐步完成并用 `update_todo` 更新状态
3. **搜索信息**：使用网页搜索获取最新信息
4. **执行代码**：执行 Python 代码（需要审批）
5. **查询数据**：获取聊天历史、会话成员、用户信息等

## 使用 Todo 规划复杂任务
当任务需要多个步骤时（如研究报告、数据分析、多信息源综合）：
1. 首先调用 `add_todos` 列出 3-6 个步骤
2. 执行每个步骤
3. 用 `update_todo` 标记步骤完成

## 输出格式
- 使用 Markdown 格式输出
- 支持代码块、列表、表格
- 复杂图表可用 mermaid 代码块

## 回复风格
- 简洁友好，像朋友聊天
- 使用中文回复（除非用户使用其他语言）
- 根据上下文自然回应

请自然地参与对话！
"""


@dataclass
class StreamState:
    """流式处理状态"""
    stream_id: str
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

    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        logger.info(f"[{self.state.stream_id}] SessionAgent started in session {self.state.chat_session_id}")

    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        logger.info(f"[{self.state.stream_id}] SessionAgent ended")

    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        logger.info(f"[{self.state.stream_id}] Tool {tool.name} started")

        chain_id = str(uuid.uuid4())
        self.state.current_tool_chain_id = chain_id
        self.state.thought_chain_sequence += 1

        node = ThoughtChainNode(
            chain_id=chain_id,
            task_id=self.state.stream_id,
            node_type=ThoughtChainNodeType.TOOL_CALL.value,
            title=f"调用工具: {tool.name}",
            description=f"正在执行 {tool.name}",
            status="running",
            sequence=self.state.thought_chain_sequence
        )
        await dual_writer.write_thought_chain_node(node)

        await sse_bus.publish(self.state.stream_id, "thought_chain", {
            "node": node.to_dict()
        })

        self.state.current_tool_call = {
            "chain_id": chain_id,
            "tool_name": tool.name,
            "start_time": datetime.now().isoformat(),
            "arguments": ""
        }

        await sse_bus.publish(self.state.stream_id, "tool_call", {
            "chain_id": chain_id,
            "tool_name": tool.name,
            "status": "executing"
        })

    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        logger.info(f"[{self.state.stream_id}] Tool {tool.name} ended")

        if self.state.current_tool_chain_id:
            await dual_writer.update_thought_chain_status(
                self.state.current_tool_chain_id,
                "success",
                result[:2000] if len(result) > 2000 else result
            )
            await sse_bus.publish(self.state.stream_id, "thought_chain_update", {
                "chain_id": self.state.current_tool_chain_id,
                "status": "success",
                "content": result[:2000] if len(result) > 2000 else result
            })

        if self.state.current_tool_call:
            self.state.current_tool_call["result"] = result[:500] if len(result) > 500 else result
            self.state.current_tool_call["end_time"] = datetime.now().isoformat()
            self.state.tool_calls.append(self.state.current_tool_call)
            self.state.current_tool_call = None

        await sse_bus.publish(self.state.stream_id, "tool_output", {
            "chain_id": self.state.current_tool_chain_id,
            "tool_name": tool.name,
            "result_preview": result[:500] if len(result) > 500 else result,
            "status": "completed"
        })

        self.state.current_tool_chain_id = None


def create_session_agents(
    state: StreamState,
    context_messages: List[ContextMessage],
    use_approval: bool = True
) -> Agent:
    """创建 SessionAgent"""
    set_tool_context(state.stream_id, state.agent_user_id, state.chat_session_id)

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
        tools=[
            web_search, web_open, web_find, python_tool,
            add_todos, update_todo, list_todos,
            get_chat_history, get_session_members, get_user_info, search_messages,
        ],
        hooks=SessionAgentHooks(state),
    )

    return session_agent


async def run_session_agent(
    stream: AgentStream,
    agent_user_id: Optional[str] = None,
    use_approval: bool = True,
    chat_history: Optional[list] = None
) -> AsyncIterator[dict]:
    """运行会话 Agent（流式）"""
    stream_id = stream.id
    user_id = stream.user_id
    chat_session_id = stream.chat_session_id

    if not agent_user_id:
        default_agent = agent_user_service.get_default_agent()
        agent_user_id = default_agent.user_id

    agent_config = await agent_user_service.get_agent_user(agent_user_id)
    if not agent_config:
        agent_config = agent_user_service.get_default_agent()

    logger.info(f"Starting SessionAgent for stream {stream_id}, session={chat_session_id}")

    state = StreamState(
        stream_id=stream_id,
        chat_session_id=chat_session_id,
        agent_user_id=agent_user_id
    )

    try:
        await sse_bus.publish(stream_id, "init", {
            "stream_id": stream_id,
            "stream_type": "session_agent",
            "chat_session_id": chat_session_id,
            "agent_user_id": agent_user_id,
            "agent_nickname": agent_config.nickname
        })

        context_messages = await context_manager.get_context(chat_session_id)
        logger.info(f"Loaded {len(context_messages)} context messages for session {chat_session_id}")

        session_agent = create_session_agents(state, context_messages, use_approval=use_approval)

        provider = agent_user_service.get_provider_for_agent(agent_user_id)
        run_config = RunConfig(model_provider=provider)
        result = Runner.run_streamed(
            session_agent,
            input=stream.input_text,
            run_config=run_config
        )

        reasoning_started = False
        output_started = False

        async for event in result.stream_events():
            if event.type == "raw_response_event":
                data = event.data

                if data.type == "response.reasoning_text.delta":
                    delta = data.delta
                    if delta:
                        if not reasoning_started:
                            reasoning_started = True
                            state.thought_chain_sequence += 1
                            chain_id = str(uuid.uuid4())
                            node = ThoughtChainNode(
                                chain_id=chain_id,
                                task_id=stream_id,
                                node_type=ThoughtChainNodeType.REASONING.value,
                                title="思考中...",
                                status="running",
                                sequence=state.thought_chain_sequence
                            )
                            await dual_writer.write_thought_chain_node(node)
                            state.current_tool_chain_id = chain_id

                            await sse_bus.publish(stream_id, "thought_chain", {
                                "node": node.to_dict()
                            })

                        state.reasoning_content += delta
                        await sse_bus.publish(stream_id, "reasoning_delta", {
                            "content": delta,
                            "delta": True
                        })
                        yield {"type": "reasoning_delta", "content": delta}

                elif data.type == "response.reasoning_summary_text.delta":
                    delta = data.delta
                    if delta:
                        await sse_bus.publish(stream_id, "reasoning_summary", {
                            "content": delta,
                            "delta": True
                        })

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
                                await sse_bus.publish(stream_id, "thought_chain_update", {
                                    "chain_id": state.current_tool_chain_id,
                                    "status": "success",
                                    "content": state.reasoning_content[:2000]
                                })

                        state.full_response += delta
                        await sse_bus.publish(stream_id, "message", {
                            "content": delta,
                            "delta": True,
                            "format": "xmarkdown",
                            "agent": "SessionAgent"
                        })
                        yield {"type": "message_delta", "content": delta}

                elif isinstance(data, ResponseFunctionCallArgumentsDeltaEvent):
                    if state.current_tool_call:
                        state.current_tool_call["arguments"] += data.delta
                        await sse_bus.publish(stream_id, "tool_args_delta", {
                            "chain_id": state.current_tool_chain_id,
                            "delta": data.delta
                        })

        # 流结束后处理
        final_text = state.full_response.strip() if state.full_response else "处理完成"

        message_metadata = {
            "model": agent_config.model,
            "provider": agent_config.provider,
            "tool_calls": state.tool_calls,
            "stream_id": stream_id,  # 关键：供前端点击「正在思考 >」时查询
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

        await sse_bus.publish(stream_id, "done", {
            "final_text": final_text,
            "metadata": message_metadata
        })

        yield {"type": "done", "result": final_text, "metadata": message_metadata}

    except Exception as e:
        logger.error(f"SessionAgent error: {e}", exc_info=True)
        await sse_bus.publish(stream_id, "error", {"message": str(e)})
        yield {"type": "error", "error": str(e)}


async def run_session_agent_simple(
    input_text: str,
    stream_id: str = "test",
    user_id: str = "test",
    chat_session_id: str = "test_session"
) -> str:
    """简单运行 Agent（非流式，用于测试）"""
    context_messages = await context_manager.get_context(chat_session_id)

    state = StreamState(
        stream_id=stream_id,
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


def get_session_agent_config() -> dict:
    """获取 SessionAgent 配置"""
    default_agent = agent_user_service.get_default_agent()
    return {
        "name": "session_agent",
        "instructions": SESSION_AGENT_SYSTEM_PROMPT,
        "model": default_agent.model,
        "provider": default_agent.provider,
        "tools": [
            "web_search", "web_open", "web_find", "python_execute",
            "add_todos", "update_todo", "list_todos",
            "get_chat_history", "get_session_members", "get_user_info", "search_messages",
        ],
        "user_info": default_agent.to_dict(),
    }
