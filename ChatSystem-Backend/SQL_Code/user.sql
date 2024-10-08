/* This file was generated by ODB, object-relational mapping (ORM)
 * compiler for C++.
 */

DROP TABLE IF EXISTS `user`;
-- 用户表：存放用户完整信息
CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT, -- 唯一的自增id：只是用来计数，和业务无关，不用画在ER图里
  `user_id` varchar(64) NOT NULL, -- 用户id
  `nickname` varchar(64) NULL, -- 昵称
  `description` TEXT NULL, -- 描述（个性签名）
  `password` varchar(64) NULL, -- 密码
  `phone` varchar(64) NULL, -- 手机号
  `avatar_id` varchar(64) NULL) -- 头像文件的文件id
 ENGINE=InnoDB;

CREATE UNIQUE INDEX `user_id_i`
  ON `user` (`user_id`);

CREATE UNIQUE INDEX `nickname_i`
  ON `user` (`nickname`);

CREATE UNIQUE INDEX `phone_i`
  ON `user` (`phone`);

