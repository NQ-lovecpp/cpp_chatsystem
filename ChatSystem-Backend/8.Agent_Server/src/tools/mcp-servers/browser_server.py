import os
import sys
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from pathlib import Path
from typing import Union, Optional

# 添加 backend 目录到 Python 路径，以便导入 tools
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from mcp.server.fastmcp import Context, FastMCP
from tools.simple_browser import SimpleBrowserTool
from tools.simple_browser.backend import YouComBackend, ExaBackend

# ============================================================
# API Key 配置 - 请在此处填写你的 API Key
# ============================================================
# 方式1: 直接在代码中设置 (不推荐用于生产环境)
EXA_API_KEY = "4bf3690f-ce7e-4966-aeee-67c2f938b0c6"  # 填写你的 Exa API Key，获取地址: https://exa.ai/
YDC_API_KEY = ""  # 填写你的 You.com API Key (如果使用 youcom 后端)

# 方式2: 通过环境变量设置 (推荐)
# export EXA_API_KEY="your-exa-api-key"
# export YDC_API_KEY="your-youcom-api-key"

# 选择使用的搜索后端: "exa" 或 "youcom"
BROWSER_BACKEND = os.getenv("BROWSER_BACKEND", "exa")
# ============================================================

@dataclass
class AppContext:
    browsers: dict[str, SimpleBrowserTool] = field(default_factory=dict)

    def create_or_get_browser(self, session_id: str) -> SimpleBrowserTool:
        if session_id not in self.browsers:
            if BROWSER_BACKEND == "youcom":
                # 优先使用代码中配置的 key，否则使用环境变量
                api_key = YDC_API_KEY or os.getenv("YDC_API_KEY")
                if not api_key:
                    raise ValueError("YDC_API_KEY not configured. Please set it in browser_server.py or as environment variable.")
                os.environ["YDC_API_KEY"] = api_key  # YouComBackend 从环境变量读取
                backend = YouComBackend(source="web")
            elif BROWSER_BACKEND == "exa":
                # 优先使用代码中配置的 key，否则使用环境变量
                api_key = EXA_API_KEY or os.getenv("EXA_API_KEY")
                if not api_key:
                    raise ValueError("EXA_API_KEY not configured. Please set it in browser_server.py or as environment variable.")
                backend = ExaBackend(source="web", api_key=api_key)
            else:
                raise ValueError(f"Invalid BROWSER_BACKEND: {BROWSER_BACKEND}. Use 'exa' or 'youcom'.")
            self.browsers[session_id] = SimpleBrowserTool(backend=backend)
        return self.browsers[session_id]

    def remove_browser(self, session_id: str) -> None:
        self.browsers.pop(session_id, None)


@asynccontextmanager
async def app_lifespan(_server: FastMCP) -> AsyncIterator[AppContext]:
    yield AppContext()


# Pass lifespan to server
mcp = FastMCP(
    name="browser",
    instructions=r"""
Tool for browsing.
The `cursor` appears in brackets before each browsing display: `[{cursor}]`.
Cite information from the tool using the following format:
`【{cursor}†L{line_start}(-L{line_end})?】`, for example: `【6†L9-L11】` or `【8†L3】`. 
Do not quote more than 10 words directly from the tool output.
sources=web
""".strip(),
    lifespan=app_lifespan,
    port=8001,
)


@mcp.tool(
    name="search",
    title="Search for information",
    description=
    "Searches for information related to `query` and displays `topn` results.",
)
async def search(ctx: Context,
                 query: str,
                 topn: int = 10,
                 source: Optional[str] = None) -> str:
    """Search for information related to a query"""
    browser = ctx.request_context.lifespan_context.create_or_get_browser(
        ctx.client_id)
    messages = []
    async for message in browser.search(query=query, topn=topn, source=source):
        if message.content and hasattr(message.content[0], 'text'):
            messages.append(message.content[0].text)
    return "\n".join(messages)


@mcp.tool(
    name="open",
    title="Open a link or page",
    description="""
Opens the link `id` from the page indicated by `cursor` starting at line number `loc`, showing `num_lines` lines.
Valid link ids are displayed with the formatting: `【{id}†.*】`.
If `cursor` is not provided, the most recent page is implied.
If `id` is a string, it is treated as a fully qualified URL associated with `source`.
If `loc` is not provided, the viewport will be positioned at the beginning of the document or centered on the most relevant passage, if available.
Use this function without `id` to scroll to a new location of an opened page.
""".strip(),
)
async def open_link(ctx: Context,
                    id: Union[int, str] = -1,
                    cursor: int = -1,
                    loc: int = -1,
                    num_lines: int = -1,
                    view_source: bool = False,
                    source: Optional[str] = None) -> str:
    """Open a link or navigate to a page location"""
    browser = ctx.request_context.lifespan_context.create_or_get_browser(
        ctx.client_id)
    messages = []
    async for message in browser.open(id=id,
                                      cursor=cursor,
                                      loc=loc,
                                      num_lines=num_lines,
                                      view_source=view_source,
                                      source=source):
        if message.content and hasattr(message.content[0], 'text'):
            messages.append(message.content[0].text)
    return "\n".join(messages)


@mcp.tool(
    name="find",
    title="Find pattern in page",
    description=
    "Finds exact matches of `pattern` in the current page, or the page given by `cursor`.",
)
async def find_pattern(ctx: Context, pattern: str, cursor: int = -1) -> str:
    """Find exact matches of a pattern in the current page"""
    browser = ctx.request_context.lifespan_context.create_or_get_browser(
        ctx.client_id)
    messages = []
    async for message in browser.find(pattern=pattern, cursor=cursor):
        if message.content and hasattr(message.content[0], 'text'):
            messages.append(message.content[0].text)
    return "\n".join(messages)
