"""
审批存储 - 管理需要用户审批的工具调用
"""
import asyncio
import uuid
from typing import Dict, Optional, List
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

from .sse_bus import sse_bus


class ApprovalStatus(str, Enum):
    """审批状态"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


@dataclass
class ApprovalRequest:
    """审批请求"""
    id: str
    task_id: str
    user_id: str
    tool_name: str
    tool_args: dict
    reason: str  # 为什么需要审批
    status: ApprovalStatus = ApprovalStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    
    # 用于恢复执行的回调
    _resume_event: asyncio.Event = field(default_factory=asyncio.Event)


class ApprovalStore:
    """
    审批存储
    - 存储待审批的工具调用
    - 处理审批结果
    - 通知 Agent 继续执行
    """
    
    def __init__(self, timeout: int = 300):
        self._approvals: Dict[str, ApprovalRequest] = {}
        self._task_approvals: Dict[str, List[str]] = {}  # task_id -> approval_ids
        self._timeout = timeout
        self._lock = asyncio.Lock()
    
    async def create_approval(
        self,
        task_id: str,
        user_id: str,
        tool_name: str,
        tool_args: dict,
        reason: str = ""
    ) -> ApprovalRequest:
        """创建审批请求"""
        approval_id = f"approval_{uuid.uuid4().hex[:12]}"
        
        approval = ApprovalRequest(
            id=approval_id,
            task_id=task_id,
            user_id=user_id,
            tool_name=tool_name,
            tool_args=tool_args,
            reason=reason or f"Tool '{tool_name}' requires approval"
        )
        
        async with self._lock:
            self._approvals[approval_id] = approval
            if task_id not in self._task_approvals:
                self._task_approvals[task_id] = []
            self._task_approvals[task_id].append(approval_id)
        
        # 发布中断事件
        await sse_bus.publish(task_id, "interruption", {
            "approval": {
                "id": approval_id,
                "tool_name": tool_name,
                "tool_args": tool_args,
                "reason": approval.reason,
                "status": approval.status.value
            }
        })
        
        return approval
    
    async def wait_for_approval(self, approval_id: str) -> ApprovalStatus:
        """等待审批结果"""
        approval = self._approvals.get(approval_id)
        if not approval:
            return ApprovalStatus.EXPIRED
        
        try:
            await asyncio.wait_for(
                approval._resume_event.wait(),
                timeout=self._timeout
            )
            return approval.status
        except asyncio.TimeoutError:
            approval.status = ApprovalStatus.EXPIRED
            return ApprovalStatus.EXPIRED
    
    async def resolve_approval(
        self,
        approval_id: str,
        approved: bool,
        resolved_by: str
    ) -> bool:
        """处理审批结果"""
        approval = self._approvals.get(approval_id)
        if not approval or approval.status != ApprovalStatus.PENDING:
            return False
        
        approval.status = ApprovalStatus.APPROVED if approved else ApprovalStatus.REJECTED
        approval.resolved_at = datetime.now()
        approval.resolved_by = resolved_by
        approval._resume_event.set()
        
        # 发布审批结果事件
        await sse_bus.publish(approval.task_id, "approval_resolved", {
            "approval_id": approval_id,
            "status": approval.status.value,
            "resolved_by": resolved_by
        })
        
        return True
    
    async def get_pending_approvals(self, task_id: str) -> List[ApprovalRequest]:
        """获取任务的待审批请求"""
        approval_ids = self._task_approvals.get(task_id, [])
        return [
            self._approvals[aid] 
            for aid in approval_ids 
            if aid in self._approvals and self._approvals[aid].status == ApprovalStatus.PENDING
        ]
    
    async def get_approval(self, approval_id: str) -> Optional[ApprovalRequest]:
        """获取审批请求"""
        return self._approvals.get(approval_id)


# 全局审批存储单例
approval_store = ApprovalStore()
