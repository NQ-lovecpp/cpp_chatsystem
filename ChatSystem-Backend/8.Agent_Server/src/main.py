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
from routers import tasks_router, events_router, approvals_router


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
    from chat_agents import get_tool_definitions
    from tools import get_python_executor
    
    # 获取 Python 执行器状态
    try:
        python_status = get_python_executor().get_status()
    except:
        python_status = {"initialized": False, "error": "Docker not available"}
    
    return {
        "service": "agent",
        "status": "ready",
        "model": settings.openai_model,
        "features": {
            "session_agent": True,
            "global_agent": True,
            "browser_tools": True,
            "python_tools": True,
            "approvals": True
        },
        "tools": [t["name"] for t in get_tool_definitions()],
        "python_executor": python_status
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
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )


if __name__ == "__main__":
    main()
