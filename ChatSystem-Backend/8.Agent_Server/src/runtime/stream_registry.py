"""
Stream Registry - 轻量 Agent 流运行时注册表

替代原有的 TaskManager，消除 "task" 概念。
每个 Agent 调用创建一个 stream，仅在内存中追踪，不持久化到数据库。
"""
import uuid
from typing import Dict, Optional, Literal
from dataclasses import dataclass, field
from datetime import datetime
from loguru import logger

from .sse_bus import sse_bus

StreamType = Literal['session', 'global']


@dataclass
class AgentStream:
    """Agent 流信息"""
    id: str
    user_id: str
    stream_type: StreamType
    input_text: str
    chat_session_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)


class StreamRegistry:
    """
    轻量 Agent 流注册表
    - 仅内存存储，不持久化
    - 支持取消运行中的流
    """

    def __init__(self):
        self._streams: Dict[str, AgentStream] = {}
        self._async_tasks: Dict[str, object] = {}  # asyncio.Task

    def create(
        self,
        user_id: str,
        input_text: str,
        stream_type: StreamType = 'session',
        chat_session_id: Optional[str] = None,
    ) -> AgentStream:
        """创建新 stream"""
        stream_id = f"stream_{uuid.uuid4().hex[:12]}"
        stream = AgentStream(
            id=stream_id,
            user_id=user_id,
            stream_type=stream_type,
            input_text=input_text,
            chat_session_id=chat_session_id,
        )
        self._streams[stream_id] = stream
        return stream

    def get(self, stream_id: str) -> Optional[AgentStream]:
        """获取 stream 信息"""
        return self._streams.get(stream_id)

    def register_task(self, stream_id: str, task) -> None:
        """注册 asyncio.Task，用于取消"""
        self._async_tasks[stream_id] = task

    async def cancel(self, stream_id: str) -> bool:
        """取消运行中的 stream"""
        task = self._async_tasks.get(stream_id)
        if task and not task.done():
            task.cancel()
            await sse_bus.publish(stream_id, "cancelled", {})
            await sse_bus.close_task(stream_id)
            logger.info(f"Stream {stream_id} cancelled")
            return True
        return False

    def is_running(self, stream_id: str) -> bool:
        """检查 stream 是否仍在运行"""
        task = self._async_tasks.get(stream_id)
        return task is not None and not task.done()

    def list_user_streams(self, user_id: str) -> list:
        """列出用户的所有 streams"""
        return [s for s in self._streams.values() if s.user_id == user_id]


# 全局单例
stream_registry = StreamRegistry()
