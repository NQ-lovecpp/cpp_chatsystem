"""
Dual Writer - Redis + MySQL 双写模块（简化版）

仅负责 Agent 消息的双写（Redis 缓存 + MySQL 持久化）。
Todo 和 ThoughtChain 已移除，agent 的思考/工具调用内容
直接以结构化 xmarkdown 存入 message.content 字段。
"""
import json
import asyncio
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
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


@dataclass
class AgentMessage:
    """Agent 消息数据结构"""
    message_id: str
    session_id: str  # chat_session_id
    user_id: str     # agent_user_id
    content: str
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
            message_type=MessageType.TEXT.value,
            content=self.content,
            create_time=self.create_time,
            is_agent=True,
            metadata=self.metadata
        )


class DualWriter:
    """
    双写器（简化版）

    提供 Redis 缓存 + MySQL 持久化的双写功能。
    写入策略：先写 Redis（快速响应），异步写 MySQL（持久化）。
    """

    def __init__(self):
        self.cache = redis_cache
        self.context_ttl = settings.redis_context_ttl
        self._write_queue: Optional[asyncio.Queue] = None
        self._writer_task: Optional[asyncio.Task] = None

    async def start(self):
        """启动后台写入任务"""
        if self._writer_task is None:
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
            if write_redis:
                context_msg = message.to_context_message(agent_nickname)
                cache_key = RedisKeys.context(message.session_id)
                await self.cache.rpush(cache_key, context_msg.to_dict(), ttl=self.context_ttl)
                logger.debug(f"Message written to Redis: {message.message_id}")

            if write_mysql and self._write_queue:
                await self._write_queue.put(("message", message))

            return True
        except Exception as e:
            logger.error(f"Failed to write agent message: {e}")
            return False

    async def _write_message_to_mysql(self, message: AgentMessage):
        """将消息写入 MySQL"""
        try:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
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
                        0,  # STRING 消息类型
                        message.content,
                        message.create_time
                    ))
                    await conn.commit()
                    logger.info(f"Message persisted to MySQL: {message.message_id}")
        except Exception as e:
            logger.error(f"Failed to write message to MySQL: {e}")
            raise


# 全局实例
dual_writer = DualWriter()
