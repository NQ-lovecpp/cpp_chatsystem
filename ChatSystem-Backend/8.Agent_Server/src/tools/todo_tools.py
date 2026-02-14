"""
Todo 工具 - 用于 Agent 管理任务进度
Agent 可以通过这些工具添加和更新 Todo 项，前端会实时渲染进度
"""
import uuid
from typing import Annotated, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
from loguru import logger

from agents import function_tool, RunContextWrapper

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from runtime.sse_bus import sse_bus


# Todo 状态枚举
class TodoStatus:
    IDLE = "idle"           # 待执行
    RUNNING = "running"     # 执行中
    COMPLETED = "completed" # 已完成
    FAILED = "failed"       # 失败
    SKIPPED = "skipped"     # 跳过


@dataclass
class TodoItem:
    """单个 Todo 项"""
    id: str
    text: str
    status: str = TodoStatus.IDLE
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    error: Optional[str] = None


@dataclass
class TaskContext:
    """任务上下文 - 用于 RunContextWrapper"""
    task_id: str
    user_id: str
    todos: List[TodoItem] = field(default_factory=list)
    
    def get_todo_by_id(self, todo_id: str) -> Optional[TodoItem]:
        """根据 ID 获取 Todo"""
        for todo in self.todos:
            if todo.id == todo_id:
                return todo
        return None
    
    def get_todos_summary(self) -> dict:
        """获取 Todos 摘要"""
        total = len(self.todos)
        completed = sum(1 for t in self.todos if t.status == TodoStatus.COMPLETED)
        running = sum(1 for t in self.todos if t.status == TodoStatus.RUNNING)
        failed = sum(1 for t in self.todos if t.status == TodoStatus.FAILED)
        return {
            "total": total,
            "completed": completed,
            "running": running,
            "failed": failed,
            "progress": completed / total * 100 if total > 0 else 0
        }


# ============== Todo 工具 (使用 RunContextWrapper) ==============

@function_tool
async def add_todo(
    wrapper: RunContextWrapper[TaskContext],
    texts: Annotated[List[str], "要添加的 Todo 文本列表，每个 4-8 个字"]
) -> str:
    """
    添加多个 Todo 项到任务中。Agent 应该在开始执行复杂任务前先规划 Todo 列表。
    每个 Todo 应该简短明确（4-8个字），描述一个具体步骤。
    
    示例：
    - "搜索相关资料"
    - "分析搜索结果"  
    - "编写代码实现"
    - "测试验证结果"
    """
    context = wrapper.context
    task_id = context.task_id
    
    added_todos = []
    for text in texts:
        todo = TodoItem(
            id=f"todo_{uuid.uuid4().hex[:8]}",
            text=text
        )
        context.todos.append(todo)
        added_todos.append(todo)
        
        # 发布 SSE 事件
        await sse_bus.publish(task_id, "todo_added", {
            "todo": {
                "id": todo.id,
                "text": todo.text,
                "status": todo.status
            }
        })
        
        logger.info(f"[{task_id}] Added todo: {todo.text}")
    
    return f"成功添加 {len(added_todos)} 个 Todo 项"


@function_tool
async def set_todo_status(
    wrapper: RunContextWrapper[TaskContext],
    todo_id: Annotated[str, "Todo 项的 ID"],
    status: Annotated[str, "新状态: idle/running/completed/failed/skipped"],
    error: Annotated[Optional[str], "如果失败，错误信息"] = None
) -> str:
    """
    更新 Todo 项的状态。Agent 应该在开始、完成或失败时更新对应 Todo 的状态。
    
    状态说明：
    - idle: 待执行
    - running: 执行中
    - completed: 已完成
    - failed: 执行失败
    - skipped: 跳过（不需要执行）
    """
    context = wrapper.context
    task_id = context.task_id
    
    todo = context.get_todo_by_id(todo_id)
    if not todo:
        return f"未找到 Todo: {todo_id}"
    
    old_status = todo.status
    todo.status = status
    
    if status == TodoStatus.COMPLETED:
        todo.completed_at = datetime.now()
    if status == TodoStatus.FAILED and error:
        todo.error = error
    
    # 发布 SSE 事件
    await sse_bus.publish(task_id, "todo_status", {
        "todoId": todo_id,
        "status": status,
        "error": error
    })
    
    # 同时发布进度摘要
    summary = context.get_todos_summary()
    await sse_bus.publish(task_id, "todo_progress", {
        "progress": summary["progress"],
        "completed": summary["completed"],
        "total": summary["total"]
    })
    
    logger.info(f"[{task_id}] Todo {todo_id}: {old_status} -> {status}")
    
    return f"Todo '{todo.text}' 状态已更新为 {status}"


@function_tool
async def get_todos(
    wrapper: RunContextWrapper[TaskContext]
) -> str:
    """
    获取当前任务的所有 Todo 项及其状态。
    """
    context = wrapper.context
    
    if not context.todos:
        return "当前没有 Todo 项"
    
    lines = ["当前 Todo 列表:"]
    for i, todo in enumerate(context.todos, 1):
        status_icon = {
            TodoStatus.IDLE: "⏳",
            TodoStatus.RUNNING: "🔄",
            TodoStatus.COMPLETED: "✅",
            TodoStatus.FAILED: "❌",
            TodoStatus.SKIPPED: "⏭️"
        }.get(todo.status, "❓")
        lines.append(f"{i}. [{status_icon}] {todo.text} (id: {todo.id})")
    
    summary = context.get_todos_summary()
    lines.append(f"\n进度: {summary['completed']}/{summary['total']} ({summary['progress']:.0f}%)")
    
    return "\n".join(lines)


# ============== 简化版工具 (不使用 RunContextWrapper，直接通过 task_id 发布事件) ==============
# 这些版本适用于不方便传递 context 的场景

from tools.sdk_tools import current_task_id, current_user_id

# 全局 Todo 存储 (task_id -> List[TodoItem])
_task_todos: dict[str, List[TodoItem]] = {}


def _get_task_todos(task_id: str) -> List[TodoItem]:
    """获取任务的 todos"""
    if task_id not in _task_todos:
        _task_todos[task_id] = []
    return _task_todos[task_id]


def _clear_task_todos(task_id: str):
    """清理任务的 todos"""
    if task_id in _task_todos:
        del _task_todos[task_id]


@function_tool
async def add_todos(
    texts: Annotated[List[str], "要添加的 Todo 文本列表，每个 4-8 个字"]
) -> str:
    """
    添加多个 Todo 项到当前任务。Agent 应该在开始执行复杂任务前先规划 Todo 列表。
    每个 Todo 应该简短明确（4-8个字），描述一个具体步骤。
    
    示例：
    ["搜索相关资料", "分析搜索结果", "编写代码实现", "测试验证结果"]
    """
    task_id = current_task_id.get()
    todos = _get_task_todos(task_id)
    
    added = []
    for text in texts:
        todo = TodoItem(
            id=f"todo_{uuid.uuid4().hex[:8]}",
            text=text
        )
        todos.append(todo)
        added.append(todo)
        
        await sse_bus.publish(task_id, "todo_added", {
            "todo": {
                "id": todo.id,
                "text": todo.text,
                "status": todo.status
            }
        })
    
    logger.info(f"[{task_id}] Added {len(added)} todos")
    return f"成功添加 {len(added)} 个 Todo 项: " + ", ".join(t.text for t in added)


@function_tool
async def update_todo(
    todo_id: Annotated[str, "Todo 项的 ID"],
    status: Annotated[str, "新状态: idle/running/completed/failed/skipped"]
) -> str:
    """
    更新指定 Todo 项的状态。
    
    状态说明：
    - idle: 待执行
    - running: 执行中  
    - completed: 已完成
    - failed: 执行失败
    - skipped: 跳过
    """
    task_id = current_task_id.get()
    todos = _get_task_todos(task_id)
    
    # 查找 todo
    todo = None
    for t in todos:
        if t.id == todo_id:
            todo = t
            break
    
    if not todo:
        return f"未找到 Todo: {todo_id}"
    
    old_status = todo.status
    todo.status = status
    
    if status == TodoStatus.COMPLETED:
        todo.completed_at = datetime.now()
    
    # 发布状态更新事件
    await sse_bus.publish(task_id, "todo_status", {
        "todoId": todo_id,
        "status": status
    })
    
    # 计算并发布进度
    total = len(todos)
    completed = sum(1 for t in todos if t.status == TodoStatus.COMPLETED)
    progress = completed / total * 100 if total > 0 else 0
    
    await sse_bus.publish(task_id, "todo_progress", {
        "progress": progress,
        "completed": completed,
        "total": total
    })
    
    logger.info(f"[{task_id}] Todo {todo.text}: {old_status} -> {status}")
    return f"Todo '{todo.text}' 状态更新为 {status}"


@function_tool
async def list_todos() -> str:
    """获取当前任务的所有 Todo 项"""
    task_id = current_task_id.get()
    todos = _get_task_todos(task_id)
    
    if not todos:
        return "当前没有 Todo 项，建议先使用 add_todos 规划任务步骤"
    
    lines = ["📋 当前 Todo 列表:"]
    for i, todo in enumerate(todos, 1):
        icon = {
            TodoStatus.IDLE: "⏳",
            TodoStatus.RUNNING: "🔄", 
            TodoStatus.COMPLETED: "✅",
            TodoStatus.FAILED: "❌",
            TodoStatus.SKIPPED: "⏭️"
        }.get(todo.status, "❓")
        lines.append(f"  {i}. {icon} {todo.text} (id: {todo.id})")
    
    total = len(todos)
    completed = sum(1 for t in todos if t.status == TodoStatus.COMPLETED)
    lines.append(f"\n📊 进度: {completed}/{total} ({completed/total*100:.0f}%)")
    
    return "\n".join(lines)


# 导出
TODO_TOOLS = [add_todos, update_todo, list_todos]
TODO_TOOLS_WITH_CONTEXT = [add_todo, set_todo_status, get_todos]

__all__ = [
    "TodoStatus",
    "TodoItem", 
    "TaskContext",
    "TODO_TOOLS",
    "TODO_TOOLS_WITH_CONTEXT",
    "add_todos",
    "update_todo",
    "list_todos",
    "add_todo",
    "set_todo_status",
    "get_todos",
    "_get_task_todos",
    "_clear_task_todos"
]
