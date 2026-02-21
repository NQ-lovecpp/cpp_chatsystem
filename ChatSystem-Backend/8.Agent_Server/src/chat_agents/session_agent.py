"""
SessionAgent - 会话 Agent（简化版）

作为聊天会话中的一个实际用户存在：
1. 通过 @mention 触发（由 C++ 网关 webhook 路由到此）
2. 从 MySQL 读取最近 30 条消息作为上下文
3. 思考、工具调用、最终输出全部累积为结构化 xmarkdown
4. 通过 session 级 SSE 频道流式推送给前端
5. 完成后整条 xmarkdown 存入 message 表
"""
import uuid
import json
import re
from typing import Optional, AsyncIterator, Any, List, Dict
from datetime import datetime
from dataclasses import dataclass
from loguru import logger

from agents import (
    Agent,
    Runner,
    RunConfig,
    ModelSettings,
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
from runtime.content_builder import ContentBuilder
from runtime.dual_writer import dual_writer, AgentMessage
from providers import get_default_provider
from services.agent_user_service import agent_user_service
from tools.sdk_tools import (
    web_search, web_open, web_find,
    python_execute, python_execute_with_approval,
    set_tool_context,
)
from tools.db_tools import (
    get_chat_history,
    get_session_members,
    get_user_info,
    search_messages,
    get_user_sessions,
)
from chat_agents.research_agent import run_deep_research, get_active_tasks
from tools.sdk_tools import current_task_id, current_user_id, current_chat_session_id


# SessionAgent 系统提示词
SESSION_AGENT_SYSTEM_PROMPT = """你是聊天会话中的 AI 助手成员。你直接参与对话，像其他群成员一样交流。

## 你的身份
- 你是这个聊天会话的成员之一
- 用户通过 @你的名字 来请求你的帮助
- 你可以看到聊天历史，理解对话上下文

## 你的能力
1. **直接回答**：根据聊天上下文回答问题
2. **搜索信息**：使用网页搜索获取最新信息
3. **执行代码**：执行 Python 代码（需要审批）
4. **查询数据**：获取聊天历史、会话成员、用户信息等
5. **深度研究**：当用户需要深入研究某个主题时，使用 create_deep_research 工具。先向用户确认研究范围和侧重点，收集充足信息后再创建研究任务。研究会在后台执行，完成后自动发送报告。

## 搜索任务流程
搜索类任务完整流程：web_search(获取结果) → web_open(用链接ID如0打开) → web_find(在页面查找) → 综合后回复。
切勿在 web_open 或 web_find 之前就结束。

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

_THINK_BLOCK_RE = re.compile(r"<think(?:\s+[^>]*)?>[\s\S]*?</think>", re.IGNORECASE)
_TOOL_CALL_RE = re.compile(
    r"<tool-call\s+name=\"([^\"]*)\"(?:\s+arguments='([^']*)')?\s*>[\s\S]*?</tool-call>",
    re.IGNORECASE,
)
_TOOL_RESULT_RE = re.compile(
    r"<tool-result\s+name=\"([^\"]*)\"(?:\s+status=\"([^\"]*)\")?\s*>([\s\S]*?)</tool-result>",
    re.IGNORECASE,
)


def _summarize_context_content(content: str, max_len: int = 420) -> str:
    """将 xmarkdown 文本压缩成适合注入提示词的上下文摘要。"""
    if not content:
        return ""

    tool_calls = []
    for match in _TOOL_CALL_RE.finditer(content):
        tool_name = (match.group(1) or "").strip()
        args = (match.group(2) or "").strip()
        if not tool_name:
            continue
        if args:
            args_preview = re.sub(r"\s+", " ", args)[:80]
            tool_calls.append(f"{tool_name}({args_preview})")
        else:
            tool_calls.append(tool_name)

    tool_results = []
    for match in _TOOL_RESULT_RE.finditer(content):
        tool_name = (match.group(1) or "").strip() or "tool"
        status = (match.group(2) or "success").strip()
        result_text = re.sub(r"\s+", " ", (match.group(3) or "")).strip()
        if result_text:
            tool_results.append(f"{tool_name}/{status}: {result_text[:120]}")
        else:
            tool_results.append(f"{tool_name}/{status}")

    plain_text = _THINK_BLOCK_RE.sub(" ", content)
    plain_text = _TOOL_CALL_RE.sub(" ", plain_text)
    plain_text = _TOOL_RESULT_RE.sub(" ", plain_text)
    plain_text = re.sub(r"\s+", " ", plain_text).strip()

    chunks = []
    if plain_text:
        chunks.append(plain_text)
    if tool_calls:
        chunks.append("工具调用: " + ", ".join(tool_calls))
    if tool_results:
        chunks.append("工具结果: " + " | ".join(tool_results))

    summary = "；".join(chunks).strip() or "[空消息]"
    return summary[:max_len]


@dataclass
class StreamState:
    """流式处理状态"""
    stream_id: str
    chat_session_id: str
    agent_user_id: str
    message_id: str  # 此次 agent 回复的 message_id

    # 内容构建器
    content_builder: ContentBuilder = None

    # Reasoning 追踪
    reasoning_active: bool = False

    # 工具调用追踪
    tool_calls: List[Dict[str, Any]] = None
    current_tool_name: Optional[str] = None
    current_tool_args: str = ""

    def __post_init__(self):
        if self.content_builder is None:
            self.content_builder = ContentBuilder()
        if self.tool_calls is None:
            self.tool_calls = []


class SessionAgentHooks(AgentHooks):
    """SessionAgent 生命周期钩子 — 驱动 ContentBuilder + 会话级 SSE"""

    def __init__(self, state: StreamState):
        self.state = state

    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        logger.info(f"[{self.state.stream_id}] SessionAgent started in session {self.state.chat_session_id}")

    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        logger.info(f"[{self.state.stream_id}] SessionAgent ended")

    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        logger.info(f"[{self.state.stream_id}] Tool {tool.name} started")

        # 关闭当前 reasoning（think → tool_call 边界）
        if self.state.reasoning_active:
            self.state.reasoning_active = False

        self.state.current_tool_name = tool.name
        self.state.current_tool_args = ""

        # 发送 tool_call 开始标签
        delta = self.state.content_builder.start_tool_call(tool.name, "")
        session_channel = f"session:{self.state.chat_session_id}"
        await sse_bus.publish(session_channel, "content_delta", {
            "message_id": self.state.message_id,
            "delta": delta,
            "part_type": "tool_call",
        })

    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        logger.info(f"[{self.state.stream_id}] Tool {tool.name} ended")

        # 关闭 tool-call 标签
        close_delta = self.state.content_builder.end_tool_call()

        # 添加 tool-result
        result_delta = self.state.content_builder.add_tool_result(
            tool.name,
            result,
            "success"
        )

        session_channel = f"session:{self.state.chat_session_id}"
        await sse_bus.publish(session_channel, "content_delta", {
            "message_id": self.state.message_id,
            "delta": close_delta + "\n" + result_delta,
            "part_type": "tool_result",
        })

        # 记录工具调用
        self.state.tool_calls.append({
            "tool_name": tool.name,
            "arguments": self.state.current_tool_args,
            "result": result[:500] if len(result) > 500 else result,
        })
        self.state.current_tool_name = None
        self.state.current_tool_args = ""


import asyncio as _asyncio
from typing import Annotated


@function_tool
async def create_deep_research(
    topic: Annotated[str, "研究主题，应当是一段清晰描述研究目标的文字"],
    context: Annotated[str, "已经从用户处搜集到的补充信息（研究范围、侧重点等）"] = "",
) -> str:
    """
    创建深度研究后台任务。使用前应先在聊天中向用户确认研究主题和侧重点。
    任务创建后将在后台自动执行：制定搜索计划 → 并行搜索 → 撰写报告。
    用户可在右侧边栏查看进度，完成后报告会自动发送到聊天中。
    """
    task_id = f"research_{uuid.uuid4().hex[:8]}"
    chat_session_id = current_chat_session_id.get()
    agent_user_id = current_user_id.get()

    _asyncio.create_task(
        run_deep_research(task_id, topic, chat_session_id, agent_user_id, context)
    )

    return (
        f"已创建深度研究任务（ID: {task_id}）。\n"
        f"研究主题: {topic}\n"
        f"你可以在右侧边栏「后台任务」中查看实时进度。研究完成后，报告将自动发送到聊天中。"
    )


def create_session_agent(
    state: StreamState,
    context_messages: List[ContextMessage],
    use_approval: bool = True,
    model_name: Optional[str] = None
) -> Agent:
    """创建 SessionAgent"""
    set_tool_context(state.stream_id, state.agent_user_id, state.chat_session_id)

    instructions = SESSION_AGENT_SYSTEM_PROMPT
    if state.chat_session_id:
        instructions += f"\n\n## 当前会话\n- 会话 ID: `{state.chat_session_id}`\n- 调用 get_chat_history、get_session_members、search_messages 时请使用此 ID（或留空/填 current 以使用自动上下文）。"
    if context_messages:
        history_text = "\n## 近期聊天记录\n"
        for msg in context_messages[-30:]:
            sender = msg.nickname
            content = _summarize_context_content(msg.content, max_len=420)
            if content:
                prefix = "[AI]" if msg.is_agent else ""
                history_text += f"- {prefix}{sender}: {content}\n"
        instructions += history_text

    python_tool = python_execute

    session_agent = Agent(
        name="SessionAgent",
        instructions=instructions,
        model=model_name,
        tools=[
            web_search, web_open, web_find, python_tool,
            get_chat_history, get_session_members, get_user_info, search_messages,
            create_deep_research,
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
    """运行会话 Agent（流式），发布事件到 session 级 SSE 频道"""
    stream_id = stream.id
    chat_session_id = stream.chat_session_id

    if not agent_user_id:
        default_agent = agent_user_service.get_default_agent()
        agent_user_id = default_agent.user_id

    agent_config = await agent_user_service.get_agent_user(agent_user_id)
    if not agent_config:
        agent_config = agent_user_service.get_default_agent()

    logger.info(f"Starting SessionAgent for stream {stream_id}, session={chat_session_id}")
    logger.info(
        f"SessionAgent model selected from agent profile: "
        f"agent={agent_user_id}, provider={agent_config.provider}, model={agent_config.model}"
    )

    message_id = str(uuid.uuid4())
    state = StreamState(
        stream_id=stream_id,
        chat_session_id=chat_session_id,
        agent_user_id=agent_user_id,
        message_id=message_id,
    )

    session_channel = f"session:{chat_session_id}"

    try:
        # 发布 agent_start 事件
        await sse_bus.publish(session_channel, "agent_start", {
            "stream_id": stream_id,
            "message_id": message_id,
            "chat_session_id": chat_session_id,
            "agent_user_id": agent_user_id,
            "agent_nickname": agent_config.nickname,
        })

        # 加载上下文（30 条）
        context_messages = await context_manager.get_context(chat_session_id, limit=30)
        logger.info(f"Loaded {len(context_messages)} context messages for session {chat_session_id}")

        # 以数据库中的 agent_model 为准，避免落到环境默认模型
        session_agent = create_session_agent(
            state,
            context_messages,
            use_approval=use_approval,
            model_name=agent_config.model,
        )

        provider = agent_user_service.get_provider_for_agent(agent_user_id)
        run_config = RunConfig(
            model_provider=provider,
            model_settings=ModelSettings(max_tokens=16384),
        )
        result = Runner.run_streamed(
            session_agent,
            input=stream.input_text,
            run_config=run_config
        )

        output_started = False

        async for event in result.stream_events():
            if event.type == "raw_response_event":
                data = event.data

                # ---- Reasoning delta ----
                if data.type == "response.reasoning_text.delta":
                    # logger.info(f"get reasoning text delta: {data.delta}")
                    delta_text = data.delta
                    if delta_text:
                        if not state.reasoning_active:
                            state.reasoning_active = True

                        sse_delta = state.content_builder.add_thinking(delta_text)
                        await sse_bus.publish(session_channel, "content_delta", {
                            "message_id": message_id,
                            "delta": sse_delta,
                            "part_type": "think",
                        })
                        yield {"type": "reasoning_delta", "content": delta_text}

                # ---- Reasoning summary (ignored for content) ----
                elif data.type == "response.reasoning_summary_text.delta":
                    # logger.info(f"get reasoning summary delta: {data.delta}")
                    pass

                # ---- Text output delta ----
                elif isinstance(data, ResponseTextDeltaEvent):
                    delta_text = data.delta
                    if delta_text:
                        if not output_started:
                            output_started = True
                            state.reasoning_active = False

                        sse_delta = state.content_builder.add_text(delta_text)
                        await sse_bus.publish(session_channel, "content_delta", {
                            "message_id": message_id,
                            "delta": sse_delta,
                            "part_type": "text",
                        })
                        yield {"type": "message_delta", "content": delta_text}

                # ---- Tool argument delta ----
                elif isinstance(data, ResponseFunctionCallArgumentsDeltaEvent):
                    if state.current_tool_name:
                        state.current_tool_args += data.delta
                        state.content_builder.append_tool_args(data.delta)
                        await sse_bus.publish(session_channel, "content_delta", {
                            "message_id": message_id,
                            "delta": data.delta,
                            "part_type": "tool_args",
                        })

        # ---- 流结束：持久化 ----
        full_content = state.content_builder.to_string()
        final_text = state.content_builder.get_full_text_only() or "处理完成"

        agent_message = AgentMessage(
            message_id=message_id,
            session_id=chat_session_id,
            user_id=agent_user_id,
            content=full_content,
            content_type="xmarkdown",
            metadata={
                "model": agent_config.model,
                "provider": agent_config.provider,
                "tool_calls": state.tool_calls,
                "stream_id": stream_id,
            }
        )

        # 确保持久化完成后再发 agent_done，避免前端补偿拉取时读不到该消息
        await dual_writer.write_agent_message(
            agent_message,
            agent_config.nickname,
            wait_mysql=True
        )

        await sse_bus.publish(session_channel, "agent_done", {
            "message_id": message_id,
            "stream_id": stream_id,
            "chat_session_id": chat_session_id,
            "agent_user_id": agent_user_id,
            "final_content": full_content,
        })

        yield {"type": "done", "result": final_text}

    except Exception as e:
        logger.error(f"SessionAgent error: {e}", exc_info=True)
        await sse_bus.publish(session_channel, "agent_error", {
            "message_id": message_id,
            "error": str(e),
        })
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
        agent_user_id=agent_user_service.get_default_agent().user_id,
        message_id=str(uuid.uuid4()),
    )

    agent = create_session_agent(state, context_messages, use_approval=False)
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
            "get_chat_history", "get_session_members", "get_user_info", "search_messages",
        ],
        "user_info": default_agent.to_dict(),
    }
