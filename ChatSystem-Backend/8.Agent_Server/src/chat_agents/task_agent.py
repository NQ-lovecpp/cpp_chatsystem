"""
TaskAgent - 任务执行 Agent（重构版）

由 SessionAgent 或 GlobalAgent 派生，在后台执行复杂任务。
用户不能直接与 TaskAgent 交互。

特点：
1. 只能由其他 Agent 创建，不接受用户直接输入
2. 支持 Todo 进度管理和 ThoughtChain
3. 通过数据库工具获取聊天上下文
4. 流式输出 + 双写持久化
"""
import asyncio
import uuid
from typing import Optional, AsyncIterator, Any, List, Dict
from datetime import datetime
from dataclasses import dataclass
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
from runtime.dual_writer import (
    dual_writer,
    TaskRecord,
    ThoughtChainNode,
    ThoughtChainNodeType,
    TodoItem,
    TodoStatus
)
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
3. **规划步骤**：使用 `add_todos` 创建任务步骤清单
4. **执行任务**：按步骤执行，完成后使用 `update_todo` 更新状态
5. **汇报结果**：总结任务结果

⚠️ 重要规则：收到任务后，**必须在第一步调用 add_todos** 列出 3-6 个执行步骤，
然后每步开始前调用 update_todo(todo_id, "running")，
完成后调用 update_todo(todo_id, "completed")。
这是强制要求，不可跳过！

## 可用工具

### 数据库工具（获取项目数据）
- `get_chat_history(chat_session_id, limit, offset)` - 获取会话的聊天历史
- `get_session_members(chat_session_id)` - 获取会话成员列表
- `get_user_info(user_id)` - 获取用户详细信息
- `search_messages(chat_session_id, keyword)` - 搜索会话中的消息
- `get_user_sessions(user_id)` - 获取用户的会话列表

### 任务管理工具
- `add_todos(texts)` - 添加任务步骤清单
- `update_todo(todo_id, status)` - 更新步骤状态，有效值: idle/running/completed/failed/skipped
- `list_todos()` - 查看当前所有步骤

### 信息检索工具
- `web_search(query)` - 搜索网页信息
- `web_open(url_or_id)` - 打开网页查看详情
- `web_find(pattern)` - 在页面中查找内容

### 代码执行工具
- `python_execute(code)` - 执行 Python 代码（需审批）

## 输出格式
- 使用 Markdown 格式输出
- 支持代码块、列表、表格
- 复杂分析可用 mermaid 图表

## 注意事项
- 必须先调用数据库工具获取需要的上下文信息
- 使用 Todo 工具跟踪进度，让用户了解执行状态
- 回复简洁专业，使用中文

请开始执行任务。
"""


@dataclass 
class TaskStreamState:
    """任务流式处理状态"""
    task_id: str
    user_id: str
    chat_session_id: Optional[str] = None
    
    # 内容累积
    full_response: str = ""
    reasoning_content: str = ""
    
    # ThoughtChain 追踪
    thought_chain_sequence: int = 0
    current_chain_id: Optional[str] = None
    
    # 工具调用追踪
    tool_calls: List[Dict[str, Any]] = None
    current_tool_call: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.tool_calls is None:
            self.tool_calls = []


class TaskAgentHooks(AgentHooks):
    """TaskAgent 生命周期钩子（支持 ThoughtChain）"""
    
    def __init__(self, state: TaskStreamState):
        self.state = state
    
    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        logger.info(f"[{self.state.task_id}] TaskAgent started")
        await sse_bus.publish(self.state.task_id, "task_status", {"status": "running"})
    
    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        logger.info(f"[{self.state.task_id}] TaskAgent ended")
    
    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        logger.info(f"[{self.state.task_id}] Tool {tool.name} starting")
        
        # 创建 ThoughtChain 节点
        chain_id = str(uuid.uuid4())
        self.state.current_chain_id = chain_id
        self.state.thought_chain_sequence += 1
        
        # 对于 Todo 工具，使用不同的图标/标题
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
        
        # 发送 thought_chain SSE 事件
        await sse_bus.publish(self.state.task_id, "thought_chain", {
            "node": node.to_dict()
        })
        
        # 记录当前工具调用
        self.state.current_tool_call = {
            "chain_id": chain_id,
            "tool_name": tool.name,
            "start_time": datetime.now().isoformat(),
            "arguments": ""
        }
        
        # 发送 SSE 事件
        await sse_bus.publish(self.state.task_id, "tool_call", {
            "chain_id": chain_id,
            "tool_name": tool.name,
            "status": "executing",
            "sequence": self.state.thought_chain_sequence
        })
    
    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        logger.info(f"[{self.state.task_id}] Tool {tool.name} completed")
        
        # 更新 ThoughtChain 节点
        if self.state.current_chain_id:
            await dual_writer.update_thought_chain_status(
                self.state.current_chain_id,
                "success",
                result[:2000] if len(result) > 2000 else result
            )
            # 发送 thought_chain_update SSE 事件
            await sse_bus.publish(self.state.task_id, "thought_chain_update", {
                "chain_id": self.state.current_chain_id,
                "status": "success",
                "content": result[:2000] if len(result) > 2000 else result
            })
        
        # 记录工具调用完成
        if self.state.current_tool_call:
            self.state.current_tool_call["result"] = result[:500] if len(result) > 500 else result
            self.state.current_tool_call["end_time"] = datetime.now().isoformat()
            self.state.tool_calls.append(self.state.current_tool_call)
            self.state.current_tool_call = None
        
        # 发送 SSE 事件
        await sse_bus.publish(self.state.task_id, "tool_output", {
            "chain_id": self.state.current_chain_id,
            "tool_name": tool.name,
            "result_preview": result[:300] if len(result) > 300 else result,
            "status": "completed"
        })
        
        self.state.current_chain_id = None


def create_task_agent(state: TaskStreamState) -> Agent:
    """
    创建 TaskAgent 实例
    
    Args:
        state: 任务流式状态
    """
    # 设置工具上下文
    set_tool_context(state.task_id, state.user_id, state.chat_session_id or "")
    
    # TaskAgent 工具集
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
    
    # 构建提示词
    instructions = TASK_AGENT_SYSTEM_PROMPT
    if state.chat_session_id:
        context_hint = f"""

## 当前上下文
- 当前用户 ID: {state.user_id}
- 关联会话 ID: {state.chat_session_id}

如果任务需要了解聊天内容，请使用 `get_chat_history("{state.chat_session_id}")` 获取。
"""
        instructions = TASK_AGENT_SYSTEM_PROMPT + context_hint
    
    return Agent(
        name="TaskAgent",
        instructions=instructions,
        tools=tools,
        hooks=TaskAgentHooks(state),
    )


async def run_task_agent(task: Task, parent_task_id: Optional[str] = None) -> AsyncIterator[dict]:
    """
    运行 TaskAgent（流式）

    TaskAgent 只能由其他 Agent 创建，不接受用户直接交互。
    parent_task_id: 父任务 ID，完成后发送 task_callback 通知父任务
    """
    task_id = task.id
    user_id = task.user_id
    chat_session_id = task.chat_session_id
    
    logger.info(f"Starting TaskAgent for task {task_id}, chat_session_id={chat_session_id}")
    
    # 创建流式状态
    state = TaskStreamState(
        task_id=task_id,
        user_id=user_id,
        chat_session_id=chat_session_id
    )
    
    try:
        # 更新状态
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 记录任务到数据库
        task_record = TaskRecord(
            task_id=task_id,
            user_id=user_id,
            task_type="task",
            status="running",
            chat_session_id=chat_session_id,
            input_text=task.input_text
        )
        await dual_writer.write_task(task_record)
        
        # 发送初始化事件
        await sse_bus.publish(task_id, "init", {
            "task_id": task_id,
            "task_type": "task_agent",
            "chat_session_id": chat_session_id
        })
        
        # 创建 Agent
        agent = create_task_agent(state)
        
        # 运行
        provider = get_default_provider()
        run_config = RunConfig(model_provider=provider)
        result = Runner.run_streamed(
            agent,
            input=task.input_text,
            run_config=run_config
        )
        
        # 追踪 reasoning 状态
        reasoning_started = False
        output_started = False
        event_sequence = 0
        
        async for event in result.stream_events():
            event_sequence += 1
            
            if event.type == "raw_response_event":
                data = event.data
                
                # Reasoning 内容（思考过程）
                if data.type == "response.reasoning_text.delta":
                    delta = data.delta
                    if delta:
                        if not reasoning_started:
                            reasoning_started = True
                            # 创建 ThoughtChain 节点
                            state.thought_chain_sequence += 1
                            chain_id = str(uuid.uuid4())
                            node = ThoughtChainNode(
                                chain_id=chain_id,
                                task_id=task_id,
                                node_type=ThoughtChainNodeType.REASONING.value,
                                title="分析任务...",
                                status="running",
                                sequence=state.thought_chain_sequence
                            )
                            await dual_writer.write_thought_chain_node(node)
                            state.current_chain_id = chain_id
                            
                            # 发送 thought_chain SSE 事件
                            await sse_bus.publish(task_id, "thought_chain", {
                                "node": node.to_dict()
                            })
                        
                        state.reasoning_content += delta
                        await sse_bus.publish(task_id, "reasoning_delta", {
                            "content": delta,
                            "delta": True
                        })
                        yield {"type": "reasoning_delta", "content": delta}
                
                # 输出文本增量
                elif isinstance(data, ResponseTextDeltaEvent):
                    delta = data.delta
                    if delta:
                        if reasoning_started and not output_started:
                            output_started = True
                            # 结束 reasoning 节点
                            if state.current_chain_id:
                                await dual_writer.update_thought_chain_status(
                                    state.current_chain_id,
                                    "success",
                                    state.reasoning_content[:2000]
                                )
                                # 发送 thought_chain_update SSE 事件
                                await sse_bus.publish(task_id, "thought_chain_update", {
                                    "chain_id": state.current_chain_id,
                                    "status": "success",
                                    "content": state.reasoning_content[:2000]
                                })
                        
                        state.full_response += delta
                        await sse_bus.publish(task_id, "message", {
                            "content": delta,
                            "delta": True,
                            "format": "xmarkdown"
                        })
                        yield {"type": "message_delta", "content": delta}
                
                # 工具调用参数流式
                elif isinstance(data, ResponseFunctionCallArgumentsDeltaEvent):
                    if state.current_tool_call:
                        state.current_tool_call["arguments"] += data.delta
                        await sse_bus.publish(task_id, "tool_args_delta", {
                            "chain_id": state.current_chain_id,
                            "delta": data.delta
                        })
            
            elif event.type == "run_item_stream_event":
                if event.item.type == "tool_call_item":
                    tool_name = getattr(event.item.raw_item, 'name', 'unknown')
                    logger.debug(f"Tool call: {tool_name}")
                elif event.item.type == "tool_call_output_item":
                    logger.debug(f"Tool output received")
            
            # 持久化重要事件
            if event.type in ["raw_response_event"]:
                await dual_writer.write_task_event(task_id, event.type, {"sequence": event_sequence}, event_sequence)
        
        # 任务完成
        final_text = state.full_response.strip() if state.full_response else "任务完成"
        
        # 创建结果 ThoughtChain 节点
        state.thought_chain_sequence += 1
        result_node = ThoughtChainNode(
            chain_id=str(uuid.uuid4()),
            task_id=task_id,
            node_type=ThoughtChainNodeType.RESULT.value,
            title="任务完成",
            description=final_text[:200] if len(final_text) > 200 else final_text,
            content=final_text,
            status="success",
            sequence=state.thought_chain_sequence
        )
        await dual_writer.write_thought_chain_node(result_node)
        
        # 更新任务状态
        await task_manager.update_task_status(task_id, TaskStatus.DONE, result=final_text)
        await dual_writer.update_task_status(task_id, "completed", result=final_text)

        # 发送完成事件
        await sse_bus.publish(task_id, "done", {
            "final_text": final_text,
            "tool_calls": state.tool_calls,
            "thought_chain_count": state.thought_chain_sequence
        })

        # 通知父任务（SessionAgent）后台任务已完成
        if parent_task_id:
            await sse_bus.publish(parent_task_id, "task_callback", {
                "task_id": task_id,
                "status": "completed",
                "result": final_text[:500],
                "todos_count": state.thought_chain_sequence,
            })
        
        # 清理 Todo 缓存
        _clear_task_todos(task_id)
        
        yield {"type": "done", "result": final_text}
        
    except Exception as e:
        logger.error(f"TaskAgent error: {e}", exc_info=True)
        
        # 创建错误 ThoughtChain 节点
        state.thought_chain_sequence += 1
        error_node = ThoughtChainNode(
            chain_id=str(uuid.uuid4()),
            task_id=task_id,
            node_type=ThoughtChainNodeType.ERROR.value,
            title="任务失败",
            description=str(e),
            status="error",
            sequence=state.thought_chain_sequence
        )
        await dual_writer.write_thought_chain_node(error_node)
        
        await task_manager.update_task_status(task_id, TaskStatus.FAILED, error=str(e))
        await dual_writer.update_task_status(task_id, "failed", error=str(e))
        
        await sse_bus.publish(task_id, "error", {"message": str(e)})
        
        _clear_task_todos(task_id)
        
        yield {"type": "error", "error": str(e)}


# 导出配置
def get_task_agent_config() -> dict:
    """获取 TaskAgent 配置"""
    return {
        "name": "task_agent",
        "instructions": TASK_AGENT_SYSTEM_PROMPT,
        "model": settings.openrouter_model,
        "tools": [
            "get_chat_history", "get_session_members", "get_user_info",
            "search_messages", "get_user_sessions",
            "add_todos", "update_todo", "list_todos",
            "web_search", "web_open", "web_find", 
            "python_execute"
        ]
    }
