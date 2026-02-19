"""
Agent Server 主入口
"""
import sys
from pathlib import Path

# 添加 src 目录到 Python 路径
src_dir = Path(__file__).parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger
import uvicorn

from config import settings
from routers import tasks_router, events_router, approvals_router, agent_router


# 配置日志
logger.remove()
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="DEBUG" if settings.debug else "INFO"
)


# 创建 FastAPI 应用
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="ChatSystem Agent Server - 智能助手后端服务",
    docs_url="/docs",
    redoc_url="/redoc"
)


# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )


# 注册路由
# 使用 /agent 前缀，网关代理时为 /service/agent/*
app.include_router(tasks_router, prefix="/agent")
app.include_router(events_router, prefix="/agent")
app.include_router(approvals_router, prefix="/agent")
app.include_router(agent_router, prefix="/agent")


# 启动事件
@app.on_event("startup")
async def startup_event():
    """服务启动时初始化"""
    # 初始化 Agent 用户
    from services.agent_user_service import agent_user_service
    try:
        await agent_user_service.ensure_agent_users()
        logger.info("Agent users initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize agent users: {e}")
    
    # 启动 DualWriter 后台写入器
    from runtime.dual_writer import dual_writer
    try:
        await dual_writer.start()
        logger.info("DualWriter background writer started")
    except Exception as e:
        logger.warning(f"Failed to start dual writer: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """服务关闭时清理"""
    # 停止 DualWriter 后台写入器
    from runtime.dual_writer import dual_writer
    try:
        await dual_writer.stop()
        logger.info("DualWriter stopped")
    except Exception as e:
        logger.warning(f"Error stopping dual writer: {e}")
    
    # 关闭 Redis 连接
    from runtime.redis_client import close_redis_client
    try:
        await close_redis_client()
        logger.info("Redis connection closed")
    except Exception as e:
        logger.warning(f"Error closing Redis: {e}")


# 挂载静态文件
static_dir = src_dir / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
async def root():
    """根路径 - 服务信息"""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
        "test_ui": "/test"
    }


@app.get("/test")
async def test_page():
    """测试页面"""
    test_file = static_dir / "test.html"
    if test_file.exists():
        return FileResponse(str(test_file))
    return {"error": "Test page not found"}


@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy"}


@app.get("/agent/status")
async def agent_status():
    """Agent 服务状态"""
    return {
        "service": "agent",
        "status": "ready",
        "model": settings.openai_model,
        "features": {
            "session_agent": True,
            "browser_tools": True,
            "python_tools": True,
            "approvals": True,
            "webhook": True,
        },
    }


@app.get("/agent/audit-logs")
async def get_audit_logs(
    user_id: str = None,
    task_id: str = None,
    tool_name: str = None,
    limit: int = 50
):
    """
    获取工具执行审计日志
    
    用于安全审计和问题排查
    """
    from chat_agents import get_audit_logs as fetch_audit_logs
    
    logs = fetch_audit_logs(
        user_id=user_id,
        task_id=task_id,
        tool_name=tool_name,
        limit=limit
    )
    
    return {
        "logs": logs,
        "count": len(logs),
        "filters": {
            "user_id": user_id,
            "task_id": task_id,
            "tool_name": tool_name,
            "limit": limit
        }
    }


def main():
    """启动服务"""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Listening on {settings.host}:{settings.port}")
    logger.info(f"API docs available at http://{settings.host}:{settings.port}/docs")
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=False,  # 禁用 reload 避免 subprocess 使用系统 Python
        log_level="debug" if settings.debug else "info"
    )


if __name__ == "__main__":
    main()
