"""
Chat Agent 模块 - 使用 OpenAI Agents SDK

Agent 类型：
1. SessionAgent - 聊天会话中的 AI 成员，用户通过 @ 触发
2. GlobalAgent - 用户的私人助手，从左侧边栏访问
"""
from .session_agent import (
    get_session_agent_config,
    run_session_agent,
    run_session_agent_simple,
    create_session_agents,
)
create_session_agent = create_session_agents  # 兼容别名

from .global_agent import (
    get_global_agent_config,
    run_global_agent,
    create_global_agent,
)

__all__ = [
    # Session Agent
    "get_session_agent_config", "run_session_agent", "run_session_agent_simple",
    "create_session_agent", "create_session_agents",

    # Global Agent
    "get_global_agent_config", "run_global_agent", "create_global_agent",
]
