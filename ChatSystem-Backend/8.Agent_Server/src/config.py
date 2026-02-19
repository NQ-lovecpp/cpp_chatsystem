"""
Agent Server 配置模块
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""
    # 服务配置
    app_name: str = "Agent Server"
    app_version: str = "0.1.0"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8080
    
    # OpenAI 配置
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    openai_base_url: Optional[str] = "https://api.openai.com/v1"
    openai_model: str = "o4-mini"
    
    # OpenRouter 配置
    openrouter_api_key: Optional[str] = os.getenv("OPENROUTER_API_KEY")
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "openai/gpt-5-mini"
    
    # 代理配置 (Clash)
    http_proxy: Optional[str] = None
    https_proxy: Optional[str] = None
    
    # 工具配置
    exa_api_key: Optional[str] = None
    docker_enabled: bool = True
    docker_timeout: int = 60
    docker_memory_limit: str = "512m"
    docker_cpu_limit: float = 1.0
    python_docker_image: str = "agent-python-executor"
    python_docker_timeout: int = 60
    
    # 安全配置
    require_approval_for_python: bool = True
    require_approval_for_write: bool = True
    
    # 网关配置
    gateway_url: str = "http://localhost:8500"
    
    # MySQL 数据库配置
    mysql_host: str = "127.0.0.1"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_database: str = "chen_im"
    mysql_pool_size: int = 5
    
    # Redis 缓存配置
    redis_host: str = "127.0.0.1"
    redis_port: int = 6379
    redis_password: Optional[str] = None
    redis_db: int = 0
    redis_context_ttl: int = 86400  # 上下文缓存 TTL（24小时）
    redis_task_ttl: int = 7200       # 任务缓存 TTL（2小时）
    
    # Agent 配置
    agent_context_limit: int = 50    # 上下文消息数量限制
    agent_o4_mini_user_id: str = "agent-o4-mini"
    agent_gpt_5_mini_user_id: str = "agent-gpt-5-mini"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


# 导出便捷访问
settings = get_settings()
