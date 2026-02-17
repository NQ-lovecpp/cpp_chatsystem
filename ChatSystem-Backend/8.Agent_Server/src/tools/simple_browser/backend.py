"""桥接层：供 mcp-servers 使用 tools.simple_browser.backend 导入"""
from tools.tool_impl.simple_browser.backend import YouComBackend, ExaBackend

__all__ = ["YouComBackend", "ExaBackend"]
