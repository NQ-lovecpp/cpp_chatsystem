"""
会话 Agent - 使用 OpenAI Agents SDK 实现
支持工具调用、流式输出、SSE 事件推送
"""
import asyncio
from typing import Optional, AsyncIterator, Any
from loguru import logger

from agents import (
    Agent,
    Runner,
    RunConfig,
    ItemHelpers,
    AgentHooks,
    AgentHookContext,
    RunContextWrapper,
    Tool,
)
from openai.types.responses import ResponseTextDeltaEvent

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from runtime import sse_bus, task_manager, Task, TaskStatus
from providers import get_default_provider, get_openrouter_provider

# 延迟导入 SDK 工具
def _get_sdk_tools():
    from tools.sdk_tools import web_search, web_open, web_find, python_execute, SAFE_TOOLS
    return web_search, web_open, web_find, python_execute, SAFE_TOOLS


# Agent 系统提示词
SESSION_AGENT_SYSTEM_PROMPT = """你是一个智能助手，帮助用户完成会话内的各种任务。

你可以使用以下工具：
1. web_search(query, topn) - 搜索网页信息，获取最新资讯
2. web_open(url_or_id, start_line) - 打开链接或滚动浏览页面
3. web_find(pattern) - 在页面中查找特定文本
4. python_execute(code) - 执行 Python 代码进行计算或数据处理

使用工具时的注意事项：
- 如果用户询问需要最新信息的问题，优先使用 web_search
- 需要数学计算或数据处理时，使用 python_execute
- 回答问题时，引用工具结果并标注信息来源
- 保持回答简洁、准确、有帮助

请用中文回复用户。
"""


class SessionAgentHooks(AgentHooks):
    """
    Agent 生命周期钩子
    用于在工具调用时发送 SSE 事件
    """
    
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.event_counter = 0
    
    async def on_start(self, context: AgentHookContext, agent: Agent) -> None:
        """Agent 开始执行"""
        self.event_counter += 1
        logger.info(f"[{self.task_id}] Agent {agent.name} started")
        await sse_bus.publish(self.task_id, "reasoning_delta", {
            "content": "正在分析您的请求..."
        })
    
    async def on_end(self, context: RunContextWrapper, agent: Agent, output: Any) -> None:
        """Agent 执行结束"""
        self.event_counter += 1
        logger.info(f"[{self.task_id}] Agent {agent.name} ended")
    
    async def on_tool_start(self, context: RunContextWrapper, agent: Agent, tool: Tool) -> None:
        """工具开始执行"""
        self.event_counter += 1
        logger.info(f"[{self.task_id}] Tool {tool.name} started")
        await sse_bus.publish(self.task_id, "tool_call", {
            "tool_name": tool.name,
            "status": "executing"
        })
    
    async def on_tool_end(
        self, context: RunContextWrapper, agent: Agent, tool: Tool, result: str
    ) -> None:
        """工具执行结束"""
        self.event_counter += 1
        logger.info(f"[{self.task_id}] Tool {tool.name} ended")
        await sse_bus.publish(self.task_id, "tool_output", {
            "tool_name": tool.name,
            "result_preview": result[:500] if len(result) > 500 else result,
            "status": "completed"
        })


def create_session_agent(task_id: str) -> Agent:
    """
    创建会话 Agent 实例
    """
    # 延迟获取工具
    web_search, web_open, web_find, python_execute, SAFE_TOOLS = _get_sdk_tools()
    
    return Agent(
        name="SessionAgent",
        instructions=SESSION_AGENT_SYSTEM_PROMPT,
        tools=SAFE_TOOLS,  # 使用安全工具（不包含需要审批的）
        hooks=SessionAgentHooks(task_id),
    )


async def run_session_agent(task: Task) -> AsyncIterator[dict]:
    """
    运行会话 Agent（流式）
    
    使用 OpenAI Agents SDK 的 Runner.run_streamed
    实时推送事件到 SSE
    """
    task_id = task.id
    user_id = task.user_id
    
    logger.info(f"Starting session agent for task {task_id}")
    
    try:
        # 更新状态为运行中
        await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
        
        # 创建 Agent
        agent = create_session_agent(task_id)
        
        # 获取模型提供者
        provider = get_default_provider()
        
        # 运行流式 Agent
        run_config = RunConfig(model_provider=provider)
        result = Runner.run_streamed(
            agent,
            input=task.input_text,
            run_config=run_config
        )
        
        # 收集完整响应
        full_response = ""
        
        # 处理流式事件
        async for event in result.stream_events():
            # 处理文本增量
            if event.type == "raw_response_event":
                if isinstance(event.data, ResponseTextDeltaEvent):
                    delta = event.data.delta
                    if delta:
                        full_response += delta
                        # 发送消息增量
                        await sse_bus.publish(task_id, "message", {
                            "content": delta,
                            "delta": True
                        })
                        yield {"type": "message_delta", "content": delta}
            
            # 处理 run_item 事件
            elif event.type == "run_item_stream_event":
                if event.item.type == "tool_call_item":
                    tool_name = getattr(event.item.raw_item, 'name', 'unknown')
                    logger.info(f"Tool called: {tool_name}")
                    # tool_call 事件已经在 hooks 中发送
                    
                elif event.item.type == "tool_call_output_item":
                    output = event.item.output
                    logger.info(f"Tool output received: {output[:100]}...")
                    # tool_output 事件已经在 hooks 中发送
                    
                elif event.item.type == "message_output_item":
                    message = ItemHelpers.text_message_output(event.item)
                    if message and message != full_response:
                        # 这是最终消息
                        pass
            
            # Agent 更新事件
            elif event.type == "agent_updated_stream_event":
                logger.info(f"Agent updated: {event.new_agent.name}")
        
        # 流结束后，full_response 就是最终结果
        final_text = full_response.strip() if full_response else "任务完成"
        
        # 更新任务状态
        await task_manager.update_task_status(
            task_id,
            TaskStatus.DONE,
            result=final_text
        )
        
        # 发送完成事件
        await sse_bus.publish(task_id, "done", {
            "final_text": final_text
        })
        
        yield {"type": "done", "result": final_text}
        
    except Exception as e:
        logger.error(f"Session agent error: {e}", exc_info=True)
        
        # 更新任务状态为失败
        await task_manager.update_task_status(
            task_id,
            TaskStatus.FAILED,
            error=str(e)
        )
        
        # 发送错误事件
        await sse_bus.publish(task_id, "error", {
            "message": str(e)
        })
        
        yield {"type": "error", "error": str(e)}


async def run_session_agent_simple(input_text: str, task_id: str = "test") -> str:
    """
    简单运行 Agent（非流式，用于测试）
    """
    agent = create_session_agent(task_id)
    provider = get_default_provider()
    
    result = await Runner.run(
        agent,
        input=input_text,
        run_config=RunConfig(model_provider=provider)
    )
    
    return result.final_output


# Agent 配置（用于导出）
session_agent = {
    "name": "session_agent",
    "instructions": SESSION_AGENT_SYSTEM_PROMPT,
    "model": settings.openrouter_model,
    "tools": ["web_search", "web_open", "web_find", "python_execute"]
}
