/* This file was generated by ODB, object-relational mapping (ORM)
 * compiler for C++.
 */

DROP TABLE IF EXISTS `chat_session_member`;
-- 聊天成员表：记录每个聊天会话里有哪些成员
-- 会话：群聊或单人聊天被统称为“会话”
CREATE TABLE `chat_session_member` ( -- 会话成员表
  `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT, -- 唯一的自增id
  `chat_session_id` varchar(64) NOT NULL, -- 聊天会话id
  `user_id` varchar(64) NOT NULL) -- 用户id：
 ENGINE=InnoDB;

CREATE INDEX `chat_session_id_i`
  ON `chat_session_member` (`chat_session_id`);

