"""
Dual Writer - Redis + MySQL 双写模块

负责：
1. Agent 消息的双写（Redis 缓存 + MySQL 持久化）
2. 任务状态的双写
3. Todo 和 ThoughtChain 的持久化
4. 失败重试机制
"""
import json
import asyncio
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from dataclasses import dataclass, asdict, field
from enum import Enum
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from runtime.redis_client import redis_cache, RedisKeys
from runtime.context_manager import ContextMessage, MessageType
from tools.db_tools import get_db_pool


class TaskStatus(Enum):
    """任务状态枚举"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TodoStatus(Enum):
    """Todo 状态枚举"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ThoughtChainNodeType(Enum):
    """思维链节点类型"""
    REASONING = "reasoning"
    TOOL_CALL = "tool_call"
    TOOL_OUTPUT = "tool_output"
    RESULT = "result"
    ERROR = "error"


@dataclass
class AgentMessage:
    """Agent 消息数据结构"""
    message_id: str
    session_id: str  # chat_session_id
    user_id: str     # agent_user_id
    content: str     # JSON 格式的内容
    content_type: str = "xmarkdown"
    metadata: Optional[Dict[str, Any]] = None
    create_time: Optional[str] = None
    
    def __post_init__(self):
        if not self.message_id:
            self.message_id = str(uuid.uuid4())
        if not self.create_time:
            self.create_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    def to_context_message(self, nickname: str = "AI 助手") -> ContextMessage:
        """转换为 ContextMessage"""
        return ContextMessage(
            message_id=self.message_id,
            user_id=self.user_id,
            nickname=nickname,
            message_type=MessageType.AGENT_RESPONSE.value,
            content=self.content,
            create_time=self.create_time,
            is_agent=True,
            metadata=self.metadata
        )


@dataclass
class TaskRecord:
    """任务记录数据结构"""
    task_id: str
    user_id: str
    task_type: str
    status: str = TaskStatus.PENDING.value
    chat_session_id: Optional[str] = None
    conversation_id: Optional[str] = None
    input_text: Optional[str] = None
    result: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    def __post_init__(self):
        now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        if not self.created_at:
            self.created_at = now
        if not self.updated_at:
            self.updated_at = now
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class TodoItem:
    """Todo 项数据结构"""
    todo_id: str
    task_id: str
    content: str
    status: str = TodoStatus.PENDING.value
    sequence: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    def __post_init__(self):
        if not self.todo_id:
            self.todo_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        if not self.created_at:
            self.created_at = now
        if not self.updated_at:
            self.updated_at = now
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ThoughtChainNode:
    """思维链节点数据结构"""
    chain_id: str
    task_id: str
    node_type: str
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    status: str = "pending"
    sequence: int = 0
    parent_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    
    def __post_init__(self):
        if not self.chain_id:
            self.chain_id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    
    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        if self.metadata and isinstance(self.metadata, dict):
            result['metadata'] = json.dumps(self.metadata, ensure_ascii=False)
        return result


class DualWriter:
    """
    双写器
    
    提供 Redis 缓存 + MySQL 持久化的双写功能
    写入策略：先写 Redis（快速响应），异步写 MySQL（持久化）
    """
    
    def __init__(self):
        self.cache = redis_cache
        self.context_ttl = settings.redis_context_ttl
        self.task_ttl = settings.redis_task_ttl
        # 延迟初始化，避免在模块加载时创建 Queue 导致事件循环问题
        self._write_queue: Optional[asyncio.Queue] = None
        self._writer_task: Optional[asyncio.Task] = None
    
    async def start(self):
        """启动后台写入任务"""
        if self._writer_task is None:
            # 在当前事件循环中创建 Queue
            self._write_queue = asyncio.Queue()
            self._writer_task = asyncio.create_task(self._background_writer())
            logger.info("DualWriter background task started")
    
    async def stop(self):
        """停止后台写入任务"""
        if self._writer_task:
            self._writer_task.cancel()
            try:
                await self._writer_task
            except asyncio.CancelledError:
                pass
            self._writer_task = None
            self._write_queue = None
            logger.info("DualWriter background task stopped")
    
    async def _background_writer(self):
        """后台 MySQL 写入协程"""
        while True:
            try:
                item = await self._write_queue.get()
                write_type, data = item
                
                if write_type == "message":
                    await self._write_message_to_mysql(data)
                elif write_type == "task":
                    await self._write_task_to_mysql(data)
                elif write_type == "todo":
                    await self._write_todo_to_mysql(data)
                elif write_type == "thought_chain":
                    await self._write_thought_chain_to_mysql(data)
                elif write_type == "task_event":
                    await self._write_task_event_to_mysql(data)
                
                self._write_queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Background writer error: {e}")
    
    # ==================== Agent 消息双写 ====================
    
    async def write_agent_message(
        self,
        message: AgentMessage,
        agent_nickname: str = "AI 助手",
        write_redis: bool = True,
        write_mysql: bool = True
    ) -> bool:
        """
        写入 Agent 消息
        
        1. 写入 Redis 上下文缓存（同步）
        2. 写入 MySQL 消息表（异步）
        """
        try:
            # 1. 写入 Redis 上下文缓存
            if write_redis:
                context_msg = message.to_context_message(agent_nickname)
                cache_key = RedisKeys.context(message.session_id)
                await self.cache.rpush(cache_key, context_msg.to_dict(), ttl=self.context_ttl)
                logger.debug(f"Message written to Redis: {message.message_id}")
            
            # 2. 异步写入 MySQL
            if write_mysql and self._write_queue:
                await self._write_queue.put(("message", message))
            
            return True
        except Exception as e:
            logger.error(f"Failed to write agent message: {e}")
            return False
    
    async def _write_message_to_mysql(self, message: AgentMessage):
        """将消息写入 MySQL（作为普通文本消息 message_type=0）"""
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    # 使用 message_type=0（STRING），直接存储纯文本内容
                    # 这样 C++ 网关能正确将其作为 StringMessageInfo 返回给前端
                    sql = """
                        INSERT INTO message 
                        (message_id, session_id, user_id, message_type, content, create_time)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE content = VALUES(content)
                    """
                    
                    await cursor.execute(sql, (
                        message.message_id,
                        message.session_id,
                        message.user_id,
                        0,  # STRING 消息类型，与 IM 系统一致
                        message.content,  # 直接存储纯文本，不包裹 JSON
                        message.create_time
                    ))
                    await conn.commit()
                    logger.info(f"Message persisted to MySQL: {message.message_id}")
        except Exception as e:
            logger.error(f"Failed to write message to MySQL: {e}")
            raise
    
    # ==================== 任务双写 ====================
    
    async def write_task(
        self,
        task: TaskRecord,
        write_redis: bool = True,
        write_mysql: bool = True
    ) -> bool:
        """写入任务记录"""
        try:
            # 1. 写入 Redis
            if write_redis:
                cache_key = RedisKeys.task(task.task_id)
                await self.cache.hset(cache_key, task.to_dict(), ttl=self.task_ttl)
                logger.debug(f"Task written to Redis: {task.task_id}")
            
            # 2. 异步写入 MySQL
            if write_mysql and self._write_queue:
                await self._write_queue.put(("task", task))
            
            return True
        except Exception as e:
            logger.error(f"Failed to write task: {e}")
            return False
    
    async def update_task_status(
        self,
        task_id: str,
        status: str,
        result: Optional[str] = None,
        error: Optional[str] = None
    ) -> bool:
        """更新任务状态"""
        try:
            cache_key = RedisKeys.task(task_id)
            updates = {
                "status": status,
                "updated_at": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            }
            if result is not None:
                updates["result"] = result
            if error is not None:
                updates["error"] = error
            if status in [TaskStatus.COMPLETED.value, TaskStatus.FAILED.value]:
                updates["completed_at"] = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            
            # 更新 Redis
            await self.cache.hset(cache_key, updates, ttl=self.task_ttl)
            
            # 更新 MySQL
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        UPDATE agent_task 
                        SET status = %s, result = %s, error = %s, 
                            updated_at = NOW(), completed_at = %s
                        WHERE task_id = %s
                    """
                    completed_at = updates.get("completed_at")
                    await cursor.execute(sql, (status, result, error, completed_at, task_id))
                    await conn.commit()
            
            logger.info(f"Task status updated: {task_id} -> {status}")
            return True
        except Exception as e:
            logger.error(f"Failed to update task status: {e}")
            return False
    
    async def _write_task_to_mysql(self, task: TaskRecord):
        """将任务写入 MySQL"""
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        INSERT INTO agent_task 
                        (task_id, user_id, chat_session_id, conversation_id, 
                         task_type, status, input, result, error, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            status = VALUES(status),
                            result = VALUES(result),
                            error = VALUES(error),
                            updated_at = VALUES(updated_at)
                    """
                    await cursor.execute(sql, (
                        task.task_id,
                        task.user_id,
                        task.chat_session_id,
                        task.conversation_id,
                        task.task_type,
                        task.status,
                        task.input_text,
                        task.result,
                        task.error,
                        task.created_at,
                        task.updated_at
                    ))
                    await conn.commit()
                    logger.info(f"Task persisted to MySQL: {task.task_id}")
        except Exception as e:
            logger.error(f"Failed to write task to MySQL: {e}")
            raise
    
    # ==================== Todo 双写 ====================
    
    async def write_todo(
        self,
        todo: TodoItem,
        write_redis: bool = True,
        write_mysql: bool = True
    ) -> bool:
        """写入 Todo 项"""
        try:
            # 1. 写入 Redis
            if write_redis:
                cache_key = RedisKeys.task_todos(todo.task_id)
                await self.cache.rpush(cache_key, todo.to_dict(), ttl=self.task_ttl)
            
            # 2. 异步写入 MySQL
            if write_mysql and self._write_queue:
                await self._write_queue.put(("todo", todo))
            
            return True
        except Exception as e:
            logger.error(f"Failed to write todo: {e}")
            return False
    
    async def update_todo_status(
        self,
        task_id: str,
        todo_id: str,
        status: str
    ) -> bool:
        """更新 Todo 状态"""
        try:
            # 更新 Redis（重新获取并更新）
            cache_key = RedisKeys.task_todos(task_id)
            todos = await self.cache.lrange(cache_key)
            
            for i, todo in enumerate(todos):
                if todo.get('todo_id') == todo_id:
                    todo['status'] = status
                    todo['updated_at'] = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
                    # Redis 不支持直接更新列表元素，需要删除重建
                    break
            
            # 更新 MySQL
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        UPDATE agent_todo 
                        SET status = %s, updated_at = NOW()
                        WHERE todo_id = %s
                    """
                    await cursor.execute(sql, (status, todo_id))
                    await conn.commit()
            
            logger.info(f"Todo status updated: {todo_id} -> {status}")
            return True
        except Exception as e:
            logger.error(f"Failed to update todo status: {e}")
            return False
    
    async def _write_todo_to_mysql(self, todo: TodoItem):
        """将 Todo 写入 MySQL"""
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        INSERT INTO agent_todo 
                        (todo_id, task_id, content, status, sequence, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            status = VALUES(status),
                            updated_at = VALUES(updated_at)
                    """
                    await cursor.execute(sql, (
                        todo.todo_id,
                        todo.task_id,
                        todo.content,
                        todo.status,
                        todo.sequence,
                        todo.created_at,
                        todo.updated_at
                    ))
                    await conn.commit()
                    logger.debug(f"Todo persisted to MySQL: {todo.todo_id}")
        except Exception as e:
            logger.error(f"Failed to write todo to MySQL: {e}")
            raise
    
    # ==================== ThoughtChain 双写 ====================
    
    async def write_thought_chain_node(
        self,
        node: ThoughtChainNode,
        write_redis: bool = True,
        write_mysql: bool = True
    ) -> bool:
        """写入思维链节点"""
        try:
            # 1. 写入 Redis
            if write_redis:
                cache_key = RedisKeys.thought_chain(node.task_id)
                await self.cache.rpush(cache_key, node.to_dict(), ttl=self.task_ttl)
            
            # 2. 异步写入 MySQL
            if write_mysql and self._write_queue:
                await self._write_queue.put(("thought_chain", node))
            
            return True
        except Exception as e:
            logger.error(f"Failed to write thought chain node: {e}")
            return False
    
    async def update_thought_chain_status(
        self,
        chain_id: str,
        status: str,
        content: Optional[str] = None
    ) -> bool:
        """更新思维链节点状态"""
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    if content:
                        sql = """
                            UPDATE agent_thought_chain 
                            SET status = %s, content = %s, updated_at = NOW()
                            WHERE chain_id = %s
                        """
                        await cursor.execute(sql, (status, content, chain_id))
                    else:
                        sql = """
                            UPDATE agent_thought_chain 
                            SET status = %s, updated_at = NOW()
                            WHERE chain_id = %s
                        """
                        await cursor.execute(sql, (status, chain_id))
                    await conn.commit()
            
            logger.debug(f"ThoughtChain node updated: {chain_id} -> {status}")
            return True
        except Exception as e:
            logger.error(f"Failed to update thought chain status: {e}")
            return False
    
    async def _write_thought_chain_to_mysql(self, node: ThoughtChainNode):
        """将思维链节点写入 MySQL"""
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        INSERT INTO agent_thought_chain 
                        (chain_id, task_id, parent_id, node_type, title, description, 
                         content, status, sequence, metadata, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            status = VALUES(status),
                            content = VALUES(content),
                            updated_at = NOW()
                    """
                    metadata_json = json.dumps(node.metadata, ensure_ascii=False) if node.metadata else None
                    await cursor.execute(sql, (
                        node.chain_id,
                        node.task_id,
                        node.parent_id,
                        node.node_type,
                        node.title,
                        node.description,
                        node.content,
                        node.status,
                        node.sequence,
                        metadata_json,
                        node.created_at
                    ))
                    await conn.commit()
                    logger.debug(f"ThoughtChain node persisted to MySQL: {node.chain_id}")
        except Exception as e:
            logger.error(f"Failed to write thought chain to MySQL: {e}")
            raise
    
    # ==================== 任务事件持久化 ====================
    
    async def write_task_event(
        self,
        task_id: str,
        event_type: str,
        event_data: Dict[str, Any],
        sequence: int
    ) -> bool:
        """写入任务事件"""
        try:
            event_id = str(uuid.uuid4())
            
            # 写入 Redis
            cache_key = RedisKeys.task_events(task_id)
            event = {
                "event_id": event_id,
                "event_type": event_type,
                "event_data": event_data,
                "sequence": sequence,
                "created_at": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            }
            await self.cache.rpush(cache_key, event, ttl=self.task_ttl)
            
            # 异步写入 MySQL
            if self._write_queue:
                await self._write_queue.put(("task_event", {
                    "event_id": event_id,
                    "task_id": task_id,
                    "event_type": event_type,
                    "event_data": event_data,
                    "sequence": sequence
                }))
            
            return True
        except Exception as e:
            logger.error(f"Failed to write task event: {e}")
            return False
    
    async def _write_task_event_to_mysql(self, event: Dict[str, Any]):
        """将任务事件写入 MySQL"""
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        INSERT INTO agent_task_event 
                        (event_id, task_id, event_type, event_data, sequence)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    await cursor.execute(sql, (
                        event["event_id"],
                        event["task_id"],
                        event["event_type"],
                        json.dumps(event["event_data"], ensure_ascii=False),
                        event["sequence"]
                    ))
                    await conn.commit()
        except Exception as e:
            logger.error(f"Failed to write task event to MySQL: {e}")
            raise
    
    # ==================== 查询方法 ====================
    
    async def get_task_todos(self, task_id: str) -> List[TodoItem]:
        """获取任务的 Todo 列表"""
        try:
            # 先从 Redis 获取
            cache_key = RedisKeys.task_todos(task_id)
            cached = await self.cache.lrange(cache_key)
            if cached:
                return [TodoItem(**t) for t in cached]
            
            # 从 MySQL 获取
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        SELECT * FROM agent_todo 
                        WHERE task_id = %s 
                        ORDER BY sequence
                    """
                    await cursor.execute(sql, (task_id,))
                    rows = await cursor.fetchall()
                    # 获取列名
                    columns = [desc[0] for desc in cursor.description]
                    todos = []
                    for row in rows:
                        row_dict = dict(zip(columns, row))
                        todos.append(TodoItem(
                            todo_id=row_dict['todo_id'],
                            task_id=row_dict['task_id'],
                            content=row_dict['content'],
                            status=row_dict['status'],
                            sequence=row_dict['sequence']
                        ))
                    return todos
        except Exception as e:
            logger.error(f"Failed to get task todos: {e}")
            return []
    
    async def get_thought_chain(self, task_id: str) -> List[ThoughtChainNode]:
        """获取任务的思维链"""
        try:
            # 先从 Redis 获取
            cache_key = RedisKeys.thought_chain(task_id)
            cached = await self.cache.lrange(cache_key)
            if cached:
                return [ThoughtChainNode(**n) for n in cached]
            
            # 从 MySQL 获取
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    sql = """
                        SELECT * FROM agent_thought_chain 
                        WHERE task_id = %s 
                        ORDER BY sequence
                    """
                    await cursor.execute(sql, (task_id,))
                    rows = await cursor.fetchall()
                    columns = [desc[0] for desc in cursor.description]
                    nodes = []
                    for row in rows:
                        row_dict = dict(zip(columns, row))
                        metadata = row_dict.get('metadata')
                        if metadata and isinstance(metadata, str):
                            metadata = json.loads(metadata)
                        nodes.append(ThoughtChainNode(
                            chain_id=row_dict['chain_id'],
                            task_id=row_dict['task_id'],
                            parent_id=row_dict.get('parent_id'),
                            node_type=row_dict['node_type'],
                            title=row_dict.get('title'),
                            description=row_dict.get('description'),
                            content=row_dict.get('content'),
                            status=row_dict.get('status', 'pending'),
                            sequence=row_dict['sequence'],
                            metadata=metadata
                        ))
                    return nodes
        except Exception as e:
            logger.error(f"Failed to get thought chain: {e}")
            return []


# 全局实例
dual_writer = DualWriter()
