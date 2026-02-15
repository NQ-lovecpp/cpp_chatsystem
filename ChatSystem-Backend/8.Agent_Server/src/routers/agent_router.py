"""
Agent 用户和会话管理路由
"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from services.agent_user_service import agent_user_service, AgentUserConfig
from chat_agents.global_agent import global_conversation_service


router = APIRouter(tags=["agent"])


# ==================== Pydantic Models ====================

class AgentUserResponse(BaseModel):
    user_id: str
    nickname: str
    description: str
    model: str
    provider: str
    avatar_id: Optional[str] = None


class ConversationCreate(BaseModel):
    user_id: str
    title: Optional[str] = "新对话"


class ConversationUpdate(BaseModel):
    title: str


class ConversationResponse(BaseModel):
    conversation_id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str


class MessageResponse(BaseModel):
    message_id: str
    role: str
    content: str
    metadata: Optional[dict] = None
    created_at: Optional[str] = None


class AddAgentToSessionRequest(BaseModel):
    chat_session_id: str
    agent_user_id: str


# ==================== Agent 用户 API ====================

@router.get("/agents", response_model=List[AgentUserResponse])
async def list_agent_users():
    """列出所有可用的 Agent 用户"""
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


# ==================== Global Agent 会话 API ====================

@router.post("/global/conversations", response_model=ConversationResponse)
async def create_conversation(request: ConversationCreate):
    """创建新的 Global Agent 会话"""
    try:
        conv = await global_conversation_service.create_conversation(
            user_id=request.user_id,
            title=request.title or "新对话"
        )
        return ConversationResponse(
            conversation_id=conv.conversation_id,
            user_id=conv.user_id,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at
        )
    except Exception as e:
        logger.error(f"Failed to create conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/global/conversations", response_model=List[ConversationResponse])
async def list_conversations(user_id: str, limit: int = 50):
    """列出用户的 Global Agent 会话"""
    convs = await global_conversation_service.list_conversations(user_id, limit)
    return [
        ConversationResponse(
            conversation_id=c.conversation_id,
            user_id=c.user_id,
            title=c.title,
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in convs
    ]


@router.get("/global/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str):
    """获取 Global Agent 会话详情"""
    conv = await global_conversation_service.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationResponse(
        conversation_id=conv.conversation_id,
        user_id=conv.user_id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at
    )


@router.patch("/global/conversations/{conversation_id}")
async def update_conversation(conversation_id: str, request: ConversationUpdate):
    """更新会话标题"""
    success = await global_conversation_service.update_conversation_title(
        conversation_id,
        request.title
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update conversation")
    return {"success": True}


@router.delete("/global/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """删除会话"""
    success = await global_conversation_service.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete conversation")
    return {"success": True}


@router.get("/global/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(conversation_id: str, limit: int = 50):
    """获取会话消息"""
    messages = await global_conversation_service.get_messages(conversation_id, limit)
    return [
        MessageResponse(
            message_id=m.get("message_id", ""),
            role=m.get("role", "user"),
            content=m.get("content", ""),
            metadata=m.get("metadata"),
            created_at=m.get("created_at")
        )
        for m in messages
    ]


# ==================== 任务相关 API ====================

@router.get("/tasks/{task_id}/todos")
async def get_task_todos(task_id: str):
    """获取任务的 Todo 列表"""
    from runtime.dual_writer import dual_writer
    todos = await dual_writer.get_task_todos(task_id)
    return {"task_id": task_id, "todos": todos}


@router.get("/tasks/{task_id}/thought-chain")
async def get_task_thought_chain(task_id: str):
    """获取任务的思维链"""
    from runtime.dual_writer import dual_writer
    chain = await dual_writer.get_thought_chain(task_id)
    return {"task_id": task_id, "thought_chain": chain}
