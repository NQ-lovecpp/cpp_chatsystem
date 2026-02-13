"""
SSE 事件总线 - 管理任务事件的发布与订阅
"""
import asyncio
import json
from typing import Dict, List, Optional, AsyncIterator
from dataclasses import dataclass, field
from datetime import datetime

try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)


def encode_sse(event: str, data: dict) -> bytes:
    """编码 SSE 事件"""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n".encode("utf-8")


@dataclass
class EventSubscriber:
    """事件订阅者"""
    queue: asyncio.Queue
    task_id: str
    created_at: datetime = field(default_factory=datetime.now)


class SSEBus:
    """
    SSE 事件总线
    - 支持按 task_id 订阅
    - 支持事件广播
    - 支持断线重连时的事件补发
    """
    
    def __init__(self, max_history: int = 100):
        self._subscribers: Dict[str, List[EventSubscriber]] = {}
        self._event_history: Dict[str, list] = {}  # task_id -> events
        self._max_history = max_history
        self._lock = asyncio.Lock()
    
    async def subscribe(self, task_id: str, last_event_id: Optional[str] = None) -> AsyncIterator[bytes]:
        """
        订阅某个任务的事件流
        
        Args:
            task_id: 任务 ID
            last_event_id: 上次收到的事件 ID，用于断线重连
        """
        queue: asyncio.Queue = asyncio.Queue()
        subscriber = EventSubscriber(queue=queue, task_id=task_id)
        
        async with self._lock:
            if task_id not in self._subscribers:
                self._subscribers[task_id] = []
            self._subscribers[task_id].append(subscriber)
            
            # 如果有历史事件且需要重放
            if last_event_id and task_id in self._event_history:
                found = False
                for event_data in self._event_history[task_id]:
                    if found:
                        await queue.put(event_data)
                    elif event_data.get("id") == last_event_id:
                        found = True
        
        try:
            # 发送 init 事件
            yield encode_sse("init", {"task_id": task_id, "timestamp": datetime.now().isoformat()})
            
            while True:
                try:
                    # 等待新事件，超时 30 秒发送心跳
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield event
                except asyncio.TimeoutError:
                    # 发送心跳保持连接
                    yield b": heartbeat\n\n"
        finally:
            # 清理订阅
            async with self._lock:
                if task_id in self._subscribers:
                    if subscriber in self._subscribers[task_id]:
                        self._subscribers[task_id].remove(subscriber)
                    if not self._subscribers[task_id]:
                        del self._subscribers[task_id]
    
    async def publish(self, task_id: str, event_type: str, data: dict) -> None:
        """
        发布事件到指定任务的所有订阅者
        
        Args:
            task_id: 任务 ID
            event_type: 事件类型
            data: 事件数据
        """
        event_data = {
            "id": f"{task_id}_{datetime.now().timestamp()}",
            "type": event_type,
            "task_id": task_id,
            "timestamp": datetime.now().isoformat(),
            **data
        }
        
        encoded = encode_sse(event_type, event_data)
        
        async with self._lock:
            # 保存到历史
            if task_id not in self._event_history:
                self._event_history[task_id] = []
            self._event_history[task_id].append(event_data)
            
            # 限制历史长度
            if len(self._event_history[task_id]) > self._max_history:
                self._event_history[task_id] = self._event_history[task_id][-self._max_history:]
            
            # 广播给所有订阅者
            if task_id in self._subscribers:
                for subscriber in self._subscribers[task_id]:
                    try:
                        await subscriber.queue.put(encoded)
                    except Exception as e:
                        logger.warning(f"Failed to publish event to subscriber: {e}")
    
    async def close_task(self, task_id: str) -> None:
        """关闭任务的所有订阅"""
        async with self._lock:
            if task_id in self._subscribers:
                for subscriber in self._subscribers[task_id]:
                    try:
                        await subscriber.queue.put(encode_sse("done", {"task_id": task_id}))
                    except:
                        pass
    
    def get_history(self, task_id: str) -> list:
        """获取任务的事件历史"""
        return self._event_history.get(task_id, [])
    
    def clear_history(self, task_id: str) -> None:
        """清除任务的事件历史"""
        if task_id in self._event_history:
            del self._event_history[task_id]


# 全局事件总线单例
sse_bus = SSEBus()
