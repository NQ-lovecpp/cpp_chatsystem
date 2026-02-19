-- Agent System Simplification Migration
-- Drop unused tables; agent responses now stored as structured xmarkdown in the `message` table.
-- Keep `agent_task` for tracking running tasks.

-- Drop tables with FK dependencies first
DROP TABLE IF EXISTS agent_thought_chain;
DROP TABLE IF EXISTS agent_todo;
DROP TABLE IF EXISTS agent_task_event;

-- Drop GlobalAgent tables
DROP TABLE IF EXISTS agent_conversation_message;
DROP TABLE IF EXISTS agent_conversation;
