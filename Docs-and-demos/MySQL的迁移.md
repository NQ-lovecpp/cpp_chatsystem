在两台云服务器之间迁移 MySQL 数据库涉及到多个步骤，确保数据在新服务器上正确无误并保持业务的连续性。以下是常见的 MySQL 数据库迁移流程：

### 1. 准备工作
- **检查 MySQL 版本**：确保源服务器和目标服务器的 MySQL 版本兼容。如果版本不兼容，需要提前规划升级或降级方案。
- **备份数据**：始终建议在迁移之前备份数据以防意外。
- **配置目标服务器**：在目标服务器上安装 MySQL，并确保相关权限配置正确。

### 2. 备份 MySQL 数据
使用 `mysqldump` 工具可以将数据库备份为 SQL 文件，便于迁移。

```bash
mysqldump -u root -p --all-databases > all_databases.sql
```

- `-u root`：指定用户。
- `-p`：提示输入密码。
- `--all-databases`：备份所有数据库。如果只迁移某个数据库，可以使用 `--databases your_db_name`。
- `all_databases.sql`：备份输出文件。

如果数据库较大，可以通过以下方式压缩备份文件：
```bash
mysqldump -u root -p --all-databases | gzip > all_databases.sql.gz
```

### 3. 传输数据到目标服务器
使用 `scp` 或 `rsync` 等工具将备份文件传输到目标服务器。

- 使用 `scp`：
```bash
scp all_databases.sql.gz user@target_ip:/path/to/destination
```

- 使用 `rsync`：
```bash
rsync -avz all_databases.sql.gz user@target_ip:/path/to/destination
```

### 4. 在目标服务器上恢复数据
1. 登录到目标服务器，解压 SQL 文件（如果使用了压缩）：
   ```bash
   gunzip all_databases.sql.gz
   ```

2. 使用 `mysql` 恢复数据库：
   ```bash
   mysql -u root -p < all_databases.sql
   ```

### 5. 修改 MySQL 配置（如有需要）
- 确保在目标服务器上配置文件（如 `/etc/my.cnf` 或 `/etc/mysql/my.cnf`）中的设置与源服务器一致，例如字符集、时区、网络配置等。
   ```conf
   # For advice on how to change settings please see
   # http://dev.mysql.com/doc/refman/5.7/en/server-configuration-defaults.html

   [mysqld]
   #
   # Remove leading # and set to the amount of RAM for the most important data
   # cache in MySQL. Start at 70% of total RAM for dedicated server, else 10%.
   # innodb_buffer_pool_size = 128M
   #
   # Remove leading # to turn on a very important data integrity option: logging
   # changes to the binary log between backups.
   # log_bin
   #
   # Remove leading # to set options mainly useful for reporting servers.
   # The server defaults are faster for transactions and fast SELECTs.
   # Adjust sizes as needed, experiment to find the optimal values.
   # join_buffer_size = 128M
   # sort_buffer_size = 2M
   # read_rnd_buffer_size = 2M

   port=3306
   character-set-server=utf8
   default-storage-engine=innodb
                                                                                                                                                   
   datadir=/var/lib/mysql
   socket=/var/lib/mysql/mysql.sock

   # Disabling symbolic-links is recommended to prevent assorted security risks
   symbolic-links=0

   log-error=/var/log/mysqld.log
   pid-file=/var/run/mysqld/mysqld.pid
   ```


- 可能需要修改数据库用户的权限以确保可以正常访问数据库，例如：
  ```sql
  GRANT ALL PRIVILEGES ON *.* TO 'user'@'%' IDENTIFIED BY 'password';
  FLUSH PRIVILEGES;
  ```

### 6. 测试和验证
- 测试数据库是否在目标服务器上正常运行。
- 确保所有表和数据完整无误。
- 检查应用程序是否能够正常连接到目标服务器上的 MySQL 数据库。

### 7. 切换业务
- 完成数据验证后，可以将业务切换到新服务器的数据库。确保配置文件中的数据库连接字符串正确指向新服务器。

### 8. 优化和清理
- 完成迁移后，考虑对目标服务器上的数据库进行优化，例如使用 `ANALYZE TABLE` 或 `OPTIMIZE TABLE` 来优化性能。
- 可以根据需要删除旧服务器上的数据库备份文件以释放存储空间。

这种方式能够确保数据迁移的完整性，且步骤灵活，适用于小型和中型 MySQL 数据库的迁移。


# 导出MySQL的用户信息

`mysqldump` 工具默认情况下不会导出 MySQL 用户及其权限信息，即 `mysql` 系统库中的用户表 (`mysql.user`)，以及相关权限表（如 `mysql.db` 和 `mysql.tables_priv`）。因此，直接使用 `mysqldump` 备份后恢复的数据库不会自动包含用户账户及其权限。

### 解决方案

要迁移 MySQL 用户及其权限，你可以手动导出 MySQL 系统库中的相关表，然后在目标服务器上导入。以下是导出 MySQL 用户和权限的两种方式：

### 方法一：导出 `mysql` 数据库相关表

可以使用 `mysqldump` 导出与用户和权限相关的表，然后在目标服务器上恢复。

1. **导出 MySQL 用户和权限表**：
   ```bash
   mysqldump -u root -p --no-create-info --skip-triggers --databases mysql --tables user db tables_priv columns_priv > mysql_privileges.sql
   ```

   - `--no-create-info`：不导出表结构，只导出数据。
   - `--skip-triggers`：跳过触发器导出。
   - `--databases mysql`：只导出 `mysql` 数据库中的相关表。

2. **传输到目标服务器**（与数据库数据文件一起）：
   ```bash
   scp mysql_privileges.sql user@target_ip:/path/to/destination
   ```

3. **在目标服务器上恢复**：
   ```bash
   mysql -u root -p < mysql_privileges.sql
   ```

### 方法二：使用 `pt-show-grants` 工具

如果你安装了 Percona Toolkit，可以使用 `pt-show-grants` 工具，它专门用于提取 MySQL 用户及其权限信息。

1. **安装 Percona Toolkit**（如果未安装）：
   ```bash
   sudo apt install percona-toolkit  # Ubuntu/Debian
   sudo yum install percona-toolkit  # CentOS/Red Hat
   ```

2. **导出用户权限**：
   ```bash
   pt-show-grants --user=root --password > mysql_grants.sql
   ```

3. **在目标服务器上导入**：
   ```bash
   mysql -u root -p < mysql_grants.sql
   ```

### 方法三：手动导出和重建用户

如果不想导出整个 `mysql` 数据库中的用户和权限表，可以手动查询现有用户及其权限，然后在新服务器上创建它们。

1. **查询用户和权限**：
   ```sql
   SELECT CONCAT('CREATE USER ''', user, '''@''', host, ''' IDENTIFIED BY PASSWORD ''', authentication_string, ''';') 
   FROM mysql.user;

   SELECT CONCAT('GRANT ', privilege_type, ' ON ', table_schema, '.', table_name, ' TO ''', grantee, ''';')
   FROM information_schema.user_privileges;
   ```


```sql
mysql> SELECT CONCAT('CREATE USER ''', user, '''@''', host, ''' IDENTIFIED BY PASSWORD ''', authentication_string, ''';') 
    -> FROM mysql.user;
+-------------------------------------------------------------------------------------------------------------+
| CONCAT('CREATE USER ''', user, '''@''', host, ''' IDENTIFIED BY PASSWORD ''', authentication_string, ''';') |
+-------------------------------------------------------------------------------------------------------------+
| CREATE USER 'root'@'%' IDENTIFIED BY PASSWORD '*653E9FDE88A1C70B352C5607857B8AF9C612BE2E';                  |
| CREATE USER 'mysql.session'@'localhost' IDENTIFIED BY PASSWORD '*THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE'; |
| CREATE USER 'mysql.sys'@'localhost' IDENTIFIED BY PASSWORD '*THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE';     |
| CREATE USER 'chen'@'%' IDENTIFIED BY PASSWORD '*653E9FDE88A1C70B352C5607857B8AF9C612BE2E';                  |
+-------------------------------------------------------------------------------------------------------------+


GRANT ALL PRIVILEGES ON mysql.* TO 'chen'@'localhost';
FLUSH PRIVILEGES;


```

2. **在目标服务器上执行**：复制查询结果，在目标服务器上执行这些 SQL 语句来重建用户和权限。

### 总结

如果你仅仅通过 `mysqldump` 进行数据备份，用户和权限信息不会自动包含在内。可以通过手动导出相关权限表、使用 `pt-show-grants` 工具，或查询并重建用户的方式将用户及其权限迁移到新的服务器。


本项目采用主写+读、附读的策略

配置文件在 /etc/mysql/mysql.conf.d/mysqld.cnf 下