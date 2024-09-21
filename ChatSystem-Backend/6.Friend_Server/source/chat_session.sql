/* This file was generated by ODB, object-relational mapping (ORM)
 * compiler for C++.
 */

USE `chen_im`;

DROP TABLE IF EXISTS `chat_session`;

CREATE TABLE `chat_session` (
  `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `chat_session_id` varchar(64) NOT NULL,
  `chat_session_name` varchar(64) NOT NULL,
  `chat_session_type` tinyint NOT NULL)
 ENGINE=InnoDB;

CREATE UNIQUE INDEX `chat_session_id_i`
  ON `chat_session` (`chat_session_id`);

