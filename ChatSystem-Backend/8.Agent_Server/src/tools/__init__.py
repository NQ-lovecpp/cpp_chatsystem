"""
工具模块 - 提供 Agent 可调用的工具
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
