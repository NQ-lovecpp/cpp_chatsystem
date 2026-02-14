#!/usr/bin/env python3.9
"""
测试 OpenAI Agents SDK 与 OpenRouter
"""
import asyncio
import os
import sys

# 清除代理（如果要使用代理，手动设置）
# 注意：Clash 代理可能需要在终端中先运行 clashon
if 'http_proxy' in os.environ:
    del os.environ['http_proxy']
if 'https_proxy' in os.environ:
    del os.environ['https_proxy']
if 'HTTP_PROXY' in os.environ:
    del os.environ['HTTP_PROXY']
if 'HTTPS_PROXY' in os.environ:
    del os.environ['HTTPS_PROXY']

# 加载 .env
from dotenv import load_dotenv
load_dotenv()

from openai.types.shared import Reasoning
from openai import AsyncOpenAI
from agents import (
    Agent,
    Runner,
    RunConfig,
    ModelProvider,
    ModelSettings,
    OpenAIChatCompletionsModel,
    function_tool,
    set_tracing_disabled,
)

# 禁用 tracing
set_tracing_disabled(True)

# OpenRouter 配置
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-120b")

print(f"API Key: {OPENROUTER_API_KEY[:20]}..." if OPENROUTER_API_KEY else "No API key!")
print(f"Model: {OPENROUTER_MODEL}")


class OpenRouterProvider(ModelProvider):
    def __init__(self):
        self.client = AsyncOpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=OPENROUTER_API_KEY,
            default_headers={
                "HTTP-Referer": "https://github.com/test",
                "X-Title": "Test"
            }
        )
    
    def get_model(self, model_name=None):
        return OpenAIChatCompletionsModel(
            model=model_name or OPENROUTER_MODEL,
            openai_client=self.client
        )


@function_tool
def get_current_time() -> str:
    """获取当前时间"""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


@function_tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return f"计算结果: {expression} = {result}"
    except Exception as e:
        return f"计算错误: {e}"


async def test_simple():
    """测试简单对话"""
    print("\n=== 测试简单对话 ===")
    
    agent = Agent(
        name="TestAgent",
        instructions="你是一个友好的助手，用中文回复。",
    )
    
    provider = OpenRouterProvider()
    
    result = await Runner.run(
        agent,
        input="你好！请用一句话介绍你自己。",
        run_config=RunConfig(model_provider=provider)
    )
    
    print(f"回复: {result.final_output}")


async def test_with_tools():
    """测试工具调用"""
    print("\n=== 测试工具调用 ===")
    
    agent = Agent(
        name="ToolAgent",
        instructions="你是一个助手，可以获取时间和进行计算。请用中文回复。",
        tools=[get_current_time, calculate]
    )
    
    provider = OpenRouterProvider()
    
    result = await Runner.run(
        agent,
        input="现在几点了？另外帮我算一下 123 * 456 等于多少。",
        run_config=RunConfig(model_provider=provider)
    )
    
    print(f"回复: {result.final_output}")


async def test_streaming():
    """测试流式输出"""
    print("\n=== 测试流式输出 ===")
    
    from openai.types.responses import ResponseTextDeltaEvent
    
    agent = Agent(
        name="StreamAgent",
        instructions="你是一个助手，用中文回复。",
        model_settings=ModelSettings(
            reasoning=Reasoning(effort="high", summary="detailed"),
        ),
    )
    
    provider = OpenRouterProvider()
    
    result = Runner.run_streamed(
        agent,
        input="请讲一个简短的笑话。",
        run_config=RunConfig(model_provider=provider)
    )
    
    print("流式输出: \n", end="", flush=True)
    async for event in result.stream_events():
        if event.type == "raw_response_event":
            if event.data.type == "response.reasoning_text.delta":
                print(f"\033[33m{event.data.delta}\033[0m", end="", flush=True)
            elif event.data.type == "response.output_text.delta":
                print(f"\033[32m{event.data.delta}\033[0m", end="", flush=True)
    print()  # 换行


async def main():
    try:
        await test_simple()
        await test_with_tools()
        await test_streaming()
        print("\n✅ 所有测试通过！")
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
