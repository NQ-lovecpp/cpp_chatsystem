---
name: ChatSystem Agent 体系设计（融合版，Python 后端主导）
overview: 对比现有两份方案后给出融合版：采用网关鉴权 + Agent_Server(Python)编排，复用 simple_browser/python_docker 工具，前端借鉴现有 agent sdk 交互但改为后端驱动与 Ant Design 组件体系。
todos: []
isProject: false
---

# ChatSystem Agent 融合版方案

## 0. 结论与选择

### 0.1 两个现有方案结论

- `chatsystem_agent_体系设计_9b068714.plan.md` 更适合作为主干：  
保持了 `Gateway -> Agent_Server -> 现有后端能力` 的边界，权限链路更清晰，且更符合你当前 C++ 微服务架构。
- `chatsystem_agent_体系设计_255c9a87.plan.md` 的可借鉴点：  
把前端交互（SSE、tool call 展示、审批）拆得更细，落地细节更丰富。

### 0.2 融合策略

- 架构层面采用 `9b068714`。
- 交互层面借鉴 `255c9a87` 和 `my-gpt-project/frontend/src` 的 UI/事件模型。
- 工具层面直接接入你已有的：
  - `backend/tools/simple_browser`
  - `backend/tools/python_docker`

---

## 1. 目标架构（最终态）

```mermaid
flowchart TB
    subgraph FE [ChatSystem-Frontend-React]
      AgentPanel[全局 Agent 面板]
      SessionTask[会话 Task 面板]
      SseClient[SSE 客户端]
    end

    subgraph GW [7.Gateway_Server]
      Auth[session_id 鉴权]
      AgentProxy[/service/agent/* 代理]
    end

    subgraph AG [8.Agent_Server Python]
      FastAPI[FastAPI]
      Orchestrator[Agent Orchestrator]
      Tools[function tools]
      MCP[MCP Bridge]
      Queue[Task Worker + SSE Bus]
    end

    subgraph Existing [现有 C++ 服务]
      MsgSvc[Message Service]
      UserSvc[User Service]
      FriendSvc[Friend Service]
    end

    FE --> GW
    GW --> AG
    AG --> GW
    GW --> Existing
```



核心原则：

- 前端不再使用 JS Agent SDK 直连模型，不承载 Agent 决策逻辑。
- 所有 Agent 运行、工具调用、审批中断、SSE 事件统一在 Python 后端处理。
- 网关统一鉴权，Agent_Server 始终以 `X-User-Id/X-Session-Id` 运行。

---

## 2. 复用你已有工具（重点）

## 2.1 `simple_browser` 复用策略

来源：

- `ChatSystem-Backend/8.Agent_Server/examples/my-gpt-project/backend/tools/simple_browser/*`
- `ChatSystem-Backend/8.Agent_Server/examples/my-gpt-project/backend/gpt-oss-mcp-server/browser_server.py`

建议：

- 先以 **function_tool 直封装** 接入（最短路径），暴露：
  - `web_search(query, topn)`
  - `web_open(id_or_url, cursor, loc, num_lines)`
  - `web_find(pattern, cursor)`
- 第二阶段再考虑独立成 MCP Server（SSE）供多 Agent 复用。

注意：

- 严禁把 API key 硬编码在仓库，改为环境变量。
- 每个 task_id 或 conversation_id 维护独立 browser state（page_stack）。

## 2.2 `python_docker` 复用策略

来源：

- `ChatSystem-Backend/8.Agent_Server/examples/my-gpt-project/backend/tools/python_docker/docker_tool.py`

建议：

- 默认后端使用 `docker` 执行后端（安全默认）。
- 仅在开发环境允许 `dangerously_use_uv` 或本地 Jupyter。
- 加入资源限制（超时、CPU、内存、网络策略）并记录审计日志：
  - 用户
  - task_id
  - 执行代码 hash
  - 退出状态

---

## 3. Agent_Server 设计（Python）

## 3.1 建议目录

```text
ChatSystem-Backend/8.Agent_Server/
├── src/
│   ├── main.py
│   ├── config.py
│   ├── auth.py
│   ├── routers/
│   │   ├── tasks.py         # POST /agent/tasks
│   │   ├── events.py        # GET /agent/events (SSE)
│   │   └── approvals.py     # POST /agent/approvals
│   ├── agents/
│   │   ├── session_agent.py
│   │   └── global_agent.py
│   ├── tools/
│   │   ├── chat_tools.py
│   │   ├── browser_tools.py # from simple_browser
│   │   ├── python_tools.py  # from python_docker
│   │   └── todo_tools.py
│   ├── runtime/
│   │   ├── task_worker.py
│   │   ├── sse_bus.py
│   │   └── approval_store.py
│   └── gateway_client.py
└── requirements.txt
```

## 3.2 API 统一为网关代理前缀

- `POST /service/agent/tasks`：创建任务（会话/全局）
- `GET /service/agent/events?task_id=...`：订阅任务 SSE
- `POST /service/agent/approvals`：提交审批结果
- `GET /service/agent/tasks/{task_id}`：查询任务状态（重连兜底）

## 3.3 SSE 事件模型（借鉴你现有前端）

建议保留这些事件语义（前后端统一）：

- `init`
- `reasoning_delta`
- `tool_call`
- `tool_output`
- `interruption`（需要审批）
- `message`
- `done`
- `error`

这样可以最大化复用你已有的消息编排经验，同时替换底层数据来源为后端事件流。

---

## 4. 数据与消息模型

## 4.1 message_type 扩展

沿用并确认：

- `AGENT_STREAM = 4`

`content` 建议存储为 JSON：

```json
{
  "task_id": "t_xxx",
  "final_text": "...markdown...",
  "todos": [],
  "tool_calls": [],
  "sources": [],
  "stream_state": "done"
}
```

## 4.2 task 表

保留 task 表，最少字段：

- `task_id`
- `user_id`
- `chat_session_id` (nullable)
- `task_type`
- `status` (`running/done/failed/cancelled/waiting_approval`)
- `input_summary`
- `created_at/updated_at`

---

## 5. 前端方案（借鉴 + Ant Design 化）

你的 `my-gpt-project/frontend/src` 很值得借鉴，尤其是：

- `app/page.tsx` 的流式事件处理状态机
- `components/History.tsx` 的“用户消息 -> thinking block -> assistant”分组
- `components/messages/FunctionCall.tsx` 的工具调用可视化
- `components/Approvals.tsx` 的审批交互

但要改造为：

- 前端不维护 Agent SDK conversation 语义
- 仅维护 UI 状态和来自后端 SSE 的事件
- 组件层优先使用 Ant Design（可混用你现有样式）

## 5.1 组件映射建议（Ant Design）

- Tool 调用折叠卡片：`Collapse + Card + Tag + Typography.Text`
- 审批弹窗：`Modal + Descriptions + Button`
- 消息区：`List + Avatar + Typography + Space`
- 思考过程：`Collapse.Panel`（默认折叠）
- 进度/待办：`Timeline` 或 `Steps`

## 5.2 Markdown 渲染

你提到偏好 Ant Design，建议：

- 主体用 `@ant-design/x` 的 Markdown 能力（Think/Sources/CodeHighlighter）
- 若现有 `react-markdown` 先行，也可后续替换，不阻塞主流程

---

## 6. 审批流（高风险工具）

将工具分级：

- 自动执行：读消息、总结、普通检索
- 需审批：Python 执行、外部写操作、未来文件系统写入

流程：

1. Agent 发出 `tool_call`（needs approval）
2. 后端发 `interruption` 事件并置任务为 `waiting_approval`
3. 前端弹窗批准/拒绝
4. 调 `POST /service/agent/approvals`
5. 后端恢复执行并继续推流

---

## 7. 分阶段实施（推荐，含测试门禁）

### Phase 0：开发前预研与协议摸底（必须先做）

- 目标：先拿到“真实响应格式基线”，避免后续事件适配反复返工。
- 输出物（必须提交到仓库）：
  - `docs/agent-api-baseline.md`：三种通道的真实响应字段对照
  - `tests/contracts/provider_payloads/*.json`：脱敏后的样本响应
  - `tests/contracts/provider_contract_test.(py|js)`：字段契约测试脚本
- 预研维度：
  - OpenAI 官方 `Responses API`
  - OpenAI 官方 `Chat Completions API`
  - OpenRouter 的 `responses/chat completions` 兼容接口（按实际模型验证）
- 重点验证字段：
  - 文本增量（stream delta）结构
  - 工具调用（tool/function call）发起与回填结果结构
  - reasoning/思维链相关字段（是否有、粒度、是否可流式、是否仅摘要）
  - 中断与恢复（审批后继续）所需的最小上下文字段

### Phase 1：打通后端主链路

- 搭建 `FastAPI + tasks/events`
- 接入 `session_agent/global_agent`
- 跑通 `reasoning_delta + done`
- 测试门禁：
  - 必须有 `tasks/events` 的接口测试（创建、订阅、结束）
  - 必须有至少 1 个 SSE 流程测试（含断线重连）

### Phase 2：接入你的两大工具

- `browser_tools.py` 封装 `simple_browser`
- `python_tools.py` 封装 `python_docker`
- 打通 `tool_call/tool_output`
- 测试门禁：
  - `simple_browser` 三个关键路径测试：`search/open/find`
  - `python_docker` 执行成功、超时、异常三类测试
  - 工具调用事件序列测试：`tool_call -> tool_output -> done`

### Phase 3：审批与安全

- `approvals` API + interruption 恢复
- Python 工具资源限制与审计
- 测试门禁：
  - 审批通过与拒绝两条端到端测试
  - 未审批状态下任务不可继续执行的负向测试
  - 审计日志字段完整性测试（user_id/task_id/tool/status）

### Phase 4：前端 Ant Design Agent 面板

- 全局 Agent 页
- 会话 Task 面板
- 工具调用与审批 UI
- 测试门禁：
  - 前端最小 e2e：发问 -> 看到流式 -> 工具卡片 -> 最终消息
  - 审批弹窗交互测试：Approve/Reject 后状态变化正确

### Phase 5：持久化与历史回放

- `task` 表完善
- `AGENT_STREAM` 入库
- 历史渲染与断线恢复
- 测试门禁：
  - 历史回放一致性测试（实时结果 vs 入库回放）
  - 断线重连后补齐事件测试

---

## 8. 风险与规避

- 工具安全风险（Python 执行）  
通过 docker 隔离 + 超时 + 资源限制 + 审计。
- 状态一致性风险（SSE 断线）  
增加 `/tasks/{id}` 查询和事件重放游标（可选）。
- 架构越权风险（Agent 直连 DB）  
第一阶段优先通过网关/服务接口读写，后续再评估直连路径。

---

## 9. 最终建议（一句话）

以 `9b068714` 为骨架，融合 `255c9a87` 与你 `my-gpt-project` 的交互和工具资产，做成“Python 后端主导、前端 Ant Design 呈现、可审批可审计”的统一 Agent 体系。

---

## 10. 响应格式基线设计（必须先验）

本节不是“猜格式”，而是“以实测为准”建立契约，避免供应商差异导致线上解析失败。

## 10.1 三通道格式对照（建议关注）

- `Responses API`：
  - 关注输出 item 列表、工具调用 item、增量事件类型。
  - 关注 reasoning 字段是否提供全文、摘要或仅结构标记。
- `Chat Completions API`：
  - 关注 `choices[].delta`、`tool_calls` 增量拼接、finish reason。
  - 关注工具参数分片场景（arguments 流式拼接）。
- `OpenRouter 兼容层`：
  - 同一模型在不同 provider 下字段可能存在细微差异。
  - 必须对“当前拟用模型+端点”逐一录制样本，不可只按文档推断。

## 10.2 统一内部事件映射（Adapter 层）

在 Agent_Server 里增加 provider adapter，把外部差异收敛成内部统一事件：

- `TEXT_DELTA`
- `REASONING_DELTA`（若无则降级为 `NONE`）
- `TOOL_CALL_START`
- `TOOL_CALL_ARGS_DELTA`
- `TOOL_CALL_END`
- `TOOL_RESULT`
- `RUN_DONE`
- `RUN_ERROR`

前端与业务层仅消费内部事件，不直接依赖供应商原始字段。

## 10.3 思维链（reasoning）策略

- 默认不向最终用户展示完整链路推理文本（安全与合规优先）。
- 如模型仅支持 reasoning 摘要，则前端展示摘要卡片。
- 如模型不提供 reasoning 字段，前端退化为“处理中”状态，不影响主链路。

---

## 11. 开发前 PoC 任务清单（Agent SDK + Ant Design + examples 复用）

## 11.1 Agent SDK PoC

- PoC-A：最小 `run + stream`，验证文本增量事件。
- PoC-B：单工具调用（mock 工具），验证 call/args/result 事件链。
- PoC-C：审批中断后恢复执行。

## 11.2 Ant Design PoC

- PoC-D：消息渲染区（含 Markdown）
- PoC-E：工具调用折叠卡片（参数与输出分区）
- PoC-F：审批弹窗（批量审批 + 提交）

## 11.3 examples 复用评估清单

优先复用：

- `12-agentic-tool-calling/5_todos.py`：SSE 发布与任务进度表达
- `12-agentic-tool-calling/utils.py`：SSE 编码细节
- `my-gpt-project/backend/tools/simple_browser`：浏览器工具能力
- `my-gpt-project/backend/tools/python_docker`：Python 隔离执行

选择性借鉴：

- `my-gpt-project/frontend/src` 的状态组织与组件分层思想  
（保留思路，不直接照搬样式和 SDK 直连模式）

---

## 12. 接口测试规范（后端）

## 12.1 测试分层

- Contract Test（协议契约）：验证 provider 原始 payload 到内部事件映射。
- API Test（接口测试）：验证 `/tasks /events /approvals /tasks/{id}`。
- Integration Test（集成）：验证“网关鉴权 -> Agent_Server -> 工具 -> SSE”。
- E2E Test（端到端）：验证前后端用户路径。

## 12.2 每个功能开发完成后的强制要求

- 至少新增 1 个成功路径测试 + 1 个失败路径测试。
- 若改动事件协议，必须同步更新 contract fixtures 与 contract test。
- 若改动工具行为，必须补工具级单测和一条集成测试。

## 12.3 推荐测试目录

```text
ChatSystem-Backend/8.Agent_Server/tests/
├── contracts/
│   ├── fixtures/
│   └── test_provider_contract.py
├── api/
│   ├── test_tasks_api.py
│   ├── test_events_sse.py
│   └── test_approvals_api.py
├── integration/
│   ├── test_task_with_browser_tool.py
│   └── test_task_with_python_tool.py
└── e2e/
    └── test_agent_flow.py
```

---

## 13. 开发流程中的 JS API 测试规范

你提到“开发中直接用 js 代码测 API”，建议纳入标准流程，不作为临时手段。

## 13.1 脚本化 smoke test（Node）

- 在 `scripts/api-smoke/` 放置可重复执行脚本：
  - `create-task.mjs`
  - `stream-events.mjs`
  - `approve-task.mjs`
- 每次功能开发后执行一次 smoke 套件，输出到 `artifacts/api-smoke/`。

## 13.2 断言要求

- 必须断言关键事件顺序，而不只是打印日志：
  - `init` 在前
  - `tool_call` 先于 `tool_output`
  - `done/error` 作为终态
- 失败时输出原始事件片段，便于回溯。

---

## 14. 质量门禁与发布条件

- 未完成 Phase 0 的协议基线，不进入功能开发。
- 每个 Phase 未通过对应测试门禁，不进入下一阶段。
- 合并前必须通过：
  - contract + api + integration 最小集合
  - 关键 e2e（至少 1 条全链路）
- 新增或变更工具必须有安全评审记录（权限、资源限制、审计）。

