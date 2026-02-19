"""
GlobalAgent - 用户个人的全局 Agent（重构版）

从左侧边栏打开，独立于聊天会话。
支持多会话管理和持久化。

特点：
1. 用户专属：每个用户有自己的 GlobalAgent
2. 跨会话：可以访问用户的所有会话数据
3. 会话管理：支持创建、切换、持久化会话
4. 任务派发：可以创建 TaskAgent 执行具体任务
"""
import asyncio
import uuid
from typing import Optional, AsyncIterator, Any, Annotated, List, Dict
from datetime import datetime, timezone
from dataclasses import dataclass
from loguru import logger

from agents import (
    Agent,
    Runner,
    RunConfig,
    ModelSettings,
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
from runtime import sse_bus, stream_registry, AgentStream
from runtime.redis_client import redis_cache, RedisKeys
from runtime.dual_writer import (
    dual_writer,
    ThoughtChainNode,
    ThoughtChainNodeType,
)
from providers import get_default_provider
from tools.sdk_tools import (
    web_search, web_open, web_find,
    python_execute_with_approval,
    set_tool_context,
    current_task_id,
    current_user_id,
    add_todos, update_todo, list_todos,
)
from tools.db_tools import (
    get_chat_history,
    get_session_members,
    get_user_info,
    search_messages,
    get_user_sessions,
    get_db_pool,
    execute_query,
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

### 任务规划
- `add_todos(texts)` - 列出执行步骤
- `update_todo(todo_id, status)` - 更新步骤状态
- `list_todos()` - 查看当前步骤列表

### 信息检索
- `web_search(query)` - 搜索网页信息
- `web_open(url_or_id)` - 打开网页查看详情
- `web_find(pattern)` - 在页面中查找内容

### 代码执行
- `python_execute(code)` - 执行 Python 代码（需审批）

## 输出格式
- 使用 Markdown 格式输出
- 支持代码块、列表、表格
- 复杂分析可用 mermaid 图表

## 使用指南
1. 当用户询问聊天相关内容时，先用 `get_user_sessions` 找到相关会话
2. 然后用 `get_chat_history` 或 `search_messages` 获取具体内容
3. 复杂任务先用 `add_todos` 规划步骤，再逐步执行

## 回复风格
- 亲切友好，像私人助手
- 简洁高效，重点突出
- 使用中文回复

请开始为用户服务！
"""


@dataclass
class GlobalAgentConversation:
    """Global Agent 会话"""
    conversation_id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "title": self.title,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }


@dataclass
class GlobalStreamState:
    """Global Agent 流式处理状态"""
    task_id: str
    user_id: str
    conversation_id: str

    # 内容累积
    full_response: str = ""
    reasoning_content: str = ""  # 全量 reasoning（用于 metadata）

    # ThoughtChain 追踪
    thought_chain_sequence: int = 0
    current_chain_id: Optional[str] = None  # 当前 tool_call 节点 ID

    # Reasoning 节点追踪（独立于 tool chain）
    current_reasoning_chain_id: Optional[str] = None
    current_reasoning_content: str = ""  # 当前 reasoning 分段内容
    reasoning_active: bool = False  # 当前是否处于 reasoning 阶段

    # 工具调用追踪
    tool_calls: List[Dict[str, Any]] = None

    def __post_init__(self):
        if self.tool_calls is None:
            self.tool_calls = []


class GlobalAgentHooks(AgentHooks):
    """GlobalAgent 生命周期钩子"""
    
    def __init__(self, state: GlobalStreamState):
        self.state = state
    
    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        logger.info(f"[{self.state.task_id}] GlobalAgent started for user {self.state.user_id}")
    
    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        logger.info(f"[{self.state.task_id}] GlobalAgent ended")
    
    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        logger.info(f"[{self.state.task_id}] Tool {tool.name} started")

        # 关闭当前活跃的 reasoning 节点（think → tool_call 边界）
        if self.state.current_reasoning_chain_id:
            await dual_writer.update_thought_chain_status(
                self.state.current_reasoning_chain_id,
                "success",
                self.state.current_reasoning_content[:2000]
            )
            await sse_bus.publish(self.state.task_id, "thought_chain_update", {
                "chain_id": self.state.current_reasoning_chain_id,
                "status": "success",
                "content": self.state.current_reasoning_content[:2000]
            })
            self.state.current_reasoning_chain_id = None
            self.state.current_reasoning_content = ""
            self.state.reasoning_active = False

        # 创建 ThoughtChain 节点
        chain_id = str(uuid.uuid4())
        self.state.current_chain_id = chain_id
        self.state.thought_chain_sequence += 1
        
        node = ThoughtChainNode(
            chain_id=chain_id,
            task_id=self.state.task_id,
            node_type=ThoughtChainNodeType.TOOL_CALL.value,
            title=f"调用工具: {tool.name}",
            status="running",
            sequence=self.state.thought_chain_sequence
        )
        await dual_writer.write_thought_chain_node(node)
        
        # 发送 thought_chain SSE 事件
        await sse_bus.publish(self.state.task_id, "thought_chain", {
            "node": node.to_dict()
        })
        
        await sse_bus.publish(self.state.task_id, "tool_call", {
            "chain_id": chain_id,
            "tool_name": tool.name,
            "status": "executing"
        })
    
    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        logger.info(f"[{self.state.task_id}] Tool {tool.name} ended")
        
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
        
        await sse_bus.publish(self.state.task_id, "tool_output", {
            "chain_id": self.state.current_chain_id,
            "tool_name": tool.name,
            "result_preview": result[:500] if len(result) > 500 else result,
            "status": "completed"
        })
        
        self.state.current_chain_id = None


# ==================== 会话管理 API ====================

class GlobalAgentConversationService:
    """Global Agent 会话管理服务"""
    
    async def create_conversation(
        self,
        user_id: str,
        title: str = "新对话",
        conversation_id: Optional[str] = None
    ) -> GlobalAgentConversation:
        """创建新会话"""
        conversation_id = conversation_id or str(uuid.uuid4())
        now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        INSERT INTO agent_conversation 
                        (conversation_id, user_id, title, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    await cursor.execute(sql, (conversation_id, user_id, title, now, now))
                    await conn.commit()
            
            logger.info(f"Created global agent conversation: {conversation_id}")
            return GlobalAgentConversation(
                conversation_id=conversation_id,
                user_id=user_id,
                title=title,
                created_at=now,
                updated_at=now
            )
        except Exception as e:
            logger.error(f"Failed to create conversation: {e}")
            raise
    
    async def get_conversation(
        self,
        conversation_id: str
    ) -> Optional[GlobalAgentConversation]:
        """获取会话"""
        try:
            rows = await execute_query(
                "SELECT * FROM agent_conversation WHERE conversation_id = %s",
                (conversation_id,)
            )
            if rows:
                row = rows[0]
                return GlobalAgentConversation(
                    conversation_id=row['conversation_id'],
                    user_id=row['user_id'],
                    title=row['title'],
                    created_at=str(row['created_at']),
                    updated_at=str(row['updated_at'])
                )
            return None
        except Exception as e:
            logger.error(f"Failed to get conversation: {e}")
            return None
    
    async def list_conversations(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[GlobalAgentConversation]:
        """列出用户的所有会话"""
        try:
            rows = await execute_query(
                """SELECT * FROM agent_conversation 
                   WHERE user_id = %s 
                   ORDER BY updated_at DESC 
                   LIMIT %s""",
                (user_id, limit)
            )
            return [
                GlobalAgentConversation(
                    conversation_id=row['conversation_id'],
                    user_id=row['user_id'],
                    title=row['title'],
                    created_at=str(row['created_at']),
                    updated_at=str(row['updated_at'])
                )
                for row in rows
            ]
        except Exception as e:
            logger.error(f"Failed to list conversations: {e}")
            return []
    
    async def update_conversation_title(
        self,
        conversation_id: str,
        title: str
    ) -> bool:
        """更新会话标题"""
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = "UPDATE agent_conversation SET title = %s WHERE conversation_id = %s"
                    await cursor.execute(sql, (title, conversation_id))
                    await conn.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to update conversation title: {e}")
            return False
    
    async def delete_conversation(
        self,
        conversation_id: str
    ) -> bool:
        """删除会话"""
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    # 消息会通过外键级联删除
                    sql = "DELETE FROM agent_conversation WHERE conversation_id = %s"
                    await cursor.execute(sql, (conversation_id,))
                    await conn.commit()
            
            # 清除 Redis 缓存
            cache_key = f"agent:global:*:{conversation_id}"
            # Note: 这里简化处理，实际可能需要扫描删除
            
            logger.info(f"Deleted global agent conversation: {conversation_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete conversation: {e}")
            return False
    
    async def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict] = None
    ) -> str:
        """添加消息到会话"""
        message_id = str(uuid.uuid4())
        
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        INSERT INTO agent_conversation_message 
                        (message_id, conversation_id, role, content, metadata)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    import json
                    metadata_json = json.dumps(metadata, ensure_ascii=False) if metadata else None
                    await cursor.execute(sql, (message_id, conversation_id, role, content, metadata_json))
                    
                    # 更新会话的 updated_at
                    await cursor.execute(
                        "UPDATE agent_conversation SET updated_at = NOW() WHERE conversation_id = %s",
                        (conversation_id,)
                    )
                    await conn.commit()
            
            # 同时写入 Redis 缓存
            # 获取 user_id
            conv = await self.get_conversation(conversation_id)
            if conv:
                cache_key = RedisKeys.global_conversation(conv.user_id, conversation_id)
                await redis_cache.rpush(cache_key, {
                    "message_id": message_id,
                    "role": role,
                    "content": content,
                    "metadata": metadata
                }, ttl=settings.redis_context_ttl)
            
            return message_id
        except Exception as e:
            logger.error(f"Failed to add message: {e}")
            raise
    
    async def get_messages(
        self,
        conversation_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """获取会话消息"""
        try:
            # 先尝试从 Redis 获取
            conv = await self.get_conversation(conversation_id)
            if conv:
                cache_key = RedisKeys.global_conversation(conv.user_id, conversation_id)
                cached = await redis_cache.lrange(cache_key, -limit, -1)
                if cached:
                    return cached
            
            # 从 MySQL 获取
            rows = await execute_query(
                """SELECT * FROM agent_conversation_message 
                   WHERE conversation_id = %s 
                   ORDER BY created_at DESC 
                   LIMIT %s""",
                (conversation_id, limit)
            )
            
            import json
            messages = []
            for row in reversed(rows):  # 反转顺序
                metadata = row.get('metadata')
                if metadata and isinstance(metadata, str):
                    metadata = json.loads(metadata)
                messages.append({
                    "message_id": row['message_id'],
                    "role": row['role'],
                    "content": row['content'],
                    "metadata": metadata,
                    "created_at": str(row['created_at'])
                })
            
            return messages
        except Exception as e:
            logger.error(f"Failed to get messages: {e}")
            return []


# 全局会话服务实例
global_conversation_service = GlobalAgentConversationService()


# ==================== Agent 运行 ====================

def create_global_agent(state: GlobalStreamState) -> Agent:
    """创建全局 Agent 实例"""
    set_tool_context(state.task_id, state.user_id)

    instructions = GLOBAL_AGENT_SYSTEM_PROMPT + f"""

## 当前用户
- 用户 ID: {state.user_id}

使用数据库工具时，可以直接使用此用户 ID 查询用户相关数据。
"""

    tools = [
        get_user_sessions,
        get_chat_history,
        get_session_members,
        get_user_info,
        search_messages,
        add_todos,
        update_todo,
        list_todos,
        web_search,
        web_open,
        web_find,
        python_execute_with_approval,
    ]

    return Agent(
        name="GlobalAgent",
        instructions=instructions,
        tools=tools,
        hooks=GlobalAgentHooks(state),
    )


def _build_input_from_history(chat_history: Optional[List[Dict]], new_input: str):
    """将聊天历史 + 新输入转换为 Runner 的 input 格式"""
    if not chat_history:
        return new_input
    items = []
    for msg in chat_history[-20:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if content:
            items.append({"role": role, "content": content})
    if items:
        items.append({"role": "user", "content": new_input})
        return items
    return new_input


async def run_global_agent(
    stream,  # AgentStream
    conversation_id: Optional[str] = None,
    chat_history: Optional[List[Dict]] = None
) -> AsyncIterator[dict]:
    """
    运行全局 Agent（流式）
    
    支持会话持久化：
    - 传入 conversation_id 时，会从数据库加载历史并保存新消息
    - 不传时，使用传入的 chat_history（内存模式）
    """
    task_id = stream.id
    user_id = stream.user_id
    
    # 如果没有 conversation_id，自动创建会话
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        # 创建会话记录到数据库
        try:
            await global_conversation_service.create_conversation(
                user_id=user_id,
                conversation_id=conversation_id,
                title=stream.input_text[:50] if stream.input_text else "新对话"
            )
            logger.info(f"Created new conversation: {conversation_id}")
        except Exception as e:
            logger.warning(f"Failed to create conversation record: {e}")
    else:
        # 确保会话存在，如果不存在则创建
        existing = await global_conversation_service.get_conversation(conversation_id)
        if not existing:
            try:
                await global_conversation_service.create_conversation(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    title=stream.input_text[:50] if stream.input_text else "新对话"
                )
                logger.info(f"Created missing conversation: {conversation_id}")
            except Exception as e:
                logger.warning(f"Failed to create missing conversation: {e}")
    
    logger.info(f"Starting GlobalAgent for task {task_id}, user={user_id}, conversation={conversation_id}")
    
    # 创建流式状态
    state = GlobalStreamState(
        task_id=task_id,
        user_id=user_id,
        conversation_id=conversation_id
    )
    
    try:
        # 确保 agent_task 中存在 stream 记录，满足 agent_thought_chain 外键约束
        await dual_writer.ensure_stream_in_agent_task(
            stream_id=task_id,
            user_id=user_id,
            stream_type="global",
            conversation_id=conversation_id,
            input_text=stream.input_text,
        )

        # 发送初始化事件
        await sse_bus.publish(task_id, "init", {
            "task_id": task_id,
            "task_type": "global_agent",
            "user_id": user_id,
            "conversation_id": conversation_id
        })
        
        # 获取聊天历史
        if not chat_history:
            # 尝试从数据库加载
            chat_history = await global_conversation_service.get_messages(conversation_id)
        
        # 创建 Agent
        agent = create_global_agent(state)
        
        # 获取模型提供者
        provider = get_default_provider()
        
        # 构建输入
        runner_input = _build_input_from_history(chat_history, stream.input_text)
        
        # 运行流式 Agent
        run_config = RunConfig(
            model_provider=provider,
            model_settings=ModelSettings(max_tokens=16384),
        )
        result = Runner.run_streamed(
            agent,
            input=runner_input,
            run_config=run_config
        )
        
        # 追踪状态
        output_started = False

        # 处理流式事件
        async for event in result.stream_events():
            if event.type == "raw_response_event":
                data = event.data

                # Reasoning 内容
                if data.type == "response.reasoning_text.delta":
                    delta = data.delta
                    if delta:
                        if not state.reasoning_active:
                            # 新的 reasoning 阶段开始（首次或 tool_call 之后）
                            state.reasoning_active = True
                            state.current_reasoning_content = ""
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
                            state.current_reasoning_chain_id = chain_id

                            await sse_bus.publish(task_id, "thought_chain", {
                                "node": node.to_dict()
                            })

                        state.reasoning_content += delta
                        state.current_reasoning_content += delta
                        await sse_bus.publish(task_id, "reasoning_delta", {
                            "content": delta,
                            "delta": True
                        })
                        yield {"type": "reasoning_delta", "content": delta}

                # 输出文本增量
                elif isinstance(data, ResponseTextDeltaEvent):
                    delta = data.delta
                    if delta:
                        if not output_started:
                            output_started = True
                            # 关闭最后一个 reasoning 节点
                            if state.current_reasoning_chain_id:
                                await dual_writer.update_thought_chain_status(
                                    state.current_reasoning_chain_id,
                                    "success",
                                    state.current_reasoning_content[:2000]
                                )
                                await sse_bus.publish(task_id, "thought_chain_update", {
                                    "chain_id": state.current_reasoning_chain_id,
                                    "status": "success",
                                    "content": state.current_reasoning_content[:2000]
                                })
                                state.current_reasoning_chain_id = None
                                state.current_reasoning_content = ""
                                state.reasoning_active = False
                        
                        state.full_response += delta
                        await sse_bus.publish(task_id, "message", {
                            "content": delta,
                            "delta": True,
                            "format": "xmarkdown"
                        })
                        yield {"type": "message_delta", "content": delta}
            
            elif event.type == "run_item_stream_event":
                if event.item.type == "tool_call_item":
                    tool_name = getattr(event.item.raw_item, 'name', 'unknown')
                    logger.debug(f"Tool called: {tool_name}")
        
        # 流结束后处理
        final_text = state.full_response.strip() if state.full_response else "处理完成"
        
        # 保存消息到会话（如果是持久化会话）
        try:
            # 保存用户消息
            await global_conversation_service.add_message(
                conversation_id, "user", stream.input_text
            )
            # 保存助手消息
            await global_conversation_service.add_message(
                conversation_id, "assistant", final_text,
                metadata={"thinking": state.reasoning_content[:2000]} if state.reasoning_content else None
            )
        except Exception as e:
            logger.warning(f"Failed to persist messages: {e}")
        
        # 发送完成事件
        await sse_bus.publish(task_id, "done", {
            "final_text": final_text,
            "conversation_id": conversation_id
        })
        
        yield {"type": "done", "result": final_text, "conversation_id": conversation_id}
        
    except Exception as e:
        logger.error(f"GlobalAgent error: {e}", exc_info=True)
        await sse_bus.publish(task_id, "error", {"message": str(e)})
        yield {"type": "error", "error": str(e)}


# 导出配置
def get_global_agent_config() -> dict:
    """获取 GlobalAgent 配置"""
    return {
        "name": "global_agent",
        "instructions": GLOBAL_AGENT_SYSTEM_PROMPT,
        "model": settings.openrouter_model,
        "tools": [
            "get_user_sessions", "get_chat_history", "get_session_members",
            "get_user_info", "search_messages",
            "add_todos", "update_todo", "list_todos",
            "web_search", "web_open", "web_find", "python_execute"
        ]
    }
