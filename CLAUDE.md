# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A hybrid chat system with two backends:
- **C++ Microservices** (`ChatSystem-Backend/`): 7 domain services + API gateway, built with brpc, protobuf, Redis, MySQL, etcd, RabbitMQ
- **Python Agent Server** (`ChatSystem-Backend/8.Agent_Server/`): FastAPI + OpenAI Agents SDK, provides AI assistant functionality
- **React Frontend** (`ChatSystem-Frontend-React/`): Ant Design X UI, communicates with both backends

## Development Commands

### Agent Server (Python)
```bash
cd ChatSystem-Backend/8.Agent_Server
source /home/chen/cpp_chatsystem/venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8080 --reload
```

### React Frontend
```bash
cd ChatSystem-Frontend-React
npm install
npm run dev        # Dev server on port 5173
npm run build      # Production build
npm run preview    # Preview production build
```

### Infrastructure (Docker)
```bash
cd ChatSystem-Backend
docker-compose up -d    # Start all infrastructure services
docker-compose down     # Stop services
```

### C++ Backend
```bash
cmake -B build && cmake --build build -j$(nproc)
```

## Architecture

### C++ Microservices
- **Gateway** (HTTP :9000, WS :9001): Routes all client requests to downstream services
- **user_server** (:10001): Registration, login, user profile
- **friend_server** (:10002): Friend requests, contacts
- **message_transmit_server** (:10003): Real-time message delivery via RabbitMQ
- **message_store_server** (:10004): Message persistence with Elasticsearch search
- **file_server** (:10005): File upload/download
- **speech_server** (:10006): Voice-to-text
- Service discovery via **etcd**; all services register on startup

### Agent Server (`ChatSystem-Backend/8.Agent_Server/src/`)
Key components:
- **`main.py`**: FastAPI app, routes under `/agent/tasks`, `/agent/events`, `/agent/approvals`, `/agent/agents`
- **`config.py`**: All settings (OpenAI model, DB, Redis, tool approval flags)
- **`chat_agents/session_agent.py`**: Handles chat session AI responses; spawns TaskAgent via `create_background_task` tool
- **`chat_agents/task_agent.py`**: Background agent with todo list + thought chain; emits SSE to its `task_id`; sends `task_callback` to parent on completion
- **`chat_agents/global_agent.py`**: User's personal AI assistant (not session-scoped)
- **`runtime/task_worker.py`**: `Task`, `TaskStatus`, `TaskType`, `TaskManager` — task lifecycle
- **`runtime/sse_bus.py`**: Pub/sub SSE event bus
- **`runtime/dual_writer.py`**: Persists messages to Redis + MySQL
- **`tools/sdk_tools.py`**: Web search, code execution; exports `current_task_id`, `current_user_id`, `current_chat_session_id` ContextVars
- **`tools/db_tools.py`**: Chat history, user info, message search
- **`tools/todo_tools.py`**: Todo list management for TaskAgent
- **`tools/python_tools.py`**: Docker-sandboxed Python execution

SSE event types: `task_created`, `task_callback`, `todo_added`, `todo_status`, `todo_progress`, `thought_chain`, `thought_chain_update`, `done`, `error`

### React Frontend (`ChatSystem-Frontend-React/src/`)
- **`contexts/AgentContext.jsx`**: Manages all agent task state; subscribes to SSE; handles `task_created` → `subscribeChildTask`, `task_callback` → updates child task status
- **`contexts/ChatContext.jsx`**: Chat messages and session history
- **`contexts/AuthContext.jsx`**: Auth state, session validation
- **`api/agentApi.js`**: Agent HTTP/SSE client; proxies `/agent` → `:8080` in dev via Vite
- **`components/MessageInput.jsx`**: `@AI助手` button triggers `onStartAgentTask(instruction)`
- **`components/MessageArea.jsx`**: `handleStartAgentTask` → calls `startTask(instruction, 'session', ...)`
- **`components/agent/TaskSidebar.jsx`**: Task progress panel; uses `task.progress` from `todo_progress` SSE event
- **`components/agent/TaskThoughtChain.jsx`**: Renders thought chain steps
- **`components/agent/TaskTodoList.jsx`**: Renders todo items with status

Dev proxy (vite.config.js): `/service` → `:9000`, `/ws` → `:9001`, `/agent` → `:8080`

### Data Flow: Agent Task
1. User clicks `@AI助手` in MessageInput
2. MessageArea calls `startTask(instruction, 'session', sessionId, chatHistory)`
3. `agentApi.createAgentTask()` → POST `/agent/tasks`
4. Backend creates Task, runs SessionAgent
5. SessionAgent may call `create_background_task` → spawns TaskAgent
6. Frontend AgentContext subscribes SSE for child task_id
7. TaskAgent emits `todo_added`, `thought_chain`, `todo_progress` events during execution
8. On finish, TaskAgent emits `task_callback` to parent; SessionAgent posts reply to chat

## Key Conventions
- Backend task types: `TASK`, `SESSION`, `GLOBAL`
- Frontend task status: `pending`, `running`, `waiting_approval`, `done`, `failed`, `cancelled`
- Agent tool approval (configurable in `.env`): `REQUIRE_APPROVAL_PYTHON_EXEC`, `REQUIRE_APPROVAL_WRITE_OPS`
- `.env` file in `8.Agent_Server/` configures model provider (OpenAI or OpenRouter), DB, Redis, Docker executor
