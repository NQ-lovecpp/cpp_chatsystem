set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR})
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR})

# 设置 CMake 最小版本
cmake_minimum_required(VERSION 3.1.3)

# 声明工程名称
project(message_server)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_compile_options(-include mysql/plugin_auth_common.h)

set(target "message_store_server")
set(test_client "message_store_client")

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g")

# 1. 设置 Protobuf 文件
set(proto_path ${CMAKE_CURRENT_SOURCE_DIR}/../APIs)
set(proto_files base.proto user.proto file.proto message_storage.proto)
set(proto_srcs "")

foreach(proto_file ${proto_files})
    string(REPLACE ".proto" ".pb.cc" proto_cc ${proto_file})
    if (NOT EXISTS ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc})
        add_custom_command(
            PRE_BUILD
            COMMAND protoc --cpp_out=${CMAKE_CURRENT_BINARY_DIR} -I ${proto_path} ${proto_path}/${proto_file}
            DEPENDS ${proto_path}/${proto_file}
            OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc}
            COMMENT "生成 Protobuf 框架代码文件: ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc}"
        )
    endif()
    list(APPEND proto_srcs ${CMAKE_CURRENT_BINARY_DIR}/${proto_cc})
endforeach()

# 2. 设置 ODB 文件，并将生成的 .sql 复制到 SQL_Code
set(odb_path ${CMAKE_CURRENT_SOURCE_DIR}/../ODB)
set(odb_files message.hxx)
set(SQL_CODE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../SQL_Code)
set(odb_srcs "")

foreach(odb_file ${odb_files})
    string(REPLACE ".hxx" "-odb.hxx" odb_hxx ${odb_file})
    string(REPLACE ".hxx" "-odb.cxx" odb_cxx ${odb_file})
    string(REPLACE ".hxx" ".sql" odb_sql ${odb_file})
    add_custom_command(
        OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx}
        COMMAND odb -d mysql --std c++17 --generate-query --generate-schema --profile boost/date-time ${odb_path}/${odb_file}
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
            ${CMAKE_CURRENT_BINARY_DIR}/${odb_sql}
            ${SQL_CODE_DIR}/${odb_sql}
        DEPENDS ${odb_path}/${odb_file}
        COMMENT "生成 ODB 框架代码并复制 SQL: ${odb_sql}"
        VERBATIM
    )
    list(APPEND odb_srcs ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx})
endforeach()

# 3. 获取源码目录下的所有源码文件
file(GLOB src_files "${CMAKE_CURRENT_SOURCE_DIR}/source/*.cc")

# 4. 声明目标及依赖
add_executable(${target} ${src_files} ${proto_srcs} ${odb_srcs})

# 5. 查找 Boost 库，指定需要的模块
find_package(Boost REQUIRED COMPONENTS date_time)

# 6. 设置需要链接的库
target_link_libraries(${target}
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

# 7. 处理测试客户端
file(GLOB test_files "${CMAKE_CURRENT_SOURCE_DIR}/test/*.cc")
add_executable(${test_client} ${test_files} ${proto_srcs} ${odb_srcs})

target_link_libraries(${test_client}
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

# 8. 设置头文件搜索路径
include_directories(${CMAKE_CURRENT_BINARY_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../Common)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../ODB)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../Third-party)

# 9. 设置安装路径
INSTALL(TARGETS ${target} ${test_client} RUNTIME DESTINATION bin)
