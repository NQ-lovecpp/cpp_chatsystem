"""
任务执行器 - 执行 Agent 任务并推送事件
"""
import asyncio
import uuid
from typing import Dict, Optional, Any, List
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

from .sse_bus import sse_bus


class TaskStatus(str, Enum):
    """任务状态"""
    PENDING = "pending"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    DONE = "done"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskType(str, Enum):
    """
    任务类型
    
    - TASK: TaskAgent 执行的后台任务（默认，右侧边栏任务面板）
    - SESSION: SessionAgent 在聊天会话中的响应
    - GLOBAL: GlobalAgent 用户私人助手的响应（左侧边栏）
    """
    TASK = "task"        # 后台任务（TaskAgent）
    SESSION = "session"  # 会话内任务（SessionAgent）
    GLOBAL = "global"    # 全局任务（GlobalAgent）


@dataclass
class Task:
    """任务数据结构"""
    id: str
    user_id: str
    task_type: TaskType
    input_text: str
    status: TaskStatus = TaskStatus.PENDING
    chat_session_id: Optional[str] = None
    result: Optional[str] = None
    error: Optional[str] = None
    tool_calls: List[dict] = field(default_factory=list)
    todos: List[dict] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    # Agent 运行时状态
    previous_response_id: Optional[str] = None
    conversation_items: List[dict] = field(default_factory=list)


class TaskManager:
    """
    任务管理器
    - 管理任务生命周期
    - 调度任务执行
    """
    
    def __init__(self):
        self._tasks: Dict[str, Task] = {}
        self._lock = asyncio.Lock()
    
    async def create_task(
        self,
        user_id: str,
        input_text: str,
        task_type: TaskType = TaskType.SESSION,
        chat_session_id: Optional[str] = None,
        previous_response_id: Optional[str] = None
    ) -> Task:
        """创建新任务"""
        task_id = f"task_{uuid.uuid4().hex[:12]}"
        
        task = Task(
            id=task_id,
            user_id=user_id,
            task_type=task_type,
            input_text=input_text,
            chat_session_id=chat_session_id,
            previous_response_id=previous_response_id
        )
        
        async with self._lock:
            self._tasks[task_id] = task
        
        # 发布任务创建事件
        await sse_bus.publish(task_id, "task_created", {
            "task": {
                "id": task_id,
                "type": task_type.value,
                "status": task.status.value,
                "input": input_text[:100]  # 截断防止过长
            }
        })
        
        return task
    
    async def get_task(self, task_id: str) -> Optional[Task]:
        """获取任务"""
        return self._tasks.get(task_id)
    
    async def update_task_status(self, task_id: str, status: TaskStatus, **kwargs) -> None:
        """更新任务状态"""
        task = self._tasks.get(task_id)
        if task:
            task.status = status
            task.updated_at = datetime.now()
            for key, value in kwargs.items():
                if hasattr(task, key):
                    setattr(task, key, value)
            
            await sse_bus.publish(task_id, "task_status", {
                "status": status.value,
                **kwargs
            })
    
    async def add_tool_call(self, task_id: str, tool_call: dict) -> None:
        """添加工具调用记录"""
        task = self._tasks.get(task_id)
        if task:
            task.tool_calls.append(tool_call)
            task.updated_at = datetime.now()
    
    async def list_user_tasks(self, user_id: str, limit: int = 20) -> List[Task]:
        """列出用户的任务"""
        user_tasks = [t for t in self._tasks.values() if t.user_id == user_id]
        return sorted(user_tasks, key=lambda t: t.created_at, reverse=True)[:limit]
    
    async def cancel_task(self, task_id: str) -> bool:
        """取消任务"""
        task = self._tasks.get(task_id)
        if task and task.status in (TaskStatus.PENDING, TaskStatus.RUNNING, TaskStatus.WAITING_APPROVAL):
            task.status = TaskStatus.CANCELLED
            task.updated_at = datetime.now()
            
            await sse_bus.publish(task_id, "task_cancelled", {})
            await sse_bus.close_task(task_id)
            return True
        return False


# 全局任务管理器单例
task_manager = TaskManager()
