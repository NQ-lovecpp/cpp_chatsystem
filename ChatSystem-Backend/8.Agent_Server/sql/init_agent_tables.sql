-- Agent Server 数据库表初始化脚本
-- 为 Agent 功能创建独立的持久化存储

USE chen_im;

-- =====================================================
-- 1. 扩展 user 表，添加 is_agent 字段
-- =====================================================
ALTER TABLE `user` 
    ADD COLUMN IF NOT EXISTS `is_agent` TINYINT DEFAULT 0 COMMENT 'Agent 标识：0-普通用户，1-Agent用户',
    ADD COLUMN IF NOT EXISTS `agent_model` VARCHAR(64) DEFAULT NULL COMMENT 'Agent 使用的模型名称',
    ADD COLUMN IF NOT EXISTS `agent_provider` VARCHAR(32) DEFAULT NULL COMMENT 'Agent 模型提供者：openai/openrouter';


-- =====================================================
-- 2. Agent 会话表（Global Agent 的会话管理）
-- =====================================================
CREATE TABLE IF NOT EXISTS `agent_conversation` (
    `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `conversation_id` VARCHAR(64) NOT NULL COMMENT '会话唯一ID',
    `user_id` VARCHAR(64) NOT NULL COMMENT '所属用户ID',
    `title` VARCHAR(256) NOT NULL DEFAULT '新对话' COMMENT '会话标题',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX `idx_conversation_id` (`conversation_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Agent 会话表';


-- =====================================================
-- 3. Agent 会话消息表
-- =====================================================
CREATE TABLE IF NOT EXISTS `agent_conversation_message` (
    `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `message_id` VARCHAR(64) NOT NULL COMMENT '消息唯一ID',
    `conversation_id` VARCHAR(64) NOT NULL COMMENT '所属会话ID',
    `role` ENUM('user', 'assistant', 'system') NOT NULL COMMENT '消息角色',
    `content` LONGTEXT NOT NULL COMMENT '消息内容（支持JSON格式）',
    `content_type` VARCHAR(32) DEFAULT 'text' COMMENT '内容类型：text/json/xmarkdown',
    `metadata` JSON COMMENT '元数据（思考过程、工具调用、引用等）',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE INDEX `idx_message_id` (`message_id`),
    INDEX `idx_conversation_id` (`conversation_id`),
    INDEX `idx_created_at` (`created_at`),
    FOREIGN KEY (`conversation_id`) REFERENCES `agent_conversation`(`conversation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Agent 会话消息表';


-- =====================================================
-- 4. Agent 任务表（持久化任务状态）
-- =====================================================
CREATE TABLE IF NOT EXISTS `agent_task` (
    `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `task_id` VARCHAR(64) NOT NULL COMMENT '任务唯一ID',
    `user_id` VARCHAR(64) NOT NULL COMMENT '创建者用户ID',
    `chat_session_id` VARCHAR(64) DEFAULT NULL COMMENT '关联的聊天会话ID（SessionAgent）',
    `conversation_id` VARCHAR(64) DEFAULT NULL COMMENT '关联的Agent会话ID（GlobalAgent）',
    `task_type` ENUM('session', 'task', 'global') NOT NULL COMMENT '任务类型',
    `status` ENUM('pending', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT '任务状态',
    `input` TEXT COMMENT '任务输入',
    `result` LONGTEXT COMMENT '任务结果',
    `error` TEXT COMMENT '错误信息',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `completed_at` TIMESTAMP NULL COMMENT '完成时间',
    UNIQUE INDEX `idx_task_id` (`task_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_chat_session_id` (`chat_session_id`),
    INDEX `idx_conversation_id` (`conversation_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Agent 任务表';


-- =====================================================
-- 5. Agent 任务事件表（持久化SSE事件历史）
-- =====================================================
CREATE TABLE IF NOT EXISTS `agent_task_event` (
    `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `event_id` VARCHAR(64) NOT NULL COMMENT '事件唯一ID',
    `task_id` VARCHAR(64) NOT NULL COMMENT '所属任务ID',
    `event_type` VARCHAR(32) NOT NULL COMMENT '事件类型',
    `event_data` JSON NOT NULL COMMENT '事件数据',
    `sequence` INT UNSIGNED NOT NULL COMMENT '事件序号',
    `created_at` TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（毫秒精度）',
    UNIQUE INDEX `idx_event_id` (`event_id`),
    INDEX `idx_task_id_sequence` (`task_id`, `sequence`),
    FOREIGN KEY (`task_id`) REFERENCES `agent_task`(`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Agent 任务事件表';


-- =====================================================
-- 6. Agent Todo 表（任务的 Todo 列表）
-- =====================================================
CREATE TABLE IF NOT EXISTS `agent_todo` (
    `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `todo_id` VARCHAR(64) NOT NULL COMMENT 'Todo 唯一ID',
    `task_id` VARCHAR(64) NOT NULL COMMENT '所属任务ID',
    `content` TEXT NOT NULL COMMENT 'Todo 内容',
    `status` ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Todo 状态',
    `sequence` INT UNSIGNED NOT NULL COMMENT '排序序号',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX `idx_todo_id` (`todo_id`),
    INDEX `idx_task_id` (`task_id`),
    FOREIGN KEY (`task_id`) REFERENCES `agent_task`(`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Agent Todo 表';


-- =====================================================
-- 7. Agent 思维链表（持久化 ThoughtChain 数据）
-- =====================================================
CREATE TABLE IF NOT EXISTS `agent_thought_chain` (
    `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `chain_id` VARCHAR(64) NOT NULL COMMENT '思维链节点唯一ID',
    `task_id` VARCHAR(64) NOT NULL COMMENT '所属任务ID',
    `parent_id` VARCHAR(64) DEFAULT NULL COMMENT '父节点ID（支持嵌套）',
    `node_type` ENUM('reasoning', 'tool_call', 'tool_output', 'result', 'error') NOT NULL COMMENT '节点类型',
    `title` VARCHAR(256) COMMENT '节点标题',
    `description` TEXT COMMENT '节点描述',
    `content` LONGTEXT COMMENT '节点内容（详细信息）',
    `status` ENUM('pending', 'running', 'success', 'error') DEFAULT 'pending' COMMENT '节点状态',
    `sequence` INT UNSIGNED NOT NULL COMMENT '排序序号',
    `metadata` JSON COMMENT '额外元数据',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE INDEX `idx_chain_id` (`chain_id`),
    INDEX `idx_task_id` (`task_id`),
    INDEX `idx_parent_id` (`parent_id`),
    FOREIGN KEY (`task_id`) REFERENCES `agent_task`(`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Agent 思维链表';


-- =====================================================
-- 8. 预置 Agent 用户
-- =====================================================
-- 注意：需要根据实际的 user_id 生成逻辑调整
-- 这里使用固定的 UUID 作为 Agent 用户 ID

INSERT IGNORE INTO `user` (`user_id`, `nickname`, `description`, `phone`, `is_agent`, `agent_model`, `agent_provider`) VALUES
('agent-o4-mini', 'AI 助手 (O4-Mini)', '基于 OpenAI O4-Mini 模型的智能助手', NULL, 1, 'o4-mini', 'openai'),
('agent-gpt-oss-120b', 'AI 助手 (GPT-OSS-120B)', '基于 OpenRouter GPT-OSS-120B 模型的智能助手', NULL, 1, 'openai/gpt-oss-120b', 'openrouter');


-- =====================================================
-- 9. 视图：获取 Agent 用户列表
-- =====================================================
CREATE OR REPLACE VIEW `v_agent_users` AS
SELECT 
    user_id,
    nickname,
    description,
    agent_model,
    agent_provider
FROM `user`
WHERE is_agent = 1;
