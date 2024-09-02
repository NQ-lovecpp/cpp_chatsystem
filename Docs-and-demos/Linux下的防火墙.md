# 常用组件
在Linux下关闭某个端口的TCP或UDP连接，可以使用防火墙工具，如 `iptables` 或 `firewalld`。以下是使用 `iptables` 和 `firewalld` 关闭端口的简单方法：

### 使用 `iptables` 关闭端口
`iptables` 是一个常用的防火墙工具，你可以通过以下步骤关闭某个端口：

1. **关闭TCP端口:**
   ```bash
   sudo iptables -A INPUT -p tcp --dport <端口号> -j DROP
   ```
   例如，关闭80端口的TCP连接：
   ```bash
   sudo iptables -A INPUT -p tcp --dport 80 -j DROP
   ```

2. **关闭UDP端口:**
   ```bash
   sudo iptables -A INPUT -p udp --dport <端口号> -j DROP
   ```
   例如，关闭53端口的UDP连接：
   ```bash
   sudo iptables -A INPUT -p udp --dport 53 -j DROP
   ```

3. **保存配置:**
   如果希望配置在系统重启后仍然生效，可以保存规则：
   ```bash
   sudo iptables-save > /etc/iptables/rules.v4
   ```

### 使用 `firewalld` 关闭端口
`firewalld` 是 `iptables` 的前端工具，更加用户友好。

1. **查看当前状态:**
   确保 `firewalld` 正在运行：
   ```bash
   sudo systemctl status firewalld
   ```

2. **关闭TCP端口:**
   ```bash
   sudo firewall-cmd --zone=public --remove-port=<端口号>/tcp --permanent
   ```
   例如，关闭80端口的TCP连接：
   ```bash
   sudo firewall-cmd --zone=public --remove-port=80/tcp --permanent
   ```

3. **关闭UDP端口:**
   ```bash
   sudo firewall-cmd --zone=public --remove-port=<端口号>/udp --permanent
   ```
   例如，关闭53端口的UDP连接：
   ```bash
   sudo firewall-cmd --zone=public --remove-port=53/udp --permanent
   ```

4. **重新加载防火墙规则:**
   ```bash
   sudo firewall-cmd --reload
   ```

这些方法适用于不同的防火墙配置工具。选择一种适合你系统配置的方法来关闭特定端口。

# Ubuntu下

在Ubuntu下使用 `ufw`（Uncomplicated Firewall）来开启或关闭特定端口的防火墙非常简单。以下是如何操作的步骤：

### 1. 检查 `ufw` 状态
首先，检查 `ufw` 是否已启用：
```bash
sudo ufw status
```

- 如果显示 `Status: active`，表示 `ufw` 已启用。
- 如果显示 `Status: inactive`，表示 `ufw` 未启用。

### 2. 启用 `ufw`（如果未启用）
如果 `ufw` 处于未启用状态，可以通过以下命令启用它：
```bash
sudo ufw enable
```

### 3. 开启特定端口
要开启某个特定端口，可以使用以下命令：

- **开启TCP端口：**
  ```bash
  sudo ufw allow <端口号>/tcp
  ```
  例如，开启80端口的TCP连接：
  ```bash
  sudo ufw allow 80/tcp
  ```

- **开启UDP端口：**
  ```bash
  sudo ufw allow <端口号>/udp
  ```
  例如，开启53端口的UDP连接：
  ```bash
  sudo ufw allow 53/udp
  ```

- **同时开启TCP和UDP端口：**
  ```bash
  sudo ufw allow <端口号>
  ```
  例如，开启80端口的TCP和UDP连接：
  ```bash
  sudo ufw allow 80
  ```

### 4. 关闭特定端口
要关闭某个特定端口，可以使用以下命令：

- **关闭TCP端口：**
  ```bash
  sudo ufw deny <端口号>/tcp
  ```
  例如，关闭80端口的TCP连接：
  ```bash
  sudo ufw deny 80/tcp
  ```

- **关闭UDP端口：**
  ```bash
  sudo ufw deny <端口号>/udp
  ```
  例如，关闭53端口的UDP连接：
  ```bash
  sudo ufw deny 53/udp
  ```

- **同时关闭TCP和UDP端口：**
  ```bash
  sudo ufw deny <端口号>
  ```
  例如，关闭80端口的TCP和UDP连接：
  ```bash
  sudo ufw deny 80
  ```

### 5. 删除规则（如果需要）
如果需要删除某个端口的规则，可以使用以下命令：

- **删除已允许的TCP或UDP规则：**
  ```bash
  sudo ufw delete allow <端口号>/tcp
  sudo ufw delete allow <端口号>/udp
  ```

- **删除已拒绝的TCP或UDP规则：**
  ```bash
  sudo ufw delete deny <端口号>/tcp
  sudo ufw delete deny <端口号>/udp
  ```

例如，删除80端口的TCP规则（无论是`allow`还是`deny`）：
```bash
sudo ufw delete allow 80/tcp
sudo ufw delete deny 80/tcp
```

### 6. 验证防火墙规则
最后，验证当前的 `ufw` 规则是否已应用：
```bash
sudo ufw status
```
这会列出所有当前的防火墙规则，包括已允许和已拒绝的端口。

通过以上步骤，你可以在Ubuntu下轻松管理 `ufw` 防火墙的端口设置。