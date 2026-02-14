"""
MCP 工具配置模块

支持通过 MCP (Model Context Protocol) 调用外部工具服务。
MCP 工具可以与 function_tool 混合使用。

使用方式：
1. 配置 MCP 服务器 URL 和工具定义
2. 在 Agent 中使用 HostedMCPTool 包装
3. Agent 会自动调用 MCP 服务器执行工具

参考：
- https://platform.openai.com/docs/guides/tools-connectors-mcp
- examples/openai-agents-python-main/examples/hosted_mcp/
"""
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from loguru import logger

try:
    from agents import HostedMCPTool
except ImportError:
    logger.warning("HostedMCPTool not available, MCP tools will be disabled")
    HostedMCPTool = None

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings


@dataclass
class MCPServerConfig:
    """MCP 服务器配置"""
    server_label: str
    server_url: str
    require_approval: str = "never"  # "never", "always", or list of tools
    description: Optional[str] = None


# MCP 服务器配置
# 注意：这些 URL 需要在部署时配置正确的地址
MCP_SERVERS = {
    # Python 执行 MCP 服务器
    "python": MCPServerConfig(
        server_label="python_executor",
        server_url="http://localhost:8081/mcp/python",
        require_approval="always",  # Python 执行需要审批
        description="Execute Python code in isolated container"
    ),
    
    # 网页搜索 MCP 服务器 (使用 Exa)
    "browser": MCPServerConfig(
        server_label="browser",
        server_url="http://localhost:8082/mcp/browser",
        require_approval="never",
        description="Search and browse web pages"
    ),
    
    # Git MCP 服务器 (示例)
    "git": MCPServerConfig(
        server_label="gitmcp",
        server_url="https://gitmcp.io/openai/codex",
        require_approval="never",
        description="Access Git repositories"
    ),
}


def get_mcp_tool(server_key: str) -> Optional[Any]:
    """
    获取 MCP 工具实例
    
    Args:
        server_key: 服务器配置键名 (如 "python", "browser")
        
    Returns:
        HostedMCPTool 实例，如果不可用返回 None
    """
    if HostedMCPTool is None:
        logger.warning(f"HostedMCPTool not available, cannot create MCP tool for {server_key}")
        return None
        
    config = MCP_SERVERS.get(server_key)
    if not config:
        logger.warning(f"Unknown MCP server: {server_key}")
        return None
    
    return HostedMCPTool(
        tool_config={
            "type": "mcp",
            "server_label": config.server_label,
            "server_url": config.server_url,
            "require_approval": config.require_approval,
        }
    )


def get_all_mcp_tools() -> List[Any]:
    """获取所有可用的 MCP 工具"""
    tools = []
    for key in MCP_SERVERS:
        tool = get_mcp_tool(key)
        if tool:
            tools.append(tool)
    return tools


# MCP 与 function_tool 的混合使用工厂
def create_hybrid_tools(
    use_mcp_for_python: bool = False,
    use_mcp_for_browser: bool = False,
) -> List[Any]:
    """
    创建混合工具集
    
    可以选择特定工具使用 MCP 还是 function_tool。
    默认使用 function_tool（因为 MCP 服务器可能未部署）。
    
    Args:
        use_mcp_for_python: 是否使用 MCP 的 Python 执行工具
        use_mcp_for_browser: 是否使用 MCP 的浏览器工具
        
    Returns:
        工具列表
    """
    from .sdk_tools import (
        web_search, web_open, web_find,
        python_execute_with_approval
    )
    
    tools = []
    
    # Python 工具
    if use_mcp_for_python:
        mcp_python = get_mcp_tool("python")
        if mcp_python:
            tools.append(mcp_python)
        else:
            tools.append(python_execute_with_approval)
    else:
        tools.append(python_execute_with_approval)
    
    # 浏览器工具
    if use_mcp_for_browser:
        mcp_browser = get_mcp_tool("browser")
        if mcp_browser:
            tools.append(mcp_browser)
        else:
            tools.extend([web_search, web_open, web_find])
    else:
        tools.extend([web_search, web_open, web_find])
    
    return tools


# 导出
__all__ = [
    "MCPServerConfig",
    "MCP_SERVERS",
    "get_mcp_tool",
    "get_all_mcp_tools",
    "create_hybrid_tools",
]
