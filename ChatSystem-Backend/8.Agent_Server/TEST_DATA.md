# Agent Server 测试数据

## 环境配置

### 服务地址
- **Agent Server**: http://localhost:8080
- **API 文档**: http://localhost:8080/docs
- **健康检查**: http://localhost:8080/health

### 数据库连接
| 服务 | 主机 | 端口 | 用户名 | 密码 | 数据库 |
|------|------|------|--------|------|--------|
| MySQL | 127.0.0.1 | 3306 | root | Cydia4384! | chen_im |
| Redis | 127.0.0.1 | 6379 | - | - | 0 |

### 启动命令
```bash
cd /home/chen/cpp_chatsystem/ChatSystem-Backend/8.Agent_Server
~/miniconda3/envs/chatkit/bin/python -m src.main
```

---

## 测试用户

| 用户ID | 昵称 | 密码 | 说明 |
|--------|------|------|------|
| `test-user-alice` | Alice | password123 | Agent 测试用户 A |
| `test-user-bob` | Bob | password123 | Agent 测试用户 B |
| `test-user-charlie` | Charlie | password123 | Agent 测试用户 C |

---

## Agent 用户

| 用户ID | 昵称 | 模型 | Provider |
|--------|------|------|----------|
| `agent-o4-mini` | AI 助手 (O4-Mini) | o4-mini | openai |
| `agent-gpt-oss-120b` | AI 助手 (GPT-OSS-120B) | openai/gpt-oss-120b | openrouter |

---

## 聊天会话

| 会话ID | 名称 | 类型 | 成员 |
|--------|------|------|------|
| `session-alice-bob` | Alice与Bob | 单聊 | Alice, Bob |
| `session-agent-group-1` | AI助手测试群 | 群聊 | Alice, Bob, agent-o4-mini |
| `session-charlie-agent` | Charlie与AI助手 | 单聊 | Charlie, agent-gpt-oss-120b |

---

## Global Agent 会话

| 会话ID | 所属用户 | 标题 | 消息数 |
|--------|----------|------|--------|
| `global-conv-001` | test-user-alice | 关于Python编程的问题 | 4 |
| `global-conv-002` | test-user-alice | 项目架构讨论 | 2 |
| `global-conv-003` | test-user-bob | 技术方案咨询 | 0 |

---

## 测试任务

| 任务ID | 创建者 | 类型 | 状态 | 说明 |
|--------|--------|------|------|------|
| `task-001` | test-user-alice | session | completed | 代码结构分析 |
| `task-002` | test-user-bob | task | running | 代码质量检查 (含 Todo 和 ThoughtChain) |
| `task-003` | test-user-charlie | global | completed | Python 装饰器解释 |

### task-002 的 TodoList
| Todo ID | 内容 | 状态 |
|---------|------|------|
| `todo-001` | 扫描代码文件 | completed |
| `todo-002` | 检查代码规范 | completed |
| `todo-003` | 运行单元测试 | in_progress |
| `todo-004` | 生成报告 | pending |

### task-002 的 ThoughtChain
| 序号 | 类型 | 标题 | 状态 |
|------|------|------|------|
| 1 | reasoning | 分析任务 | success |
| 2 | tool_call | 扫描文件 | success |
| 3 | tool_output | 扫描结果 | success |
| 4 | tool_call | 代码检查 | success |
| 5 | tool_output | 检查结果 | success |
| 6 | reasoning | 分析检查结果 | success |
| 7 | tool_call | 运行测试 | running |

---

## API 测试示例

### 获取 Agent 列表
```bash
curl http://localhost:8080/agent/agents
```

### 获取服务状态
```bash
curl http://localhost:8080/agent/status
```

### 获取 Global Agent 会话列表
```bash
curl "http://localhost:8080/agent/global/conversations?user_id=test-user-alice"
```

### 获取会话消息
```bash
curl http://localhost:8080/agent/global/conversations/global-conv-001/messages
```

### 获取任务 TodoList
```bash
curl http://localhost:8080/agent/tasks/task-002/todos
```

### 获取任务 ThoughtChain
```bash
curl http://localhost:8080/agent/tasks/task-002/thought-chain
```

---

## 数据库表结构

### Agent 相关表
- `agent_conversation` - Global Agent 会话
- `agent_conversation_message` - 会话消息
- `agent_task` - 任务记录
- `agent_task_event` - 任务事件
- `agent_todo` - Todo 列表
- `agent_thought_chain` - 思维链

### 扩展字段 (user 表)
- `is_agent` - Agent 标识 (0=普通用户, 1=Agent)
- `agent_model` - 使用的模型名称
- `agent_provider` - 模型提供者 (openai/openrouter)

### 视图
- `v_agent_users` - Agent 用户列表视图
