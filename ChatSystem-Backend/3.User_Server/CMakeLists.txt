set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR})
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR})

# 1. 添加cmake版本说明
cmake_minimum_required(VERSION 3.1.3)

# 设置C++标准为17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 2. 声明工程名称
project(user_server)

add_compile_options(-include mysql/plugin_auth_common.h)

set(target "user_server")

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g")

# 3. 检测并生成Protobuf框架代码
set(proto_path ${CMAKE_CURRENT_SOURCE_DIR}/../APIs)
set(proto_files base.proto user.proto file.proto)

set(proto_srcs "")
foreach(proto_file ${proto_files})
    string(REPLACE ".proto" ".pb.cc" proto_cc ${proto_file})
    string(REPLACE ".proto" ".pb.h" proto_hh ${proto_file})
    if (NOT EXISTS ${CMAKE_CURRENT_BINARY_DIR}${proto_cc})
        add_custom_command(
            PRE_BUILD
            COMMAND protoc
            ARGS --cpp_out=${CMAKE_CURRENT_BINARY_DIR} -I ${proto_path} ${proto_path}/${proto_file}
            DEPENDS ${proto_path}/${proto_file}
            OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc}
            COMMENT "生成Protobuf框架代码文件:" ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc}
        )
    endif()
    list(APPEND proto_srcs ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc})
endforeach()

# 3. 检测并生成ODB框架代码，并将生成的 .sql 复制到 SQL_Code
set(odb_path ${CMAKE_CURRENT_SOURCE_DIR}/../ODB)
set(odb_files user.hxx)
set(SQL_CODE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../SQL_Code)

set(odb_srcs "")
foreach(odb_file ${odb_files})
    string(REPLACE ".hxx" "-odb.hxx" odb_hxx ${odb_file})
    string(REPLACE ".hxx" "-odb.cxx" odb_cxx ${odb_file})
    string(REPLACE ".hxx" ".sql" odb_sql ${odb_file})
    add_custom_command(
        OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx}
        COMMAND odb
        ARGS -d mysql --std c++17 --generate-query --generate-schema --profile boost/date-time ${odb_path}/${odb_file}
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
            ${CMAKE_CURRENT_BINARY_DIR}/${odb_sql}
            ${SQL_CODE_DIR}/${odb_sql}
        DEPENDS ${odb_path}/${odb_file}
        COMMENT "生成ODB框架代码并复制 SQL: ${odb_sql}"
        VERBATIM
    )
    list(APPEND odb_srcs ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx})
endforeach()

# 4. 获取源码目录下的所有源码文件
set(src_files "")
aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR}/source src_files)

# 5. 声明目标及依赖
add_executable(${target} ${src_files} ${proto_srcs} ${odb_srcs})

# 6. 设置需要连接的库
target_link_libraries(${target}
    gflags
    pthread
    spdlog
    brpc
    ssl
    crypto
    protobuf
    leveldb
    etcd-cpp-api
    cpprest
    curl
    odb-mysql
    odb
    odb-boost
    /usr/lib/x86_64-linux-gnu/libjsoncpp.so.19
    alibabacloud-sdk-core
    cpr
    elasticlient
    hiredis
    redis++
    gtest
    dl  # 将 libdl 放在最后
)


# 新增三个可执行文件：es_test、mysql_test、redis_test
add_executable(es_test ${CMAKE_CURRENT_SOURCE_DIR}/test/es_test/main.cc)
# es_test 需要 elasticlient 与 cpr（cpr 依赖 curl/ssl），否则会出现 DSO missing 错误
target_link_libraries(es_test
    -lgflags
    -ljsoncpp
    -lspdlog
    -lelasticlient
    -lcpr
    -lcurl
    -lssl
    -lcrypto
    /usr/lib/x86_64-linux-gnu/libjsoncpp.so.19
    -ldl)

add_executable(mysql_test
    ${CMAKE_CURRENT_SOURCE_DIR}/test/mysql_test/main.cc
    ../ODB/odb_builds/user-odb.cxx  # Include this generated file
)
target_link_libraries(mysql_test -lodb-mysql -lodb -lodb-boost -pthread -lgtest -lgflags -lspdlog -lbrpc -lssl -lcrypto -lprotobuf -lleveldb -letcd-cpp-api -lcpprest -lcurl -ldl)


# 用户客户端
set(test_client "user_client")
add_executable(${test_client} ${CMAKE_CURRENT_SOURCE_DIR}/test/user_client.cc ${proto_srcs})
target_link_libraries(${test_client} -pthread -lgtest -lgflags -lspdlog -lbrpc -lssl -lcrypto -lprotobuf -lleveldb -letcd-cpp-api -lcpprest -lcurl /usr/lib/x86_64-linux-gnu/libjsoncpp.so.19 -ldl)

# 设置头文件默认搜索路径
include_directories(${CMAKE_CURRENT_BINARY_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../Common)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../APIs)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../ODB/odb_builds)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../ODB)
include_directories(${CMAKE_CURRENT_SOURCEDIR}/../../Third-party)

# 8. 设置安装路径
INSTALL(TARGETS ${target} ${test_client} es_test mysql_test RUNTIME DESTINATION bin)


# # 1. 添加cmake版本说明
# cmake_minimum_required(VERSION 3.1.3)
# # 2. 声明工程名称
# project(user_server)

# set(target "user_server")

# set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g")

# # 3. 生成Protobuf框架代码
# set(proto_path ${CMAKE_CURRENT_SOURCE_DIR}/../APIs)
# set(proto_files base.proto user.proto file.proto)
# set(proto_srcs "")

# foreach(proto_file ${proto_files})
#     string(REPLACE ".proto" ".pb.cc" proto_cc ${proto_file})
#     string(REPLACE ".proto" ".pb.h" proto_hh  ${proto_file})
    
#     add_custom_command(
#         OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc} ${CMAKE_CURRENT_BINARY_DIR}/${proto_hh}
#         COMMAND protoc
#         ARGS --cpp_out=${CMAKE_CURRENT_BINARY_DIR} -I ${proto_path} ${proto_path}/${proto_file}
#         DEPENDS ${proto_path}/${proto_file}
#         COMMENT "生成Protobuf框架代码文件: ${proto_cc}"
#     )
    
#     list(APPEND proto_srcs ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc})
# endforeach()

# # 4. 生成ODB框架代码
# set(odb_path ${CMAKE_CURRENT_SOURCE_DIR}/../ODB)
# set(odb_files user.hxx)
# set(odb_srcs "")

# foreach(odb_file ${odb_files})
#     string(REPLACE ".hxx" "-odb.hxx" odb_hxx ${odb_file})
#     string(REPLACE ".hxx" "-odb.cxx" odb_cxx ${odb_file})
    
#     add_custom_command(
#         OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx}
#         COMMAND odb
#         ARGS -d mysql --std c++11 --generate-query --generate-schema --profile boost/date-time ${odb_path}/${odb_file}
#         DEPENDS ${odb_path}/${odb_file}
#         COMMENT "生成ODB框架代码文件: ${odb_cxx}"
#     )
    
#     list(APPEND odb_srcs ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx})
# endforeach()

# # 5. 获取源码目录下的所有源码文件
# set(src_files "")
# aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR}/source src_files)

# # 6. 声明目标及依赖
# add_executable(${target} ${src_files} ${proto_srcs} ${odb_srcs})

# # 7. 设置需要连接的库
# target_link_libraries(${target} -lgflags -lspdlog -lfmt -lbrpc -lssl -lcrypto 
#     -lprotobuf -lleveldb -letcd-cpp-api -lcpprest -lcurl -lodb-mysql -lodb -lodb-boost
#     /usr/lib/x86_64-linux-gnu/libjsoncpp.so.19 -lalibabacloud-sdk-core -lcpr 
#     -lelasticlient -lhiredis -lredis++
# )

# # 8. 设置头文件默认搜索路径
# include_directories(${CMAKE_CURRENT_BINARY_DIR})
# include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../Common)
# include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../APIs)
# include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../ODB/odb_builds)
# include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../ODB)
# include_directories(${CMAKE_CURRENT_SOURCEDIR}/../../Third-party)

# # 9. 设置测试目标
# set(test_client "user_client")
# aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR}/test test_files)
# add_executable(${test_client} ${test_files} ${proto_srcs})
# target_link_libraries(${test_client} -pthread -lgtest -lgflags -lspdlog -lfmt -lbrpc 
#     -lssl -lcrypto -lprotobuf -lleveldb -letcd-cpp-api -lcpprest -lcurl 
#     /usr/lib/x86_64-linux-gnu/libjsoncpp.so.19
# )

# # 10. 设置安装路径
# INSTALL(TARGETS ${target} ${test_client} RUNTIME DESTINATION bin)
