# 一、聊天室后端服务器设计摘要

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


>除了以上的与客户端之间交互的功能之外，还包含一些服务器后台内部所需的功能：

1.  消息的存储：用于将文本消息进行存储起来，以便于进行消息的搜索，且使得客户端不需要进行消息存储。
2.  文件的存储：用于存储用户的头像文件，以及消息中的文件/图片/语音文件数据。
3.  用户信息，好友关系，会话信息，好友申请事件的存储管理


## 框架与微服务拆分设计

该项目在设计的时候采用**微服务**框架设计，微服务指将一个大的业务拆分称为多个子业务，分别在多台不同的机器节点上提供对应的服务，由网关服务统一接收多个客户端的各种不同请求，然后将请求分发到不同的子服务节点上进行处理，获取响应后，再转发给客户端。


微服务架构设计的思想主要包括以下几个方面：
1. 服务拆分：将应用程序拆分成多个小型服务，每个服务负责一部分业务功能，具有独立的生命周期和部署。
2. 独立部署：每个微服务可以独立于其他服务进行部署、更新和扩展。
3. 语言和数据的多样性：不同的服务可以使用不同的编程语言和数据库，根据服务的特定需求进行技术选型。
4. 轻量级通信：服务之间通过定义良好的API进行通信，通常使用HTTP/REST、gRPC等协议。
5. 去中心化治理：每个服务可以有自己的开发团队，拥有自己的技术栈和开发流程。
6. 弹性和可扩展性：微服务架构支持服务的动态扩展和收缩，以适应负载的变化。
7. 容错性：设计时考虑到服务可能会失败，通过断路器、重试机制等手段提高系统的容错性。
8. 去中心化数据管理：每个服务管理自己的数据库，数据在服务之间是私有的，这有助于保持服务的独立性。
9. 自动化部署：通过持续集成和持续部署（CI/CD）流程自动化服务的构建、测试和部署。
10. 监控和日志：对每个服务进行监控和日志记录，以便于跟踪问题和性能瓶颈。
11. 服务发现：服务实例可能动态变化，需要服务发现机制来动态地找到服务实例。
12. 安全：每个服务需要考虑安全问题，包括认证、授权和数据传输的安全性。



>基于微服务的思想，以及聊天室项目的业务功能，将聊天室项目进行服务拆分为以下**6个子服务**和**1个网关服务**：

### ① 网关服务
网关服务，提供与客户端进行直接交互的作用，用于接收客户端的各项不同的请求，进行用户鉴权通过后，将请求分发到各个不同的子服务进行处理，接收到响应后，发送给客户端。

用户鉴权指的是，客户端在登录成功后，后台会为客户端创建登录会话，并向客户端返回一个登录会话ID，往后，客户端发送的所有请求中都必须带有对应的会话ID进行身份识别，否则视为未登录，**不予提供除注册/登录/验证码获取以外的所有服务**。

在网关服务中，基于不同的使用目的，向客户端提供两种不同的通信：

#### HTTP通信：
在项目的设计中客户端的大部分业务都是基于请求-响应模式进行的，因此基于便于扩展，设计简单的目的，采用HTTP协议作为与客户端进行基础的业务请求的通信协议，在HTTP通信中涵盖了上述所有的功能接口请求。
#### WEBSOCKET通信：
在聊天室项目中，不仅仅包含客户端主动请求的业务，还包含了一些需要服务器主动推送的通知的情况。由于**HTTP不支持服务器主动推送数据**，因此采用Websocket协议保持长连接的通信，向客户端发送通知类型的数据，包括：
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
消息存储子服务，主要用于持久化存储消息、查询历史消息，因此需要提供以下接口：
1. 获取消息：
    - 获取最近N条消息：用于登录成功后，点击对方头像打开聊天框时显示最近的消息
    - 获取指定时间段内的消息：用户可以进行聊天消息的按时间搜索
2. 消息的关键字搜索：用户可以进行聊天消息的关键字搜索


### ⑥ 文件管理子服务
文件管理子服务，主要用于管理用户的头像，以及文件消息、语音消息的存储，因此需要提供以下接口：
1. 文件的上传
    - 单个文件的上传：收到文件消息、语音消息或用户更新头像后将文件数据转发给文件子服务进行存储
    - 多个文件的上传：收到文件消息、语音消息或用户更新头像后将文件数据转发给文件子服务进行存储
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
**
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





# 四、后台服务的通信流程图
## 入口网关子服务业务接口
## 用户管理子服务业务接口
## 好友管理子服务业务接口
## 转发管理子服务业务接口
## 消息存储子服务业务接口
## 文件存储子服务业务接口
## 语音识别子服务业务接口


# 五、微服务通信接口设计
因为微服务框架的思想是将业务拆分到不同的节点主机上提供服务，因此主机节点之间的通信就尤为重要，而在进行开发之前，首先要做的就是将通信接口（service）以及传输的数据结构定义出来（message），比如：
```proto
//用户名注册   
message UserRegisterReq {
    string request_id = 1;
    string nickname = 2;
    string password = 3;
}
message UserRegisterRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3;
}

service UserService {
    rpc UserRegister(UserRegisterReq) returns (UserRegisterRsp);                   
    rpc UserLogin(UserLoginReq) returns (UserLoginRsp);                           
    rpc GetPhoneVerifyCode(PhoneVerifyCodeReq) returns (PhoneVerifyCodeRsp);       
    rpc PhoneRegister(PhoneRegisterReq) returns (PhoneRegisterRsp);               
    rpc PhoneLogin(PhoneLoginReq) returns (PhoneLoginRsp);                        
    rpc GetUserInfo(GetUserInfoReq) returns (GetUserInfoRsp);                     
    rpc GetMultiUserInfo(GetMultiUserInfoReq) returns (GetMultiUserInfoRsp);      
    rpc SetUserAvatar(SetUserAvatarReq) returns (SetUserAvatarRsp);               
    rpc SetUserNickname(SetUserNicknameReq) returns (SetUserNicknameRsp);         
    rpc SetUserDescription(SetUserDescriptionReq) returns (SetUserDescriptionRsp);
    rpc SetUserPhoneNumber(SetUserPhoneNumberReq) returns (SetUserPhoneNumberRsp);
}
```
解释：
1. `message` 用于定义结构化的数据类型。它类似于类或结构体，包含多个字段，每个字段都有类型和唯一的字段编号。
2. `service` 用于定义 RPC（远程过程调用）服务，它描述了一组可以被调用的远程方法。每个方法通常具有输入类型和输出类型（都为 message 类型）。


这样只要每个要相互通信的子服务之间遵循这份约定，即可实现业务往来。




## 网关服务(`gateway.proto`、`base.proto`、`notify.proto`)
网关负责直接与客户端进行通信，其基础业务请求使用HTTP协议进行通信，通知类业务使用Websocket协议进行通信，接口定义如下：



### 网关的HTTP接口
HTTP通信，分为首行，头部和正文三部分，首行中的URI明确了业务请求目标，头部进行正文或连接描述，正文中包含请求或响应的内容，在约定的内容中，首先需要定义出来的就是URI：
```proto
syntax = "proto3";
package bite_im;
option cc_generic_services = true;
/*
    消息推送使用websocket长连接进行
    websocket长连接转换请求：ws://host:ip/ws
    长连建立以后，需要客户端给服务器发送一个身份验证信息
*/
message ClientAuthenticationReq {
    string request_id = 1;
    string session_id = 2;
}
message ClientAuthenticationRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3;
}

//通信接口统一采用POST请求实现,正文采用protobuf协议进行组织
/*  
    HTTP HEADER：
    POST /service/xxxxx
    Content-Type: application/x-protobuf
    Content-Length: 123

    xxxxxx

    -------------------------------------------------------

    HTTP/1.1 200 OK 
    Content-Type: application/x-protobuf
    Content-Length: 123

    xxxxxxxxxx
*/

```


在客户端与网关服务器的通信中，使用HTTP协议进行通信，通信时采用POST请求作为请求方法，正文采用protobuf作为正文协议格式，具体内容字段以前边各个文件中定义的字段格式为准


  以下是HTTP请求的功能与接口路径对应关系：

| 功能描述                           | HTTP路径                                    | 调用的子服务名称            | HTTP请求执行逻辑中实际调用的RPC接口名称           | 是否需要鉴权         |
|-----------------------------------|--------------------------------------------|----------------------------|---------------------------------------------|--------------------|
| 获取短信验证码                     | /service/user/get_phone_verify_code         | User_Server                 | GetPhoneVerifyCode                          | 否                 |
| 用户名密码注册                     | /service/user/username_register             | User_Server                 | UserRegister                                | 否                 |
| 用户名密码登录                     | /service/user/username_login                | User_Server                 | UserLogin                                   | 否                 |
| 手机号码注册                       | /service/user/phone_register                | User_Server                 | PhoneRegister                               | 否                 |
| 手机号码登录                       | /service/user/phone_login                   | User_Server                 | PhoneLogin                                  | 否                 |
| 获取个人信息                       | /service/user/get_user_info                 | User_Server                 | GetUserInfo                                 | 是                 |
| 修改头像                           | /service/user/set_avatar                    | User_Server                 | SetUserAvatar                               | 是                 |
| 修改昵称                           | /service/user/set_nickname                  | User_Server                 | SetUserNickname                             | 是                 |
| 修改签名                           | /service/user/set_description               | User_Server                 | SetUserDescription                          | 是                 |
| 修改绑定手机                       | /service/user/set_phone                     | User_Server                 | SetUserPhoneNumber                          | 是                 |
| 获取好友列表                       | /service/friend/get_friend_list             | Friend_Server               | GetFriendList                               | 是                 |
| 发送好友申请                       | /service/friend/add_friend_apply            | Friend_Server               | FriendAdd                                   | 是                 |
| 好友申请处理                       | /service/friend/add_friend_process          | Friend_Server               | FriendAddProcess                            | 是                 |
| 删除好友                           | /service/friend/remove_friend               | Friend_Server               | FriendRemove                                | 是                 |
| 搜索用户                           | /service/friend/search_friend               | Friend_Server               | FriendSearch                                | 是                 |
| 获取指定用户的消息会话列表           | /service/friend/get_chat_session_list       | Friend_Server               | GetChatSessionList                          | 是                 |
| 创建消息会话                       | /service/friend/create_chat_session         | Friend_Server               | ChatSessionCreate                           | 是                 |
| 获取消息会话成员列表                 | /service/friend/get_chat_session_member     | Friend_Server               | GetChatSessionMember                        | 是                 |
| 获取待处理好友申请事件列表           | /service/friend/get_pending_friend_events   | Friend_Server               | GetPendingFriendEventList                   | 是                 |
| 获取历史消息/离线消息列表            | /service/message_storage/get_history        | Message_Store_Server        | GetHistoryMsg                               | 是                 |
| 获取最近N条消息列表                 | /service/message_storage/get_recent         | Message_Store_Server        | GetRecentMsg                                | 是                 |
| 搜索历史消息                       | /service/message_storage/search_history     | Message_Store_Server        | MsgSearch                                   | 是                 |
| 发送消息                           | /service/message_transmit/new_message       | Message_Transmit_Server     | GetTransmitTarget                           | 是                 |
| 获取单个文件数据                    | /service/file/get_single_file               | File_Server                 | GetSingleFile                               | 是                 |
| 获取多个文件数据                    | /service/file/get_multi_file                | File_Server                 | GetMultiFile                                | 是                 |
| 发送单个文件                       | /service/file/put_single_file               | File_Server                 | PutSingleFile                               | 是                 |
| 发送多个文件                       | /service/file/put_multi_file                | File_Server                 | PutMultiFile                                | 是                 |
| 语音转文字                         | /service/speech/recognition                 | Speech_Server               | SpeechRecognition                           | 是                 |


html表格：

<table border="1" cellpadding="10">
  <thead>
    <tr>
      <th>功能描述</th>
      <th>HTTP路径</th>
      <th>调用的子服务名称</th>
      <th>HTTP请求执行逻辑中实际调用的RPC接口名称</th>
      <th>是否需要鉴权</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>获取短信验证码</td>
      <td>/service/user/get_phone_verify_code</td>
      <td rowspan="10">User_Server</td>
      <td>GetPhoneVerifyCode</td>
      <td>否</td>
    </tr>
    <tr>
      <td>用户名密码注册</td>
      <td>/service/user/username_register</td>
      <td>UserRegister</td>
      <td>否</td>
    </tr>
    <tr>
      <td>用户名密码登录</td>
      <td>/service/user/username_login</td>
      <td>UserLogin</td>
      <td>否</td>
    </tr>
    <tr>
      <td>手机号码注册</td>
      <td>/service/user/phone_register</td>
      <td>PhoneRegister</td>
      <td>否</td>
    </tr>
    <tr>
      <td>手机号码登录</td>
      <td>/service/user/phone_login</td>
      <td>PhoneLogin</td>
      <td>否</td>
    </tr>
    <tr>
      <td>获取个人信息</td>
      <td>/service/user/get_user_info</td>
      <td>GetUserInfo</td>
      <td>是</td>
    </tr>
    <tr>
      <td>修改头像</td>
      <td>/service/user/set_avatar</td>
      <td>SetUserAvatar</td>
      <td>是</td>
    </tr>
    <tr>
      <td>修改昵称</td>
      <td>/service/user/set_nickname</td>
      <td>SetUserNickname</td>
      <td>是</td>
    </tr>
    <tr>
      <td>修改签名</td>
      <td>/service/user/set_description</td>
      <td>SetUserDescription</td>
      <td>是</td>
    </tr>
    <tr>
      <td>修改绑定手机</td>
      <td>/service/user/set_phone</td>
      <td>SetUserPhoneNumber</td>
      <td>是</td>
    </tr>
    <tr>
      <td>获取好友列表</td>
      <td>/service/friend/get_friend_list</td>
      <td rowspan="9">Friend_Server</td>
      <td>GetFriendList</td>
      <td>是</td>
    </tr>
    <tr>
      <td>发送好友申请</td>
      <td>/service/friend/add_friend_apply</td>
      <td>FriendAdd</td>
      <td>是</td>
    </tr>
    <tr>
      <td>好友申请处理</td>
      <td>/service/friend/add_friend_process</td>
      <td>FriendAddProcess</td>
      <td>是</td>
    </tr>
    <tr>
      <td>删除好友</td>
      <td>/service/friend/remove_friend</td>
      <td>FriendRemove</td>
      <td>是</td>
    </tr>
    <tr>
      <td>搜索用户</td>
      <td>/service/friend/search_friend</td>
      <td>FriendSearch</td>
      <td>是</td>
    </tr>
    <tr>
      <td>获取指定用户的消息会话列表</td>
      <td>/service/friend/get_chat_session_list</td>
      <td>GetChatSessionList</td>
      <td>是</td>
    </tr>
    <tr>
      <td>创建消息会话</td>
      <td>/service/friend/create_chat_session</td>
      <td>ChatSessionCreate</td>
      <td>是</td>
    </tr>
    <tr>
      <td>获取消息会话成员列表</td>
      <td>/service/friend/get_chat_session_member</td>
      <td>GetChatSessionMember</td>
      <td>是</td>
    </tr>
    <tr>
      <td>获取待处理好友申请事件列表</td>
      <td>/service/friend/get_pending_friend_events</td>
      <td>GetPendingFriendEventList</td>
      <td>是</td>
    </tr>
    <tr>
      <td>获取历史消息/离线消息列表</td>
      <td>/service/message_storage/get_history</td>
      <td rowspan="3">Message_Store_Server</td>
      <td>GetHistoryMsg</td>
      <td>是</td>
    </tr>
    <tr>
      <td>获取最近N条消息列表</td>
      <td>/service/message_storage/get_recent</td>
      <td>GetRecentMsg</td>
      <td>是</td>
    </tr>
    <tr>
      <td>搜索历史消息</td>
      <td>/service/message_storage/search_history</td>
      <td>MsgSearch</td>
      <td>是</td>
    </tr>
    <tr>
      <td>发送消息</td>
      <td>/service/message_transmit/new_message</td>
      <td>Message_Transmit_Server</td>
      <td>GetTransmitTarget</td>
      <td>是</td>
    </tr>
    <tr>
      <td>获取单个文件数据</td>
      <td>/service/file/get_single_file</td>
      <td rowspan="4">File_Server</td>
      <td>GetSingleFile</td>
      <td>是</td>
    </tr>
    <tr>
      <td>获取多个文件数据</td>
      <td>/service/file/get_multi_file</td>
      <td>GetMultiFile</td>
      <td>是</td>
    </tr>
    <tr>
      <td>发送单个文件</td>
      <td>/service/file/put_single_file</td>
      <td>PutSingleFile</td>
      <td>是</td>
    </tr>
    <tr>
      <td>发送多个文件</td>
      <td>/service/file/put_multi_file</td>
      <td>PutMultiFile</td>
      <td>是</td>
    </tr>
    <tr>
      <td>语音转文字</td>
      <td>/service/speech/recognition</td>
      <td>Speech_Server</td>
      <td>SpeechRecognition</td>
      <td>是</td>
    </tr>
  </tbody>
</table>





### 网关的Websocket接口
websocket通信接口中，包含两方面内容：
- 连接的身份识别：

    当用户登录成功后，向服务器发起websocket长连接请求，建立长连接。
    长连接建立成功后，向服务器发送身份鉴权请求，请求内容为protobuf结构数据，主要内容为：
    - 请求ID
    - 登录会话ID： 用于进行身份识别

    该请求不需要服务端进行回复，鉴权成功则长连接保持，鉴权失败则断开长连接即可。

    gateway.proto:
    ```proto
    syntax = "proto3";
    package chen_im;
    option cc_generic_services = true;

    message ClientAuthenticationReq {
        string request_id = 1;
        string session_id = 2;
    }

    ```





- 事件通知的内容

    因为事件通知在websocket长连接通信中进行，因此只需要定义出消息结构即可：先将一些公共结构给提取出来进行定义，定义到一个base.proto文件中。

    base.proto:
    ```proto
    syntax = "proto3";
    package chen_im;

    option cc_generic_services = true;

    //用户信息结构
    message UserInfo {
        string user_id = 1;//用户ID
        string nickname = 2;//昵称
        string description = 3;//个人签名/描述
        string phone = 4; //绑定手机号
        bytes  avatar = 5;//头像照片，文件内容使用二进制
    }

    //聊天会话信息
    message ChatSessionInfo {
        optional string single_chat_friend_id = 1;//群聊会话不需要设置，单聊会话设置为对方ID
        string chat_session_id = 2; //会话ID
        string chat_session_name = 3;//会话名称
        optional MessageInfo prev_message = 4;//会话上一条消息，新建的会话没有最新消息
        optional bytes avatar = 5;//会话头像 --群聊会话不需要，直接由前端固定渲染，单聊就是对方的头像
    }

    //消息类型
    enum MessageType {
        STRING = 0;
        IMAGE = 1;
        FILE = 2;
        SPEECH = 3;
    }
    message StringMessageInfo {
        string content = 1;//文字聊天内容
    }
    message ImageMessageInfo {
        optional string file_id = 1;//图片文件id,客户端发送的时候不用设置，由transmit服务器进行设置后交给storage的时候设置
        optional bytes image_content = 2;//图片数据，在ES中存储消息的时候只要id不要文件数据, 服务端转发的时候需要原样转发
    }
    message FileMessageInfo {
        optional string file_id = 1;//文件id,客户端发送的时候不用设置
        int64 file_size = 2;//文件大小
        string file_name = 3;//文件名称
        optional bytes file_contents = 4;//文件数据，在ES中存储消息的时候只要id和元信息，不要文件数据, 服务端转发的时候也不需要填充
    }
    message SpeechMessageInfo {
        optional string file_id = 1;//语音文件id,客户端发送的时候不用设置
        optional bytes file_contents = 2;//文件数据，在ES中存储消息的时候只要id不要文件数据, 服务端转发的时候也不需要填充
    }
    message MessageContent {
        MessageType message_type = 1; //消息类型
        oneof msg_content {
            StringMessageInfo string_message = 2;//文字消息
            FileMessageInfo file_message = 3;//文件消息
            SpeechMessageInfo speech_message = 4;//语音消息
            ImageMessageInfo image_message = 5;//图片消息
        };
    }
    //消息结构
    message MessageInfo {
        string message_id = 1;//消息ID
        string chat_session_id = 2;//消息所属聊天会话ID
        int64 timestamp = 3;//消息产生时间
        UserInfo sender = 4;//消息发送者信息
        MessageContent message = 5;
    }

    message Message {
        string request_id = 1;
        MessageInfo message = 2;
    }

    message FileDownloadData {
        string file_id = 1;
        bytes file_content = 2;
    }

    message FileUploadData {
        string file_name = 1;
        int64 file_size = 2;
        bytes file_content = 3;
    }
    ```

    然后，开始定义通知内容结构，notify.proto：
    ```proto
    syntax = "proto3";
    package chen_im;
    import "base.proto";

    option cc_generic_services = true;

    enum NotifyType {
        FRIEND_ADD_APPLY_NOTIFY = 0;
        FRIEND_ADD_PROCESS_NOTIFY = 1;
        CHAT_SESSION_CREATE_NOTIFY = 2;
        CHAT_MESSAGE_NOTIFY = 3;
        FRIEND_REMOVE_NOTIFY = 4;
    }

    message NotifyFriendAddApply {
        UserInfo user_info = 1;  //申请人信息
    }
    message NotifyFriendAddProcess {
        bool agree = 1;
        UserInfo user_info = 2;  //处理人信息
    }
    message NotifyFriendRemove {
        string user_id = 1; //删除自己的用户ID
    }
    message NotifyNewChatSession {
        ChatSessionInfo chat_session_info = 1; //新建会话信息
    }
    message NotifyNewMessage {
        MessageInfo message_info = 1; //新消息
    }


    message NotifyMessage {
        optional string notify_event_id = 1;//通知事件操作id（有则填无则忽略）
        NotifyType notify_type = 2;//通知事件类型
        oneof notify_remarks {      //事件备注信息
            NotifyFriendAddApply friend_add_apply = 3;
            NotifyFriendAddProcess friend_process_result = 4;
            NotifyFriendRemove friend_remove = 7;
            NotifyNewChatSession new_chat_session_info = 5;//会话信息
            NotifyNewMessage new_message_info = 6;//消息信息
        }
    }
    ```



## 用户管理子服务(`user.proto`)

```proto
syntax = "proto3";
package chen_im;
import "base.proto";

option cc_generic_services = true;

//----------------------------
//用户名注册   
message UserRegisterReq {
    string request_id = 1;
    string nickname = 2;
    string password = 3;
    string verify_code_id = 4;
    string verify_code = 5;
}
message UserRegisterRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3;
}
//----------------------------
//用户名登录 
message UserLoginReq {
    string request_id = 1;
    string nickname = 2;
    string password = 3;
    string verify_code_id = 4;
    string verify_code = 5;
}
message UserLoginRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3;
    string login_session_id = 4;
}
//----------------------------
//手机号验证码获取
message PhoneVerifyCodeReq {
    string request_id = 1;
    string phone_number = 2;
}
message PhoneVerifyCodeRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3;
    string verify_code_id = 4;
}
//----------------------------
//手机号注册
message PhoneRegisterReq {
    string request_id = 1;
    string phone_number = 2;
    string verify_code_id = 3;
    string verify_code = 4;
}
message PhoneRegisterRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3;
}
//----------------------------
//手机号登录
message PhoneLoginReq {
    string request_id = 1;
    string phone_number = 2;
    string verify_code_id = 3;
    string verify_code = 4;
}
message PhoneLoginRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    string login_session_id = 4;
}
//个人信息获取-这个只用于获取当前登录用户的信息
//  客户端传递的时候只需要填充session_id即可
//其他个人/好友信息的获取在好友操作中完成
message GetUserInfoReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
}
message GetUserInfoRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    UserInfo user_info = 4;
}
//----------------------------
//用户头像修改 
message SetUserAvatarReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    bytes avatar = 4;
}
message SetUserAvatarRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
}
//----------------------------
//用户昵称修改 
message SetUserNicknameReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    string nickname = 4;
}
message SetUserNicknameRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
}
//----------------------------
//用户签名修改 
message SetUserDescriptionReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    string description = 4;
}
message SetUserDescriptionRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
}
//----------------------------
//用户手机修改 
message SetUserPhoneNumberReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    string phone_number = 4;
    string phone_verify_code_id = 5;
    string phone_verify_code = 6;
}
message SetUserPhoneNumberRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
}

service UserService {
    rpc UserRegister(UserRegisterReq) returns (UserRegisterRsp);
    rpc UserLogin(UserLoginReq) returns (UserLoginRsp);
    rpc GetPhoneVerifyCode(PhoneVerifyCodeReq) returns (PhoneVerifyCodeRsp);
    rpc PhoneRegister(PhoneRegisterReq) returns (PhoneRegisterRsp);
    rpc PhoneLogin(PhoneLoginReq) returns (PhoneLoginRsp);
    rpc GetUserInfo(GetUserInfoReq) returns (GetUserInfoRsp);
    rpc SetUserAvatar(SetUserAvatarReq) returns (SetUserAvatarRsp);
    rpc SetUserNickname(SetUserNicknameReq) returns (SetUserNicknameRsp);
    rpc SetUserDescription(SetUserDescriptionReq) returns (SetUserDescriptionRsp);
    rpc SetUserPhoneNumber(SetUserPhoneNumberReq) returns (SetUserPhoneNumberRsp);
}
```



## 好友管理子服务(`friend.proto`)

```proto
syntax = "proto3";
package chen_im;
import "base.proto";

option cc_generic_services = true;


//--------------------------------------
//好友列表获取
message GetFriendListReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
}
message GetFriendListRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated UserInfo friend_list = 4;
}

//--------------------------------------
//好友删除
message FriendRemoveReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    string peer_id = 4;
}
message FriendRemoveRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
}
//--------------------------------------
//添加好友--发送好友申请
message FriendAddReq {
    string request_id = 1;
    optional string session_id = 2;
    optional string user_id = 3;//申请人id
    string respondent_id = 4;//被申请人id
}
message FriendAddRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    string notify_event_id = 4;//通知事件id
}
//--------------------------------------
//好友申请的处理
message FriendAddProcessReq {
    string request_id = 1;
    string notify_event_id = 2;//通知事件id
    bool agree = 3;//是否同意好友申请
    string apply_user_id = 4; //申请人的用户id
    optional string session_id = 5;
    optional string user_id = 6;
}
//   +++++++++++++++++++++++++++++++++
message FriendAddProcessRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    optional string new_session_id = 4; // 同意后会创建会话，向网关返回会话信息，用于通知双方会话的建立，这个字段客户端不需要关注
}
//--------------------------------------
//获取待处理的，申请自己好友的信息列表
message GetPendingFriendEventListReq {
    string request_id = 1;
    optional string session_id = 2;
    optional string user_id = 3;
}

message FriendEvent {
    string event_id = 1;
    UserInfo sender = 3;
}
message GetPendingFriendEventListRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated FriendEvent event = 4;
}

//--------------------------------------
//好友搜索
message FriendSearchReq {
    string request_id = 1;
    string search_key = 2;//就是名称模糊匹配关键字
    optional string session_id = 3;
    optional string user_id = 4;
}
message FriendSearchRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated UserInfo user_info = 4;
}

//--------------------------------------
//会话列表获取
message GetChatSessionListReq {
    string request_id = 1;
    optional string session_id = 2;
    optional string user_id = 3;
}
message GetChatSessionListRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated ChatSessionInfo chat_session_info_list = 4;
}
//--------------------------------------
//创建会话
message ChatSessionCreateReq {
    string request_id = 1;
    optional string session_id = 2;
    optional string user_id = 3;
    string chat_session_name = 4;
    //需要注意的是，这个列表中也必须包含创建者自己的用户ID
    repeated string member_id_list = 5;
}
message ChatSessionCreateRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    //这个字段属于后台之间的数据，给前端回复的时候不需要这个字段，会话信息通过通知进行发送
    optional ChatSessionInfo chat_session_info = 4; 
}
//--------------------------------------
//获取会话成员列表
message GetChatSessionMemberReq {
    string request_id = 1;
    optional string session_id = 2;
    optional string user_id = 3;
    string chat_session_id = 4;
}
message GetChatSessionMemberRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated UserInfo member_info_list = 4;
}

service FriendService {
    rpc GetFriendList(GetFriendListReq) returns (GetFriendListRsp);
    rpc FriendRemove(FriendRemoveReq) returns (FriendRemoveRsp);
    rpc FriendAdd(FriendAddReq) returns (FriendAddRsp);
    rpc FriendAddProcess(FriendAddProcessReq) returns (FriendAddProcessRsp);
    rpc FriendSearch(FriendSearchReq) returns (FriendSearchRsp);
    rpc GetChatSessionList(GetChatSessionListReq) returns (GetChatSessionListRsp);
    rpc ChatSessionCreate(ChatSessionCreateReq) returns (ChatSessionCreateRsp);
    rpc GetChatSessionMember(GetChatSessionMemberReq) returns (GetChatSessionMemberRsp);
    rpc GetPendingFriendEventList(GetPendingFriendEventListReq) returns (GetPendingFriendEventListRsp);
}
```


## 文件管理子服务(`file.proto`)
```proto
syntax = "proto3";
package chen_im;
import "base.proto";

option cc_generic_services = true;


message GetSingleFileReq {
    string request_id = 1;
    string file_id = 2;
    optional string user_id = 3;
    optional string session_id = 4;
}
message GetSingleFileRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    FileDownloadData file_data = 4;
}

message GetMultiFileReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    repeated string file_id_list = 4;
}
message GetMultiFileRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated FileDownloadData file_data = 4;
}

message PutSingleFileReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    FileUploadData file_data = 4;
}
message PutSingleFileRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3;
    FileMessageInfo file_info = 4;
}

message PutMultiFileReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    repeated FileUploadData file_data = 4;
}
message PutMultiFileRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated FileMessageInfo file_info = 4;
}

service FileService {
    rpc GetSingleFile(GetSingleFileReq) returns (GetSingleFileRsp);
    rpc GetMultiFile(GetMultiFileReq) returns (GetMultiFileRsp);
    rpc PutSingleFile(PutSingleFileReq) returns (PutSingleFileRsp);
    rpc PutMultiFile(PutMultiFileReq) returns (PutMultiFileRsp);
}

```


## 消息管理子服务(`message_storage.proto`)

```proto
/*
    消息存储服务器的子服务注册信息： /service/message_storage/instance_id
        服务名称：/service/message_storage
        实例ID: instance_id     每个能够提供用户操作服务的子服务器唯一ID
    当服务发现的时候，通过 /service/message_storage 进行服务发现，就可以发现所有的能够提供用户操作的实例信息了
*/
syntax = "proto3";
package chen_im;
import "base.proto";

option cc_generic_services = true;

message GetHistoryMsgReq {
    string request_id = 1;
    string chat_session_id = 2;
    int64 start_time = 3;
    int64 over_time = 4;
    optional string user_id = 5;
    optional string session_id = 6;
}
message GetHistoryMsgRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated MessageInfo msg_list = 4;
}

message GetRecentMsgReq {
    string request_id = 1;
    string chat_session_id = 2;
    int64 msg_count = 3;
    optional int64 cur_time = 4;//用于扩展获取指定时间前的n条消息
    optional string user_id = 5;
    optional string session_id = 6;
}
message GetRecentMsgRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated MessageInfo msg_list = 4;
}

message MsgSearchReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    string chat_session_id = 4;
    string search_key = 5;
}
message MsgSearchRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    repeated MessageInfo msg_list = 4;
}

service MsgStorageService {
    rpc GetHistoryMsg(GetHistoryMsgReq) returns (GetHistoryMsgRsp);
    rpc GetRecentMsg(GetRecentMsgReq) returns (GetRecentMsgRsp);
    rpc MsgSearch(MsgSearchReq) returns (MsgSearchRsp);
    
}

```

## 转发管理子服务(`message_transmit.proto`)

```proto
/*
    消息转发服务器的子服务注册信息： /service/message_transmit/instance_id
        服务名称：/service/message_transmit
        实例ID: instance_id     每个能够提供用户操作服务的子服务器唯一ID
    当服务发现的时候，通过 /service/message_transmit 进行服务发现，就可以发现所有的能够提供用户操作的实例信息了
*/
//消息转发服务器接口
syntax = "proto3";
package chen_im;
import "base.proto";

option cc_generic_services = true;

//这个用于和网关进行通信
message NewMessageReq {
    string request_id = 1;
    optional string user_id = 2;
    optional string session_id = 3;
    string chat_session_id = 4;
    MessageContent message = 5;
}
message NewMessageRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
}

//这个用于内部的通信,生成完整的消息信息，并获取消息的转发人员列表
message GetTransmitTargetRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    MessageInfo message = 4;
    repeated string target_id_list = 5;
}

service MsgTransmitService {
    rpc GetTransmitTarget(NewMessageReq) returns (GetTransmitTargetRsp);
}
```

## 语音转换子服务(`speach_recognition.proto`)
```proto
/*
    语音识别服务器的子服务注册信息： /service/speech/instance_id
        服务名称：/service/speech
        实例ID: instance_id     每个能够提供用户操作服务的子服务器唯一ID
    当服务发现的时候，通过 /service/speech 进行服务发现，就可以发现所有的能够提供用户操作的实例信息了
*/
syntax = "proto3";
package chen_im;

option cc_generic_services = true;

message SpeechRecognitionReq {
    string request_id = 1;
    bytes speech_content = 2;
    optional string user_id = 3;
    optional string session_id = 4;
}

message SpeechRecognitionRsp {
    string request_id = 1;
    bool success = 2;
    string errmsg = 3; 
    string recognition_result = 4;
}

service SpeechService {
    rpc SpeechRecognition(SpeechRecognitionReq) returns (SpeechRecognitionRsp);
}
```


# Speech_Server 设计与实现

## 1. 功能设计

**语音转换子服务：**

- 用于调用语音识别 SDK，进行语音识别，将语音转为文字后返回给网关。
- 提供的功能性接口只有一个：语音消息的文字转换，供客户端进行语音消息的文字转换。

## 2. 模块划分

1. **参数/配置文件解析模块：** 需要设置如下参数
    - rpc所需信息：
      - rpc服务器的地址和端口号
    - 服务注册所需要的信息：
      - 注册中心的地址和端口号：便于向注册中心发起服务注册
      - 实际提供rpc服务的地址和端口号信息：这就是etcd中存放的键值对中的value
    - 语音识别平台所需信息：
      - app_id
      - api_key
      - secret_key
    - 日志模块所需信息：
      - 运行模式
      - 日志文件名称
      - 日志输出级别

2. **日志模块：**
   - 直接使用基于 `spdlog` 框架封装的模块进行日志输出。

3. **服务注册模块：**
   - 直接使用基于 `etcd` 框架封装的注册模块，进行**语音识别子服务**的服务注册。

4. **RPC 服务模块：**
   - 基于 `brpc` 框架搭建 RPC 服务器。

5. **语音识别 SDK 模块：**
   - 基于语音识别平台提供的 SDK 直接使用，完成语音的识别转文字。

## 3. 模块功能示意图
![Alt text](./Pics/语音模块框架图2.png)


## 4. 接口实现流程

- 参数解析
- 初始化日志器
- 搭建rpc服务器
- 服务注册
- 语音识别：
  1. 接收请求，从请求中取出语音数据。
  2. 基于语音识别 SDK 进行语音识别，获取识别后的文本内容。
  3. 组织响应进行返回。





# File_Server 设计与实现

## 1. 功能设计

1. **文件的上传：**
   - **单个文件的上传：** 这个接口基本用于后台部分，收到文件消息后将文件数据转发给文件子服务进行存储。
   - **多个文件的上传：** 这个接口基本用于后台部分，收到文件消息后将文件数据转发给文件子服务进行存储。

2. **文件的下载：**
   - **单个文件的下载：** 在后台用于获取用户头像文件数据，以及客户端用于获取文件/语音/图片消息的文件数据。
   - **多个文件的下载：** 在后台用于大批量获取用户头像数据（比如获取用户列表的时候），以及前端的批量文件下载。

## 2. 模块划分

1. **参数/配置文件解析模块：**
   - 基于 `gflags` 框架直接使用进行参数/配置文件解析。

2. **日志模块：**
   - 基于 `spdlog` 框架封装的模块直接使用进行日志输出。

3. **服务注册模块：**
   - 基于 `etcd` 框架封装的注册模块直接使用进行文件存储管理子服务的服务注册。

4. **RPC 服务模块：**
   - 基于 `brpc` 框架搭建 RPC 服务器。

5. **文件操作模块：**
   - 基于标准库的文件流操作实现文件读写的封装。

## 3. 模块功能示意图

（此处插入模块功能示意图）

## 4. 接口实现流程

### 4.1 单个文件的上传

1. 获取文件元数据（大小、文件名、文件内容）。
2. 为文件分配文件 ID。
3. 以文件 ID 为文件名打开文件，并写入数据。
4. 组织响应进行返回。

### 4.2 多个文件的上传

>多文件上传相较于单文件上传，就是将处理过程循环进行。

1. 从请求中获取文件元数据。
2. 为文件分配文件 ID。
3. 以文件 ID 为文件名打开文件，并写入数据。
4. 回到第一步进行下一个文件的处理。
5. 当所有文件数据存储完毕，组织响应进行返回。

### 4.3 单个文件的下载

1. 从请求中获取文件 ID。
2. 以文件 ID 作为文件名打开文件，获取文件大小，并从中读取文件数据。
3. 组织响应进行返回。

### 4.4 多个文件的下载

>多文件下载相较于单文件下载，就是将处理过程循环进行。

1. 从请求中获取文件 ID。
2. 以文件 ID 作为文件名打开文件，获取文件大小，并从中读取文件数据。
3. 回到第一步进行下一个文件的处理。
4. 当所有文件数据获取完毕，组织响应进行返回。



# User_Server 设计与开发

## 1. 功能设计

**用户管理子服务：**

>主要用于管理用户的数据，以及关于用户信息的各项操作。用户子服务需要提供以下接口：
  1. 用户注册：用户输入用户名（昵称）以及密码进行用户名的注册。
  2. 用户登录：用户通过用户名和密码进行登录。
  3. 短信验证码获取：当用户通过手机号注册或登录时，需要获取短信验证码。
  4. 手机号注册：用户输入手机号和短信验证码进行手机号的用户注册。
  5. 手机号登录：用户输入手机号和短信验证码进行手机号的用户登录。
  6. 用户信息获取：用户登录后，获取个人信息进行展示。
  7. 头像修改：设置用户头像。
  8. 昵称修改：设置用户昵称。
  9. 签名修改：设置用户签名。
  10. 手机号修改：修改用户的绑定手机号。

## 2. 模块划分

1. **参数/配置文件解析模块：**
   - 基于 `gflags` 框架直接使用进行参数/配置文件解析。

2. **日志模块：**
   - 基于 `spdlog` 框架封装的模块直接使用进行日志输出。

3. **服务注册模块：**
   - 基于 `etcd` 框架封装的注册模块直接使用，进行聊天消息存储子服务的注册。

4. **数据库数据操作模块：**
   - 基于 `odb-mysql` 数据管理封装的模块，实现关系型数据库中的数据操作。
     - 用户进行用户名/手机号注册时在数据库中进行新增信息。
     - 用户修改个人信息时修改数据库中的记录。
     - 用户登录时，在数据库中进行用户名密码的验证。

5. **Redis 客户端模块：**
   - 基于 `redis++` 封装的客户端进行内存数据库数据操作。
     - 用户登录时需要为用户创建登录会话，会话信息保存在 Redis 服务器中。
     - 用户手机号进行获取/验证验证码时，验证码与对应信息保存在 Redis 服务器中。

6. **RPC 服务模块：**
   - 基于 `brpc` 框架搭建 RPC 服务器。

7. **RPC 服务发现与调用模块：**
   - 基于 `etcd` 框架与 `brpc` 框架封装的服务发现与调用模块。
     - 连接文件管理子服务：获取用户信息时，用户头像通过文件形式存储在文件子服务中。
     - 连接消息管理子服务：打开聊天会话时，需要获取最近的一条消息进行展示。

8. **ES 客户端模块：**
   - 基于 `elasticsearch` 框架实现访问客户端，向 ES 服务器中存储用户信息，以便于用户搜索。

9. **短信平台客户端模块：**
   - 基于短信平台 SDK 封装使用，用于向用户手机号发送指定验证码。

## 3. 功能模块示意图

（此处插入功能模块示意图）

## 4. 数据管理

对用户数据的管理：
1. mysql：存储用户元信息，以便用于登录验证以及用户信息获取
2. elasticserarch：存储用户元信息，以便通过关键字搜索用户
3. redis：存储登录会话（session）信息、验证码校验

### 4.1 关系数据库数据管理

**用户数据表：**

- 包含字段：
  1. 主键 ID：自动生成。
  2. 用户 ID：用户唯一标识。
  3. 用户昵称：用户的昵称，也可用作登录用户名。
  4. 用户签名：用户对自己的描述。
  5. 登录密码：登录验证。
  6. 绑定手机号：用户可以绑定手机号，绑定后可以通过手机号登录。
  7. 用户头像文件 ID：头像文件存储的唯一标识，具体头像数据存储在文件子服务器中。

- 提供的操作：
  1. 通过昵称获取用户信息。
  2. 通过手机号获取用户信息。
  3. 通过用户 ID 获取用户信息。
  4. 新增用户。
  5. 更新用户信息。

**ODB 映射数据结构：**

```cpp
#pragma once
#include <string>
#include <cstddef> // std::size_t
#include <boost/date_time/posix_time/posix_time.hpp>
#include <odb/nullable.hxx>
#include <odb/core.hxx>

/* 在 C++ 中，要使用 ODB 将类声明为持久化类，
需要包含 ODB 的核心头文件，并使用 #pragma db object 指令 #pragma db object
指示 ODB 编译器将 person 类视为一个持久化类。 */

typedef boost::posix_time::ptime ptime;

#pragma db object table("user")
class User
{
    friend class odb::access;

private:
#pragma db id auto
    unsigned long _id;
#pragma db type("varchar(64)") index unique
    std::string _user_id;
#pragma db type("varchar(64)") index unique
    odb::nullable<std::string> _nickname;    // 用户昵称-不一定存在
    odb::nullable<std::string> _description; // 用户签名 - 不一定存在
#pragma db type("varchar(64)")
    odb::nullable<std::string> _password;    // 用户密码 - 不一定存在
#pragma db type("varchar(64)") index unique
    odb::nullable<std::string> _phone;       // 用户手机号 - 不一定存在
#pragma db type("varchar(64)")
    odb::nullable<std::string> _avatar_id;   // 用户头像文件ID - 不一定存在

public:
    // 用户名+密码注册
    User(const std::string &uid, const std::string &nickname, const std::string &password) : _user_id(uid), _nickname(nickname), _password(password) {}

    // 手机号+密码注册
    User(const std::string &uid, const std::string &phone) : _user_id(uid), _nickname(uid), _phone(phone) {}

    void user_id(const std::string &val)
    {
        _user_id = val;
    }
    std::string user_id() { return _user_id; }

    std::string nickname()
    {
        if (_nickname)
            return *_nickname;
        return std::string();
    }
    void nickname(const std::string &val) { _nickname = val; }

    std::string description()
    {
        if (!_description)
            return std::string();
        return *_description;
    }
    void description(const std::string &val) { _description = val; }

    std::string password()
    {
        if (!_password)
            return std::string();
        return *_password;
    }
    void password(const std::string &val) { _password = val; }

    std::string phone()
    {
        if (!_phone)
            return std::string();
        return *_phone;
    }
    void phone(const std::string &val) { _phone = val; }

    std::string avatar_id()
    {
        if (!_avatar_id)
            return std::string();
        return *_avatar_id;
    }
    void avatar_id(const std::string &val) { _avatar_id = val; }

    User() {}
    ~User() {}
};

// odb -d mysql --std c++17 --generate-query --generate-schema --profile boost/date-time user.hxx
```


ODB自动生成的SQL代码:
```sql
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` varchar(64) NOT NULL,
  `nickname` varchar(64) NULL,
  `description` TEXT NULL,
  `password` varchar(64) NULL,
  `phone` varchar(64) NULL,
  `avatar_id` varchar(64) NULL)
 ENGINE=InnoDB;

CREATE UNIQUE INDEX `user_id_i`
  ON `user` (`user_id`);

CREATE UNIQUE INDEX `nickname_i`
  ON `user` (`nickname`);

CREATE UNIQUE INDEX `phone_i`
  ON `user` (`phone`);
```


### 4.2 内存数据库数据管理

**会话信息映射键值对：**

- 映射类型：字符串键值对映射。
- 映射字段：
  1. 会话 ID (key) - 用户 ID (val)：便于通过会话 ID 查找用户 ID，进行后续操作时的连接身份识别鉴权。
     - 在用户登录时新增数据。
     - 在用户登录后的操作时进行验证及查询。
     - 该映射数据在用户退出登录时删除（目前未实现）。
  2. 用户 ID (key) - 空 (val)：这是一个用户登录状态的标记，用于避免重复登录。
     - 在用户登录时新增数据。
     - 在用户连接断开时删除数据。

**验证码信息映射键值对：**

- 映射类型：字符串键值对映射。
- 映射字段：
  1. 验证码 ID (key) - 验证码 (val)：用于生成一个验证码 ID 和验证码。
     - 用户获取短信验证码时新增数据。
     - 验证码通过短信平台发送给用户手机。
     - 验证码 ID 直接响应发送给用户，用户登录时通过这两个信息进行验证。
     - 该映射字段需要设置一个 60s 过期自动删除的时间，并在验证完毕后删除。

### 4.3 文档数据库数据管理

**用户信息的用户 ID、手机号、昵称字段需要在 ES 服务器额外存储一份。**

- 目的：用户搜索通常是一种字符串的模糊匹配方式，用传统的关系型数据库进行模糊匹配效率低，因此采用 ES 服务对索引字段进行分词后构建倒排索引，根据关键词进行搜索，提升效率。

**创建用户索引：**

```json
POST /user/_doc
{
    "settings" : {
        "analysis" : {
            "analyzer" : {
                "ik" : {
                    "tokenizer" : "ik_max_word"
                }
            }
        }
    },
    "mappings" : {
        "dynamic" : true,
        "properties" : {
            "nickname" : {
                "type" : "text",
                "analyzer" : "ik_max_word"
            },
            "user_id" : {
                "type" : "keyword",
                "analyzer" : "standard"
            },
            "phone" : {
                "type" : "keyword",
                "analyzer" : "standard"
            },
            "description" : {
                "type" : "text",
                "index": "not_analyzed"
            },
            "avatar_id" : {
                "type" : "text",
                "index": "not_analyzed"
            }
        }
    }
}
```

**新增测试数据：**

```json
POST /user/_doc/_bulk
{"index":{"_id":"1"}}
{"user_id" : "USER4b862aaa-2df8654a-7eb4bb65-e3507f66","nickname" : "昵称 1","phone" : "手机号 1","description" : "签名 1","avatar_id" : "头像 1"}
{"index":{"_id":"2"}}
{"user_id" : "USER14eeeaa5-442771b9-0262e455-e4663d1d","nickname" : "昵称 2","phone" : "手机号 2","description" : "签名 2","avatar_id" : "头像 2"}
{"index":{"_id":"3"}}
{"user_id" : "USER484a6734-03a124f0-996c169d-d05c1869","nickname" : "昵称 3","phone" : "手机号 3","description" : "签名 3","avatar_id" : "头像 3"}
{"index":{"_id":"4"}}
{"user_id" : "USER186ade83-4460d4a6-8c08068f-83127b5d","nickname" : "昵称 4","phone" : "手机号 4","description" : "签名 4","avatar_id" : "头像 4"}
{"index":{"_id":"5"}}
{"user_id" : "USER6f19d074-c33891cf-23bf5a83-57189a19","nickname" : "

昵称 5","phone" : "手机号 5","description" : "签名 5","avatar_id" : "头像 5"}
{"index":{"_id":"6"}}
{"user_id" : "USER97605c64-9833ebb7-d0455353-35a59195","nickname" : "昵称 6","phone" : "手机号 6","description" : "签名 6","avatar_id" : "头像 6"}
```

**进行搜索测试：**

```json
GET /user/_doc/_search?pretty
{
    "query": {
        "match_all": {}
    }
}
```

```json
GET /user/_doc/_search?pretty
{
    "query" : {
        "bool" : {
            "must_not" : [
                {
                    "terms" : {
                        "user_id.keyword" : [
                            "USER4b862aaa-2df8654a-7eb4bb65-e3507f66",
                            "USER14eeeaa5-442771b9-0262e455-e4663d1d",
                            "USER484a6734-03a124f0-996c169d-d05c1869"
                        ]
                    }
                }
            ],
            "should" : [
                {
                    "match" : {
                        "user_id" : "昵称"
                    }
                },
                {
                    "match" : {
                        "nickname" : "昵称"
                    }
                },
                {
                    "match" : {
                        "phone" : "昵称"
                    }
                }
            ]
        }
    }
}
```

**删除用户索引：**

```json
DELETE /user
```

## 5. 接口实现流程

### 5.1 用户注册

1. 从请求中取出昵称和密码。
2. 检查昵称是否合法（只能包含字母，数字，连字符-，下划线_，长度限制 3~15 之间）。
3. 检查密码是否合法（只能包含字母，数字，长度限制 6~15 之间）。
4. 根据昵称在数据库中判断是否昵称已存在。
5. 向数据库新增数据。
6. 向 ES 服务器中新增用户信息。
7. 组织响应，返回成功与否。

### 5.2 用户登录

1. 从请求中取出昵称和密码。
2. 通过昵称获取用户信息，进行密码是否一致的判断。
3. 根据 Redis 中的登录标记信息判断用户是否已经登录。
4. 构造会话 ID，生成会话键值对，向 Redis 中添加会话信息以及登录标记信息。
5. 组织响应，返回生成的会话 ID。

### 5.3 获取短信验证码

1. 从请求中取出手机号码。
2. 验证手机号码格式是否正确（必须以 1 开始，第二位 3~9 之间，后边 9 个数字字符）。
3. 生成 4 位随机验证码。
4. 基于短信平台 SDK 发送验证码。
5. 构造验证码 ID，添加到 Redis 验证码映射键值索引中。
6. 组织响应，返回生成的验证码 ID。

### 5.4 手机号注册

1. 从请求中取出手机号码和验证码。
2. 检查注册手机号码是否合法。
3. 从 Redis 数据库中进行验证码 ID-验证码一致性匹配。
4. 通过数据库查询判断手机号是否已注册。
5. 向数据库新增用户信息。
6. 向 ES 服务器中新增用户信息。
7. 组织响应，返回注册成功与否。

### 5.5 手机号登录

1. 从请求中取出手机号码和验证码 ID，以及验证码。
2. 检查注册手机号码是否合法。
3. 从 Redis 数据库中进行验证码 ID-验证码一致性匹配。
4. 根据手机号从数据库查询用户信息，判断用户是否存在。
5. 根据 Redis 中的登录标记信息判断用户是否已经登录。
6. 构造会话 ID，生成会话键值对，向 Redis 中添加会话信息以及登录标记信息。
7. 组织响应，返回生成的会话 ID。

### 5.6 获取用户信息

1. 从请求中取出用户 ID。
2. 通过用户 ID 从数据库中查询用户信息。
3. 根据用户信息中的头像 ID，从文件服务器获取头像文件数据，组织完整用户信息。
4. 组织响应，返回用户信息。

### 5.7 设置头像

1. 从请求中取出用户 ID 与头像数据。
2. 从数据库通过用户 ID 进行用户信息查询，判断用户是否存在。
3. 上传头像文件到文件子服务。
4. 将返回的头像文件 ID 更新到数据库中。
5. 更新 ES 服务器中用户信息。
6. 组织响应，返回更新成功与否。

### 5.8 设置昵称

1. 从请求中取出用户 ID 与新的昵称。
2. 判断昵称格式是否正确。
3. 从数据库通过用户 ID 进行用户信息查询，判断用户是否存在。
4. 将新的昵称更新到数据库中。
5. 更新 ES 服务器中用户信息。
6. 组织响应，返回更新成功与否。

### 5.9 设置签名

1. 从请求中取出用户 ID 与新的签名。
2. 从数据库通过用户 ID 进行用户信息查询，判断用户是否存在。
3. 将新的签名更新到数据库中。
4. 更新 ES 服务器中用户信息。
5. 组织响应，返回更新成功与否。

### 5.10 设置绑定手机号

1. 从请求中取出手机号码和验证码 ID，以及验证码。
2. 检查注册手机号码是否合法。
3. 从 Redis 数据库中进行验证码 ID-验证码一致性匹配。
4. 根据手机号从数据库查询用户信息，判断用户是否存在。
5. 将新的手机号更新到数据库中。
6. 更新 ES 服务器中用户信息。
7. 组织响应，返回更新成功与否。

### 5.10 设置密码



# MessageTransmitServer 设计与实现

## 1. 功能设计

**转发子服务：**

- 主要用于针对一条消息内容，组织消息的 ID 以及各项所需元素，然后告知网关服务器一条消息应该发给谁。
- 通常消息都是以聊天会话为基础进行发送的，根据会话找到它的所有成员，这就是转发的目标。
- 转发子服务将收到的消息放入消息队列中，由消息存储管理子服务进行消费存储。

**核心功能：**

1. 获取消息转发目标：针对消息内容，组织消息，并告知网关转发目标。

## 2. 模块划分

1. **参数/配置文件解析模块：**
   - 基于 `gflags` 框架直接使用进行参数/配置文件解析。

2. **日志模块：**
   - 基于 `spdlog` 框架封装的模块直接使用进行日志输出。

3. **服务注册模块：**
   - 基于 `etcd` 框架封装的注册模块直接使用进行消息转发服务的服务注册。

4. **数据库数据操作模块：**
   - 基于 `odb-mysql` 数据管理封装的模块，从数据库获取会话成员。

5. **服务发现与调用模块：**
   - 基于 `etcd` 框架与 `brpc` 框架封装的服务发现与调用模块，从用户子服务获取消息发送者的用户信息。

6. **RPC 服务模块：**
   - 基于 `brpc` 框架搭建 RPC 服务器。

7. **MQ 发布模块：**
   - 基于 `rabbitmq-client` 封装的模块将消息发布到消息队列，让消息存储子服务进行消费，对消息进行存储。

## 3. 功能模块示意图

（此处插入功能模块示意图）

## 4. 接口实现流程

**获取消息转发目标与消息处理：**

1. 从请求中取出消息内容、会话 ID、用户 ID。
2. 根据用户 ID 从用户子服务获取当前发送者用户信息。
3. 根据消息内容构造完整的消息结构（分配消息 ID，填充发送者信息，填充消息产生时间）。
4. 将消息序列化后发布到 MQ 消息队列中，让消息存储子服务对消息进行持久化存储。
5. 从数据库获取目标会话所有成员 ID。
6. 组织响应（完整消息 + 目标用户 ID），发送给网关，告知网关该将消息发送给谁。





# MessageStoreServer设计

## 1. 功能设计

**消息管理子服务：**

- 主要用于管理消息的存储：
  - **文本消息：** 储存在 ElasticSearch 文档搜索服务中。
  - **文件/语音/图片：** 需要转储到文件管理子服务中。
  
- 还需管理消息的搜索与获取，对外提供以下接口：
  1. **获取历史消息(通过MySQL)：**
     - 获取最近 N 条消息：用于登录成功后，点击对方头像打开聊天框时显示最近的消息。
     - 获取指定时间段内的消息：用户可以按时间搜索聊天消息。
  2. **关键字消息搜索(通过ES)：** 用户可以针对指定好友的聊天消息进行关键字搜索。

## 2. 模块划分

1. **参数/配置文件解析模块：**
   - 基于 `gflags` 框架直接使用进行参数/配置文件解析。

2. **日志模块：**
   - 基于 `spdlog` 框架封装的模块直接使用进行日志输出。

3. **服务注册模块：**
   - 基于 `etcd` 框架封装的注册模块直接使用，进行聊天消息存储子服务的注册。

4. **数据库数据操作模块：**
   - 基于 `odb-mysql` 数据管理封装的模块，进行数据库数据操作，用于从 MQ 中消费到消息后，向数据库中存储一份，以便通过时间进行范围性查找。
   - 从数据库根据指定用户的所有好友信息。

5. **RPC 服务模块：**
   - 基于 `brpc` 框架搭建 RPC 服务器。

6. **服务发现与调用模块：**
   - 基于 `etcd` 和 `brpc` 框架封装的服务发现与调用模块。
   - 连接文件管理子服务：将文件/语音/图片类型的消息以及用户头像之类的文件数据转储到文件管理子服务。
   - 连接用户管理子服务：在消息搜索时，根据发送用户的 ID 获取发送者用户信息。

7. **ES 客户端模块：**
   - 基于 `elasticsearch` 框架实现访问客户端，向 ES 服务器进行文本聊天消息的存储，以便于文本消息的关键字搜索。

8. **MQ 消费模块：**
   - 基于 `rabbitmq-client` 封装的消费者模块从消息队列服务器消费获取聊天消息，将文本消息存储到 ElasticSearch 服务，将文件消息转储到文件管理子服务，所有消息的简息都需要向数据库存储一份。


## 3. 功能模块示意图

![Alt text](./Pics/Message_Store_Server功能模块示意图.png)




## 3. 数据管理

### 3.1 MySQL数据库对消息的管理

**说明：**

- 在消息的存储管理中，所有的消息简息都要在数据库中存储一份，进行消息的持久化，以便于进行时间范围性查询和离线消息的实现。
- 消息类型有四种：文本，文件，语音，图片。数据库中只存储文本消息和其他类型消息的元信息（比如文件的ID）。

**MySQL数据库表结构：**

- 消息 ID：唯一标识。
- 消息产生时间：用于进行时间性搜索。
- 消息发送者用户 ID：明确消息的发送者。
- 消息产生会话 ID：明确消息属于哪个会话。
- 消息类型：明确消息的类型。
- 消息内容：只存储文本消息；**文件/语音/图片数据不直接进行存储，而存储在文件子服务中**。
- 文件 ID：只有文件/语音/图片类消息会用到。
- 文件大小：只有文件/语音/图片类消息会用到。
- 文件名称：只有文件类消息会用到。

**数据库操作：**

- 新增消息。
- 通过消息 ID 获取消息信息。
- 通过会话 ID，时间范围，获取指定时间段之内的消息，并按时间进行排序。
- 通过会话 ID，消息数量，获取最近的 N 条消息（逆序 + limit 即可）。

**ODB 映射数据结构：**

```cpp
// 某个人，在某个聊天会话中，发送的消息
#pragma db object table("message")
class Message
{
    friend class odb::access; // odb要访问private成员
private:
#pragma db id auto
    unsigned long _id;     
#pragma db type("varchar(64)") index unique
    std::string _message_id;                // 用于唯一标识一条消息
#pragma db type("varchar(64)") index column("session_id")
    std::string _session_id;                // 所属聊天会话ID
#pragma db type("varchar(64)")
    std::string _user_id;                   // 发送者用户ID
    unsigned char _message_type;            // 消息类型 0-文本；1-图片；2-文件；3-语音
#pragma db type("TIMESTAMP")
    boost::posix_time::ptime _create_time;  // 消息的产生时间
    odb::nullable<std::string> _content;    // 文本消息内容--非文本消息可以忽略
#pragma db type("varchar(64)")
    odb::nullable<std::string> _file_id;    // 文件消息的文件ID -- 文本消息忽略
#pragma db type("varchar(128)")
    odb::nullable<std::string> _file_name;  // 文件消息的文件名称 -- 只针对文件消息有效
    odb::nullable<unsigned int> _file_size; // 文件消息的文件大小 -- 只针对文件消息有效
};
```

### 3.2 ElasticSearch对文本消息的管理

**说明：**

- 为了实现聊天内容的关键字搜索功能，而不在数据库中进行模糊匹配，采用 ES 进行消息内容存储与搜索。在搜索时，需要进行会话的过滤，因此需要考虑 ES 索引的构造。

**ES 文档 INDEX：**

```json
POST /message/_doc
{
    "settings" : {
        "analysis" : {
            "analyzer" : {
                "ik" : {
                    "tokenizer" : "ik_max_word"
                }
            }
        }
    },
    "mappings" : {
        "dynamic" : true,
        "properties" : {
            "chat_session_id" : {
                "type" : "keyword",
                "analyzer" : "standard"
            },
            "message_id" : {
                "type" : "keyword",
                "analyzer" : "standard"
            },
            "content" : {
                "type" : "text",
                "analyzer" : "ik_max_word"
            }
        }
    }
}
```

字段：

>chat_session_id

- `chat_session_id` 字段的类型为 `keyword`。`keyword` 类型用于存储不需要被分析的字符串（如 ID 或标签），以便进行精确匹配。
- `analyzer: "standard"` 是个多余的设置，因为 `keyword` 类型本身不进行分析。

>message_id

- `message_id` 字段也为 `keyword` 类型，功能与 `chat_session_id` 相同。

>content

- `content` 字段的类型为 `text`，适合存储需要被分析的文本内容（例如消息内容）。
- `analyzer: "ik_max_word"` 指定在索引和搜索时使用 `ik_max_word` 分析器来处理这个字段的内容，以便更好地处理中文文本。






**ES 消息测试用例：**

**新增数据：**

```json
POST /message/_doc/_bulk
{"index":{"_id":"1"}}
{"chat_session_id" : "会话 ID1","message_id" : "消息 ID1","content" : "吃饭了么？"}
{"index":{"_id":"2"}}
{"chat_session_id" : "会话 ID1","message_id" : "消息 ID2","content" : "吃的盖浇饭。"}
{"index":{"_id":"3"}}
{"chat_session_id" : "会话 ID2","message_id" : "消息 ID3","content" : "昨天吃饭了么？"}
{"index":{"_id":"4"}}
{"chat_session_id" : "会话 ID2","message_id" : "消息 ID4","content" : "昨天吃的盖浇饭。"}
```

**查看数据：**

```json
GET /message/_doc/_search?pretty
{
    "query": {
        "match_all": {}
    }
}
```

**搜索数据：**

```json
GET /message/_doc/_search?pretty
{
    "query" : {
        "bool" : {
            "must" : [
                {
                    "term" : { "chat_session_id.keyword" : "会话 ID1" }
                },
                {
                    "match" : { "content" : "盖浇饭" }
                }
            ]
        }
    }
}
```

**删除索引：**

```json
DELETE /message
```

## 4. 接口实现流程

消息存储子服务提供三个RPC接口，这三个接口都会被网关服务器调用，三个接口分别对应http服务器的三个GET类型的回调函数：


```proto
service MsgStorageService {
    rpc GetHistoryMsg(GetHistoryMsgReq) returns (GetHistoryMsgRsp); // http GET "/service/message_storage/get_history"
    rpc GetRecentMsg(GetRecentMsgReq) returns (GetRecentMsgRsp);    // http GET "/service/message_storage/get_recent"
    rpc MsgSearch(MsgSearchReq) returns (MsgSearchRsp);             // http GET "/service/message_storage/search_history"
}
```

### 15.4.1 最近 N 条消息获取

>注意：获取消息的本质是，通过**聊天会话ID（chat_session_id）**，获取这个会话下的 指定时间或数量或包含某个关键字的消息
1. 从请求中，获取**会话 ID**，和要获取的消息数量。
2. 访问数据库，从数据库中按时间排序，获取指定数量的消息简略信息（消息 ID，会话 ID，消息类型，产生时间，发送者用户 ID，文本消息内容，文件消息元信息）。
3. 循环构造完整消息（从用户子服务获取消息的发送者用户信息，从文件子服务获取文件/语音/图片数据）。
4. 组织响应返回给网关服务器。

### 15.4.2 指定时间段消息搜索

1. 从请求中，获取**会话 ID**，以及要获取的消息的起始时间与结束时间。
2. 访问数据库，从数据库中按时间进行范围查询，获取消息简略信息（消息 ID，会话 ID，消息类型，产生时间，发送者用户 ID，文本消息内容，文件消息元信息）。
3. 循环构造完整消息（从用户子服务获取消息的发送者用户信息，从文件子服务获取文件/语音/图片数据）。
4. 组织响应返回给网关服务器。

### 15.4.3 关键字消息搜索

1. 从请求中，获取**会话 ID**，以及搜索关键字。
2. 基于封装的 ES 客户端，访问 ES 服务器进行文本消息搜索（以消息内容进行搜索，并以会话 ID 进行过滤），从 ES 服务器获取到消息简略信息（消息 ID，会话 ID，文本消息内容）。
3. 循环从数据库根据消息 ID 获取消息简略信息（消息 ID，消息类型，会话 ID，发送者 ID，产生时间，文本消息内容，文件消息元数据）。
4. 循环从用户子服务获取所有消息的发送者用户信息，构造完整消息。
5. 组织响应返回给网关服务器。





# FriendServer 设计

## 19.1 功能设计

好友管理子服务，主要用于管理好友相关的数据与操作，因此主要负责以下接口：

1. **好友列表的获取：** 当用户登录成功之后，获取自己好友列表进行展示。
2. **申请好友：** 搜索用户之后，点击申请好友，向对方发送好友申请。
3. **待处理申请的获取：** 当用户登录成功之后，会获取离线的好友申请请求以待处理。
4. **好友申请的处理：** 针对收到的好友申请进行同意/拒绝的处理。
5. **删除好友：** 删除当前好友列表中的好友。
6. **用户搜索：** 可以进行用户的搜索用于申请好友。
7. **聊天会话列表的获取：** 每个单人/多人聊天都有一个聊天会话，在登录成功后可以获取聊天会话，查看历史的消息以及对方的各项信息。
8. **多人聊天会话的创建：** 单人聊天会话在对方同意好友时创建，而多人会话需要调用该接口进行手动创建。
9. **聊天成员列表的获取：** 多人聊天会话中，可以点击查看群成员按钮，查看群成员信息。

## 19.2 模块划分

1. **参数/配置文件解析模块：** 基于 `gflags` 框架直接使用进行参数/配置文件解析。
2. **日志模块：** 基于 `spdlog` 框架封装的模块直接使用进行日志输出。
3. **服务注册模块：** 基于 `etcd` 框架封装的注册模块直接使用，进行聊天消息存储子服务的注册。
4. **数据库数据操作模块：** 基于 `odb-mysql` 数据管理封装的模块，实现数据库中数据的操作。
   - 申请好友的时候，根据数据库中的数据判断两人是否已经是好友关系。
   - 申请好友的时候，根据数据库中的数据判断是否已经申请过好友。
   - 申请好友的时候，针对两位用户 ID 建立好友申请事件信息。
   - 好友信息处理的时候，找到申请事件，进行删除。
   - 获取待处理好友申请事件的时候，从数据库根据用户 ID 查询出所有的申请信息。
   - 同意好友申请的时候，需要创建单聊会话，向数据库中插入会话信息。
   - 从数据库根据指定用户 ID 获取所有好友 ID。
   - 创建群聊的时候，需要创建群聊会话，向数据库中插入会话信息。
   - 查看群聊成员的时候，从数据库根据会话 ID 获取所有会话成员 ID。
   - 获取会话列表的时候，从数据库根据用户 ID 获取到所有会话信息。
   - 删除好友的时候，从数据库中删除两人的好友关系，以及单聊会话，以及会话成员信息。
5. **RPC 服务模块：** 基于 `brpc` 框架搭建 RPC 服务器。
6. **RPC 服务发现与调用模块：** 基于 `etcd` 框架与 `brpc` 框架封装的服务发现与调用模块。
   - 连接用户管理子服务：获取好友列表，会话成员，好友申请事件的时候获取用户信息。
   - 连接消息管理子服务：在打开聊天会话的时候，需要获取最近的一条消息进行展示。
7. **ES 客户端模块：** 基于 `elasticsearch` 框架实现访问客户端，从 ES 服务器进行用户的关键字搜索（用户信息由用户子服务在用户注册的时候添加进去）。

## 19.3 功能模块示意图

（此处插入功能模块示意图）

## 19.4 数据管理

### 19.4.1 数据库数据管理

#### 用户信息表（user）

- 该表由用户管理子服务进行维护，并在用户注册时添加数据，好友管理子服务只是调用用户管理子服务来获取完整用户信息，具体来说是通过用户 ID 来获取完整用户信息。

#### 用户关系表（relation）

- 因为本身用户服务器已经管理了用户个人信息，因此没必要再整一份用户信息出来。因为当前用户之间只有好友关系（目前未实现：黑名单，陌生人等），因此这里是一个好友关系表，表示谁和谁是好友。
- 包含字段：
  - ID：作为主键。
  - 用户 ID。
  - 好友 ID。
- 需要注意的是两个用户结为好友时，需要添加 (1,2)、(2,1) 两条数据。

**提供的操作：**

- 新增用户关系：
  - 新增好友，通常伴随着新增会话，新增会话伴随着新增会话成员。
- 移除用户关系：
  - 移除好友，通常伴随着移除会话，移除会话伴随着移除会话成员。
- 判断两人是否是好友关系。
- 以用户 ID 获取用户的所有好友 ID。
- 与用户表连接，以用户 ID 获取所有好友详细信息。

**ODB 映射结构：**

```cpp
#pragma once
#include <odb/core.hxx>
#include <odb/nullable.hxx>

#pragma db object
class friend_relation {
    public:
        friend_relation(){} 
    private:
        friend class odb::access;
        #pragma db id auto 
        long int _id; 
        #pragma db index type("VARCHAR(127)") 
        std::string _user_id; 
        #pragma db type("VARCHAR(127)") 
        std::string _friend_id; 
};
```

#### 会话信息（chat_session）

- 在多人聊天中，舍弃了群的概念，添加了聊天会话的概念，因为会话既可以是两人单聊会话，也可以是多人聊天会话，这样就可以统一管理了。
- 包含字段：
  - ID：作为主键。
  - 会话 ID：会话标识。
  - 会话名称：单聊会话则设置为'单聊会话'或直接为空就行，因为单聊会话名称就是对方名称，头像就是对方头像。
  - 会话类型：`SINGLE`-单聊 / `GROUP`-多人（单聊由服务器在同意好友时创建，多人由用户申请创建）。

**提供的操作：**

- 新增会话：
  - 向会话成员表中新增会话成员信息。
  - 向会话表中新增会话信息。
- 删除会话：
  - 删除会话成员表中的所有会话成员信息。
  - 删除会话表中的会话信息。
- 通过会话 ID，获取会话的详细信息。
- 通过用户 ID 获取所有的好友单聊会话（连接会话成员表和用户表）。
  - 所需字段：
    - 会话 ID。
    - 会话名称：好友的昵称。
    - 会话类型：单聊类型。
    - 会话头像 ID：好友的头像 ID。
    - 好友 ID。
- 通过用户 ID 获取所有自己的群聊会话（连接会话成员表和用户表）。
  - 所需字段：
    - 会话 ID。
    - 会话名称。
    - 会话类型：群聊类型。

**ODB 映射结构：**

```cpp
#pragma once
#include <odb/core.hxx>
#include <odb/nullable.hxx>

enum class session_type_t { 
    SINGLE = 1, 
    GROUP = 2 
}; 

#pragma db object 
class chat_session { 
    public: 
        chat_session() {} 
    private: 
        friend class odb::access; 
        #pragma db id auto 
        long int _id; 
        #pragma db unique type("VARCHAR(127)") 
        std::string _session_id; 
        #pragma db type("VARCHAR(127)") 
        odb::nullable<std::string> _session_name; 
        #pragma db type("TINYINT") 
        session_type_t _session_type;
};
```

#### 会话成员（chat_session_member）

- 每个会话中都会有两个及以上的成员，只有两个成员的会话是单聊会话，超过两个是多人聊天会话。为了明确哪个用户属于哪个会话，或者说会话中有哪些成员，因此需要有会话成员的数据管理。
- 包含字段：
  - ID：作为主键。
  - 会话 ID：会话标识。
  - 用户 ID：用户标识。

**提供的操作：**

- 向指定会话中添加单个成员。
- 向指定会话中添加多个成员。
- 从指定会话中删除单个成员。
- 通过会话 ID，获取会话的所有成员 ID。
- 删除会话所有成员：在删除会话的时候使用。

**ODB 映射结构：**

```cpp
#pragma once
#include <odb/core.hxx>
#include <odb/nullable.hxx>

#pragma db object 
class chat_session_member {
    public: 
        chat_session_member (){} 
    private: 
        friend class odb::access; 
        #pragma db id auto 
        unsigned long _id; 
        #pragma db index type("VARCHAR(127)") 
        std::string _session_id; 
        #pragma db type("VARCHAR(127)") 
        std::string _user_id; 
};
```

#### 好友申请事件（friend_apply）

- 在好友的操作中有个操作需要额外的管理，那就是申请好友的事件。因为用户 A 申请用户 B 为好友，并非一次性完成，需要用户 B 对本次申请进行处理，同意后才算是完成一次完整的流程。所以要把申请信息存放在数据库中，申请流程完成后删除。
- 包含字段：
  - ID：作为主键。
  - 事件 ID。
  - 请求者用户 ID。
  - 响应者用户 ID。
  - 状态：用于表示本次请求的处理阶段，其包含三种状态：待处理-todo，同意-accept，拒绝-reject。

**提供的操作：**

- 新增好友申请事件：申请的时候新增。
- 删除好友申请事件：处理完毕（同意/拒绝）的时候删除。
- 获取指定用户的所有待处理事件及关联申请者用户信息（连接用户表）。

**ODB 映射结构：**

```cpp
enum class fevent_status{
    PENDING = 1, 
    ACCEPT = 2, 
    REJECT = 3 
}; 

#pragma db object 
class friend_event {
    public: 
        friend_event() {} 
    private: 
        friend class odb::access; 
        #pragma db id auto 
        long int _id; 
        #pragma db unique type("VARCHAR(127)") 
        std::string _event_id; 
        #pragma db type("VARCHAR(127)") 
        std::string _req_user_id; 
        #pragma db type("VARCHAR(127)") 
        std::string _rsp_user_id; 
        #pragma db type("TINYINT") 
        fevent_status _status; 
};
```

### 19.4.2 ES用户信息管理

**创建用户索引**

```json
POST /user/_doc 
{ 
    "settings" : { 
        "analysis" : { 
            "analyzer" : { 
                "ik" : { 
                    "tokenizer" : "ik_max_word" 
                } 
            } 
        } 
    }, 
    "mappings" : { 
        "dynamic" : true, 
        "properties" : { 
            "nickname" : { 
                "type" : "text", 
                "analyzer" : "ik_max_word" 
            }, 
            "user_id" : { 
                "type" : "keyword", 
                "analyzer" : "standard" 
            }, 
            "phone" : { 
                "type" : "keyword", 
                "analyzer" : "standard" 
            }, 
            "description" : { 
                "type" : "text", 
                "index": "not_analyzed" 
            }, 
            "avatar_id" : { 
                "type" : "text", 
                "index": "not_analyzed" 
            } 
        } 
    } 
}
```

**新增测试数据**

```json
POST /user/_doc/_bulk 
{"index":{"_id":"1"}} 
{"user_id" : "USER4b862aaa-2df8654a-7eb4bb65-e3507f66","nickname" : "昵称 1","phone" : "手机号 1","description" : "签名 1","avatar_id" : "头像 1"} 
{"index":{"_id":"2"}} 
{"user_id" : "USER14eeeaa5-442771b9-0262e455-e4663d1d","nickname" : "昵称 2","phone" : "手机号 2","description" : "签名 2","avatar_id" : "头像 2"} 
{"index":{"_id":"3"}} 
{"user_id" : "USER484a6734-03a124f0-996c169d-d05c1869","nickname" : "昵称 3","phone" : "手机号 3","description" : "签名 3","avatar_id" : "头像 3"} 
{"index":{"_id":"4"}} 
{"user_id" : "USER186ade83-4460d4a6-8c08068f-83127b5d","nickname" : "昵称 4","phone" : "手机号 4","description" : "签名 4","avatar_id" : "头像 4"} 
{"index":{"_id":"5"}} 
{"user_id" : "USER6f19d074-c33891cf-23bf5a83-57189a19","nickname" : "昵称 5","phone" : "手机号 5","description" : "签名 5","avatar_id" : "头像 5"} 
{"index":{"_id":"6"}} 
{"user_id" : "USER97605c64-9833ebb7-d0455353-35a59195","nickname" : "昵称 6","phone" : "手机号 6","description" : "签名 6","avatar_id" : "头像 6"} 
```

**进行搜索测试**

```json
GET /user/_doc/_search?pretty 
{ 
    "query": { 
        "match_all": {} 
    } 
}
```

```json
GET /user/_doc/_search?pretty 
{ 
    "query" : { 
        "bool" : { 
            "must_not" : [ 
                { 
                    "terms" : { 
                        "user_id.keyword" : [ 
                            "USER4b862aaa-2df8654a-7eb4bb65-e3507f66", 
                            "USER14eeeaa5-442771b9-0262e455-e4663d1d", 
                            "USER484a6734-03a124f0-996c169d-d05c1869" 
                        ] 
                    } 
                } 
            ], 
            "should" : [ 
                { 
                    "match" : { 
                        "user_id" : "昵称" 
                    } 
                }, 
                { 
                    "match" : { 
                        "nickname" : "昵称" 
                    } 
                }, 
                { 
                    "match" : { 
                        "phone" : "昵称" 
                    } 
                } 
            ] 
        } 
    } 
}
```

**删除用户索引**

```json
DELETE /user
```

## 19.5 接口实现流程

### 19.5.1 获取好友列表

1. 获取请求中的用户 ID。
2. 根据用户 ID，从数据库的好友关系表和用户表中取出该用户所有的好友简息。
3. 根据好友简息中的好友头像 ID，批量获取头像数据，组织完整用户信息结构。
4. 组织响应，将好友列表返回给网关。

### 19.5.2 申请添加好友

1. 取出请求中的请求者 ID 和被请求者 ID。
2. 判断两人是否已经是好友。
3. 判断该用户是否已经申请过好友关系。
4. 向好友申请事件表中，新增申请信息。
5. 组织响应，将事件 ID 信息响应给网关。

### 19.5.3 获取待处理好友申请事件

1. 取出请求中的用户 ID。
2. 根据用户 ID，从申请事件表和用户表中找到该用户所有状态为 `PENDING` 的待处理事件关联申请人用户简息。
3. 根据申请人用户头像 ID，从文件存储子服务器获取所有用户头像信息，组织用户信息结构。
4. 组织响应，将申请事件列表响应给网关。

### 19.5.4 处理好友申请

1. 取出请求中的申请人 ID 和被申请人 ID，以及处理结果。
2. 根据两人 ID 在申请事件表中查询判断是否存在申请事件。
3. 判断两人是否已经是好友（互相加好友的情况）。
4. 不管拒绝还是同意，删除申请事件表中的事件信息（该事件处理完毕）。
5. 若同意申请，则向用户关系表中添加好友关系数据，向会话表中新增会话信息，向会话成员表中新增成员信息。
6. 组织响应，将新生成的会话 ID 响应给网关。

### 19.5.5 删除好友

1. 取出请求中的删除者 ID 和被删除者 ID。
2. 从用户好友关系表中删除相关关系数据，从会话表中删除单聊会话，从会话成员表中删除会话成员信息。
3. 组织响应，返回给网关。

### 19.5.6 搜索好友

1. 取出请求中的用户 ID 和搜索关键字。
2. 从好友关系表中取出该用户所有好友 ID。
3. 根据关键字从 ES 服务器中进行用户搜索，搜索的时候需要将关键字作为用户 ID、手机号、昵称的搜索关键字进行搜索，且需要根据自己的 ID 和好友 ID 过滤掉自己和自己的好友。
4. 根据搜索到的用户简息中的头像 ID，从文件服务器批量获取用户头像数据。
5. 组织响应，将搜索到的用户列表响应给网关。

### 19.5.7 创建会话

1. 从请求中取出用户 ID 与会话名称，以及会话的成员 ID 列表。
2. 生成会话 ID，并向会话表中新增会话信息数据，会话为群聊会话（单聊会话是同意好友申请的时候创建的）。
3. 向会话成员表中新增所有的成员信息。
4. 组织响应，将组织好的会话信息响应给网关。

### 19.5.

8 获取会话列表

1. 从请求中取出用户 ID。
2. 根据用户 ID，从会话表、会话成员表和用户表中取出好友的单聊会话列表（会话 ID、好友用户 ID、好友昵称、好友头像 ID），并组织会话信息结构对象。
   - 单聊会话中，对方的昵称就是会话名称，对方的头像就是会话头像，会话类型为单聊类型。
3. 根据单聊会话 ID，从消息存储子服务获取会话的最后一条消息。
4. 根据好友头像 ID，从文件存储子服务批量获取好友头像数据。
5. 组织好单聊会话结构数据。
6. 根据用户 ID，从会话表和会话成员表中取出群聊会话列表（会话 ID，会话名称）。
7. 根据群聊会话 ID，从消息存储子服务获取会话的最后一条消息。
8. 组织好群聊会话结构数据。
9. 将单聊会话数据和群聊会话数据组织到一起，响应给网关。

### 19.5.9 获取会话成员

1. 取出请求中用户 ID 和会话 ID。
2. 根据会话 ID，从会话成员表和用户表中取出所有的成员用户信息。
3. 根据成员信息中的头像 ID，从文件存储子服务批量获取头像数据组织用户信息结构。
4. 组织响应，将会话的成员用户信息列表响应给网关。




# GatewayServer 设计

## 20.1 功能设计

网关服务器在设计中，最重要的两个功能：

- 作为入口服务器接收客户端的所有请求，进行请求的子服务分发，得到响应后进行响应。
- 对客户端进行事件通知（好友申请和处理及删除，单聊/群聊会话创建，新消息）。

基于以上的两个功能，网关服务器包含两项通信：

- **HTTP 通信：** 进行业务处理。
- **WebSocket 通信：** 进行事件通知。

## 20.2 模块划分

1. **参数/配置文件解析模块：** 基于 `gflags` 框架直接使用进行参数/配置文件解析。

2. **日志模块：** 基于 `spdlog` 框架封装的模块直接使用进行日志输出。

3. **RPC 服务发现与调用模块：** 基于 `etcd` 框架与 `brpc` 框架封装的服务发现与调用模块。
   - 因为要分发处理所有请求，因此所有的子服务都需要进行服务发现。

4. **Redis 客户端模块：** 基于 `redis++` 封装的客户端进行内存数据库数据操作。
   - 根据用户子服务添加的会话信息进行用户连接身份识别与鉴权。

5. **HTTP 通信服务器模块：** 基于 `cpp-httplib` 库搭建 HTTP 服务器，接收 HTTP 请求进行业务处理。

6. **WebSocket 服务器模块：** 基于 `WebSocketpp` 库，搭建 WebSocket 服务器，进行事件通知。

7. **客户端长连接管理模块：** 建立用户 ID 与长连接句柄映射关系，便于后续根据用户 ID 找到连接进行事件通知。

## 20.3 模块功能示意图

（此处插入模块功能示意图）

## 20.4 接口实现流程

### 20.4.1 用户名注册

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 查找用户子服务。
3. 调用子服务对应接口进行业务处理。
4. 将处理结果响应给客户端。

### 20.4.2 用户名登录

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 查找用户子服务。
3. 调用子服务对应接口进行业务处理。
4. 将处理结果响应给客户端。

### 20.4.3 短信验证码获取

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 查找用户子服务。
3. 调用子服务对应接口进行业务处理。
4. 将处理结果响应给客户端。

### 20.4.4 手机号码注册

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 查找用户子服务。
3. 调用子服务对应接口进行业务处理。
4. 将处理结果响应给客户端。

### 20.4.5 手机号码登录

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 查找用户子服务。
3. 调用子服务对应接口进行业务处理。
4. 将处理结果响应给客户端。

### 20.4.6 用户信息获取

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找用户子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.7 修改用户头像

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找用户子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.8 修改用户签名

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找用户子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.9 修改用户昵称

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找用户子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.10 修改用户绑定手机号

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找用户子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.11 获取好友列表

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找好友子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.12 发送好友申请

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找用户子服务。
4. 根据请求中的用户 ID，调用用户子服务，获取用户的详细信息。
5. 查找好友子服务。
6. 调用子服务对应接口进行业务处理。
7. 若处理成功，则通过被申请人 ID，查找对方长连接。
   - 若长连接存在（对方在线），则组织好友申请通知进行事件通知。
8. 将处理结果响应给客户端。

### 20.4.13 获取待处理好友申请

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找好友子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.14 好友申请处理

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找用户子服务。
4. 根据请求中的用户 ID，调用用户子服务，获取申请人与被申请人的详细信息。
5. 查找好友子服务。
6. 调用子服务对应接口进行业务处理。
7. 若处理成功，则通过申请人 ID，查找申请人长连接，进行申请处理结果的通知。
   - 若处理结果是同意，则意味着新聊天会话的创建，对申请人进行聊天会话创建通知。
     1. 从处理结果中取出会话 ID，使用对方的昵称作为会话名称，对方的头像作为会话头像组织会话信息。
   - 若处理结果是同意，则对当前处理者用户 ID 查找长连接，进行聊天会话创建的通知。
     1. 从处理结果中取出会话 ID，使用对方的昵称作为会话名称，对方的头像作为会话头像组织会话信息。
   - 清理响应中的会话 ID 信息。
8. 将处理结果响应给客户端。

### 20.4.15 删除好友

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找好友子服务。
4. 调用子服务对应接口进行业务处理。
5. 若处理成功，则通过被删除者用户 ID，查找对方长连接。
   - 若长连接存在（对方在线），则组织好友删除通知进行事件通知。
6. 将处理结果响应给客户端。

### 20.4.16 搜索用户

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找好友子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.17 获取用户聊天会话列表

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找好友子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.18 创建多人聊天会话

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。


2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找好友子服务。
4. 调用子服务对应接口进行业务处理。
5. 若处理成功，循环根据会话成员的 ID 找到他们的长连接。
   - 根据响应中的会话信息，逐个进行会话创建的通知。
   - 清理响应中的会话信息。
6. 将处理结果响应给客户端。

### 20.4.19 获取消息会话成员列表

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找好友子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.20 发送新消息

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找消息转发子服务。
4. 调用子服务对应接口进行业务处理。
5. 若处理成功，则根据处理结果中的用户 ID 列表，循环找到目标长连接，根据处理结果中的消息字段组织新消息通知，逐个对目标进行新消息通知。
6. 若处理失败，则根据处理结果中的错误提示信息，设置响应内容。
7. 将处理结果响应给客户端。

### 20.4.21 获取指定时间段消息列表

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找消息存储子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.22 获取最近 N 条消息列表

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找消息存储子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.23 搜索关键字历史消息

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找消息存储子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.24 单个文件数据获取

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找文件子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.25 多个文件数据获取

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找文件子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.26 单个文件数据上传

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找文件子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.27 多个文件数据上传

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找文件子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。

### 20.4.28 语音转文字

1. 取出 HTTP 请求正文，进行 ProtoBuf 反序列化。
2. 根据请求中的会话 ID 进行鉴权，并获取用户 ID，向请求中设置用户 ID。
3. 查找语音子服务。
4. 调用子服务对应接口进行业务处理。
5. 将处理结果响应给客户端。



# 项目部署

## 编写项目配置文件
在项目的各个子服务中，每个子服务可能都会有不同的配置，代码中我们通过gflags进行了参数解析，但是如果改换了部署的机器，就需要修改代码中的数据，然后重新编译代码，这是一件非常麻烦的事情，会导致项目的自动部署成为空谈
而gflags不仅支持参数的解析，也支持配置文件的解析，因此我们需要将代码中需要的参数通过配置文件来进行配置。

项目部署：
1.为我们自己的程序编写配置文件---以便于程序能够进行灵活配置
2.查询我们自己程序的运行依赖（库）---以便于在docker镜像中完成运行环境的搭建
3.编写每个子服务程序的dockerfile---打包我们自己程序的运行环境镜像
4.编写一个脚本用于控制容器中程序的启动顺序
   - 通过depends_on控制容器启动顺序
   - 通过脚本控制容器内程序启动顺序
5.编写docker-compose.yml打包镜像，启动容器--实现项目的一键式部署

## 获取程序的依赖

```bash
ldd speech_server | awk '{if (match($3,"/")){ print $3}}'
```