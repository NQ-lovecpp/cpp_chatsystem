# 一、聊天室后端服务器摘要

项目流程：
1. 功能需求确定阶段：
    - 要做什么，实现什么项目
    - 实现这个项目，需要内部拥有哪些功能

2. 设计阶段
    - 概要框架设计
    - 功能模块接口设计

3. 技术调研，搭建开发环境阶段
    - 确定使用哪些技术框架/库，了解它们的基础使用
    - 将开发环境搭建起来

4. 具体实现阶段
5. 单元测试阶段：确定每一个模块实现的没有问题
6. 系统联调阶段


# 二、功能需求确定阶段
## 功能演示与介绍

在聊天室项目的功能设计中，包含了以下功能：
1. 用户注册：用户输入用户名(昵称)，以及密码进行用户名的注册
2. 用户登录：用户通过用户名和密码进行登录
3. 短信验证码获取：当用户通过手机号注册或登录的时候，需要获取短信验证码
4. 手机号注册：用户输入手机号和短信验证码进行手机号的用户注册
5. 手机号登录：用户输入手机号和短信验证码进行手机号的用户登录
6. 用户信息获取：当用户登录之后，获取个人信息进行展示
7. 头像修改：设置用户头像
8. 昵称修改：设置用户昵称
9. 签名修改：设置用户签名
10. 手机号修改：修改用户的绑定手机号
11. 好友列表的获取：当用户登录成功之后，获取自己好友列表进行展示
12. 申请好友：搜索用户之后，点击申请好友，向对方发送好友申请
13. 待处理申请的获取：当用户登录成功之后，会获取离线的好友申请请求以待处理
14. 好友申请的处理：针对收到的好友申请进行同意/拒绝的处理
15. 删除好友：删除当前好友列表中的好友
16. 用户搜索：可以进行用户的搜索用于申请好友
17. 聊天会话列表的获取：每个单人/多人聊天都有一个聊天会话，在登录成功后可以获取聊天会话，查看历史的消息以及对方的各项信息
18. 多人聊天会话的创建：单人聊天会话在对方同意好友时创建，而多人会话需要调用该接口进行手动创建
19. 聊天成员列表的获取：多人聊天会话中，可以点击查看群成员按钮，查看群成员信息
20. 发送聊天消息：在聊天框输入内容后点击发送，则向服务器发送消息聊天请求
21. 获取历史消息：
    - 获取最近N条消息：用于登录成功后，点击对方头像打开聊天框时显示最近
    的消息
    - 获取指定时间段内的消息：用户可以进行聊天消息的按时间搜索
22. 消息搜索：用户可以进行聊天消息的关键字搜索
23. 文件的上传
    - 单个文件的上传：这个接口基本用于后台部分，收到文件消息后将文件数据转发给文件子服务进行存储
    - 多个文件的上传：这个接口基本用于后台部分，收到文件消息后将文件数据转发给文件子服务进行存储
24. 文件的下载
    - 单个文件的下载：在后台用于获取用户头像文件数据，以及客户端用于获取文件/语音/图片消息的文件数据
    - 多个文件的下载：在后台用于大批量获取用户头像数据（比如获取用户列表的时候），以及前端的批量文件下载
25. 语音消息的文字转换：客户端进行语音消息的文字转换。
除了以上的与客户端之间交互的功能之外，还包含一些服务器后台内部所需的功能：
    1. 消息的存储：用于将文本消息进行存储起来，以便于进行消息的搜索，以及离线消息的存储。
    2. 文件的存储：用于存储用户的头像文件，以及消息中的文件/图片/语音文件数据。
    3. 各项用户，好友，会话数据的存储管理

## 框架与微服务拆分设计

该项目在设计的时候采用**微服务**框架设计，微服务指将一个大的业务拆分称为多个子业务，分别在多台不同的机器节点上提供对应的服务，由网关服务统一接收多个客户端的各种不同请求，然后将请求分发到不同的子服务节点上进行处理，获取响应后，再转发给客户端。


微服务架构设计的思想主要包括以下几个方面：
1. 服务拆分：将应用程序拆分成多个小型服务，每个服务负责一部分业务功能，具有独立的生命周期和部署。
2. 独立部署：每个微服务可以独立于其他服务进行部署、更新和扩展。
3. 语言和数据的多样性：不同的服务可以使用不同的编程语言和数据库，根据服务的特定需求进行技术选型。
4. 轻量级通信：服务之间通过定义良好的API进行通信，通常使用HTTP/REST、
gRPC
等协议。
5. 去中心化治理：每个服务可以有自己的开发团队，拥有自己的技术栈和开发流程。
6. 弹性和可扩展性：微服务架构支持服务的动态扩展和收缩，以适应负载的变化。
7. 容错性：设计时考虑到服务可能会失败，通过断路器、重试机制等手段提高系统的容错性。
8. 去中心化数据管理：每个服务管理自己的数据库，数据在服务之间是私有的，这有助于保持服务的独立性。
9. 自动化部署：通过持续集成和持续部署（CI/CD）流程自动化服务的构建、测试和部署。
10. 监控和日志：对每个服务进行监控和日志记录，以便于跟踪问题和性能瓶颈。
11. 服务发现：服务实例可能动态变化，需要服务发现机制来动态地找到服务实例。
12. 安全：每个服务需要考虑安全问题，包括认证、授权和数据传输的安全性。



基于微服务的思想，以及聊天室项目的业务功能，将聊天室项目进行服务拆分为以下几个子服务：

### ① 网关服务
网关服务，提供与客户端进行直接交互的作用，用于接收客户端的各项不同的请求，进行用户鉴权通过后，将请求分发到各个不同的子服务进行处理，接收到响应后，发送给客户端。

用户鉴权：客户端在登录成功后，后台会为客户端创建登录会话，并向客户端返回一个登录会话ID，往后，客户端发送的所有请求中都必须带有对应的会话ID进行身份识别，否则视为未登录，不予提供除注册/登录/验证码获取以外的所有服务。

在网关服务中，基于不同的使用目的，向客户端提供两种不同的通信：

#### HTTP通信：
在项目的设计中客户端的大部分业务都是基于请求-响应模式进行的，因此基于便于扩展，设计简单的目的，采用HTTP协议作为与客户端进行基础的业务请求的通信协议，在HTTP通信中涵盖了上述所有的功能接口请求。
#### WEBSOCKET通信：
在聊天室项目中，不仅仅包含客户端主动请求的业务，还包含了一些需要服务器主动推送的通知，因为HTTP不支持服务器主动推送数据，因此采用Websocket协议进行长连接的通信，向客户端发送通知类型的数据，包括：
- 好友申请的通知
- 好友申请处理结果的通知
- 好友删除的通知
- 聊天会话建立的通知
- 聊天新消息的通知

### ② 用户管理子服务
用户管理子服务，主要用于管理用户的数据，以及关于用户信息的各项操作，因此在上述项目功能中，用户子服务需要提供以下接口：
1. 用户注册：用户输入用户名(昵称)，以及密码进行用户名的注册
2. 用户登录：用户通过用户名和密码进行登录
3. 短信验证码获取：当用户通过手机号注册或登录的时候，需要获取短信验证码
4. 手机号注册：用户输入手机号和短信验证码进行手机号的用户注册
5. 手机号登录：用户输入手机号和短信验证码进行手机号的用户登录
6. 用户信息获取：当用户登录之后，获取个人信息进行展示
7. 头像修改：设置用户头像
8. 昵称修改：设置用户昵称
9. 签名修改：设置用户签名
10. 手机号修改：修改用户的绑定手机号

### ③ 好友管理子服务
好友管理子服务，主要用于管理好友相关的数据与操作，因此主要负责以下接口：
1. 好友列表的获取：当用户登录成功之后，获取自己好友列表进行展示
2. 申请好友：搜索用户之后，点击申请好友，向对方发送好友申请
3. 待处理申请的获取：当用户登录成功之后，会获取离线的好友申请请求以待处理
4. 好友申请的处理：针对收到的好友申请进行同意/拒绝的处理
5. 删除好友：删除当前好友列表中的好友
6. 用户搜索：可以进行用户的搜索用于申请好友
7. 聊天会话列表的获取：每个单人/多人聊天都有一个聊天会话，在登录成功后可以获取聊天会话，查看历史的消息以及对方的各项信息
8. 多人聊天会话的创建：单人聊天会话在对方同意好友时创建，而多人会话需要调用该接口进行手动创建
9. 聊天成员列表的获取：多人聊天会话中，可以点击查看群成员按钮，查看群成员信息

### ④ 消息转发子服务
消息转发子服务，主要用于针对一条消息内容，组织消息的ID以及各项所需要素，然后告诉网关服务器一条消息应该发给谁。

该服务并不是提供消息的转发功能，而是告诉网关服务器这条消息应该发给谁。

通常消息都是以聊天会话为基础进行发送的，根据会话找到它的所有成员，这就是转发的目标。

除此之外，消息转发子服务将收到的消息，放入消息队列中，由文件子服务/消息存储子服务进行消费存储。

因此转发管理子服务只提供一个接口：
- 获取消息转发目标：针对消息内容，根据其中的会话信息，告知网关转发目标。

### ⑤ 消息存储子服务
消息存储子服务，主要用于持久化存储消息、查询消息，因此需要提供以下接口：
1. 获取消息：
    - 获取最近N条消息：用于登录成功后，点击对方头像打开聊天框时显示最近的消息
    - 获取指定时间段内的消息：用户可以进行聊天消息的按时间搜索
2. 消息的关键字搜索：用户可以进行聊天消息的关键字搜索


### ⑥ 文件管理子服务
文件管理子服务，主要用于管理用户的头像，以及消息中的文件存储，因此需要提供以下接口：
1. 文件的上传
    - 单个文件的上传：这个接口基本用于后台部分，收到文件消息后将文件数据转发给文件子服务进行存储
    - 多个文件的上传：这个接口基本用于后台部分，收到文件消息后将文件数据转发给文件子服务进行存储
2. 文件的下载
    - 单个文件的下载：在后台用于获取用户头像文件数据，以及客户端用于获取文件/语音/图片消息的文件数据
    - 多个文件的下载：在后台用于大批量获取用户头像数据（比如获取用户列表的时候），以及前端的批量文件下载

### ⑦ 语音转文字子服务
语音转文字子服务，用于调用语音识别SDK，进行语音识别，将语音转为文字后返回给网关。语音转文字子服务只提供一个接口：
- 语音消息的文字转换：客户端进行语音消息的文字转换。


## 项目所使用到的框架/库
- _**gflags**_：针对程序运行所需的运行参数解析/配置文件解析框架。
- _**gtest**_：针对程序编写到一定阶段后，进行的单元测试框架。
- _**spdlog**_：针对项目中进行日志输出的框架。
- _**protobuf**_：针对项目中的网络通信数据所采用的序列化和反序列化框架。
- _**brpc**_：项目中的rpc调用使用的框架。
- _**redis**_：高性能键值存储系统，用于项目中进行用户登录会话信息的存储管理。
- _**mysql**_：关系型数据库系统，用于项目中的业务数据的存储管理。
- _**ODB**_：项目中mysql数据库操作的ORM框架（Object-Relational Mapping，对象关系映射）
- _**Etcd**_：分布式、高可用的一致性键值存储系统，用于项目中实现服务注册与发现功能的框架。
- _**cpp-httplib**_：用于搭建简单轻量HTTP服务器的框架。
- _**websocketpp**_：用于搭建Websocket服务器的框架。
- _**rabbitMQ**_：用于搭建消息队列服务器，用于项目中持久化消息的转发消费。
- _**elasticsearch**_：用于搭建文档存储/搜索服务器，用于项目中历史消息的存储管理
- _**语音云平台**_：采用百度语音识别技术云平台实现语音转文字功能。
- _**短信云平台**_：采用阿里云短信云平台实现手机短信验证码通知功能。
- _**cmake**_：项目工程的构建工具。
- _**docker**_：项目工程的一键式部署工具。

## 后台服务技术框架图

![](Pics/%E9%A1%B9%E7%9B%AE%E6%80%BB%E6%A1%86%E6%9E%B6%E5%9B%BE.png)



# 三、开发环境的快速搭建

开发环境的搭建是一个非常重要的步骤，它确保了开发过程中可以顺利进行编译、调试以及最终的部署。下面将详细介绍如何在Linux系统中搭建一个完整的C++开发环境。所有组件的用法，详见[组件教程](./Playground/Kit_Tutorial.md)

## 1. 基础工具安装

首先，我们需要安装一些基础的开发工具。这些工具包括编辑器、编译器、调试器、构建工具、传输工具和版本管理工具。

### 1.1 编辑器安装

```bash
sudo apt-get install vim
```

Vim 是一个功能强大的文本编辑器，在C++开发中非常常用。

### 1.2 编译器安装

```bash
sudo apt-get install gcc g++
```

GCC 和 G++ 是 GNU 的编译器集合，分别用于C和C++语言的编译。

### 1.3 调试器安装

```bash
sudo apt-get install gdb
```

GDB 是GNU的调试器，用于调试C/C++程序。

### 1.4 项目构建工具安装

```bash
sudo apt-get install make cmake
```

Make 和 CMake 是常用的构建工具，用于自动化构建过程。

### 1.5 传输工具安装

```bash
sudo apt-get install lrzsz
```

Lrzsz 是一组文件传输工具，支持X/Y/ZMODEM协议。

### 1.6 版本管理工具安装

```bash
sudo apt-get install git
```

Git 是目前最流行的分布式版本控制系统，用于跟踪源代码的变化。

## 2. 常用框架安装

在开发C++应用程序时，通常会使用一些第三方框架来简化开发工作。以下是一些常用框架的安装步骤。

### 2.1 gflags 框架安装

```bash
sudo apt-get install libgflags-dev
```

Gflags 是一个命令行标志解析库。

### 2.2 gtest 框架安装

```bash
sudo apt-get install libgtest-dev
```

GTest 是一个Google发布的C++测试框架。

### 2.3 spdlog 框架安装

```bash
sudo apt-get install libspdlog-dev
```

Spdlog 是一个非常快速且易用的C++日志库。

### 2.4 brpc 框架安装

首先，安装brpc的依赖项：

```bash
sudo apt-get install -y git g++ make libssl-dev libprotobuf-dev libprotoc-dev protobuf-compiler libleveldb-dev
```

然后，安装brpc：

```bash
git clone https://github.com/apache/brpc.git
cd brpc/
mkdir build && cd build
cmake -DCMAKE_INSTALL_PREFIX=/usr .. && cmake --build . -j6
make && sudo make install
```

### 2.5 etcd 框架安装

首先，安装etcd：

```bash
sudo apt-get install etcd
sudo systemctl start etcd
sudo systemctl enable etcd
```

然后，安装etcd的C++客户端API：

```bash
sudo apt-get install libboost-all-dev protobuf-compiler-grpc
sudo apt-get install libgrpc-dev libgrpc++-dev libcpprest-dev
git clone https://github.com/etcd-cpp-apiv3/etcd-cpp-apiv3.git
cd etcd-cpp-apiv3
mkdir build && cd build
cmake .. -DCMAKE_INSTALL_PREFIX=/usr
make -j$(nproc) && sudo make install
```

### 2.6 Elasticsearch 框架安装

安装 Elasticsearch：

```bash
curl -s https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --no-default-keyring --keyring gnupg-ring:/etc/apt/trusted.gpg.d/icsearch.gpg --import
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elasticsearch.list
sudo apt update
sudo apt-get install elasticsearch=7.17.21
```

安装中文分词插件：

```bash
sudo /usr/share/elasticsearch/bin/elasticsearch-plugin install https://get.infini.cloud/elasticsearch/analysis-ik/7.17.21
```

修改 Elasticsearch 配置以启用外部访问：

```bash
sudo vim /etc/elasticsearch/elasticsearch.yml
```

添加或修改以下配置项：

```bash
network.host: 0.0.0.0
http.port: 9200
```

启动 Elasticsearch 并设置开机启动：

```bash
sudo systemctl restart elasticsearch
sudo systemctl enable elasticsearch
```

### 2.7 ODB 框架安装

首先，安装 ODB 编译器：

```bash
curl -sSfO https://download.build2.org/0.17.0/build2-install-0.17.0.sh
sh build2-install-0.17.0.sh
sudo apt-get install gcc-11-plugin-dev
mkdir odb-build && cd odb-build
bpkg create -d odb-gcc-N cc config.cxx=g++ config.cc.coptions=-O3 config.bin.rpath=/usr/lib config.install.root=/usr/ config.install.sudo=sudo
cd odb-gcc-N
bpkg build odb@https://pkg.cppget.org/1/beta
bpkg test odb
bpkg install odb
```

然后，安装 ODB 运行时库：

```bash
cd .. 
bpkg create -d libodb-gcc-N cc config.cxx=g++ config.cc.coptions=-O3 config.install.root=/usr/ config.install.sudo=sudo
cd libodb-gcc-N
bpkg add https://pkg.cppget.org/1/beta
bpkg fetch
bpkg build libodb
bpkg build libodb-mysql
```

### 2.8 Redis 安装

```bash
sudo apt install redis -y
```

修改 `/etc/redis/redis.conf` 文件以支持远程连接：

```bash
sudo vim /etc/redis/redis.conf
```

修改以下配置项：

```bash
# bind 127.0.0.1   # 注释掉这行 
bind 0.0.0.0       # 添加这行
protected-mode no  # 把 yes 改成 no
```

启动 Redis 并设置开机启动：

```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 2.9 RabbitMQ 安装

```bash
sudo apt install rabbitmq-server
```

启动 RabbitMQ 服务并检查状态：

```bash
sudo systemctl start rabbitmq-server
sudo systemctl status rabbitmq-server
```

添加一个 `administrator` 用户：

```bash
sudo rabbitmqctl add_user root 123456
sudo rabbitmqctl set_user_tags root administrator
sudo rabbitmqctl set_permissions -p / root "." "." ".*"
```

启用 RabbitMQ 的 Web 管理界面：

```bash
sudo rabbitmq-plugins enable rabbitmq_management
```

访问 Web UI 界面，默认端口为 `15672`。


