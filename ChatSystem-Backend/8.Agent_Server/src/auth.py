"""
认证模块 - 验证来自网关的请求
"""
from fastapi import Request, HTTPException, Depends
from typing import Optional
from dataclasses import dataclass


@dataclass
class UserContext:
    """用户上下文，从网关传递的 header 中提取"""
    user_id: str
    session_id: Optional[str] = None
    nickname: Optional[str] = None


async def get_user_context(request: Request) -> UserContext:
    """
    从请求头中提取用户上下文
    网关应该在鉴权后设置这些 header:
    - X-User-Id: 用户 ID
    - X-Session-Id: 会话 ID (可选)
    - X-User-Nickname: 用户昵称 (可选)
    """
    user_id = request.headers.get("X-User-Id")
    
    # 开发模式下允许不鉴权
    if not user_id:
        # 检查是否有测试 user_id 参数
        user_id = request.query_params.get("user_id", "test_user")
    
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Missing X-User-Id header"
        )
    
    return UserContext(
        user_id=user_id,
        session_id=request.headers.get("X-Session-Id") or request.query_params.get("session_id"),
        nickname=request.headers.get("X-User-Nickname")
    )


def require_auth(user: UserContext = Depends(get_user_context)) -> UserContext:
    """依赖注入：要求认证的端点使用"""
    return user
