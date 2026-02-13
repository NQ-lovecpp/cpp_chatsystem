"""
任务 API - 创建和管理 Agent 任务
"""
import asyncio
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from auth import UserContext, require_auth
from runtime import task_manager, Task, TaskStatus, TaskType
from chat_agents import run_session_agent, run_global_agent


router = APIRouter(prefix="/tasks", tags=["tasks"])


class CreateTaskRequest(BaseModel):
    """创建任务请求"""
    input: str = Field(..., description="任务输入文本", min_length=1, max_length=10000)
    task_type: str = Field(default="session", description="任务类型: session/global")
    chat_session_id: Optional[str] = Field(default=None, description="会话 ID (session 类型必填)")
    previous_response_id: Optional[str] = Field(default=None, description="上一次响应 ID (用于对话延续)")


class TaskResponse(BaseModel):
    """任务响应"""
    task_id: str
    status: str
    task_type: str
    created_at: str


class TaskDetailResponse(BaseModel):
    """任务详情响应"""
    task_id: str
    status: str
    task_type: str
    input: str
    result: Optional[str] = None
    error: Optional[str] = None
    tool_calls: List[dict] = []
    todos: List[dict] = []
    created_at: str
    updated_at: str


async def execute_task(task: Task):
    """后台执行任务"""
    try:
        if task.task_type == TaskType.GLOBAL:
            async for _ in run_global_agent(task):
                pass
        else:
            async for _ in run_session_agent(task):
                pass
    except Exception as e:
        logger.error(f"Task execution error: {e}")
        await task_manager.update_task_status(
            task.id,
            TaskStatus.FAILED,
            error=str(e)
        )


@router.post("", response_model=TaskResponse)
async def create_task(
    request: CreateTaskRequest,
    background_tasks: BackgroundTasks,
    user: UserContext = Depends(require_auth)
):
    """
    创建新的 Agent 任务
    
    - session 类型：会话内任务，需要 chat_session_id
    - global 类型：全局任务，跨会话执行
    """
    # 验证任务类型
    try:
        task_type = TaskType(request.task_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid task_type: {request.task_type}. Must be 'session' or 'global'"
        )
    
    # session 类型需要 chat_session_id
    if task_type == TaskType.SESSION and not request.chat_session_id:
        # 开发阶段允许不传，使用默认值
        request.chat_session_id = f"default_session_{user.user_id}"
    
    # 创建任务
    task = await task_manager.create_task(
        user_id=user.user_id,
        input_text=request.input,
        task_type=task_type,
        chat_session_id=request.chat_session_id,
        previous_response_id=request.previous_response_id
    )
    
    logger.info(f"Task created: {task.id} by user {user.user_id}")
    
    # 后台执行任务
    background_tasks.add_task(execute_task, task)
    
    return TaskResponse(
        task_id=task.id,
        status=task.status.value,
        task_type=task.task_type.value,
        created_at=task.created_at.isoformat()
    )


@router.get("/{task_id}", response_model=TaskDetailResponse)
async def get_task(
    task_id: str,
    user: UserContext = Depends(require_auth)
):
    """获取任务详情"""
    task = await task_manager.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # 检查权限
    if task.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return TaskDetailResponse(
        task_id=task.id,
        status=task.status.value,
        task_type=task.task_type.value,
        input=task.input_text,
        result=task.result,
        error=task.error,
        tool_calls=task.tool_calls,
        todos=task.todos,
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat()
    )


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    limit: int = 20,
    user: UserContext = Depends(require_auth)
):
    """列出用户的任务"""
    tasks = await task_manager.list_user_tasks(user.user_id, limit)
    
    return [
        TaskResponse(
            task_id=t.id,
            status=t.status.value,
            task_type=t.task_type.value,
            created_at=t.created_at.isoformat()
        )
        for t in tasks
    ]


@router.post("/{task_id}/cancel")
async def cancel_task(
    task_id: str,
    user: UserContext = Depends(require_auth)
):
    """取消任务"""
    task = await task_manager.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    success = await task_manager.cancel_task(task_id)
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Task cannot be cancelled (already completed or cancelled)"
        )
    
    return {"message": "Task cancelled", "task_id": task_id}
