import sys
from pathlib import Path

# 添加 src 目录到 Python 路径，以便导入 tools
src_dir = Path(__file__).resolve().parent.parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from mcp.server.fastmcp import FastMCP
from tools.python_docker.docker_tool import PythonTool

mcp = FastMCP(
    name="python",
    instructions=r"""
Use this tool to execute Python code. The code will be executed in a stateless docker container,
and the stdout of that process will be returned to you.
""".strip(),
)


@mcp.tool(
    name="execute_python",
    title="Execute Python code",
    description="""
Execute Python code in a stateless docker container. stdout is returned as the result.
    """,
)
async def execute_python(code: str) -> str:
    tool = PythonTool()
    output = await tool.execute(code)
    return output
