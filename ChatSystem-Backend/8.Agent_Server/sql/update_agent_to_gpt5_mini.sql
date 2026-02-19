-- 将 OpenRouter agent 更新为 GPT 5 Mini（仅更新 nickname/description，不更名 user_id）
-- 若需完整更名 user_id agent-gpt-oss-120b → agent-gpt-5-mini，请执行 update_agent_gpt5_mini_rename.sql
UPDATE `user` SET
    nickname = 'AI 助手 (GPT 5 Mini)',
    description = '基于 OpenRouter GPT 5 Mini 模型的智能助手',
    agent_model = 'openai/gpt-5-mini',
    agent_provider = 'openrouter'
WHERE user_id = 'agent-gpt-5-mini';

SELECT user_id, nickname, agent_model, agent_provider FROM `user` WHERE user_id = 'agent-gpt-5-mini';
