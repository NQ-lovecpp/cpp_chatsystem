#!/bin/bash

#./entrypoint.sh -h 127.0.0.1 -p 3306,2379,6379 -c '/im/bin/file_server -flagfile=./xx.conf'

# 1. 编写一个端口探测函数，端口连接不上则循环等待
# wait_for 127.0.0.1 3306
wait_for() {
    while ! nc -z $1 $2 
    do
        echo "$2 端口连接失败，休眠等待！";
        sleep 1;
    done
    echo "$1:$2 检测成功！";
}
# 2. 对脚本运行参数进行解析，获取到ip，port，command
declare ip
declare ports
declare command
while getopts "h:p:c:" arg
do
    case $arg in
        h)
            ip=$OPTARG;;
        p)
            ports=$OPTARG;;
        c)
            command=$OPTARG;;
    esac
done
# 3. 通过执行脚本进行端口检测
# ${port //,/ } 针对port中的内容，以空格替换字符串中的,  shell中数组--一种以空格间隔的字符串
for port in ${ports//,/ }
do
    wait_for $ip $port
done
# 4. 执行command
#  eval 对一个字符串进行二次检测，将其当作命令进行执行
eval $command