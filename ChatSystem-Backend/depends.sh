#!/bin/bash

# 传递两个参数
# 1. 可执行程序的路径名
# 2. 将这个程序的依赖库拷贝到指定目录下

get_depends() {
    depends=$(ldd "$1" | awk '{if (match($3,"/")){print $3}}')
    if [ ! -d "$2" ]; then
        mkdir -p "$2"
    fi
    cp -Lr $depends "$2"
}

# 可执行程序的路径 将这个程序的依赖库拷贝到指定目录
get_depends ./1.Speech_Server/build/speech_server                     ./1.Speech_Server/build/depends
get_depends ./2.File_Server/build/file_server                         ./2.File_Server/build/depends
get_depends ./3.User_Server/build/user_server                         ./3.User_Server/build/depends
get_depends ./4.Message_Transmit_Server/build/message_transmit_server ./4.Message_Transmit_Server/build/depends
get_depends ./5.Message_Store_Server/build/message_store_server       ./5.Message_Store_Server/build/depends
get_depends ./6.Friend_Server/build/friend_server                     ./6.Friend_Server/build/depends
get_depends ./7.Gateway_Server/build/gateway_server                   ./7.Gateway_Server/build/depends
