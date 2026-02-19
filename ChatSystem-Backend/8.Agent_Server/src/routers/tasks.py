"""
任务 API - 创建和管理 Agent 流 + Webhook

支持：
1. POST /tasks — 前端直接创建 (保留兼容)
2. POST /webhook/message — C++ 网关 @mention 路由
"""
import re
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
from chat_agents import run_session_agent


router = APIRouter(prefix="/tasks", tags=["tasks"])


class CreateTaskRequest(BaseModel):
    """创建 Agent 流请求"""
    input: str = Field(..., description="输入文本", min_length=1, max_length=10000)
    task_type: str = Field(default="session", description="类型: session")
    chat_session_id: Optional[str] = Field(default=None, description="会话 ID")
    agent_user_id: Optional[str] = Field(default=None, description="指定 Agent 用户 ID")
    chat_history: Optional[List[dict]] = Field(default=None, description="聊天历史")


class StreamResponse(BaseModel):
    """创建响应"""
    task_id: str
    status: str = "pending"
    task_type: str
    created_at: str


class WebhookMessageRequest(BaseModel):
    """C++ 网关 webhook 请求"""
    chat_session_id: str
    message_id: str
    sender_user_id: str
    agent_user_id: str
    content: str


# @mention 格式: @[display_name]{agent_user_id}
MENTION_PATTERN = re.compile(r'@\[([^\]]+)\]\{([^}]+)\}')


def strip_mentions(content: str) -> str:
    """移除 @mention 标签，保留纯文本"""
    return MENTION_PATTERN.sub(r'@\1', content).strip()


async def execute_stream(
    stream: AgentStream,
    agent_user_id: Optional[str] = None,
    chat_history: Optional[List[dict]] = None
):
    """后台执行 Agent 流"""
    try:
        async for _ in run_session_agent(
            stream,
            agent_user_id=agent_user_id,
            chat_history=chat_history
        ):
            pass
    except Exception as e:
        logger.error(f"Stream execution error: {e}")
        session_channel = f"session:{stream.chat_session_id}"
        await sse_bus.publish(session_channel, "agent_error", {"error": str(e)})


@router.post("", response_model=StreamResponse)
async def create_task(
    request: CreateTaskRequest,
    background_tasks: BackgroundTasks,
    user: UserContext = Depends(require_auth)
):
    """创建新的 Agent 流（前端直接调用）"""
    if request.task_type != "session":
        raise HTTPException(
            status_code=400,
            detail=f"Invalid task_type: {request.task_type}. Must be 'session'"
        )

    if not request.chat_session_id:
        raise HTTPException(status_code=400, detail="chat_session_id is required")

    stream = stream_registry.create(
        user_id=user.user_id,
        input_text=request.input,
        stream_type="session",
        chat_session_id=request.chat_session_id,
    )

    logger.info(f"Stream created: {stream.id} by user {user.user_id}")

    background_tasks.add_task(
        execute_stream, stream,
        agent_user_id=request.agent_user_id,
        chat_history=request.chat_history
    )

    return StreamResponse(
        task_id=stream.id,
        status="pending",
        task_type="session",
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
