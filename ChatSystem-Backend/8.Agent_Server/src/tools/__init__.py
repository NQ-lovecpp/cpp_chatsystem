"""
工具模块 - 提供 Agent 可调用的工具

工具分类：
1. function_tool: 本地函数工具（SDK 封装）
2. MCP tools: 通过 MCP 协议调用的远程工具
3. Database tools: 数据库查询工具
"""
from .browser_tools import (
    BrowserTools,
    get_browser,
    clear_browser,
    SearchResult,
    PageContent
)

from .python_tools import (
    PythonExecutor,
    get_python_executor,
    execute_python,
    ExecutionResult,
    PREINSTALLED_PACKAGES
)

from .db_tools import (
    DB_TOOLS,
    DB_TOOL_MAP,
    get_chat_history,
    get_session_members,
    get_user_info,
    search_messages,
    get_user_sessions,
    get_db_pool,
    close_db_pool,
)

from .mcp_tools import (
    MCPServerConfig,
    MCP_SERVERS,
    get_mcp_tool,
    get_all_mcp_tools,
    create_hybrid_tools,
)

__all__ = [
    # Browser tools (底层实现)
    "BrowserTools",
    "get_browser", 
    "clear_browser",
    "SearchResult",
    "PageContent",
    
    # Python tools (底层实现)
    "PythonExecutor",
    "get_python_executor",
    "execute_python",
    "ExecutionResult",
    "PREINSTALLED_PACKAGES",
    
    # Database tools
    "DB_TOOLS",
    "DB_TOOL_MAP",
    "get_chat_history",
    "get_session_members",
    "get_user_info",
    "search_messages",
    "get_user_sessions",
    "get_db_pool",
    "close_db_pool",
    
    # MCP tools
    "MCPServerConfig",
    "MCP_SERVERS",
    "get_mcp_tool",
    "get_all_mcp_tools",
    "create_hybrid_tools",
]

# SDK 工具需要延迟导入以避免循环依赖
def get_sdk_tools():
    """获取 SDK 工具（延迟导入）"""
    from .sdk_tools import (
        web_search,
        web_open,
        web_find,
        python_execute,
        python_execute_with_approval,
        ALL_TOOLS,
        SAFE_TOOLS,
        APPROVAL_REQUIRED_TOOLS,
        ALL_TOOLS_WITH_APPROVAL,
        set_tool_context,
        current_task_id,
        current_user_id
    )
    return {
        "web_search": web_search,
        "web_open": web_open,
        "web_find": web_find,
        "python_execute": python_execute,
        "python_execute_with_approval": python_execute_with_approval,
        "ALL_TOOLS": ALL_TOOLS,
        "SAFE_TOOLS": SAFE_TOOLS,
        "APPROVAL_REQUIRED_TOOLS": APPROVAL_REQUIRED_TOOLS,
        "ALL_TOOLS_WITH_APPROVAL": ALL_TOOLS_WITH_APPROVAL,
        "set_tool_context": set_tool_context,
        "current_task_id": current_task_id,
        "current_user_id": current_user_id
    }
