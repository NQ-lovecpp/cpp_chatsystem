"""
事件 API - SSE 事件订阅与历史推理数据查询
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
from runtime import sse_bus, stream_registry, dual_writer


router = APIRouter(prefix="/events", tags=["events"])


@router.get("")
async def subscribe_events(
    request: Request,
    task_id: str,
    last_event_id: Optional[str] = None,
    user: UserContext = Depends(require_auth)
):
    """
    订阅 Agent 流的 SSE 事件流

    事件类型：
    - init: 初始化连接
    - reasoning_delta: 思考过程增量
    - thought_chain: 思维链节点创建
    - thought_chain_update: 思维链节点更新
    - tool_call: 工具调用
    - tool_output: 工具输出
    - tool_args_delta: 工具参数流式
    - interruption: 需要审批
    - message: 消息内容（流式增量）
    - todo_added: 添加待办
    - todo_status: 待办状态更新
    - todo_progress: 待办进度
    - done: 流完成
    - error: 错误
    """
    stream = stream_registry.get(task_id)

    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    if stream.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    logger.info(f"SSE subscription: stream={task_id}, user={user.user_id}")

    async def event_generator():
        async for event in sse_bus.subscribe(task_id, last_event_id):
            if await request.is_disconnected():
                logger.info(f"SSE client disconnected: stream={task_id}")
                break
            yield event

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


def _todo_to_frontend(todo) -> dict:
    """将 DB 格式 TodoItem 转换为前端兼容格式（与 SSE 事件 todo_added 一致）"""
    db_to_fe_status = {
        "pending": "idle",
        "in_progress": "running",
        "completed": "completed",
        "cancelled": "failed",
    }
    d = todo.to_dict() if hasattr(todo, 'to_dict') else todo
    return {
        "id": d.get("todo_id", d.get("id", "")),
        "text": d.get("content", d.get("text", "")),
        "status": db_to_fe_status.get(d.get("status", "pending"), "idle"),
    }


def _chain_node_to_frontend(node) -> dict:
    """将 ThoughtChainNode 转换为前端兼容格式（metadata 保持 dict）"""
    d = {
        "chain_id": node.chain_id,
        "node_type": node.node_type,
        "title": node.title,
        "description": node.description,
        "content": node.content,
        "status": node.status,
        "sequence": node.sequence,
        "parent_id": node.parent_id,
    }
    return d


@router.get("/history/{task_id}")
async def get_reasoning_history(
    task_id: str,
    user: UserContext = Depends(require_auth)
):
    """
    获取 stream 的推理历史（思维链 + Todo）
    用于前端点击「正在思考 >」时加载历史数据（已完成的流）

    返回格式与 SSE 事件保持一致，方便前端直接复用 TaskThoughtChain / TaskTodoList 组件：
    - thought_chain nodes: {chain_id, node_type, title, description, content, status, sequence}
    - todos: {id, text, status}  ← 与 todo_added SSE 事件格式相同
    """
    # 优先从注册表验证用户权限（仍在运行的 stream）
    stream = stream_registry.get(task_id)
    if stream:
        if stream.user_id != user.user_id:
            raise HTTPException(status_code=403, detail="Access denied")
    # 若不在注册表中（服务重启后），仍尝试从 DB 加载（不做权限校验，前端通过 session_id 控制访问）

    thought_chain = await dual_writer.get_thought_chain(task_id)
    todos = await dual_writer.get_stream_todos(task_id)

    if not thought_chain and not todos and not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    return {
        "stream_id": task_id,
        "thought_chain": [_chain_node_to_frontend(n) for n in thought_chain],
        "todos": [_todo_to_frontend(t) for t in todos],
    }
