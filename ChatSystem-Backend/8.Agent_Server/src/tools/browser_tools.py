"""
浏览器工具 - 提供网页搜索、打开和查找功能
使用 Exa API 作为搜索后端
"""
import os
import re
import textwrap
from typing import Optional, List, Dict, Any, Union
from dataclasses import dataclass, field
from urllib.parse import quote, unquote
import aiohttp
from loguru import logger

# 从环境变量或 .env 文件加载配置
from dotenv import load_dotenv
load_dotenv()


@dataclass
class SearchResult:
    """搜索结果"""
    id: int
    title: str
    url: str
    summary: str = ""
    

@dataclass
class PageContent:
    """页面内容"""
    url: str
    title: str
    text: str
    lines: List[str] = field(default_factory=list)
    urls: Dict[str, str] = field(default_factory=dict)  # id -> url 映射
    
    def __post_init__(self):
        if not self.lines and self.text:
            self.lines = self._wrap_lines(self.text)
    
    @staticmethod
    def _wrap_lines(text: str, width: int = 100) -> List[str]:
        """将文本按行包装"""
        lines = text.split("\n")
        wrapped = []
        for line in lines:
            if len(line) > width:
                wrapped.extend(textwrap.wrap(line, width=width) or [""])
            else:
                wrapped.append(line)
        return wrapped


class BrowserState:
    """浏览器状态 - 维护页面栈"""
    
    def __init__(self):
        self.pages: Dict[str, PageContent] = {}
        self.page_stack: List[str] = []
    
    @property
    def current_cursor(self) -> int:
        return len(self.page_stack) - 1
    
    def add_page(self, page: PageContent) -> int:
        """添加页面并返回 cursor"""
        self.pages[page.url] = page
        self.page_stack.append(page.url)
        return self.current_cursor
    
    def get_page(self, cursor: int = -1) -> Optional[PageContent]:
        """获取指定 cursor 的页面"""
        if not self.page_stack:
            return None
        if cursor == -1:
            cursor = self.current_cursor
        if 0 <= cursor < len(self.page_stack):
            url = self.page_stack[cursor]
            return self.pages.get(url)
        return None
    
    def clear(self):
        """清空状态"""
        self.pages.clear()
        self.page_stack.clear()


class BrowserTools:
    """
    浏览器工具集
    提供 web_search、web_open、web_find 三个核心功能
    """
    
    def __init__(self, session_id: str = "default"):
        self.session_id = session_id
        self.state = BrowserState()
        self.api_key = os.getenv("EXA_API_KEY")
        self.base_url = "https://api.exa.ai"
        self.view_lines = 50  # 每次显示的行数
        
        if not self.api_key:
            logger.warning("EXA_API_KEY not set, browser search will not work")
    
    async def _exa_request(self, endpoint: str, payload: dict) -> dict:
        """发送 Exa API 请求"""
        if not self.api_key:
            raise ValueError("EXA_API_KEY not configured")
        
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}{endpoint}",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    raise Exception(f"Exa API error {resp.status}: {error_text}")
                return await resp.json()
    
    def _format_page_view(
        self, 
        page: PageContent, 
        cursor: int,
        start_line: int = 0,
        num_lines: int = -1
    ) -> str:
        """格式化页面显示"""
        lines = page.lines
        total_lines = len(lines)
        
        if num_lines <= 0:
            num_lines = self.view_lines
        
        end_line = min(start_line + num_lines, total_lines)
        
        # 构建显示内容
        header = f"[{cursor}] {page.title}"
        if page.url:
            domain = self._extract_domain(page.url)
            header += f" ({domain})"
        
        scrollbar = f"**viewing lines [{start_line} - {end_line - 1}] of {total_lines - 1}**"
        
        # 添加行号
        body_lines = []
        for i, line in enumerate(lines[start_line:end_line], start=start_line):
            body_lines.append(f"L{i}: {line}")
        body = "\n".join(body_lines)
        
        return f"{header}\n{scrollbar}\n\n{body}"
    
    @staticmethod
    def _extract_domain(url: str) -> str:
        """提取域名"""
        try:
            parts = url.split("/")
            if len(parts) >= 3:
                return parts[2]
        except:
            pass
        return url[:50]
    
    async def web_search(self, query: str, topn: int = 10) -> dict:
        """
        搜索网页
        
        Args:
            query: 搜索关键词
            topn: 返回结果数量
            
        Returns:
            包含搜索结果的字典
        """
        logger.info(f"Browser search: {query}, topn={topn}")
        
        try:
            data = await self._exa_request("/search", {
                "query": query,
                "numResults": min(topn, 20),
                "contents": {"text": True, "summary": True}
            })
            
            results = data.get("results", [])
            
            # 构建搜索结果页面
            lines = [f"Search Results for: {query}", "=" * 50, ""]
            urls = {}
            
            for i, result in enumerate(results):
                title = result.get("title", "Untitled")
                url = result.get("url", "")
                summary = result.get("summary", "")[:200]
                
                lines.append(f"【{i}】{title}")
                lines.append(f"  URL: {url}")
                if summary:
                    lines.append(f"  {summary}")
                lines.append("")
                
                urls[str(i)] = url
            
            # 创建搜索结果页面
            page = PageContent(
                url=f"search://{quote(query)}",
                title=f"Search: {query}",
                text="\n".join(lines),
                urls=urls
            )
            
            cursor = self.state.add_page(page)
            display = self._format_page_view(page, cursor)
            
            return {
                "success": True,
                "cursor": cursor,
                "display": display,
                "result_count": len(results)
            }
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def web_open(
        self,
        id_or_url: Union[int, str] = -1,
        cursor: int = -1,
        loc: int = 0,
        num_lines: int = -1
    ) -> dict:
        """
        打开链接或滚动页面
        
        Args:
            id_or_url: 链接 ID（来自搜索结果）或完整 URL
            cursor: 页面 cursor（-1 表示当前页面）
            loc: 起始行号
            num_lines: 显示行数
            
        Returns:
            包含页面内容的字典
        """
        logger.info(f"Browser open: id_or_url={id_or_url}, cursor={cursor}, loc={loc}")
        
        try:
            url = None
            
            # 确定要打开的 URL
            if isinstance(id_or_url, str) and id_or_url.startswith("http"):
                # 直接 URL
                url = id_or_url
            elif isinstance(id_or_url, int) and id_or_url >= 0:
                # 从当前页面的链接中获取（需先调用 web_search 获取搜索结果）
                page = self.state.get_page(cursor)
                if not page:
                    return {"success": False, "error": f"Invalid link id: {id_or_url}。请先调用 web_search 获取搜索结果，或直接传入完整 URL。"}
                if str(id_or_url) not in page.urls:
                    available = ", ".join(sorted(page.urls.keys(), key=int)) if page.urls else "无"
                    return {"success": False, "error": f"Invalid link id: {id_or_url}。当前页面有效 ID: [{available}]。请先调用 web_search 或直接传入完整 URL。"}
                url = page.urls[str(id_or_url)]
            elif id_or_url == -1:
                # 滚动当前页面
                page = self.state.get_page(cursor)
                if page:
                    display = self._format_page_view(page, self.state.current_cursor, loc, num_lines)
                    return {
                        "success": True,
                        "cursor": self.state.current_cursor,
                        "display": display
                    }
                else:
                    return {"success": False, "error": "No page to scroll"}
            else:
                return {"success": False, "error": f"Invalid id_or_url: {id_or_url}"}
            
            # 使用 Exa 获取页面内容
            data = await self._exa_request("/contents", {
                "urls": [url],
                "text": {"includeHtmlTags": False}
            })
            
            results = data.get("results", [])
            if not results:
                return {"success": False, "error": f"Failed to fetch: {url}"}
            
            result = results[0]
            text = result.get("text", "")
            title = result.get("title", "Untitled")
            
            # 提取页面中的链接（简单实现）
            urls = {}
            # 这里可以用更复杂的逻辑提取链接
            
            page = PageContent(
                url=url,
                title=title,
                text=text,
                urls=urls
            )
            
            cursor = self.state.add_page(page)
            display = self._format_page_view(page, cursor, loc, num_lines)
            
            return {
                "success": True,
                "cursor": cursor,
                "display": display,
                "url": url,
                "title": title
            }
            
        except Exception as e:
            logger.error(f"Open error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def web_find(self, pattern: str, cursor: int = -1) -> dict:
        """
        在页面中查找文本
        
        Args:
            pattern: 查找模式（大小写不敏感）
            cursor: 页面 cursor
            
        Returns:
            包含匹配结果的字典
        """
        logger.info(f"Browser find: pattern={pattern}, cursor={cursor}")
        
        try:
            page = self.state.get_page(cursor)
            if not page:
                return {"success": False, "error": "No page to search"}
            
            pattern_lower = pattern.lower()
            matches = []
            
            for i, line in enumerate(page.lines):
                if pattern_lower in line.lower():
                    # 显示匹配行及上下文
                    start = max(0, i - 1)
                    end = min(len(page.lines), i + 3)
                    context = "\n".join([
                        f"L{j}: {page.lines[j]}" 
                        for j in range(start, end)
                    ])
                    matches.append({
                        "line": i,
                        "context": context
                    })
                    
                    if len(matches) >= 20:  # 限制结果数量
                        break
            
            if not matches:
                return {
                    "success": True,
                    "display": f"No matches found for: `{pattern}`",
                    "match_count": 0
                }
            
            # 构建结果显示
            lines = [f"Find results for: `{pattern}` in `{page.title}`", "=" * 50, ""]
            for i, match in enumerate(matches):
                lines.append(f"【{i}】match at L{match['line']}")
                lines.append(match["context"])
                lines.append("")
            
            result_page = PageContent(
                url=f"{page.url}/find?pattern={quote(pattern)}",
                title=f"Find: {pattern} in {page.title}",
                text="\n".join(lines)
            )
            
            new_cursor = self.state.add_page(result_page)
            display = self._format_page_view(result_page, new_cursor)
            
            return {
                "success": True,
                "cursor": new_cursor,
                "display": display,
                "match_count": len(matches)
            }
            
        except Exception as e:
            logger.error(f"Find error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_state(self) -> dict:
        """获取当前状态（用于序列化）"""
        return {
            "session_id": self.session_id,
            "current_cursor": self.state.current_cursor,
            "page_count": len(self.state.page_stack)
        }


# 会话级浏览器实例管理
_browser_instances: Dict[str, BrowserTools] = {}


def get_browser(session_id: str = "default") -> BrowserTools:
    """获取或创建浏览器实例"""
    if session_id not in _browser_instances:
        _browser_instances[session_id] = BrowserTools(session_id)
    return _browser_instances[session_id]


def clear_browser(session_id: str = "default"):
    """清除浏览器实例"""
    if session_id in _browser_instances:
        del _browser_instances[session_id]
