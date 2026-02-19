"""
ContentBuilder - 结构化 xmarkdown 内容构建器

将 agent 的思考、工具调用、工具结果、最终输出累积为一个
可流式传输的 xmarkdown 字符串。存入 MySQL message.content 字段，
前端解析相同标签即可还原渲染。

标签格式:
  <think>思考内容</think>
  <tool-call name="tool_name" arguments='{"key":"val"}'></tool-call>
  <tool-result name="tool_name" status="success">结果文本</tool-result>
  普通 markdown 文本（最终输出）
"""
import json
from enum import Enum
from typing import Optional


class PartType(str, Enum):
    THINK = "think"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    TEXT = "text"


class ContentBuilder:
    """累积结构化 xmarkdown 内容，支持流式追加和最终序列化。"""

    def __init__(self):
        # 每个 part: (PartType, content_str)
        self._parts: list[tuple[PartType, str]] = []
        # 当前正在追加的 part 类型（用于合并连续同类 delta）
        self._current_type: Optional[PartType] = None

    # ------------------------------------------------------------------
    # 追加方法 —— 每个都返回本次应发给前端的 SSE delta 字符串
    # ------------------------------------------------------------------

    def add_thinking(self, delta: str) -> str:
        """追加思考内容。返回要流式发送的 delta。"""
        if self._current_type == PartType.THINK:
            # 追加到最后一个 think part
            old = self._parts[-1][1]
            self._parts[-1] = (PartType.THINK, old + delta)
            return delta
        else:
            # 关闭上一个 part 的标签（如果需要），开始新 think
            self._current_type = PartType.THINK
            self._parts.append((PartType.THINK, delta))
            return delta

    def start_tool_call(self, name: str, arguments: str) -> str:
        """开始一个工具调用。返回 SSE delta。"""
        self._current_type = PartType.TOOL_CALL
        escaped_args = arguments.replace("'", "\\'")
        tag = f'<tool-call name="{name}" arguments=\'{escaped_args}\'>'
        self._parts.append((PartType.TOOL_CALL, tag))
        return tag

    def append_tool_args(self, delta: str) -> str:
        """追加工具参数增量（用于流式参数）。"""
        if self._parts and self._parts[-1][0] == PartType.TOOL_CALL:
            old = self._parts[-1][1]
            self._parts[-1] = (PartType.TOOL_CALL, old + delta)
        return delta

    def end_tool_call(self) -> str:
        """关闭 tool-call 标签。"""
        tag = "</tool-call>"
        if self._parts and self._parts[-1][0] == PartType.TOOL_CALL:
            old = self._parts[-1][1]
            self._parts[-1] = (PartType.TOOL_CALL, old + tag)
        return tag

    def add_tool_result(self, name: str, result: str, status: str = "success") -> str:
        """添加工具结果。返回完整的 tool-result 标签字符串。"""
        self._current_type = PartType.TOOL_RESULT
        # 截断过长结果
        display_result = result[:2000] if len(result) > 2000 else result
        tag = f'<tool-result name="{name}" status="{status}">\n{display_result}\n</tool-result>'
        self._parts.append((PartType.TOOL_RESULT, tag))
        return tag

    def add_text(self, delta: str) -> str:
        """追加最终输出文本。返回 delta。"""
        if self._current_type == PartType.TEXT:
            old = self._parts[-1][1]
            self._parts[-1] = (PartType.TEXT, old + delta)
            return delta
        else:
            self._current_type = PartType.TEXT
            self._parts.append((PartType.TEXT, delta))
            return delta

    # ------------------------------------------------------------------
    # 序列化
    # ------------------------------------------------------------------

    def to_string(self) -> str:
        """输出完整的 xmarkdown 字符串（存入 MySQL）。"""
        sections = []
        for ptype, content in self._parts:
            if ptype == PartType.THINK:
                sections.append(f"<think>\n{content}\n</think>")
            elif ptype == PartType.TOOL_CALL:
                # tool-call 标签已经在 content 中完整构建
                sections.append(content)
            elif ptype == PartType.TOOL_RESULT:
                sections.append(content)
            elif ptype == PartType.TEXT:
                sections.append(content)
        return "\n\n".join(sections)

    def get_full_text_only(self) -> str:
        """只获取最终输出文本（不含 think/tool 标签）。"""
        texts = [content for ptype, content in self._parts if ptype == PartType.TEXT]
        return "".join(texts)

    def has_content(self) -> bool:
        return len(self._parts) > 0
