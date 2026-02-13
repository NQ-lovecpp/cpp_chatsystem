"""
Python 执行工具 - 使用统一的 Docker 容器执行 Python 代码
容器持久运行，每次调用在容器内创建独立工作目录
"""
import os
import io
import uuid
import tarfile
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime
from dataclasses import dataclass, field
from loguru import logger

from dotenv import load_dotenv
load_dotenv()

# Docker 配置
DOCKER_IMAGE = os.getenv("PYTHON_DOCKER_IMAGE", "agent-python-executor")
DOCKER_TIMEOUT = int(os.getenv("PYTHON_DOCKER_TIMEOUT", "60"))
DOCKER_MEMORY_LIMIT = os.getenv("PYTHON_DOCKER_MEMORY_LIMIT", "512m")
DOCKER_CPU_LIMIT = float(os.getenv("PYTHON_DOCKER_CPU_LIMIT", "1.0"))
CONTAINER_NAME = "agent-python-executor"

# 预装的 Python 包
PREINSTALLED_PACKAGES = [
    "numpy",
    "pandas", 
    "scipy",
    "sympy",
    "matplotlib",
    "requests",
    "beautifulsoup4",
    "lxml",
    "pyyaml",
    "python-dateutil",
]


@dataclass
class ExecutionResult:
    """执行结果"""
    success: bool
    output: str
    execution_id: str
    duration_ms: int = 0
    error: Optional[str] = None


@dataclass
class ExecutionRecord:
    """执行记录（用于审计）"""
    execution_id: str
    user_id: str
    task_id: str
    code_hash: str
    code_preview: str  # 前 200 字符
    status: str
    output_preview: str  # 前 500 字符
    duration_ms: int
    created_at: datetime = field(default_factory=datetime.now)


class PythonExecutor:
    """
    Python 代码执行器
    使用单一持久化 Docker 容器，每次执行在独立目录中运行
    """
    
    def __init__(self):
        self._docker_client = None
        self._container = None
        self._lock = asyncio.Lock()
        self._execution_records: List[ExecutionRecord] = []
        self._initialized = False
    
    def _get_docker_client(self):
        """懒加载 Docker 客户端"""
        if self._docker_client is None:
            try:
                import docker
                self._docker_client = docker.from_env()
            except Exception as e:
                logger.error(f"Failed to initialize Docker client: {e}")
                raise RuntimeError(
                    "Docker is not available. Please ensure Docker is installed and running."
                )
        return self._docker_client
    
    async def _ensure_image(self):
        """确保 Docker 镜像存在，不存在则构建"""
        client = self._get_docker_client()
        
        try:
            client.images.get(DOCKER_IMAGE)
            logger.info(f"Docker image {DOCKER_IMAGE} found")
        except Exception:
            logger.info(f"Building Docker image {DOCKER_IMAGE}...")
            await self._build_image()
    
    async def _build_image(self):
        """构建带有预装包的 Docker 镜像"""
        client = self._get_docker_client()
        
        # 构建 Dockerfile
        packages_str = " ".join(PREINSTALLED_PACKAGES)
        dockerfile = f"""
FROM python:3.11-slim

# 设置工作目录
WORKDIR /workspace

# 安装常用包
RUN pip install --no-cache-dir {packages_str}

# 设置环境变量
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# 创建执行用户（非 root）
RUN useradd -m -s /bin/bash executor
USER executor

CMD ["sleep", "infinity"]
"""
        
        # 创建 tar 包含 Dockerfile
        dockerfile_tar = io.BytesIO()
        with tarfile.open(fileobj=dockerfile_tar, mode="w") as tar:
            dockerfile_bytes = dockerfile.encode("utf-8")
            tarinfo = tarfile.TarInfo(name="Dockerfile")
            tarinfo.size = len(dockerfile_bytes)
            tar.addfile(tarinfo, io.BytesIO(dockerfile_bytes))
        dockerfile_tar.seek(0)
        
        # 构建镜像
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: client.images.build(
                    fileobj=dockerfile_tar,
                    custom_context=True,
                    tag=DOCKER_IMAGE,
                    rm=True
                )
            )
            logger.info(f"Docker image {DOCKER_IMAGE} built successfully")
        except Exception as e:
            logger.error(f"Failed to build Docker image: {e}")
            # 回退到基础镜像
            logger.info("Falling back to python:3.11-slim")
            try:
                client.images.pull("python:3.11-slim")
            except:
                pass
    
    async def _ensure_container(self):
        """确保容器运行中"""
        if self._initialized and self._container:
            try:
                self._container.reload()
                if self._container.status == "running":
                    return
            except:
                pass
        
        client = self._get_docker_client()
        
        # 尝试获取已存在的容器
        try:
            self._container = client.containers.get(CONTAINER_NAME)
            self._container.reload()
            if self._container.status != "running":
                self._container.start()
            logger.info(f"Using existing container: {CONTAINER_NAME}")
            self._initialized = True
            return
        except Exception:
            pass
        
        # 确保镜像存在
        await self._ensure_image()
        
        # 尝试使用自定义镜像，失败则使用基础镜像
        image_to_use = DOCKER_IMAGE
        try:
            client.images.get(DOCKER_IMAGE)
        except:
            image_to_use = "python:3.11-slim"
            try:
                client.images.get(image_to_use)
            except:
                client.images.pull(image_to_use)
        
        # 创建新容器
        try:
            self._container = client.containers.run(
                image_to_use,
                name=CONTAINER_NAME,
                command="sleep infinity",
                detach=True,
                mem_limit=DOCKER_MEMORY_LIMIT,
                cpu_period=100000,
                cpu_quota=int(DOCKER_CPU_LIMIT * 100000),
                network_mode="bridge",  # 允许网络访问
                remove=False,  # 不自动删除，保持持久化
            )
            logger.info(f"Created new container: {CONTAINER_NAME}")
            self._initialized = True
        except Exception as e:
            logger.error(f"Failed to create container: {e}")
            raise
    
    async def execute(
        self,
        code: str,
        user_id: str = "unknown",
        task_id: str = "unknown",
        timeout: int = None
    ) -> ExecutionResult:
        """
        执行 Python 代码
        
        Args:
            code: Python 代码
            user_id: 用户 ID（用于审计）
            task_id: 任务 ID（用于审计）
            timeout: 超时时间（秒）
            
        Returns:
            ExecutionResult
        """
        execution_id = f"exec_{uuid.uuid4().hex[:12]}"
        timeout = timeout or DOCKER_TIMEOUT
        start_time = datetime.now()
        
        logger.info(f"Executing code: execution_id={execution_id}, user={user_id}, task={task_id}")
        
        async with self._lock:
            try:
                await self._ensure_container()
                
                # 在容器内创建独立工作目录
                work_dir = f"/workspace/{execution_id}"
                script_path = f"{work_dir}/script.py"
                
                # 创建目录
                self._container.exec_run(f"mkdir -p {work_dir}", user="root")
                
                # 将脚本写入容器
                tarstream = io.BytesIO()
                with tarfile.open(fileobj=tarstream, mode="w") as tar:
                    script_bytes = code.encode("utf-8")
                    tarinfo = tarfile.TarInfo(name="script.py")
                    tarinfo.size = len(script_bytes)
                    tar.addfile(tarinfo, io.BytesIO(script_bytes))
                tarstream.seek(0)
                
                self._container.put_archive(work_dir, tarstream.read())
                
                # 执行脚本
                loop = asyncio.get_event_loop()
                
                def run_script():
                    return self._container.exec_run(
                        f"python {script_path}",
                        workdir=work_dir,
                        environment={"PYTHONUNBUFFERED": "1"}
                    )
                
                try:
                    exec_result = await asyncio.wait_for(
                        loop.run_in_executor(None, run_script),
                        timeout=timeout
                    )
                    output = exec_result.output.decode("utf-8", errors="replace")
                    exit_code = exec_result.exit_code
                except asyncio.TimeoutError:
                    output = f"[ERROR] Execution timed out after {timeout} seconds"
                    exit_code = -1
                
                # 清理工作目录
                self._container.exec_run(f"rm -rf {work_dir}", user="root")
                
                duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
                
                # 处理空输出
                if not output.strip():
                    output = "[INFO] No output. Use print() to display results."
                
                # 记录执行
                record = ExecutionRecord(
                    execution_id=execution_id,
                    user_id=user_id,
                    task_id=task_id,
                    code_hash=str(hash(code)),
                    code_preview=code[:200],
                    status="success" if exit_code == 0 else "error",
                    output_preview=output[:500],
                    duration_ms=duration_ms
                )
                self._execution_records.append(record)
                
                # 保留最近 100 条记录
                if len(self._execution_records) > 100:
                    self._execution_records = self._execution_records[-100:]
                
                return ExecutionResult(
                    success=(exit_code == 0),
                    output=output,
                    execution_id=execution_id,
                    duration_ms=duration_ms,
                    error=None if exit_code == 0 else f"Exit code: {exit_code}"
                )
                
            except Exception as e:
                duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
                logger.error(f"Execution error: {e}")
                
                return ExecutionResult(
                    success=False,
                    output="",
                    execution_id=execution_id,
                    duration_ms=duration_ms,
                    error=str(e)
                )
    
    def get_execution_records(self, limit: int = 20) -> List[dict]:
        """获取执行记录"""
        records = self._execution_records[-limit:]
        return [
            {
                "execution_id": r.execution_id,
                "user_id": r.user_id,
                "task_id": r.task_id,
                "status": r.status,
                "duration_ms": r.duration_ms,
                "created_at": r.created_at.isoformat()
            }
            for r in reversed(records)
        ]
    
    async def cleanup(self):
        """清理资源"""
        if self._container:
            try:
                self._container.stop(timeout=5)
                self._container.remove(force=True)
                logger.info(f"Container {CONTAINER_NAME} removed")
            except Exception as e:
                logger.warning(f"Failed to cleanup container: {e}")
            self._container = None
            self._initialized = False
    
    def get_status(self) -> dict:
        """获取执行器状态"""
        container_status = "unknown"
        if self._container:
            try:
                self._container.reload()
                container_status = self._container.status
            except:
                container_status = "error"
        
        return {
            "initialized": self._initialized,
            "container_name": CONTAINER_NAME,
            "container_status": container_status,
            "image": DOCKER_IMAGE,
            "timeout": DOCKER_TIMEOUT,
            "memory_limit": DOCKER_MEMORY_LIMIT,
            "preinstalled_packages": PREINSTALLED_PACKAGES,
            "total_executions": len(self._execution_records)
        }


# 全局执行器实例
_executor: Optional[PythonExecutor] = None


def get_python_executor() -> PythonExecutor:
    """获取全局 Python 执行器"""
    global _executor
    if _executor is None:
        _executor = PythonExecutor()
    return _executor


async def execute_python(
    code: str,
    user_id: str = "unknown",
    task_id: str = "unknown",
    timeout: int = None
) -> ExecutionResult:
    """便捷函数：执行 Python 代码"""
    executor = get_python_executor()
    return await executor.execute(code, user_id, task_id, timeout)
