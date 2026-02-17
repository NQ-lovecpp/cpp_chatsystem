"""桥接层：将 tool_impl.simple_browser 暴露为 tools.simple_browser"""
from tools.tool_impl.simple_browser import SimpleBrowserTool, ExaBackend, YouComBackend

__all__ = ["SimpleBrowserTool", "ExaBackend", "YouComBackend"]
