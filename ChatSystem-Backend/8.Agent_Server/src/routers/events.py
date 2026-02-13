"""
事件 API - SSE 事件订阅
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
from runtime import sse_bus, task_manager


router = APIRouter(prefix="/events", tags=["events"])


@router.get("")
async def subscribe_events(
    request: Request,
    task_id: str,
    last_event_id: Optional[str] = None,
    user: UserContext = Depends(require_auth)
):
    """
    订阅任务的 SSE 事件流
    
    事件类型：
    - init: 初始化连接
    - reasoning_delta: 思考过程增量
    - tool_call: 工具调用
    - tool_output: 工具输出
    - interruption: 需要审批
    - message: 消息内容
    - todo_added: 添加待办
    - todo_status: 待办状态更新
    - done: 任务完成
    - error: 错误
    """
    # 验证任务存在
    task = await task_manager.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # 检查权限
    if task.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    logger.info(f"SSE subscription: task={task_id}, user={user.user_id}")
    
    async def event_generator():
        async for event in sse_bus.subscribe(task_id, last_event_id):
            # 检查客户端是否断开
            if await request.is_disconnected():
                logger.info(f"SSE client disconnected: task={task_id}")
                break
            yield event
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 禁用 nginx 缓冲
        }
    )


@router.get("/history/{task_id}")
async def get_event_history(
    task_id: str,
    user: UserContext = Depends(require_auth)
):
    """
    获取任务的事件历史
    用于断线重连后恢复状态
    """
    task = await task_manager.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    history = sse_bus.get_history(task_id)
    
    return {
        "task_id": task_id,
        "events": history,
        "count": len(history)
    }
