"""
工具执行器 - 负责执行 Agent 调用的工具
支持审批流程：高风险工具需要用户批准后才执行
"""
import json
import hashlib
from typing import Any, Dict, Optional, List
from dataclasses import dataclass, field
from datetime import datetime
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from tools import get_browser, execute_python, get_python_executor
from runtime import sse_bus, task_manager, TaskStatus
from runtime.approval_store import approval_store, ApprovalStatus


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


def requires_approval(tool_name: str) -> bool:
    """检查工具是否需要审批"""
    tool = get_tool_by_name(tool_name)
    if tool:
        return tool.get("requires_approval", False)
    return False


def get_approval_reason(tool_name: str, arguments: Dict[str, Any]) -> str:
    """获取审批原因说明"""
    if tool_name == "python_execute":
        code = arguments.get("code", "")
        code_preview = code[:200] + "..." if len(code) > 200 else code
        return f"执行 Python 代码需要您的批准。代码片段：\n```python\n{code_preview}\n```"
    
    return f"工具 '{tool_name}' 需要您的批准才能执行"


async def execute_tool_with_approval(
    tool_name: str,
    arguments: Dict[str, Any],
    task_id: str,
    user_id: str,
    session_id: str = "default"
) -> Dict[str, Any]:
    """
    执行工具调用，支持审批流程
    
    对于需要审批的工具：
    1. 创建审批请求
    2. 更新任务状态为 WAITING_APPROVAL
    3. 等待用户审批
    4. 根据审批结果执行或拒绝
    
    Args:
        tool_name: 工具名称
        arguments: 工具参数
        task_id: 任务 ID
        user_id: 用户 ID
        session_id: 会话 ID
        
    Returns:
        工具执行结果
    """
    # 检查是否需要审批
    if requires_approval(tool_name):
        logger.info(f"Tool {tool_name} requires approval for task {task_id}")
        
        # 发送 tool_call 事件（需要审批状态）
        await sse_bus.publish(task_id, "tool_call", {
            "tool_name": tool_name,
            "arguments": arguments,
            "status": "pending_approval",
            "requires_approval": True
        })
        
        # 创建审批请求
        reason = get_approval_reason(tool_name, arguments)
        approval = await approval_store.create_approval(
            task_id=task_id,
            user_id=user_id,
            tool_name=tool_name,
            tool_args=arguments,
            reason=reason
        )
        
        # 更新任务状态
        await task_manager.update_task_status(task_id, TaskStatus.WAITING_APPROVAL)
        
        # 等待审批结果
        logger.info(f"Waiting for approval: {approval.id}")
        approval_status = await approval_store.wait_for_approval(approval.id)
        
        if approval_status == ApprovalStatus.APPROVED:
            logger.info(f"Approval granted for {tool_name}")
            # 更新任务状态为运行中
            await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
            # 执行工具
            return await execute_tool(tool_name, arguments, task_id, user_id, session_id)
        
        elif approval_status == ApprovalStatus.REJECTED:
            logger.info(f"Approval rejected for {tool_name}")
            # 更新任务状态为运行中（继续后续流程）
            await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
            
            # 返回拒绝结果
            result = {
                "success": False,
                "error": "用户拒绝了此操作",
                "approval_status": "rejected"
            }
            
            await sse_bus.publish(task_id, "tool_output", {
                "tool_name": tool_name,
                "result": result,
                "status": "rejected"
            })
            
            return result
        
        else:  # EXPIRED
            logger.info(f"Approval expired for {tool_name}")
            await task_manager.update_task_status(task_id, TaskStatus.RUNNING)
            
            result = {
                "success": False,
                "error": "审批请求已超时",
                "approval_status": "expired"
            }
            
            await sse_bus.publish(task_id, "tool_output", {
                "tool_name": tool_name,
                "result": result,
                "status": "expired"
            })
            
            return result
    
    # 不需要审批的工具直接执行
    return await execute_tool(tool_name, arguments, task_id, user_id, session_id)


@dataclass
class AuditLogEntry:
    """审计日志条目"""
    timestamp: datetime
    user_id: str
    task_id: str
    tool_name: str
    arguments_hash: str
    arguments_preview: str
    status: str  # pending, approved, rejected, executed, failed
    execution_id: Optional[str] = None
    duration_ms: Optional[int] = None
    error: Optional[str] = None


# 审计日志存储（内存版，生产环境应使用持久化存储）
_audit_logs: List[AuditLogEntry] = []
_MAX_AUDIT_LOGS = 1000


def _hash_arguments(arguments: Dict[str, Any]) -> str:
    """计算参数的哈希值"""
    args_str = json.dumps(arguments, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(args_str.encode()).hexdigest()[:16]


def _preview_arguments(tool_name: str, arguments: Dict[str, Any], max_len: int = 200) -> str:
    """生成参数预览"""
    if tool_name == "python_execute":
        code = arguments.get("code", "")
        return code[:max_len] + "..." if len(code) > max_len else code
    elif tool_name == "web_search":
        return f"query: {arguments.get('query', '')}"
    else:
        preview = json.dumps(arguments, ensure_ascii=False)
        return preview[:max_len] + "..." if len(preview) > max_len else preview


def log_audit_entry(
    user_id: str,
    task_id: str,
    tool_name: str,
    arguments: Dict[str, Any],
    status: str,
    execution_id: Optional[str] = None,
    duration_ms: Optional[int] = None,
    error: Optional[str] = None
):
    """记录审计日志"""
    global _audit_logs
    
    entry = AuditLogEntry(
        timestamp=datetime.now(),
        user_id=user_id,
        task_id=task_id,
        tool_name=tool_name,
        arguments_hash=_hash_arguments(arguments),
        arguments_preview=_preview_arguments(tool_name, arguments),
        status=status,
        execution_id=execution_id,
        duration_ms=duration_ms,
        error=error
    )
    
    _audit_logs.append(entry)
    
    # 保持日志数量在限制内
    if len(_audit_logs) > _MAX_AUDIT_LOGS:
        _audit_logs = _audit_logs[-_MAX_AUDIT_LOGS:]
    
    logger.info(
        f"[AUDIT] user={user_id} task={task_id} tool={tool_name} "
        f"status={status} exec_id={execution_id}"
    )


def get_audit_logs(
    user_id: Optional[str] = None,
    task_id: Optional[str] = None,
    tool_name: Optional[str] = None,
    limit: int = 50
) -> List[dict]:
    """获取审计日志"""
    logs = _audit_logs
    
    if user_id:
        logs = [l for l in logs if l.user_id == user_id]
    if task_id:
        logs = [l for l in logs if l.task_id == task_id]
    if tool_name:
        logs = [l for l in logs if l.tool_name == tool_name]
    
    return [
        {
            "timestamp": l.timestamp.isoformat(),
            "user_id": l.user_id,
            "task_id": l.task_id,
            "tool_name": l.tool_name,
            "arguments_hash": l.arguments_hash,
            "arguments_preview": l.arguments_preview,
            "status": l.status,
            "execution_id": l.execution_id,
            "duration_ms": l.duration_ms,
            "error": l.error
        }
        for l in reversed(logs[-limit:])
    ]


async def execute_tool_with_audit(
    tool_name: str,
    arguments: Dict[str, Any],
    task_id: str,
    user_id: str,
    session_id: str = "default"
) -> Dict[str, Any]:
    """
    执行工具调用，带审计日志记录
    
    整合审批流程和审计日志
    """
    # 记录工具调用开始
    log_audit_entry(
        user_id=user_id,
        task_id=task_id,
        tool_name=tool_name,
        arguments=arguments,
        status="pending"
    )
    
    try:
        # 执行工具（包含审批流程）
        result = await execute_tool_with_approval(
            tool_name=tool_name,
            arguments=arguments,
            task_id=task_id,
            user_id=user_id,
            session_id=session_id
        )
        
        # 根据结果记录审计日志
        if result.get("approval_status") == "rejected":
            log_audit_entry(
                user_id=user_id,
                task_id=task_id,
                tool_name=tool_name,
                arguments=arguments,
                status="rejected"
            )
        elif result.get("approval_status") == "expired":
            log_audit_entry(
                user_id=user_id,
                task_id=task_id,
                tool_name=tool_name,
                arguments=arguments,
                status="expired"
            )
        elif result.get("success", False):
            log_audit_entry(
                user_id=user_id,
                task_id=task_id,
                tool_name=tool_name,
                arguments=arguments,
                status="executed",
                execution_id=result.get("execution_id"),
                duration_ms=result.get("duration_ms")
            )
        else:
            log_audit_entry(
                user_id=user_id,
                task_id=task_id,
                tool_name=tool_name,
                arguments=arguments,
                status="failed",
                error=result.get("error")
            )
        
        return result
        
    except Exception as e:
        log_audit_entry(
            user_id=user_id,
            task_id=task_id,
            tool_name=tool_name,
            arguments=arguments,
            status="error",
            error=str(e)
        )
        raise
