"""
路由模块
"""
from .tasks import router as tasks_router
from .events import router as events_router
from .approvals import router as approvals_router
from .agent_router import router as agent_router

__all__ = ["tasks_router", "events_router", "approvals_router", "agent_router"]
