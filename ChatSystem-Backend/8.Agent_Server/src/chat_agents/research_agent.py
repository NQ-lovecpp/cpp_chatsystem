"""
DeepResearchAgent - 深度研究多智能体

参考 openai-agents-python research_bot 实现三阶段流程：
  PlannerAgent -> SearchAgent x N (并行) -> WriterAgent

通过 SSE 发布进度事件到 task:{task_id} 频道，前端右侧边栏可展示。
研究完成后通过 dual_writer 向聊天会话发送报告消息。
"""
import asyncio
import uuid
import json
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from loguru import logger

from agents import Agent, Runner, RunConfig, function_tool

import sys
from pathlib import Path
src_dir = Path(__file__).parent.parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import settings
from providers import get_default_provider
from runtime.sse_bus import sse_bus
from runtime.dual_writer import dual_writer, AgentMessage
from tools.sdk_tools import web_search, web_open, web_find


# ──────────────────── Structured Output Models ────────────────────

class SearchItem(BaseModel):
    """单条搜索任务"""
    query: str
    """搜索关键词"""
    reason: str
    """为什么需要这次搜索"""


class SearchPlan(BaseModel):
    """搜索计划"""
    searches: List[SearchItem]
    """5-15 条搜索任务"""


class ReportData(BaseModel):
    """研究报告"""
    short_summary: str
    """2-3 句话的简短摘要"""
    markdown_report: str
    """完整的 Markdown 报告（1000+ 词）"""
    follow_up_questions: List[str]
    """建议进一步研究的问题"""


# ──────────────────── Sub-Agents ────────────────────

PLANNER_PROMPT = """你是一名研究助手。给定一个研究主题，生成一组网络搜索查询来全面回答该主题。
输出 5 到 15 条搜索查询，每条附上理由。搜索词应覆盖多个角度和维度。
使用中文进行搜索（除非主题本身是英文的）。"""

SEARCH_PROMPT = """你是一名研究助手。给定搜索词，执行网络搜索并产出简洁的总结。
总结应为 2-3 段、不超过 300 字。抓住要点即可，不需要完整句子。
这将被用于合成研究报告，务必抓住核心信息。只输出总结本身。"""

WRITER_PROMPT = """你是一名资深研究员，负责根据搜索结果撰写完整的研究报告。

你会收到：
1. 原始研究主题
2. 研究助手搜集的搜索摘要

请：
1. 先规划报告大纲
2. 撰写详细报告（Markdown 格式，1000+ 字，5-10 页内容）
3. 给出 2-3 句话的简短摘要
4. 建议 3-5 个后续研究方向

报告应结构清晰、论据充分、引用搜索中的关键事实。使用中文撰写。"""


def _create_planner_agent(model: Optional[str] = None) -> Agent:
    return Agent(
        name="PlannerAgent",
        instructions=PLANNER_PROMPT,
        model=model or "openai/gpt-5-mini",
        output_type=SearchPlan,
    )


def _create_search_agent(model: Optional[str] = None) -> Agent:
    return Agent(
        name="SearchAgent",
        instructions=SEARCH_PROMPT,
        model=model or "openai/gpt-5-mini",
        tools=[web_search, web_open, web_find],
    )


def _create_writer_agent(model: Optional[str] = None) -> Agent:
    return Agent(
        name="WriterAgent",
        instructions=WRITER_PROMPT,
        model=model or "openai/gpt-5-mini",
        output_type=ReportData,
    )


# ──────────────────── Research Manager ────────────────────

class DeepResearchManager:
    """
    编排深度研究三阶段流程，通过 SSE 发布进度事件。
    """

    def __init__(self, task_id: str, chat_session_id: str, agent_user_id: str):
        self.task_id = task_id
        self.chat_session_id = chat_session_id
        self.agent_user_id = agent_user_id
        self.provider = get_default_provider()

    async def _publish(self, event_type: str, data: dict):
        await sse_bus.publish(self.task_id, event_type, data)

    async def run(self, topic: str, context: str = "") -> Optional[ReportData]:
        """执行完整的深度研究流程"""
        try:
            await self._publish("task_status", {"status": "running", "topic": topic})
            await self._publish("todo_added", {"todo": {"id": "plan", "text": "制定搜索计划", "status": "running"}})

            # Phase 1: Planning
            search_plan = await self._plan(topic, context)
            if not search_plan or not search_plan.searches:
                await self._publish("error", {"message": "搜索计划生成失败"})
                return None

            await self._publish("todo_status", {"todoId": "plan", "status": "completed"})
            await self._publish("todo_added", {"todo": {"id": "search", "text": f"执行 {len(search_plan.searches)} 条搜索", "status": "running"}})

            # Phase 2: Parallel Search
            search_results = await self._search(search_plan)
            await self._publish("todo_status", {"todoId": "search", "status": "completed"})
            await self._publish("todo_added", {"todo": {"id": "write", "text": "撰写研究报告", "status": "running"}})

            # Phase 3: Write Report
            report = await self._write(topic, search_results)
            await self._publish("todo_status", {"todoId": "write", "status": "completed"})

            if report:
                await self._deliver_report(topic, report)
                await self._publish("task_status", {"status": "done", "summary": report.short_summary})
            else:
                await self._publish("error", {"message": "报告生成失败"})

            return report

        except Exception as e:
            logger.error(f"[{self.task_id}] Deep research failed: {e}", exc_info=True)
            await self._publish("error", {"message": str(e)})
            await self._publish("task_status", {"status": "failed", "error": str(e)})
            return None

    async def _plan(self, topic: str, context: str) -> Optional[SearchPlan]:
        input_text = f"研究主题: {topic}"
        if context:
            input_text += f"\n\n背景信息:\n{context}"

        try:
            result = await Runner.run(
                _create_planner_agent(),
                input_text,
                run_config=RunConfig(model_provider=self.provider),
            )
            plan = result.final_output_as(SearchPlan)
            await self._publish("thought_chain", {
                "step": "search_plan",
                "content": f"计划执行 {len(plan.searches)} 条搜索:\n" +
                           "\n".join(f"  - {s.query} ({s.reason})" for s in plan.searches[:5]) +
                           (f"\n  ... 等 {len(plan.searches)} 条" if len(plan.searches) > 5 else ""),
            })
            return plan
        except Exception as e:
            logger.error(f"[{self.task_id}] Planning failed: {e}")
            return None

    async def _search(self, plan: SearchPlan) -> List[str]:
        tasks = [asyncio.create_task(self._single_search(item, i, len(plan.searches)))
                 for i, item in enumerate(plan.searches)]

        results = []
        completed = 0
        for coro in asyncio.as_completed(tasks):
            result = await coro
            completed += 1
            if result:
                results.append(result)
            await self._publish("todo_progress", {
                "progress": round(completed / len(tasks) * 100),
                "completed": completed,
                "total": len(tasks),
            })

        return results

    async def _single_search(self, item: SearchItem, index: int, total: int) -> Optional[str]:
        input_text = f"搜索词: {item.query}\n搜索理由: {item.reason}"
        try:
            result = await Runner.run(
                _create_search_agent(),
                input_text,
                run_config=RunConfig(model_provider=self.provider),
            )
            return str(result.final_output)
        except Exception as e:
            logger.warning(f"[{self.task_id}] Search {index+1}/{total} failed: {e}")
            return None

    async def _write(self, topic: str, search_results: List[str]) -> Optional[ReportData]:
        input_text = f"原始研究主题: {topic}\n\n搜索结果摘要:\n"
        for i, r in enumerate(search_results, 1):
            input_text += f"\n--- 搜索结果 {i} ---\n{r}\n"

        try:
            result = await Runner.run(
                _create_writer_agent(),
                input_text,
                run_config=RunConfig(model_provider=self.provider),
            )
            return result.final_output_as(ReportData)
        except Exception as e:
            logger.error(f"[{self.task_id}] Writing failed: {e}")
            return None

    async def _deliver_report(self, topic: str, report: ReportData):
        """将报告作为消息发送到聊天会话"""
        content = (
            f"## 深度研究完成: {topic}\n\n"
            f"**摘要**: {report.short_summary}\n\n"
            f"---\n\n"
            f"{report.markdown_report}\n\n"
            f"---\n\n"
            f"### 建议后续研究方向\n"
        )
        for q in report.follow_up_questions:
            content += f"- {q}\n"

        message = AgentMessage(
            message_id=str(uuid.uuid4()),
            session_id=self.chat_session_id,
            user_id=self.agent_user_id,
            content=content,
            content_type="xmarkdown",
            metadata={
                "type": "deep_research_report",
                "task_id": self.task_id,
                "topic": topic,
                "summary": report.short_summary,
            },
        )

        await dual_writer.write_agent_message(message, "AI 助手", wait_mysql=True)

        session_channel = f"session:{self.chat_session_id}"
        await sse_bus.publish(session_channel, "agent_done", {
            "message_id": message.message_id,
            "chat_session_id": self.chat_session_id,
            "agent_user_id": self.agent_user_id,
            "final_content": content,
        })


# ──────────────────── Active Task Registry ────────────────────

_active_tasks: dict[str, dict] = {}


def get_active_tasks() -> list[dict]:
    """获取所有活跃的后台任务"""
    return [
        {**info, "task_id": tid}
        for tid, info in _active_tasks.items()
    ]


async def run_deep_research(
    task_id: str,
    topic: str,
    chat_session_id: str,
    agent_user_id: str,
    context: str = "",
):
    """后台执行深度研究（被 asyncio.create_task 调用）"""
    _active_tasks[task_id] = {
        "topic": topic,
        "status": "running",
        "started_at": datetime.now().isoformat(),
        "chat_session_id": chat_session_id,
    }

    try:
        manager = DeepResearchManager(task_id, chat_session_id, agent_user_id)
        await manager.run(topic, context)
        _active_tasks[task_id]["status"] = "done"
    except Exception as e:
        logger.error(f"[{task_id}] Deep research task failed: {e}", exc_info=True)
        _active_tasks[task_id]["status"] = "failed"
    finally:
        await asyncio.sleep(300)
        _active_tasks.pop(task_id, None)
