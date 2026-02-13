"""
工具执行器 - 负责执行 Agent 调用的工具
"""
import json
from typing import Any, Dict, Optional
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from tools import get_browser, execute_python, get_python_executor
from runtime import sse_bus


# 工具定义（供 Agent 使用）
TOOL_DEFINITIONS = [
    {
        "name": "web_search",
        "description": "搜索网页信息。返回搜索结果列表，每个结果包含标题、URL 和摘要。",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "搜索关键词"
                },
                "topn": {
                    "type": "integer",
                    "description": "返回结果数量，默认 10",
                    "default": 10
                }
            },
            "required": ["query"]
        },
        "requires_approval": False
    },
    {
        "name": "web_open",
        "description": "打开搜索结果中的链接或直接打开 URL。可以指定从第几行开始显示。",
        "parameters": {
            "type": "object",
            "properties": {
                "id_or_url": {
                    "type": ["integer", "string"],
                    "description": "链接 ID（来自搜索结果）或完整 URL"
                },
                "cursor": {
                    "type": "integer",
                    "description": "页面 cursor，-1 表示当前页面",
                    "default": -1
                },
                "loc": {
                    "type": "integer",
                    "description": "起始行号",
                    "default": 0
                },
                "num_lines": {
                    "type": "integer",
                    "description": "显示行数，-1 表示默认",
                    "default": -1
                }
            },
            "required": []
        },
        "requires_approval": False
    },
    {
        "name": "web_find",
        "description": "在当前页面中查找文本（大小写不敏感）",
        "parameters": {
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "查找模式"
                },
                "cursor": {
                    "type": "integer",
                    "description": "页面 cursor，-1 表示当前页面",
                    "default": -1
                }
            },
            "required": ["pattern"]
        },
        "requires_approval": False
    },
    {
        "name": "python_execute",
        "description": """在隔离的 Docker 容器中执行 Python 代码。
预装的库: numpy, pandas, scipy, sympy, matplotlib, requests, beautifulsoup4, lxml, pyyaml
注意: 使用 print() 输出结果，代码是无状态的，每次执行都是独立的。""",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "要执行的 Python 代码"
                }
            },
            "required": ["code"]
        },
        "requires_approval": True  # Python 执行需要审批
    }
]


def get_tool_definitions() -> list:
    """获取工具定义列表"""
    return TOOL_DEFINITIONS


def get_tool_by_name(name: str) -> Optional[dict]:
    """根据名称获取工具定义"""
    for tool in TOOL_DEFINITIONS:
        if tool["name"] == name:
            return tool
    return None


async def execute_tool(
    tool_name: str,
    arguments: Dict[str, Any],
    task_id: str,
    user_id: str,
    session_id: str = "default"
) -> Dict[str, Any]:
    """
    执行工具调用
    
    Args:
        tool_name: 工具名称
        arguments: 工具参数
        task_id: 任务 ID
        user_id: 用户 ID
        session_id: 会话 ID（用于浏览器状态隔离）
        
    Returns:
        工具执行结果
    """
    logger.info(f"Executing tool: {tool_name}, args={arguments}")
    
    # 发送 tool_call 事件
    await sse_bus.publish(task_id, "tool_call", {
        "tool_name": tool_name,
        "arguments": arguments,
        "status": "executing"
    })
    
    try:
        result = None
        
        if tool_name == "web_search":
            browser = get_browser(session_id)
            result = await browser.web_search(
                query=arguments.get("query", ""),
                topn=arguments.get("topn", 10)
            )
            
        elif tool_name == "web_open":
            browser = get_browser(session_id)
            result = await browser.web_open(
                id_or_url=arguments.get("id_or_url", -1),
                cursor=arguments.get("cursor", -1),
                loc=arguments.get("loc", 0),
                num_lines=arguments.get("num_lines", -1)
            )
            
        elif tool_name == "web_find":
            browser = get_browser(session_id)
            result = await browser.web_find(
                pattern=arguments.get("pattern", ""),
                cursor=arguments.get("cursor", -1)
            )
            
        elif tool_name == "python_execute":
            exec_result = await execute_python(
                code=arguments.get("code", ""),
                user_id=user_id,
                task_id=task_id
            )
            result = {
                "success": exec_result.success,
                "output": exec_result.output,
                "execution_id": exec_result.execution_id,
                "duration_ms": exec_result.duration_ms,
                "error": exec_result.error
            }
            
        else:
            result = {
                "success": False,
                "error": f"Unknown tool: {tool_name}"
            }
        
        # 发送 tool_output 事件
        await sse_bus.publish(task_id, "tool_output", {
            "tool_name": tool_name,
            "result": result,
            "status": "completed" if result.get("success", False) else "failed"
        })
        
        return result
        
    except Exception as e:
        logger.error(f"Tool execution error: {e}")
        error_result = {
            "success": False,
            "error": str(e)
        }
        
        await sse_bus.publish(task_id, "tool_output", {
            "tool_name": tool_name,
            "result": error_result,
            "status": "error"
        })
        
        return error_result


def format_tool_result_for_display(tool_name: str, result: Dict[str, Any]) -> str:
    """格式化工具结果用于显示"""
    if not result.get("success", False):
        return f"❌ {tool_name} 执行失败: {result.get('error', 'Unknown error')}"
    
    if tool_name in ["web_search", "web_open", "web_find"]:
        return result.get("display", str(result))
    
    if tool_name == "python_execute":
        output = result.get("output", "")
        duration = result.get("duration_ms", 0)
        return f"```\n{output}\n```\n执行耗时: {duration}ms"
    
    return json.dumps(result, ensure_ascii=False, indent=2)
