"""
Context Manager - 聊天上下文管理模块

负责：
1. 从 Redis 读取聊天上下文（优先）
2. 从 MySQL 加载聊天上下文（缓存 miss 时）
3. 格式化上下文为 LLM 可理解的格式
4. 管理上下文的缓存和失效
"""
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from runtime.redis_client import redis_cache, RedisKeys
from tools.db_tools import execute_query


class MessageType(Enum):
    """消息类型枚举"""
    TEXT = 0
    IMAGE = 1
    FILE = 2
    SPEECH = 3
    AGENT_RESPONSE = 100  # Agent 响应消息


@dataclass
class ContextMessage:
    """上下文消息数据结构"""
    message_id: str
    user_id: str
    nickname: str
    message_type: int
    content: str
    create_time: str
    is_agent: bool = False
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ContextMessage':
        return cls(**data)
    
    def to_llm_format(self) -> Dict[str, str]:
        """转换为 LLM 消息格式"""
        role = "assistant" if self.is_agent else "user"
        
        if self.message_type == MessageType.TEXT.value:
            content = self.content
        elif self.message_type == MessageType.IMAGE.value:
            content = "[图片消息]"
        elif self.message_type == MessageType.FILE.value:
            content = f"[文件消息: {self.content or '未知文件'}]"
        elif self.message_type == MessageType.SPEECH.value:
            content = "[语音消息]"
        elif self.message_type == MessageType.AGENT_RESPONSE.value:
            # Agent 响应消息，解析 JSON 内容
            try:
                data = json.loads(self.content)
                content = data.get('content', self.content)
            except:
                content = self.content
        else:
            content = f"[未知类型消息: {self.message_type}]"
        
        # 添加发送者信息（仅对用户消息）
        if not self.is_agent:
            formatted_content = f"[{self.nickname}]: {content}"
        else:
            formatted_content = content
        
        return {
            "role": role,
            "content": formatted_content
        }


class ContextManager:
    """
    聊天上下文管理器
    
    提供：
    - 从 Redis/MySQL 获取聊天上下文
    - 添加消息到上下文
    - 格式化上下文为 LLM 格式
    - 缓存管理
    """
    
    def __init__(self):
        self.cache = redis_cache
        self.context_ttl = settings.redis_context_ttl
        self.context_limit = 30  # 默认 30 条上下文
    
    async def get_context(
        self,
        chat_session_id: str,
        limit: Optional[int] = None,
        include_metadata: bool = False
    ) -> List[ContextMessage]:
        """
        获取聊天会话的上下文消息
        
        优先从 Redis 读取，缓存 miss 时从 MySQL 加载
        """
        limit = limit or self.context_limit
        cache_key = RedisKeys.context(chat_session_id)
        
        # 1. 尝试从 Redis 读取
        cached_messages = await self.cache.lrange(cache_key, 0, limit - 1)
        
        if cached_messages:
            logger.debug(f"Context cache hit: {chat_session_id}, {len(cached_messages)} messages")
            messages = [ContextMessage.from_dict(m) for m in cached_messages]
            # 刷新 TTL
            await self.cache.expire(cache_key, self.context_ttl)
            return messages
        
        # 2. 从 MySQL 加载
        logger.debug(f"Context cache miss: {chat_session_id}, loading from MySQL")
        messages = await self._load_from_mysql(chat_session_id, limit)
        
        # 3. 写入 Redis 缓存
        if messages:
            await self._cache_messages(chat_session_id, messages)
        
        return messages
    
    async def _load_from_mysql(
        self,
        chat_session_id: str,
        limit: int
    ) -> List[ContextMessage]:
        """从 MySQL 加载聊天历史"""
        try:
            query = """
                SELECT 
                    m.message_id,
                    m.user_id,
                    m.message_type,
                    m.content,
                    m.create_time,
                    m.file_name,
                    u.nickname,
                    COALESCE(u.is_agent, 0) as is_agent
                FROM message m
                LEFT JOIN user u ON m.user_id = u.user_id
                WHERE m.session_id = %s
                ORDER BY m.create_time DESC
                LIMIT %s
            """
            
            rows = await execute_query(query, (chat_session_id, limit))
            
            messages = []
            for row in reversed(rows):  # 反转，让最早的消息在前
                create_time = row.get('create_time')
                if isinstance(create_time, datetime):
                    create_time = create_time.isoformat()
                else:
                    create_time = str(create_time) if create_time else ""
                
                # 处理文件消息的内容
                content = row.get('content') or ""
                if row.get('message_type') == MessageType.FILE.value:
                    content = row.get('file_name') or content
                
                msg = ContextMessage(
                    message_id=row.get('message_id', ''),
                    user_id=row.get('user_id', ''),
                    nickname=row.get('nickname') or row.get('user_id', '未知用户'),
                    message_type=row.get('message_type', 0),
                    content=content,
                    create_time=create_time,
                    is_agent=bool(row.get('is_agent', 0))
                )
                messages.append(msg)
            
            logger.info(f"Loaded {len(messages)} messages from MySQL for session {chat_session_id}")
            return messages
            
        except Exception as e:
            logger.error(f"Failed to load context from MySQL: {e}")
            return []
    
    async def _cache_messages(
        self,
        chat_session_id: str,
        messages: List[ContextMessage]
    ):
        """将消息写入 Redis 缓存"""
        try:
            cache_key = RedisKeys.context(chat_session_id)
            
            # 清空旧缓存
            await self.cache.delete(cache_key)
            
            # 写入新消息
            if messages:
                message_dicts = [m.to_dict() for m in messages]
                await self.cache.rpush(cache_key, *message_dicts, ttl=self.context_ttl)
                logger.debug(f"Cached {len(messages)} messages for session {chat_session_id}")
        except Exception as e:
            logger.error(f"Failed to cache messages: {e}")
    
    async def add_message(
        self,
        chat_session_id: str,
        message: ContextMessage
    ) -> bool:
        """
        添加消息到上下文缓存
        
        注意：这只更新 Redis 缓存，MySQL 持久化由 DualWriter 处理
        """
        try:
            cache_key = RedisKeys.context(chat_session_id)
            
            # 添加到缓存末尾
            await self.cache.rpush(cache_key, message.to_dict(), ttl=self.context_ttl)
            
            # 如果超出限制，裁剪
            length = await self.cache.llen(cache_key)
            if length > self.context_limit:
                await self.cache.ltrim(cache_key, length - self.context_limit, -1)
            
            logger.debug(f"Added message to context cache: {chat_session_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to add message to context: {e}")
            return False
    
    async def invalidate_cache(self, chat_session_id: str) -> bool:
        """使缓存失效"""
        try:
            cache_key = RedisKeys.context(chat_session_id)
            await self.cache.delete(cache_key)
            logger.info(f"Invalidated context cache: {chat_session_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to invalidate cache: {e}")
            return False
    
    def format_for_llm(
        self,
        messages: List[ContextMessage],
        system_prompt: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """
        将上下文消息格式化为 LLM 消息格式
        
        返回 OpenAI 兼容的消息列表
        """
        result = []
        
        # 添加系统提示词（如果有）
        if system_prompt:
            result.append({
                "role": "system",
                "content": system_prompt
            })
        
        # 添加上下文消息
        for msg in messages:
            result.append(msg.to_llm_format())
        
        return result
    
    async def get_formatted_context(
        self,
        chat_session_id: str,
        system_prompt: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Dict[str, str]]:
        """
        获取并格式化上下文（便捷方法）
        """
        messages = await self.get_context(chat_session_id, limit)
        return self.format_for_llm(messages, system_prompt)


# 全局实例
context_manager = ContextManager()
