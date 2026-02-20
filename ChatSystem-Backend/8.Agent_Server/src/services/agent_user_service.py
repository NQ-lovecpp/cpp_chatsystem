"""
Agent User Service - Agent 用户管理服务

负责：
1. 确保 Agent 用户在数据库中存在
2. 获取 Agent 用户信息
3. 管理预定义的 Agent 用户配置
"""
import uuid
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from tools.db_tools import get_db_pool, execute_query


@dataclass
class AgentUserConfig:
    """Agent 用户配置"""
    user_id: str
    nickname: str
    description: str
    model: str
    provider: str  # 'openai' or 'openrouter'
    avatar_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "nickname": self.nickname,
            "description": self.description,
            "model": self.model,
            "provider": self.provider,
            "avatar_id": self.avatar_id
        }


# 预定义的 Agent 用户配置
PREDEFINED_AGENTS: List[AgentUserConfig] = [
    AgentUserConfig(
        user_id="agent-o4-mini",
        nickname="AI 助手 (O4-Mini)",
        description="基于 OpenAI O4-Mini 模型的智能助手，擅长快速响应和日常对话",
        model="o4-mini",
        provider="openai"
    ),
    AgentUserConfig(
        user_id="agent-gpt-5-mini",
        nickname="AI 助手 (GPT 5 Mini)",
        description="基于 OpenRouter GPT 5 Mini 模型的智能助手，具备强大的推理和创作能力",
        model="openai/gpt-5-mini",
        provider="openrouter"
    ),
    AgentUserConfig(
        user_id="agent-deepseek-r1-0528",
        nickname="AI 助手 (DeepSeek R1)",
        description="基于 OpenRouter DeepSeek R1-0528 的智能助手",
        model="deepseek/deepseek-r1-0528",
        provider="openrouter"
    ),
    AgentUserConfig(
        user_id="agent-claude-haiku-4-5",
        nickname="AI 助手 (Claude Haiku 4.5)",
        description="基于 OpenRouter Claude Haiku 4.5 的轻量助手",
        model="anthropic/claude-haiku-4.5",
        provider="openrouter"
    ),
    AgentUserConfig(
        user_id="agent-qwen3-5-397b-a17b",
        nickname="AI 助手 (Qwen3.5-397B-A17B)",
        description="基于 OpenRouter Qwen3.5-397B-A17B 的推理助手",
        model="qwen/qwen3.5-397b-a17b",
        provider="openrouter"
    ),
]


class AgentUserService:
    """
    Agent 用户服务
    
    管理 Agent 用户的创建、查询和配置
    """
    
    def __init__(self):
        self._initialized = False
        self._agent_cache: Dict[str, AgentUserConfig] = {}
    
    async def ensure_agent_users(self) -> bool:
        """
        确保所有预定义的 Agent 用户都存在于数据库中
        
        在服务启动时调用
        """
        if self._initialized:
            return True
        
        try:
            pool = await get_db_pool()
            
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    for agent in PREDEFINED_AGENTS:
                        # 检查用户是否存在
                        check_sql = "SELECT user_id FROM user WHERE user_id = %s"
                        await cursor.execute(check_sql, (agent.user_id,))
                        existing = await cursor.fetchone()
                        
                        if existing:
                            # 仅补充缺失配置，不强覆盖现有名称/描述/模型，避免覆盖数据库中的手工配置
                            update_sql = """
                                UPDATE user SET
                                    is_agent = 1,
                                    agent_model = COALESCE(agent_model, %s),
                                    agent_provider = COALESCE(agent_provider, %s),
                                    nickname = COALESCE(nickname, %s),
                                    description = COALESCE(description, %s)
                                WHERE user_id = %s
                            """
                            await cursor.execute(update_sql, (
                                agent.model,
                                agent.provider,
                                agent.nickname,
                                agent.description,
                                agent.user_id
                            ))
                            logger.info(f"Ensured existing agent user: {agent.user_id}")
                        else:
                            # 插入新用户
                            insert_sql = """
                                INSERT INTO user 
                                (user_id, nickname, description, is_agent, agent_model, agent_provider)
                                VALUES (%s, %s, %s, 1, %s, %s)
                            """
                            await cursor.execute(insert_sql, (
                                agent.user_id,
                                agent.nickname,
                                agent.description,
                                agent.model,
                                agent.provider
                            ))
                            logger.info(f"Created agent user: {agent.user_id}")
                    
                    await conn.commit()

            # 以数据库为准刷新缓存，支持多个模型/多个 agent 动态扩展
            rows = await execute_query(
                """
                SELECT user_id, nickname, description, agent_model, agent_provider
                FROM user
                WHERE is_agent = 1
                """,
                ()
            )
            self._agent_cache.clear()
            for row in rows:
                config = AgentUserConfig(
                    user_id=row['user_id'],
                    nickname=row.get('nickname') or row['user_id'],
                    description=row.get('description', '') or '',
                    model=row.get('agent_model', '') or '',
                    provider=row.get('agent_provider', 'openrouter') or 'openrouter'
                )
                self._agent_cache[config.user_id] = config
            
            self._initialized = True
            logger.info(f"Agent users initialized from DB: {len(self._agent_cache)} agents")
            return True
            
        except Exception as e:
            logger.error(f"Failed to ensure agent users: {e}")
            return False
    
    async def get_agent_user(self, agent_user_id: str) -> Optional[AgentUserConfig]:
        """获取 Agent 用户配置"""
        # 先检查缓存
        if agent_user_id in self._agent_cache:
            return self._agent_cache[agent_user_id]
        
        # 从数据库查询
        try:
            query = """
                SELECT user_id, nickname, description, agent_model, agent_provider
                FROM user
                WHERE user_id = %s AND is_agent = 1
            """
            rows = await execute_query(query, (agent_user_id,))
            
            if rows:
                row = rows[0]
                config = AgentUserConfig(
                    user_id=row['user_id'],
                    nickname=row['nickname'],
                    description=row.get('description', ''),
                    model=row.get('agent_model', ''),
                    provider=row.get('agent_provider', 'openrouter')
                )
                self._agent_cache[agent_user_id] = config
                return config
            
            return None
        except Exception as e:
            logger.error(f"Failed to get agent user: {e}")
            return None
    
    async def get_agent_by_model(self, model_name: str) -> Optional[AgentUserConfig]:
        """根据模型名称获取 Agent 用户"""
        # 先检查缓存
        for agent in self._agent_cache.values():
            if agent.model == model_name:
                return agent
        
        # 从预定义配置中查找
        for agent in PREDEFINED_AGENTS:
            if agent.model == model_name:
                return agent
        
        return None
    
    async def list_agent_users(self) -> List[AgentUserConfig]:
        """列出所有 Agent 用户"""
        # 确保已初始化
        await self.ensure_agent_users()
        
        try:
            query = """
                SELECT user_id, nickname, description, agent_model, agent_provider
                FROM user
                WHERE is_agent = 1
            """
            rows = await execute_query(query, ())
            
            agents = []
            for row in rows:
                config = AgentUserConfig(
                    user_id=row['user_id'],
                    nickname=row['nickname'],
                    description=row.get('description', ''),
                    model=row.get('agent_model', ''),
                    provider=row.get('agent_provider', 'openrouter')
                )
                agents.append(config)
                self._agent_cache[config.user_id] = config
            
            return agents
        except Exception as e:
            logger.error(f"Failed to list agent users: {e}")
            return list(PREDEFINED_AGENTS)
    
    def get_default_agent(self) -> AgentUserConfig:
        """获取默认 Agent 用户配置"""
        if self._agent_cache:
            # 优先 openrouter，其次任意可用 agent
            for agent in self._agent_cache.values():
                if agent.provider == "openrouter":
                    return agent
            return next(iter(self._agent_cache.values()))

        # 优先返回 OpenRouter 的 Agent
        for agent in PREDEFINED_AGENTS:
            if agent.provider == "openrouter":
                return agent
        return PREDEFINED_AGENTS[0]
    
    def get_provider_for_agent(self, agent_user_id: str):
        """获取 Agent 对应的模型提供者"""
        from providers import get_openai_provider, get_openrouter_provider
        
        agent = self._agent_cache.get(agent_user_id)
        if not agent and agent_user_id in {a.user_id for a in PREDEFINED_AGENTS}:
            for a in PREDEFINED_AGENTS:
                if a.user_id == agent_user_id:
                    agent = a
                    break
        
        if agent and agent.provider == "openai":
            return get_openai_provider()
        else:
            return get_openrouter_provider()
    
    async def add_agent_to_session(
        self,
        chat_session_id: str,
        agent_user_id: str
    ) -> bool:
        """将 Agent 用户添加到聊天会话"""
        try:
            pool = await get_db_pool()
            
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    # 检查是否已经是成员
                    check_sql = """
                        SELECT id FROM chat_session_member 
                        WHERE chat_session_id = %s AND user_id = %s
                    """
                    await cursor.execute(check_sql, (chat_session_id, agent_user_id))
                    existing = await cursor.fetchone()
                    
                    if existing:
                        logger.info(f"Agent {agent_user_id} already in session {chat_session_id}")
                        return True
                    
                    # 添加到会话成员
                    insert_sql = """
                        INSERT INTO chat_session_member (chat_session_id, user_id)
                        VALUES (%s, %s)
                    """
                    await cursor.execute(insert_sql, (chat_session_id, agent_user_id))
                    await conn.commit()
                    
                    logger.info(f"Added agent {agent_user_id} to session {chat_session_id}")
                    return True
        except Exception as e:
            logger.error(f"Failed to add agent to session: {e}")
            return False
    
    async def remove_agent_from_session(
        self,
        chat_session_id: str,
        agent_user_id: str
    ) -> bool:
        """将 Agent 用户从聊天会话中移除"""
        try:
            pool = await get_db_pool()
            
            async with pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    delete_sql = """
                        DELETE FROM chat_session_member 
                        WHERE chat_session_id = %s AND user_id = %s
                    """
                    await cursor.execute(delete_sql, (chat_session_id, agent_user_id))
                    await conn.commit()
                    
                    logger.info(f"Removed agent {agent_user_id} from session {chat_session_id}")
                    return True
        except Exception as e:
            logger.error(f"Failed to remove agent from session: {e}")
            return False


# 全局实例
agent_user_service = AgentUserService()
