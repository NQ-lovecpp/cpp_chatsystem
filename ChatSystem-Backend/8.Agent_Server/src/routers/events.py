"""
事件 API - SSE 事件订阅

支持:
1. GET /events/session/{chat_session_id} — 会话级 SSE（前端进入聊天后订阅）
2. GET /events?task_id=X — 任务级 SSE（保留兼容）
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from auth import UserContext, require_auth
from runtime import sse_bus, stream_registry


router = APIRouter(prefix="/events", tags=["events"])


@router.get("/session/{chat_session_id}")
async def subscribe_session_events(
    request: Request,
    chat_session_id: str,
    last_event_id: Optional[str] = None,
    user: UserContext = Depends(require_auth)
):
    """
    订阅会话级 Agent SSE 事件流

    前端进入聊天会话时订阅此端点，接收该会话中所有 agent 的实时输出。

    事件类型：
    - agent_start: Agent 开始响应
    - content_delta: 内容增量 (part_type: think/tool_call/tool_result/text/tool_args)
    - agent_done: Agent 完成
    - agent_error: Agent 错误
    - interruption: 需要用户审批
    """
    session_channel = f"session:{chat_session_id}"
    logger.info(f"Session SSE subscription: session={chat_session_id}, user={user.user_id}")

    async def event_generator():
        async for event in sse_bus.subscribe(session_channel, last_event_id):
            if await request.is_disconnected():
                logger.info(f"Session SSE client disconnected: session={chat_session_id}")
                break
            yield event

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        }
    )


@router.get("")
async def subscribe_events(
    request: Request,
    task_id: str,
    last_event_id: Optional[str] = None,
    user: UserContext = Depends(require_auth)
):
    """
    订阅任务级 SSE 事件流（保留兼容）
    """
    stream = stream_registry.get(task_id)

    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    if stream.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    logger.info(f"Task SSE subscription: stream={task_id}, user={user.user_id}")

    async def event_generator():
        async for event in sse_bus.subscribe(task_id, last_event_id):
            if await request.is_disconnected():
                logger.info(f"SSE client disconnected: stream={task_id}")
                break
            yield event

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        }
    )
