cmake_minimum_required(VERSION 3.1.3)

project(bugtest) # 解决protobuf内容经过消息队列后不能正确解析的问题 

set(CMAKE_CXX_STANDARD 17)


# 最终的可执行
set(receiver "receiver")
set(sender "sender")

# 源文件
file(GLOB main_src_files_receiver  "${CMAKE_CURRENT_SOURCE_DIR}/receiver.cpp")
file(GLOB main_src_files_sender  "${CMAKE_CURRENT_SOURCE_DIR}/sender.cpp")

# proto文件
set(proto_files base.proto)
set(proto_path ${CMAKE_CURRENT_SOURCE_DIR}/../../../APIs/)
set(proto_src "")

foreach(protofile ${proto_files})
    string(REPLACE ".proto" ".pb.cc" proto_cc ${protofile})
    add_custom_command(
        PRE_BUILD
        COMMAND protoc --cpp_out=${CMAKE_CURRENT_BINARY_DIR}/ -I ${proto_path} ${proto_path}/${protofile}
        DEPENDS ${proto_path}/${protofile}
        OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc}
        Comment "生成proto文件：${proto_cc}"
    )
    list(APPEND proto_src ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc})
endforeach()

add_executable(${receiver} ${main_src_files_receiver} ${proto_src}) # 目标可执行 源文件1 源文件2
add_executable(${sender} ${main_src_files_sender} ${proto_src}) # 目标可执行 源文件1 源文件2

# 5. 查找 Boost 库，指定需要的模块
find_package(Boost REQUIRED COMPONENTS date_time)

# 库
target_link_libraries(${receiver}
    -lgflags 
    -lspdlog 
    -lfmt 
    -lbrpc 
    -lssl 
    -lcrypto 
    -lprotobuf 
    -lleveldb 
    -letcd-cpp-api 
    -lcpprest 
    -lcurl 
    -lodb-mysql 
    -lodb 
    -lodb-boost
    /usr/lib/x86_64-linux-gnu/libjsoncpp.so.19
    -lcpr 
    -lelasticlient 
    -lamqpcpp 
    -lev 
    -lpthread 
    Boost::date_time
    -lgtest
    -ldl
)

target_link_libraries(${sender}
    -lgflags 
    -lspdlog 
    -lfmt 
    -lbrpc 
    -lssl 
    -lcrypto 
    -lprotobuf 
    -lleveldb 
    -letcd-cpp-api 
    -lcpprest 
    -lcurl 
    -lodb-mysql 
    -lodb 
    -lodb-boost
    /usr/lib/x86_64-linux-gnu/libjsoncpp.so.19
    -lcpr 
    -lelasticlient 
    -lamqpcpp 
    -lev 
    -lpthread 
    Boost::date_time
    -lgtest
    -ldl
)

# 头文件搜索路径
include_directories(${CMAKE_CURRENT_BINARY_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../../../Common)
