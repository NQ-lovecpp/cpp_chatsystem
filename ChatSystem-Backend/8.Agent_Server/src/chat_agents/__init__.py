"""
Chat Agent 模块 - 使用 OpenAI Agents SDK
支持工具调用、审批流程、审计日志、任务派生

Agent 类型：
1. SessionAgent - 聊天会话中的 AI 成员，用户通过 @ 触发
2. GlobalAgent - 用户的私人助手，从左侧边栏访问
3. TaskAgent - 后台任务执行者，由其他 Agent 派生或用户直接创建
"""
from .session_agent import (
    get_session_agent_config,
    run_session_agent,
    run_session_agent_simple,
    create_session_agent,
)
from .global_agent import (
    get_global_agent_config,
    run_global_agent,
    create_global_agent,
)
from .task_agent import (
    get_task_agent_config,
    run_task_agent,
    create_task_agent,
)

# 兼容别名
session_agent_config = get_session_agent_config
global_agent_config = get_global_agent_config
task_agent_config = get_task_agent_config

# 工具执行器
from .tool_executor import (
    get_tool_definitions, 
    get_tool_by_name,
    TOOL_DEFINITIONS,
    execute_tool,
    execute_tool_with_approval,
    execute_tool_with_audit,
    requires_approval,
    get_approval_reason,
    log_audit_entry,
    get_audit_logs,
)

__all__ = [
    # Session Agent (聊天会话中的 AI 成员)
    "session_agent_config", "run_session_agent", "run_session_agent_simple",
    "create_session_agent",
    
    # Global Agent (用户的私人助手)
    "global_agent_config", "run_global_agent", "create_global_agent",
    
    # Task Agent (后台任务执行者)
    "task_agent_config", "run_task_agent", "create_task_agent",
    
    # Tool executor
    "get_tool_definitions", "get_tool_by_name", "TOOL_DEFINITIONS",
    "execute_tool", "execute_tool_with_approval", "execute_tool_with_audit",
    "requires_approval", "get_approval_reason",
    "log_audit_entry", "get_audit_logs",
]
