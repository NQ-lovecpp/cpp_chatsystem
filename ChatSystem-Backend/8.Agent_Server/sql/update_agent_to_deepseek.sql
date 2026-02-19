-- 将 OpenRouter agent 更新为 DeepSeek V3.2
USE chen_im;

UPDATE `user` SET
    nickname = 'AI 助手 (DeepSeek V3.2)',
    description = '基于 OpenRouter DeepSeek V3.2 模型的智能助手',
    agent_model = 'deepseek/deepseek-v3.2',
    agent_provider = 'openrouter'
WHERE user_id = 'agent-gpt-5-mini';

SELECT user_id, nickname, agent_model, agent_provider FROM user WHERE user_id = 'agent-gpt-5-mini';
