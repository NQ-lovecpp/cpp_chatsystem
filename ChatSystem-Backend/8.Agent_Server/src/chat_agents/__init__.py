"""
Chat Agent 模块 - 使用 OpenAI Agents SDK
"""
from .session_agent import session_agent, run_session_agent, run_session_agent_simple
from .global_agent import global_agent, run_global_agent

# 保留旧的 tool_executor 用于兼容
from .tool_executor import (
    get_tool_definitions, 
    get_tool_by_name,
    TOOL_DEFINITIONS
)

__all__ = [
    "session_agent", "run_session_agent", "run_session_agent_simple",
    "global_agent", "run_global_agent",
    "get_tool_definitions", "get_tool_by_name", "TOOL_DEFINITIONS"
]
