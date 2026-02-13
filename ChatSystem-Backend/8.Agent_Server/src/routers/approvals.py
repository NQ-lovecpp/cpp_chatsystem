"""
审批 API - 处理工具调用审批
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from loguru import logger

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from auth import UserContext, require_auth
from runtime import task_manager
from runtime.approval_store import approval_store, ApprovalStatus


router = APIRouter(prefix="/approvals", tags=["approvals"])


class ApprovalDecision(BaseModel):
    """审批决定"""
    approval_id: str = Field(..., description="审批请求 ID")
    approved: bool = Field(..., description="是否批准")


class BatchApprovalRequest(BaseModel):
    """批量审批请求"""
    decisions: List[ApprovalDecision]


class ApprovalResponse(BaseModel):
    """审批响应"""
    approval_id: str
    status: str
    tool_name: str
    tool_args: dict
    reason: str
    created_at: str


@router.post("")
async def submit_approval(
    request: ApprovalDecision,
    user: UserContext = Depends(require_auth)
):
    """
    提交审批决定
    
    - approved=true: 批准工具执行
    - approved=false: 拒绝工具执行
    """
    approval = await approval_store.get_approval(request.approval_id)
    
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    # 检查权限
    if approval.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Approval already resolved: {approval.status.value}"
        )
    
    success = await approval_store.resolve_approval(
        request.approval_id,
        request.approved,
        user.user_id
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to resolve approval")
    
    logger.info(
        f"Approval resolved: {request.approval_id}, "
        f"approved={request.approved}, by={user.user_id}"
    )
    
    return {
        "message": "Approval processed",
        "approval_id": request.approval_id,
        "approved": request.approved
    }


@router.post("/batch")
async def submit_batch_approval(
    request: BatchApprovalRequest,
    user: UserContext = Depends(require_auth)
):
    """批量提交审批决定"""
    results = []
    
    for decision in request.decisions:
        approval = await approval_store.get_approval(decision.approval_id)
        
        if not approval:
            results.append({
                "approval_id": decision.approval_id,
                "success": False,
                "error": "Not found"
            })
            continue
        
        if approval.user_id != user.user_id:
            results.append({
                "approval_id": decision.approval_id,
                "success": False,
                "error": "Access denied"
            })
            continue
        
        success = await approval_store.resolve_approval(
            decision.approval_id,
            decision.approved,
            user.user_id
        )
        
        results.append({
            "approval_id": decision.approval_id,
            "success": success,
            "approved": decision.approved if success else None
        })
    
    return {"results": results}


@router.get("/pending/{task_id}", response_model=List[ApprovalResponse])
async def get_pending_approvals(
    task_id: str,
    user: UserContext = Depends(require_auth)
):
    """获取任务的待审批请求"""
    task = await task_manager.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    approvals = await approval_store.get_pending_approvals(task_id)
    
    return [
        ApprovalResponse(
            approval_id=a.id,
            status=a.status.value,
            tool_name=a.tool_name,
            tool_args=a.tool_args,
            reason=a.reason,
            created_at=a.created_at.isoformat()
        )
        for a in approvals
    ]
