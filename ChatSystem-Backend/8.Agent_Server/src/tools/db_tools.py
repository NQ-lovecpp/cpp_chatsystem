"""
数据库工具模块 - 提供访问 ChatSystem MySQL 数据库的 function_tool

工具列表:
- get_chat_history: 获取会话的聊天历史
- get_session_members: 获取会话成员列表
- get_user_info: 获取用户信息
- search_messages: 搜索会话中的消息

这些工具供 TaskAgent 使用，让它能够获取聊天上下文
"""
import asyncio
import re
from typing import Annotated, Optional, List, Dict, Any
from datetime import datetime
from loguru import logger
import aiomysql

from agents import function_tool

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from tools.sdk_tools import current_chat_session_id

# LLM 可能传入的占位符，此时应使用上下文中的 current_chat_session_id
_CHAT_SESSION_PLACEHOLDERS = frozenset({"", "current", "当前", "this session", "本会话", "current session"})
_THINK_BLOCK_RE = re.compile(r"<think(?:\s+[^>]*)?>[\s\S]*?</think>", re.IGNORECASE)
_TOOL_CALL_RE = re.compile(
    r"<tool-call\s+name=\"([^\"]*)\"(?:\s+arguments='([^']*)')?\s*>[\s\S]*?</tool-call>",
    re.IGNORECASE,
)
_TOOL_RESULT_RE = re.compile(
    r"<tool-result\s+name=\"([^\"]*)\"(?:\s+status=\"([^\"]*)\")?\s*>([\s\S]*?)</tool-result>",
    re.IGNORECASE,
)


def _resolve_chat_session_id(chat_session_id: str) -> str:
    """当 LLM 传入占位符时，使用上下文中的 current_chat_session_id"""
    if not chat_session_id or chat_session_id.strip().lower() in _CHAT_SESSION_PLACEHOLDERS:
        try:
            ctx = current_chat_session_id.get()
            if ctx:
                return ctx
        except LookupError:
            pass
    return chat_session_id or ""


def _normalize_text_message_content(content: str, max_len: int = 600) -> str:
    """将 xmarkdown 文本转换为更适合上下文阅读的摘要。"""
    if not content:
        return "[空消息]"

    tool_calls = [m.group(1).strip() for m in _TOOL_CALL_RE.finditer(content) if (m.group(1) or "").strip()]
    tool_results = []
    for match in _TOOL_RESULT_RE.finditer(content):
        tool_name = (match.group(1) or "").strip() or "tool"
        status = (match.group(2) or "success").strip()
        result_text = re.sub(r"\s+", " ", (match.group(3) or "")).strip()
        if result_text:
            tool_results.append(f"{tool_name}/{status}: {result_text[:100]}")
        else:
            tool_results.append(f"{tool_name}/{status}")

    plain_text = _THINK_BLOCK_RE.sub(" ", content)
    plain_text = _TOOL_CALL_RE.sub(" ", plain_text)
    plain_text = _TOOL_RESULT_RE.sub(" ", plain_text)
    plain_text = re.sub(r"\s+", " ", plain_text).strip()

    parts = []
    if plain_text:
        parts.append(plain_text)
    if tool_calls:
        parts.append("工具调用: " + ", ".join(tool_calls))
    if tool_results:
        parts.append("工具结果: " + " | ".join(tool_results))

    summary = "；".join(parts).strip() or "[空消息]"
    return summary[:max_len]


# 数据库连接池
_db_pool: Optional[aiomysql.Pool] = None


async def get_db_pool() -> aiomysql.Pool:
    """获取数据库连接池"""
    global _db_pool
    
    if _db_pool is None:
        _db_pool = await aiomysql.create_pool(
            host=settings.mysql_host,
            port=settings.mysql_port,
            user=settings.mysql_user,
            password=settings.mysql_password,
            db=settings.mysql_database,
            charset='utf8mb4',
            minsize=1,
            maxsize=settings.mysql_pool_size,
            autocommit=True,
        )
        logger.info(f"MySQL pool created: {settings.mysql_host}:{settings.mysql_port}/{settings.mysql_database}")
    
    return _db_pool


async def close_db_pool():
    """关闭数据库连接池"""
    global _db_pool
    if _db_pool:
        _db_pool.close()
        await _db_pool.wait_closed()
        _db_pool = None
        logger.info("MySQL pool closed")


async def execute_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """执行查询并返回结果"""
    pool = await get_db_pool()
    
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            await cursor.execute(query, params)
            result = await cursor.fetchall()
            return list(result)


# ============== 聊天历史工具 ==============

@function_tool
async def get_chat_history(
    chat_session_id: Annotated[str, "聊天会话 ID"],
    limit: Annotated[int, "返回消息数量限制，默认 50"] = 50,
    offset: Annotated[int, "偏移量，用于分页，默认 0"] = 0
) -> str:
    """
    获取指定聊天会话的历史消息。
    
    返回会话中的消息列表，包含发送者、消息内容、时间等信息。
    用于了解会话上下文，帮助回答用户问题。
    
    消息类型说明:
    - 0: 文本消息
    - 1: 图片消息
    - 2: 文件消息
    - 3: 语音消息
    """
    try:
        chat_session_id = _resolve_chat_session_id(chat_session_id)
        if not chat_session_id:
            return "未提供有效的聊天会话 ID，且当前上下文无会话信息。"
        # 查询消息，按时间倒序
        query = """
            SELECT 
                m.message_id,
                m.user_id,
                m.message_type,
                m.content,
                m.create_time,
                m.file_name,
                u.nickname
            FROM message m
            LEFT JOIN user u ON m.user_id = u.user_id
            WHERE m.session_id = %s
            ORDER BY m.create_time DESC
            LIMIT %s OFFSET %s
        """
        
        messages = await execute_query(query, (chat_session_id, limit, offset))
        
        if not messages:
            return f"会话 {chat_session_id} 中没有找到消息记录。"
        
        # 格式化输出
        result_lines = [f"=== 会话 {chat_session_id} 的聊天历史（最近 {len(messages)} 条）===\n"]
        
        # 反转顺序，让最早的消息在前
        for msg in reversed(messages):
            nickname = msg.get('nickname') or msg.get('user_id', '未知用户')
            msg_type = msg.get('message_type', 0)
            content = msg.get('content', '')
            create_time = msg.get('create_time')
            
            # 格式化时间
            time_str = ""
            if create_time:
                if isinstance(create_time, datetime):
                    time_str = create_time.strftime("%m-%d %H:%M")
                else:
                    time_str = str(create_time)
            
            # 根据消息类型格式化内容
            if msg_type == 0:  # 文本
                content_display = _normalize_text_message_content(content)
            elif msg_type == 1:  # 图片
                content_display = "[图片消息]"
            elif msg_type == 2:  # 文件
                file_name = msg.get('file_name', '未知文件')
                content_display = f"[文件: {file_name}]"
            elif msg_type == 3:  # 语音
                content_display = "[语音消息]"
            else:
                content_display = f"[未知类型消息: {msg_type}]"
            
            result_lines.append(f"[{time_str}] {nickname}: {content_display}")
        
        return "\n".join(result_lines)
        
    except Exception as e:
        logger.error(f"获取聊天历史失败: {e}")
        return f"获取聊天历史失败: {str(e)}"


# ============== 会话成员工具 ==============

@function_tool
async def get_session_members(
    chat_session_id: Annotated[str, "聊天会话 ID"]
) -> str:
    """
    获取聊天会话的成员列表。
    
    返回会话中所有成员的信息，包括用户 ID、昵称、头像等。
    用于了解群聊成员情况。
    """
    try:
        chat_session_id = _resolve_chat_session_id(chat_session_id)
        if not chat_session_id:
            return "未提供有效的聊天会话 ID，且当前上下文无会话信息。"
        # 查询会话成员
        query = """
            SELECT 
                csm.user_id,
                u.nickname,
                u.description
            FROM chat_session_member csm
            LEFT JOIN user u ON csm.user_id = u.user_id
            WHERE csm.chat_session_id = %s
        """
        
        members = await execute_query(query, (chat_session_id,))
        
        if not members:
            return f"会话 {chat_session_id} 没有成员或会话不存在。"
        
        # 查询会话信息
        session_query = """
            SELECT chat_session_name, chat_session_type
            FROM chat_session
            WHERE chat_session_id = %s
        """
        session_info = await execute_query(session_query, (chat_session_id,))
        
        session_name = "未知会话"
        session_type = "未知"
        if session_info:
            session_name = session_info[0].get('chat_session_name', '未知会话')
            session_type_val = session_info[0].get('chat_session_type', 0)
            session_type = "单聊" if session_type_val == 1 else "群聊" if session_type_val == 2 else "未知"
        
        # 格式化输出
        result_lines = [
            f"=== 会话信息 ===",
            f"会话名称: {session_name}",
            f"会话类型: {session_type}",
            f"成员数量: {len(members)}",
            f"\n=== 成员列表 ==="
        ]
        
        for idx, member in enumerate(members, 1):
            nickname = member.get('nickname') or member.get('user_id', '未知用户')
            description = member.get('description') or '无签名'
            result_lines.append(f"{idx}. {nickname} - {description}")
        
        return "\n".join(result_lines)
        
    except Exception as e:
        logger.error(f"获取会话成员失败: {e}")
        return f"获取会话成员失败: {str(e)}"


# ============== 用户信息工具 ==============

@function_tool
async def get_user_info(
    user_id: Annotated[str, "用户 ID"]
) -> str:
    """
    获取指定用户的详细信息。
    
    返回用户的昵称、签名、手机号等信息。
    用于了解特定用户的基本情况。
    """
    try:
        query = """
            SELECT 
                user_id,
                nickname,
                description,
                phone
            FROM user
            WHERE user_id = %s
        """
        
        users = await execute_query(query, (user_id,))
        
        if not users:
            return f"未找到用户 {user_id}"
        
        user = users[0]
        
        # 格式化输出
        result_lines = [
            f"=== 用户信息 ===",
            f"用户 ID: {user.get('user_id', '未知')}",
            f"昵称: {user.get('nickname', '未知')}",
            f"签名: {user.get('description') or '无签名'}",
            f"手机: {user.get('phone') or '未绑定'}"
        ]
        
        return "\n".join(result_lines)
        
    except Exception as e:
        logger.error(f"获取用户信息失败: {e}")
        return f"获取用户信息失败: {str(e)}"


# ============== 消息搜索工具 ==============

@function_tool
async def search_messages(
    chat_session_id: Annotated[str, "聊天会话 ID"],
    keyword: Annotated[str, "搜索关键词"],
    limit: Annotated[int, "返回消息数量限制，默认 20"] = 20
) -> str:
    """
    在会话中搜索包含关键词的消息。
    
    返回匹配的消息列表，帮助查找特定话题的讨论。
    仅搜索文本消息。
    """
    try:
        chat_session_id = _resolve_chat_session_id(chat_session_id)
        if not chat_session_id:
            return "未提供有效的聊天会话 ID，且当前上下文无会话信息。"
        query = """
            SELECT 
                m.message_id,
                m.user_id,
                m.content,
                m.create_time,
                u.nickname
            FROM message m
            LEFT JOIN user u ON m.user_id = u.user_id
            WHERE m.session_id = %s
              AND m.message_type = 0
              AND m.content LIKE %s
            ORDER BY m.create_time DESC
            LIMIT %s
        """
        
        messages = await execute_query(query, (chat_session_id, f"%{keyword}%", limit))
        
        if not messages:
            return f"在会话中未找到包含 '{keyword}' 的消息。"
        
        # 格式化输出
        result_lines = [f"=== 搜索结果：'{keyword}'（共 {len(messages)} 条）===\n"]
        
        for msg in messages:
            nickname = msg.get('nickname') or msg.get('user_id', '未知用户')
            content = msg.get('content', '')
            create_time = msg.get('create_time')
            
            time_str = ""
            if create_time:
                if isinstance(create_time, datetime):
                    time_str = create_time.strftime("%m-%d %H:%M")
                else:
                    time_str = str(create_time)
            
            result_lines.append(f"[{time_str}] {nickname}: {_normalize_text_message_content(content, max_len=500)}")
        
        return "\n".join(result_lines)
        
    except Exception as e:
        logger.error(f"搜索消息失败: {e}")
        return f"搜索消息失败: {str(e)}"


# ============== 获取用户会话列表 ==============

@function_tool
async def get_user_sessions(
    user_id: Annotated[str, "用户 ID"]
) -> str:
    """
    获取用户参与的所有聊天会话列表。
    
    返回用户的会话列表，包括会话名称和类型。
    """
    try:
        query = """
            SELECT 
                cs.chat_session_id,
                cs.chat_session_name,
                cs.chat_session_type
            FROM chat_session_member csm
            JOIN chat_session cs ON csm.chat_session_id = cs.chat_session_id
            WHERE csm.user_id = %s
        """
        
        sessions = await execute_query(query, (user_id,))
        
        if not sessions:
            return f"用户 {user_id} 没有参与任何会话。"
        
        # 格式化输出
        result_lines = [f"=== 用户 {user_id} 的会话列表（共 {len(sessions)} 个）===\n"]
        
        for idx, session in enumerate(sessions, 1):
            session_name = session.get('chat_session_name', '未知会话')
            session_type_val = session.get('chat_session_type', 0)
            session_type = "单聊" if session_type_val == 1 else "群聊" if session_type_val == 2 else "未知"
            session_id = session.get('chat_session_id', '')
            
            result_lines.append(f"{idx}. [{session_type}] {session_name} (ID: {session_id[:8]}...)")
        
        return "\n".join(result_lines)
        
    except Exception as e:
        logger.error(f"获取用户会话列表失败: {e}")
        return f"获取用户会话列表失败: {str(e)}"


# ============== 导出工具列表 ==============

DB_TOOLS = [
    get_chat_history,
    get_session_members,
    get_user_info,
    search_messages,
    get_user_sessions,
]

# 工具名称到函数的映射
DB_TOOL_MAP = {
    "get_chat_history": get_chat_history,
    "get_session_members": get_session_members,
    "get_user_info": get_user_info,
    "search_messages": search_messages,
    "get_user_sessions": get_user_sessions,
}
