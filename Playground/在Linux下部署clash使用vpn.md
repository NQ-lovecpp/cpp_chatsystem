在Linux下部署Clash并通过它使用VPN，可以按照以下步骤进行：

### 1. 下载并安装Clash

1. 打开终端并下载Clash的可执行文件。你可以从Clash的GitHub页面获取最新版本的Clash:
   ```bash
   wget https://github.com/Dreamacro/clash/releases/download/vX.X.X/clash-linux-amd64-vX.X.X.gz
   ```
   请将`vX.X.X`替换为你想要的版本号。

2. 解压下载的文件：
   ```bash
   gunzip clash-linux-amd64-vX.X.X.gz
   ```

3. 赋予执行权限：
   ```bash
   chmod +x clash-linux-amd64-vX.X.X
   ```

4. 将Clash移动到`/usr/local/bin`目录下，以便全局使用：
   ```bash
   sudo mv clash-linux-amd64-vX.X.X /usr/local/bin/clash
   ```

### 2. 配置Clash

1. 创建配置文件夹：
   ```bash
   mkdir -p ~/.config/clash
   ```

2. 将你的Clash配置文件（`config.yaml`）放入`~/.config/clash/`目录中。如果没有，可以使用文本编辑器创建一个简单的配置文件：

   ```bash
   nano ~/.config/clash/config.yaml
   ```

   配置文件的内容格式通常如下：

   ```yaml
   port: 7890
   socks-port: 7891
   allow-lan: true
   mode: Rule
   log-level: info
   external-controller: '127.0.0.1:9090'
   secret: ""

   proxies:
     - name: "your_proxy_name"
       type: vmess
       server: your_server_ip
       port: your_port
       uuid: your_uuid
       alterId: your_alterId
       cipher: auto

   proxy-groups:
     - name: "Proxy"
       type: select
       proxies:
         - "your_proxy_name"

   rules:
     - MATCH,Proxy
   ```

   根据你的需求和服务提供商提供的参数修改该配置文件。

### 3. 启动Clash

1. 在终端中启动Clash：
   ```bash
   clash
   ```

   如果想让Clash在后台运行，可以使用`screen`或者`tmux`来保持会话：

   ```bash
   screen -S clash
   clash
   ```

   按 `Ctrl + A` 然后 `D` 可以让 `screen` 会话保持后台运行。

### 4. 设置系统代理

1. 如果你使用桌面环境，可以通过网络设置手动配置HTTP和SOCKS代理为`127.0.0.1`和端口`7890`（HTTP）或`7891`（SOCKS5）。

2. 也可以在终端中通过设置环境变量来配置代理：
   ```bash
   export http_proxy="http://127.0.0.1:7890"
   export https_proxy="http://127.0.0.1:7890"
   export all_proxy="socks5://127.0.0.1:7891"
   ```

### 5. 验证

你可以通过`curl`命令验证代理是否工作：
```bash
curl ipinfo.io
```

该命令将返回你的出口IP地址，如果显示的是VPN服务器的IP地址，说明Clash工作正常。

通过上述步骤，你可以在Linux系统下成功部署Clash并使用VPN。