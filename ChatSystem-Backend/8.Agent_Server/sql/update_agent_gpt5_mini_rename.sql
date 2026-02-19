-- 将 agent-gpt-oss-120b / AI 助手 (DeepSeek V3.2) 统一改为 agent-gpt-5-mini / AI 助手 (GPT 5 Mini)
-- 适用于 openai/gpt-5-mini | openrouter 的 Agent

USE chen_im;

-- 1. 更新关联表（先更新引用，再更新主表）
UPDATE `chat_session_member` SET user_id = 'agent-gpt-5-mini' WHERE user_id = 'agent-gpt-oss-120b';
UPDATE `message` SET user_id = 'agent-gpt-5-mini' WHERE user_id = 'agent-gpt-oss-120b';

-- 2. 更新 user 表
UPDATE `user` SET
    user_id = 'agent-gpt-5-mini',
    nickname = 'AI 助手 (GPT 5 Mini)',
    description = '基于 OpenRouter GPT 5 Mini 模型的智能助手',
    agent_model = 'openai/gpt-5-mini',
    agent_provider = 'openrouter'
WHERE user_id = 'agent-gpt-oss-120b';

-- 3. 验证
SELECT user_id, nickname, agent_model, agent_provider FROM `user` WHERE user_id = 'agent-gpt-5-mini';
