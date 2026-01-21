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
COPY ./build/speech_server /im/bin/

# 将可执行程序的依赖拷贝到docker容器中的lib目录中，并修复主库名
COPY ./build/depends /lib/x86_64-linux-gnu/
RUN ln -sf /lib/x86_64-linux-gnu/libcurl.so.4 /lib/x86_64-linux-gnu/libcurl.so || true

# 拷贝等待脚本
COPY ../wait_for_services.sh /im/bin/wait_for_services.sh
RUN chmod +x /im/bin/wait_for_services.sh

# 容器启动时先等待依赖，再启动服务
CMD ["/im/bin/wait_for_services.sh", "etcd:2379", "/im/bin/speech_server", "-flagfile=/im/conf/speech_server.conf"]
