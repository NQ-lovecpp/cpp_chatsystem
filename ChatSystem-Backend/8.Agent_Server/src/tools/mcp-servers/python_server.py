import sys
from pathlib import Path

# 添加 backend 目录到 Python 路径，以便导入 tools
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from mcp.server.fastmcp import FastMCP
from tools.python_docker.docker_tool import PythonTool
from openai_harmony import Message, TextContent, Author, Role

# Pass lifespan to server
mcp = FastMCP(
    name="python",
    instructions=r"""
Use this tool to execute Python code in your chain of thought. The code will not be shown to the user. This tool should be used for internal reasoning, but not for code that is intended to be visible to the user (e.g. when creating plots, tables, or files).
When you send a message containing python code to python, it will be executed in a stateless docker container, and the stdout of that process will be returned to you.
""".strip(),
)


@mcp.tool(
    name="execute_python",
    title="Execute Python code",
    description="""
Use this tool to execute Python code in your chain of thought. The code will not be shown to the user. This tool should be used for internal reasoning, but not for code that is intended to be visible to the user (e.g. when creating plots, tables, or files).
When you send a message containing python code to this tool, it will be executed in a stateless docker container, and the stdout of that process will be returned to you.
    """,
    annotations={
        # Harmony format don't want this schema to be part of it because it's simple text in text out
        "include_in_prompt": False,
    })
async def execute_python(code: str) -> str:
    tool = PythonTool()
    messages = []
    async for message in tool.process(
            Message(author=Author(role=Role.TOOL, name="python"),
                    content=[TextContent(text=code)])):
        messages.append(message)
    return "\n".join([message.content[0].text for message in messages])
