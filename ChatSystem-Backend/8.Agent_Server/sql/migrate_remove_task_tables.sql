-- 迁移脚本：移除 task 相关表，消除 task 概念
-- 执行前请确保已备份数据

-- 1. 先删除有外键约束的子表
DROP TABLE IF EXISTS agent_task_event;

-- 2. 删除 agent_task 主表（agent_todo 和 agent_thought_chain 的外键约束也需处理）
--    注意：agent_todo 和 agent_thought_chain 中的 task_id 列将作为 stream_id 使用
--    若有外键约束指向 agent_task，需先删除外键

-- 检查并删除 agent_todo 的外键约束（如果存在）
SET @fk_todo := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'agent_todo'
      AND REFERENCED_TABLE_NAME = 'agent_task'
    LIMIT 1
);
SET @sql_drop_fk_todo := IF(@fk_todo IS NOT NULL,
    CONCAT('ALTER TABLE agent_todo DROP FOREIGN KEY ', @fk_todo),
    'SELECT 1'
);
PREPARE stmt FROM @sql_drop_fk_todo;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并删除 agent_thought_chain 的外键约束（如果存在）
SET @fk_chain := (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'agent_thought_chain'
      AND REFERENCED_TABLE_NAME = 'agent_task'
    LIMIT 1
);
SET @sql_drop_fk_chain := IF(@fk_chain IS NOT NULL,
    CONCAT('ALTER TABLE agent_thought_chain DROP FOREIGN KEY ', @fk_chain),
    'SELECT 1'
);
PREPARE stmt FROM @sql_drop_fk_chain;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 删除 agent_task 表
DROP TABLE IF EXISTS agent_task;

-- 验证：保留的表
-- SELECT TABLE_NAME FROM information_schema.TABLES
-- WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME LIKE 'agent_%';
-- 应保留: agent_todo, agent_thought_chain, agent_conversation, agent_conversation_message
