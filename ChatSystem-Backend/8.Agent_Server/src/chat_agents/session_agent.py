"""
SessionAgent - 会话 Agent（Handoff 版）

作为聊天会话中的一个实际用户存在，特点：
1. 作为会话成员：在 user 表中有记录，可被添加到群聊
2. 上下文管理：从 Redis 缓存/MySQL 获取聊天上下文
3. @ 触发机制：用户通过 @agent 触发
4. 双写机制：消息同时写入 Redis 和 MySQL
5. 流式输出：支持 reasoning、tool_calls、ThoughtChain
6. Handoff：复杂任务 handoff 给 TaskAgent，完成后交回
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
    handoff,
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
    set_tool_context
)
from tools.todo_tools import add_todos, update_todo, list_todos
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
- 用户通过 @你 来请求你的帮助
- 你可以看到聊天历史，理解对话上下文

## 你的能力
1. **直接回答**：根据聊天上下文回答问题
2. **执行复杂任务**：当需要多步骤工作时（搜索+分析+总结、数据处理等），直接转交给 TaskAgent 执行
3. **搜索信息**：使用网页搜索获取最新信息
4. **执行代码**：执行 Python 代码（需要审批）

## 输出格式
- 使用 Markdown 格式输出
- 支持代码块、列表、表格
- 复杂图表可用 mermaid 代码块

## 何时转交 TaskAgent
当请求涉及以下情况时，应 handoff 给 TaskAgent：
- 需要多步骤处理（如研究报告、数据分析）
- 需要搜索多个信息源并综合分析
- 需要创建任务步骤清单并逐步执行
- 用户明确要求后台执行

## 回复风格
- 简洁友好，像朋友聊天
- 使用中文回复（除非用户使用其他语言）
- 根据上下文自然回应

请自然地参与对话！
"""


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
3. **规划步骤**：使用 `add_todos` 创建任务步骤清单
4. **执行任务**：按步骤执行，完成后使用 `update_todo` 更新状态
5. **交回结果**：任务完成后，handoff 回 SessionAgent 让它给出最终回复

## 可用工具

### 数据库工具（获取项目数据）
- `get_chat_history(chat_session_id, limit, offset)` - 获取会话的聊天历史
- `get_session_members(chat_session_id)` - 获取会话成员列表
- `get_user_info(user_id)` - 获取用户详细信息
- `search_messages(chat_session_id, keyword)` - 搜索会话中的消息
- `get_user_sessions(user_id)` - 获取用户的会话列表

### 任务管理工具
- `add_todos(texts)` - 添加任务步骤清单
- `update_todo(todo_id, status)` - 更新步骤状态 (running/completed/failed/skipped)
- `list_todos()` - 查看当前所有步骤

### 信息检索工具
- `web_search(query)` - 搜索网页信息
- `web_open(url_or_id)` - 打开网页查看详情
- `web_find(pattern)` - 在页面中查找内容

### 代码执行工具
- `python_execute(code)` - 执行 Python 代码（需审批）

## 注意事项
- 使用 Todo 工具跟踪进度，让用户了解执行状态
- 任务完成后务必 handoff 回 SessionAgent
- 回复简洁专业，使用中文
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

    # 当前 agent 追踪
    current_agent: str = "SessionAgent"

    # TaskAgent 输出（侧边栏显示）
    task_agent_output: str = ""

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
        logger.info(f"[{self.state.task_id}] Tool {tool.name} started (agent: {self.state.current_agent})")

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


class TaskAgentHooks(AgentHooks):
    """TaskAgent 生命周期钩子（在 handoff 模式下复用 StreamState）"""

    def __init__(self, state: StreamState):
        self.state = state

    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        logger.info(f"[{self.state.task_id}] TaskAgent started (handoff)")

    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        logger.info(f"[{self.state.task_id}] TaskAgent ended (handoff)")

    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        logger.info(f"[{self.state.task_id}] TaskAgent tool {tool.name} starting")

        chain_id = str(uuid.uuid4())
        self.state.current_tool_chain_id = chain_id
        self.state.thought_chain_sequence += 1

        if tool.name in ['add_todos', 'update_todo', 'list_todos']:
            title = f"任务管理: {tool.name}"
        else:
            title = f"调用工具: {tool.name}"

        node = ThoughtChainNode(
            chain_id=chain_id,
            task_id=self.state.task_id,
            node_type=ThoughtChainNodeType.TOOL_CALL.value,
            title=title,
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
            "status": "executing",
            "sequence": self.state.thought_chain_sequence
        })

    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        logger.info(f"[{self.state.task_id}] TaskAgent tool {tool.name} completed")

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
            "result_preview": result[:300] if len(result) > 300 else result,
            "status": "completed"
        })

        self.state.current_tool_chain_id = None


def create_session_agents(
    state: StreamState,
    context_messages: List[ContextMessage],
    use_approval: bool = True
) -> Agent:
    """
    创建 SessionAgent + TaskAgent（带双向 handoff）

    返回 session_agent（入口 agent）
    """
    set_tool_context(state.task_id, state.agent_user_id)

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

    # TaskAgent 提示词补充上下文
    task_instructions = TASK_AGENT_SYSTEM_PROMPT
    if state.chat_session_id:
        task_instructions += f"""

## 当前上下文
- 当前用户 ID: {state.agent_user_id}
- 关联会话 ID: {state.chat_session_id}

如果任务需要了解聊天内容，请使用 `get_chat_history("{state.chat_session_id}")` 获取。
"""

    python_tool = python_execute_with_approval if use_approval else python_execute

    # 创建 TaskAgent
    task_agent = Agent(
        name="TaskAgent",
        instructions=task_instructions,
        tools=[
            get_chat_history, get_session_members, get_user_info,
            search_messages, get_user_sessions,
            add_todos, update_todo, list_todos,
            web_search, web_open, web_find,
            python_tool,
        ],
        hooks=TaskAgentHooks(state),
    )

    # 创建 SessionAgent（带 handoff 到 TaskAgent）
    session_agent = Agent(
        name="SessionAgent",
        instructions=instructions,
        tools=[web_search, web_open, web_find, python_tool],
        handoffs=[
            handoff(
                agent=task_agent,
                tool_name_override="delegate_to_task_agent",
                tool_description_override="将复杂的多步骤任务转交给 TaskAgent 执行。TaskAgent 会创建任务清单、搜索信息、执行代码等。适用于需要较长时间处理的请求。"
            )
        ],
        hooks=SessionAgentHooks(state),
    )

    # TaskAgent 完成后 handoff 回 SessionAgent
    task_agent.handoffs = [
        handoff(
            agent=session_agent,
            tool_name_override="return_to_session_agent",
            tool_description_override="任务执行完毕后，将结果交回 SessionAgent 进行最终回复。当所有步骤完成、结果已整理好时调用。"
        )
    ]

    return session_agent


async def run_session_agent(
    task: Task,
    agent_user_id: Optional[str] = None,
    use_approval: bool = True,
    chat_history: Optional[list] = None
) -> AsyncIterator[dict]:
    """
    运行会话 Agent（流式，带 Handoff）

    同一 SSE 流中：
    - 当 current_agent=SessionAgent 时，message 事件渲染到聊天
    - 当 current_agent=TaskAgent 时，message 事件渲染到右侧边栏
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

    logger.info(f"Starting SessionAgent (handoff mode) for task {task_id}, session={chat_session_id}")

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

        # 创建 agent 组（带 handoff）
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

            # Agent 切换事件
            if event.type == "agent_updated_stream_event":
                new_agent_name = event.new_agent.name
                old_agent = state.current_agent
                state.current_agent = new_agent_name

                # 切到 TaskAgent 时重置输出状态
                if new_agent_name == "TaskAgent":
                    reasoning_started = False
                    output_started = False
                    state.task_agent_output = ""
                elif new_agent_name == "SessionAgent" and old_agent == "TaskAgent":
                    reasoning_started = False
                    output_started = False

                logger.info(f"[{task_id}] Agent switch: {old_agent} -> {new_agent_name}")

                await sse_bus.publish(task_id, "agent_switch", {
                    "agent": new_agent_name,
                    "previous": old_agent
                })
                continue

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
                                title="思考中..." if state.current_agent == "SessionAgent" else "分析任务...",
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

                        if state.current_agent == "TaskAgent":
                            state.task_agent_output += delta
                            await sse_bus.publish(task_id, "message", {
                                "content": delta,
                                "delta": True,
                                "format": "xmarkdown",
                                "agent": "TaskAgent"
                            })
                        else:
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

        # 构建 Agent 消息并双写（只写 SessionAgent 的输出到聊天）
        message_metadata = {
            "model": agent_config.model,
            "provider": agent_config.provider,
            "tool_calls": state.tool_calls,
        }
        if state.reasoning_content:
            message_metadata["thinking"] = state.reasoning_content[:5000]
        if state.task_agent_output:
            message_metadata["task_agent_output"] = state.task_agent_output[:5000]

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
        "tools": ["web_search", "web_open", "web_find", "python_execute"],
        "handoffs": ["TaskAgent"],
        "user_info": default_agent.to_dict(),
    }
