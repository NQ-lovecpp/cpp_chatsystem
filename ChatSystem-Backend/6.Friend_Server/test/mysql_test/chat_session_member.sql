/* This file was generated by ODB, object-relational mapping (ORM)
 * compiler for C++.
 */

DROP TABLE IF EXISTS `chat_session_member`;

CREATE TABLE `chat_session_member` (
  `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `session_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL)
 ENGINE=InnoDB;

CREATE INDEX `session_id_i`
  ON `chat_session_member` (`session_id`);

