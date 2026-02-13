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
    openai_api_key: Optional[str] = None
    openai_base_url: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    
    # OpenRouter 配置 (可选)
    openrouter_api_key: Optional[str] = None
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    
    # 工具配置
    exa_api_key: Optional[str] = None
    docker_enabled: bool = True
    docker_timeout: int = 30
    docker_memory_limit: str = "512m"
    docker_cpu_limit: float = 1.0
    
    # 安全配置
    require_approval_for_python: bool = True
    require_approval_for_write: bool = True
    
    # 网关配置
    gateway_url: str = "http://localhost:8500"
    
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
