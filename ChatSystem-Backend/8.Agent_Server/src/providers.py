"""
Model Providers - OpenAI 和 OpenRouter 的模型提供者
"""
import os
from typing import Optional
from openai import AsyncOpenAI

from agents import (
    Model,
    ModelProvider,
    OpenAIChatCompletionsModel,
    OpenAIResponsesModel,
    set_tracing_disabled,
)

import sys
from pathlib import Path
src_dir = Path(__file__).parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings


# 禁用 tracing（不需要 platform.openai.com API key）
set_tracing_disabled(True)


class OpenRouterModelProvider(ModelProvider):
    """
    OpenRouter 模型提供者
    支持多种模型，如 openai/gpt-4o-mini, anthropic/claude-3, etc.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://openrouter.ai/api/v1/responses",
        default_model: str = "openai/gpt-oss-120b"
    ):
        self.api_key = api_key or settings.openrouter_api_key
        self.base_url = base_url
        self.default_model = default_model
        
        if not self.api_key:
            raise ValueError("OpenRouter API key is required")
        
        self.client = AsyncOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            default_headers={
                "HTTP-Referer": "https://github.com/chatsystem-agent",
                "X-Title": "ChatSystem Agent"
            }
        )
    
    def get_model(self, model_name: Optional[str] = None) -> Model:
        """获取模型实例"""
        model = model_name or self.default_model
        return OpenAIResponsesModel(
            model=model,
            openai_client=self.client
        )


class OpenAIModelProvider(ModelProvider):
    """
    OpenAI 原生模型提供者（可通过代理）
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        default_model: str = "o4-mini",
        use_proxy: bool = True
    ):
        self.api_key = api_key or settings.openai_api_key
        self.base_url = base_url or settings.openai_base_url
        self.default_model = default_model
        
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        # 配置代理
        http_client = None
        if use_proxy and (settings.http_proxy or settings.https_proxy):
            import httpx
            proxy = settings.https_proxy or settings.http_proxy
            http_client = httpx.AsyncClient(proxy=proxy)
        
        client_kwargs = {
            "api_key": self.api_key,
        }
        if self.base_url:
            client_kwargs["base_url"] = self.base_url
        if http_client:
            client_kwargs["http_client"] = http_client
        
        self.client = AsyncOpenAI(**client_kwargs)
    
    def get_model(self, model_name: Optional[str] = None) -> Model:
        """获取模型实例"""
        model = model_name or self.default_model
        return OpenAIResponsesModel(
            model=model,
            openai_client=self.client
        )


# 全局提供者实例（懒加载）
_openrouter_provider: Optional[OpenRouterModelProvider] = None
_openai_provider: Optional[OpenAIModelProvider] = None


def get_openrouter_provider() -> OpenRouterModelProvider:
    """获取 OpenRouter 提供者单例"""
    global _openrouter_provider
    if _openrouter_provider is None:
        _openrouter_provider = OpenRouterModelProvider(
            api_key=settings.openrouter_api_key,
            base_url=settings.openrouter_base_url,
            default_model=settings.openrouter_model
        )
    return _openrouter_provider


def get_openai_provider() -> OpenAIModelProvider:
    """获取 OpenAI 提供者单例"""
    global _openai_provider
    if _openai_provider is None:
        _openai_provider = OpenAIModelProvider(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            default_model=settings.openai_model
        )
    return _openai_provider


def get_default_provider() -> ModelProvider:
    """
    获取默认模型提供者
    优先使用 OpenRouter（更稳定），如果没有配置则使用 OpenAI
    """
    if settings.openrouter_api_key:
        return get_openrouter_provider()
    elif settings.openai_api_key:
        return get_openai_provider()
    else:
        raise ValueError("No API key configured. Please set OPENROUTER_API_KEY or OPENAI_API_KEY")
