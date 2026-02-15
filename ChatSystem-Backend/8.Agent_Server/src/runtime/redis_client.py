"""
Redis 客户端模块 - 提供 Redis 连接和基础操作
"""
import json
from typing import Optional, List, Dict, Any, Union
from datetime import timedelta
import redis.asyncio as redis
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings


# 全局 Redis 连接池
_redis_pool: Optional[redis.ConnectionPool] = None
_redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> redis.Redis:
    """获取 Redis 客户端单例"""
    global _redis_pool, _redis_client
    
    if _redis_client is None:
        _redis_pool = redis.ConnectionPool(
            host=settings.redis_host,
            port=settings.redis_port,
            password=settings.redis_password,
            db=settings.redis_db,
            decode_responses=True,
            max_connections=20,
        )
        _redis_client = redis.Redis(connection_pool=_redis_pool)
        logger.info(f"Redis client created: {settings.redis_host}:{settings.redis_port}")
    
    return _redis_client


async def close_redis_client():
    """关闭 Redis 连接"""
    global _redis_pool, _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
    if _redis_pool:
        await _redis_pool.disconnect()
        _redis_pool = None
        logger.info("Redis client closed")


class RedisKeys:
    """Redis 键名定义"""
    
    # 聊天上下文缓存：agent:context:{chat_session_id}
    @staticmethod
    def context(chat_session_id: str) -> str:
        return f"agent:context:{chat_session_id}"
    
    # 任务状态缓存：agent:task:{task_id}
    @staticmethod
    def task(task_id: str) -> str:
        return f"agent:task:{task_id}"
    
    # 任务事件历史：agent:task:events:{task_id}
    @staticmethod
    def task_events(task_id: str) -> str:
        return f"agent:task:events:{task_id}"
    
    # Global Agent 会话消息：agent:global:{user_id}:{conversation_id}
    @staticmethod
    def global_conversation(user_id: str, conversation_id: str) -> str:
        return f"agent:global:{user_id}:{conversation_id}"
    
    # 任务 Todo 列表：agent:task:todos:{task_id}
    @staticmethod
    def task_todos(task_id: str) -> str:
        return f"agent:task:todos:{task_id}"
    
    # 思维链缓存：agent:task:thought_chain:{task_id}
    @staticmethod
    def thought_chain(task_id: str) -> str:
        return f"agent:task:thought_chain:{task_id}"


class RedisCache:
    """Redis 缓存操作封装"""
    
    def __init__(self):
        self._client: Optional[redis.Redis] = None
    
    async def _get_client(self) -> redis.Redis:
        if self._client is None:
            self._client = await get_redis_client()
        return self._client
    
    # ==================== 通用操作 ====================
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """设置键值"""
        try:
            client = await self._get_client()
            if isinstance(value, (dict, list)):
                value = json.dumps(value, ensure_ascii=False)
            if ttl:
                await client.setex(key, ttl, value)
            else:
                await client.set(key, value)
            return True
        except Exception as e:
            logger.error(f"Redis SET failed: {key} -> {e}")
            return False
    
    async def get(self, key: str, parse_json: bool = False) -> Optional[Any]:
        """获取键值"""
        try:
            client = await self._get_client()
            value = await client.get(key)
            if value and parse_json:
                return json.loads(value)
            return value
        except Exception as e:
            logger.error(f"Redis GET failed: {key} -> {e}")
            return None
    
    async def delete(self, key: str) -> bool:
        """删除键"""
        try:
            client = await self._get_client()
            await client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE failed: {key} -> {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """检查键是否存在"""
        try:
            client = await self._get_client()
            return await client.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis EXISTS failed: {key} -> {e}")
            return False
    
    async def expire(self, key: str, ttl: int) -> bool:
        """设置过期时间"""
        try:
            client = await self._get_client()
            await client.expire(key, ttl)
            return True
        except Exception as e:
            logger.error(f"Redis EXPIRE failed: {key} -> {e}")
            return False
    
    # ==================== 列表操作 ====================
    
    async def lpush(self, key: str, *values: Any, ttl: Optional[int] = None) -> int:
        """从左侧插入列表"""
        try:
            client = await self._get_client()
            serialized = [json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v for v in values]
            result = await client.lpush(key, *serialized)
            if ttl:
                await client.expire(key, ttl)
            return result
        except Exception as e:
            logger.error(f"Redis LPUSH failed: {key} -> {e}")
            return 0
    
    async def rpush(self, key: str, *values: Any, ttl: Optional[int] = None) -> int:
        """从右侧插入列表"""
        try:
            client = await self._get_client()
            serialized = [json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v for v in values]
            result = await client.rpush(key, *serialized)
            if ttl:
                await client.expire(key, ttl)
            return result
        except Exception as e:
            logger.error(f"Redis RPUSH failed: {key} -> {e}")
            return 0
    
    async def lrange(self, key: str, start: int = 0, end: int = -1, parse_json: bool = True) -> List[Any]:
        """获取列表范围"""
        try:
            client = await self._get_client()
            values = await client.lrange(key, start, end)
            if parse_json:
                result = []
                for v in values:
                    try:
                        result.append(json.loads(v))
                    except:
                        result.append(v)
                return result
            return values
        except Exception as e:
            logger.error(f"Redis LRANGE failed: {key} -> {e}")
            return []
    
    async def llen(self, key: str) -> int:
        """获取列表长度"""
        try:
            client = await self._get_client()
            return await client.llen(key)
        except Exception as e:
            logger.error(f"Redis LLEN failed: {key} -> {e}")
            return 0
    
    async def ltrim(self, key: str, start: int, end: int) -> bool:
        """裁剪列表"""
        try:
            client = await self._get_client()
            await client.ltrim(key, start, end)
            return True
        except Exception as e:
            logger.error(f"Redis LTRIM failed: {key} -> {e}")
            return False
    
    # ==================== Hash 操作 ====================
    
    async def hset(self, key: str, mapping: Dict[str, Any], ttl: Optional[int] = None) -> bool:
        """设置 Hash"""
        try:
            client = await self._get_client()
            serialized = {k: json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else str(v) for k, v in mapping.items()}
            await client.hset(key, mapping=serialized)
            if ttl:
                await client.expire(key, ttl)
            return True
        except Exception as e:
            logger.error(f"Redis HSET failed: {key} -> {e}")
            return False
    
    async def hget(self, key: str, field: str, parse_json: bool = False) -> Optional[Any]:
        """获取 Hash 字段"""
        try:
            client = await self._get_client()
            value = await client.hget(key, field)
            if value and parse_json:
                try:
                    return json.loads(value)
                except:
                    return value
            return value
        except Exception as e:
            logger.error(f"Redis HGET failed: {key}.{field} -> {e}")
            return None
    
    async def hgetall(self, key: str, parse_json: bool = True) -> Dict[str, Any]:
        """获取 Hash 所有字段"""
        try:
            client = await self._get_client()
            values = await client.hgetall(key)
            if parse_json:
                result = {}
                for k, v in values.items():
                    try:
                        result[k] = json.loads(v)
                    except:
                        result[k] = v
                return result
            return values
        except Exception as e:
            logger.error(f"Redis HGETALL failed: {key} -> {e}")
            return {}


# 全局缓存实例
redis_cache = RedisCache()
