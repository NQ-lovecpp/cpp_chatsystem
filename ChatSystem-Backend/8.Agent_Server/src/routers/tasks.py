"""
任务 API - 创建和管理 Agent 流

支持两种 Agent 类型：
1. session - SessionAgent: 聊天会话中的 AI 成员
2. global - GlobalAgent: 用户的私人助手（左侧边栏）
"""
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
from runtime import stream_registry, AgentStream, sse_bus
from chat_agents import run_session_agent, run_global_agent


router = APIRouter(prefix="/tasks", tags=["tasks"])


class CreateTaskRequest(BaseModel):
    """创建 Agent 流请求"""
    input: str = Field(..., description="输入文本", min_length=1, max_length=10000)
    task_type: str = Field(default="session", description="类型: session / global")
    chat_session_id: Optional[str] = Field(default=None, description="会话 ID（session 类型使用）")
    previous_response_id: Optional[str] = Field(default=None, description="上一次响应 ID")
    chat_history: Optional[List[dict]] = Field(default=None, description="聊天历史 [{role, content}, ...]")


class StreamResponse(BaseModel):
    """创建响应（保持 task_id 字段名与前端兼容）"""
    task_id: str
    status: str = "pending"
    task_type: str
    created_at: str


async def execute_stream(stream: AgentStream, chat_history: Optional[List[dict]] = None):
    """后台执行 Agent 流"""
    try:
        if stream.stream_type == "global":
            async for _ in run_global_agent(stream, chat_history=chat_history):
                pass
        else:
            async for _ in run_session_agent(stream, chat_history=chat_history):
                pass
    except Exception as e:
        logger.error(f"Stream execution error: {e}")
        await sse_bus.publish(stream.id, "error", {"message": str(e)})


@router.post("", response_model=StreamResponse)
async def create_task(
    request: CreateTaskRequest,
    background_tasks: BackgroundTasks,
    user: UserContext = Depends(require_auth)
):
    """
    创建新的 Agent 流

    - session: SessionAgent，聊天会话中的 AI 成员
    - global: GlobalAgent，用户的私人助手
    """
    stream_type = request.task_type
    if stream_type not in ("session", "global"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid task_type: {stream_type}. Must be 'session' or 'global'"
        )

    stream = stream_registry.create(
        user_id=user.user_id,
        input_text=request.input,
        stream_type=stream_type,
        chat_session_id=request.chat_session_id,
    )

    logger.info(f"Stream created: {stream.id} (type={stream_type}) by user {user.user_id}")

    background_tasks.add_task(execute_stream, stream, request.chat_history)

    return StreamResponse(
        task_id=stream.id,
        status="pending",
        task_type=stream.stream_type,
        created_at=stream.created_at.isoformat()
    )


@router.get("/{task_id}")
async def get_task(
    task_id: str,
    user: UserContext = Depends(require_auth)
):
    """获取 stream 信息"""
    stream = stream_registry.get(task_id)

    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    if stream.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "task_id": stream.id,
        "task_type": stream.stream_type,
        "input": stream.input_text,
        "running": stream_registry.is_running(stream.id),
        "created_at": stream.created_at.isoformat()
    }


@router.get("")
async def list_tasks(
    user: UserContext = Depends(require_auth)
):
    """列出用户的 streams"""
    streams = stream_registry.list_user_streams(user.user_id)
    return [
        {
            "task_id": s.id,
            "task_type": s.stream_type,
            "running": stream_registry.is_running(s.id),
            "created_at": s.created_at.isoformat()
        }
        for s in sorted(streams, key=lambda x: x.created_at, reverse=True)[:20]
    ]


@router.post("/{task_id}/cancel")
async def cancel_task(
    task_id: str,
    user: UserContext = Depends(require_auth)
):
    """取消 stream"""
    stream = stream_registry.get(task_id)

    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    if stream.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    success = await stream_registry.cancel(task_id)

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Stream not running or already completed"
        )

    return {"message": "Stream cancelled", "task_id": task_id}
