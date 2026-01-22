# 基础镜像
FROM ubuntu:20.04

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    netcat \
    && rm -rf /var/lib/apt/lists/*

# 工作路径
WORKDIR /im
RUN mkdir -p /im/logs /im/data /im/conf /im/bin

# 将可执行文件拷贝到镜像中
COPY ./build/message_store_server /im/bin/

# 将可执行程序的依赖拷贝到docker容器中的lib目录中，并修复主库名
COPY ./build/depends /lib/x86_64-linux-gnu/
# 拷贝等待脚本
COPY ./wait_for_services.sh /im/bin/wait_for_services.sh
RUN chmod +x /im/bin/wait_for_services.sh

# 容器启动时先等待依赖，再启动服务
CMD ["/im/bin/wait_for_services.sh", "etcd:2379,mysql:3306,elasticsearch:9200,rabbitmq:5672", "/im/bin/message_store_server", "-flagfile=/im/conf/message_store_server.conf"]
