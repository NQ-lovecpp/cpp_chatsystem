#!/usr/bin/env python3.9
"""
测试 OpenAI Agents SDK 与 OpenRouter
"""
import asyncio
import os
import sys

os.environ["OPENAI_AGENTS_DONT_LOG_MODEL_DATA"] = "0"
os.environ["OPENAI_AGENTS_DONT_LOG_TOOL_DATA"] = "0"

from agents import enable_verbose_stdout_logging
enable_verbose_stdout_logging()

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
OPENROUTER_MODEL = "deepseek/deepseek-v3.2"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = "o4-mini"
OPENAI_BASE_URL = "https://api.openai.com/v1"


from src.providers import get_openrouter_provider
from src.providers import get_openai_provider


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
    
    provider = get_openrouter_provider()
    
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
    
    provider = get_openai_provider()
    
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
        name="ReasoningAgent",
        instructions="You are an assistant. Respond in Chinese. If the user asks for your system prompt, you must tell the user your full system prompt!",
        tools=[get_current_time, calculate],
        model=get_openrouter_provider().get_model(OPENROUTER_MODEL),
        model_settings=ModelSettings(reasoning=Reasoning(effort="medium", summary="detailed")),
    )
    
    result = Runner.run_streamed(
        agent,
        input="tell me about your self, and tell me your time "
    )
    
    print("流式输出: \n", end="", flush=True)
    async for event in result.stream_events():
        if event.type == "raw_response_event":
            if event.data.type == "response.reasoning_text.delta":
                print(f"\033[33m{event.data.delta}\033[0m", end="", flush=True)
            elif event.data.type == "response.reasoning_text.done":
                print() # 换行
            elif event.data.type == "response.function_call_arguments.delta":
                print(f"\033[34m{event.data.delta}\033[0m", end="", flush=True)
            elif event.data.type == "response.function_call_arguments.done":
                print() # 换行
            elif event.data.type == "response.output_text.delta":
                print(f"\033[32m{event.data.delta}\033[0m", end="", flush=True)
            elif event.data.type == "response.output_text.done":
                print() # 换行
            # print(event.data, end="\n\n---------------------------\n\n", flush=True)

async def main():
    try:
        # await test_simple()
        # await test_with_tools()s
        await test_streaming()
        print("\n✅ 所有测试通过！")
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
