"""
Agent 用户管理 + Webhook 路由

- GET /agents — 列出可用 Agent（供 @mention 下拉框）
- POST /agents/add-to-session — 添加 Agent 到聊天会话
- POST /webhook/message — C++ 网关 @mention 路由入口
"""
import re
from typing import Optional, List
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from services.agent_user_service import agent_user_service, AgentUserConfig
from runtime import stream_registry, sse_bus
from chat_agents import run_session_agent


router = APIRouter(tags=["agent"])


# ==================== Pydantic Models ====================

class AgentUserResponse(BaseModel):
    user_id: str
    nickname: str
    description: str
    model: str
    provider: str
    avatar_id: Optional[str] = None


class AddAgentToSessionRequest(BaseModel):
    chat_session_id: str
    agent_user_id: str


class WebhookMessageRequest(BaseModel):
    """C++ 网关 webhook 请求体"""
    chat_session_id: str
    message_id: str
    sender_user_id: str
    agent_user_id: str
    content: str


# @mention 格式: @[display_name]{agent_user_id}
MENTION_PATTERN = re.compile(r'@\[([^\]]+)\]\{([^}]+)\}')


def strip_mentions(content: str) -> str:
    """移除 @mention 标签，保留可读文本"""
    return MENTION_PATTERN.sub(r'@\1', content).strip()


# ==================== Agent 用户 API ====================

@router.get("/agents", response_model=List[AgentUserResponse])
async def list_agent_users():
    """列出所有可用的 Agent 用户（供 @mention 下拉框和会话成员管理）"""
    agents = await agent_user_service.list_agent_users()
    return [
        AgentUserResponse(
            user_id=a.user_id,
            nickname=a.nickname,
            description=a.description,
            model=a.model,
            provider=a.provider,
            avatar_id=a.avatar_id
        )
        for a in agents
    ]


@router.get("/agents/{agent_user_id}", response_model=AgentUserResponse)
async def get_agent_user(agent_user_id: str):
    """获取 Agent 用户信息"""
    agent = await agent_user_service.get_agent_user(agent_user_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent user not found")
    return AgentUserResponse(
        user_id=agent.user_id,
        nickname=agent.nickname,
        description=agent.description,
        model=agent.model,
        provider=agent.provider,
        avatar_id=agent.avatar_id
    )


@router.post("/agents/add-to-session")
async def add_agent_to_session(request: AddAgentToSessionRequest):
    """将 Agent 用户添加到聊天会话"""
    success = await agent_user_service.add_agent_to_session(
        request.chat_session_id,
        request.agent_user_id
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to add agent to session")
    return {"success": True, "message": "Agent added to session"}


@router.post("/agents/remove-from-session")
async def remove_agent_from_session(request: AddAgentToSessionRequest):
    """将 Agent 用户从聊天会话中移除"""
    success = await agent_user_service.remove_agent_from_session(
        request.chat_session_id,
        request.agent_user_id
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to remove agent from session")
    return {"success": True, "message": "Agent removed from session"}


# ==================== Webhook — C++ 网关 @mention 路由 ====================

async def _execute_webhook_stream(stream, agent_user_id: str):
    """后台执行 webhook 触发的 agent 流"""
    try:
        async for _ in run_session_agent(
            stream,
            agent_user_id=agent_user_id,
            use_approval=True
        ):
            pass
    except Exception as e:
        logger.error(f"Webhook stream execution error: {e}")
        session_channel = f"session:{stream.chat_session_id}"
        await sse_bus.publish(session_channel, "agent_error", {"error": str(e)})


@router.post("/webhook/message")
async def webhook_new_message(
    request: WebhookMessageRequest,
    background_tasks: BackgroundTasks
):
    """
    C++ 网关 webhook 入口

    当网关检测到消息中有 @[AgentName]{agent-xxx} 标签时，
    POST 到此端点触发 Agent 处理。

    Request body:
    - chat_session_id: 聊天会话 ID
    - message_id: 触发消息的 ID
    - sender_user_id: 发送者用户 ID
    - agent_user_id: 被 @mention 的 Agent 用户 ID
    - content: 消息内容（含 @mention 标签）
    """
    logger.info(
        f"Webhook received: session={request.chat_session_id}, "
        f"sender={request.sender_user_id}, agent={request.agent_user_id}"
    )

    # 验证 agent 存在
    agent = await agent_user_service.get_agent_user(request.agent_user_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent user not found: {request.agent_user_id}")

    # 清理 @mention 标签得到实际输入
    input_text = strip_mentions(request.content)
    if not input_text:
        input_text = request.content

    # 创建 stream
    stream = stream_registry.create(
        user_id=request.sender_user_id,
        input_text=input_text,
        stream_type="session",
        chat_session_id=request.chat_session_id,
    )

    logger.info(f"Webhook stream created: {stream.id} for agent {request.agent_user_id}")

    # 后台执行
    background_tasks.add_task(_execute_webhook_stream, stream, request.agent_user_id)

    return {
        "success": True,
        "stream_id": stream.id,
        "agent_user_id": request.agent_user_id,
    }
