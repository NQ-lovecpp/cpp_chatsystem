"""
Chat Agent 模块 - 使用 OpenAI Agents SDK
支持工具调用、审批流程、审计日志、任务派生
"""
from .session_agent import session_agent, run_session_agent, run_session_agent_simple
from .global_agent import global_agent, run_global_agent
from .task_agent import task_agent_config, run_task_agent, create_task_agent

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
    # Session Agent
    "session_agent", "run_session_agent", "run_session_agent_simple",
    # Global Agent
    "global_agent", "run_global_agent",
    # Task Agent
    "task_agent_config", "run_task_agent", "create_task_agent",
    # Tool executor
    "get_tool_definitions", "get_tool_by_name", "TOOL_DEFINITIONS",
    "execute_tool", "execute_tool_with_approval", "execute_tool_with_audit",
    "requires_approval", "get_approval_reason",
    "log_audit_entry", "get_audit_logs",
]
