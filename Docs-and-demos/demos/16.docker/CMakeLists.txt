cmake_minimum_required(VERSION 3.10)
project(WebServer)

set(CMAKE_CXX_STANDARD 17)

# 添加当前目录为头文件搜索路径
include_directories(${CMAKE_CURRENT_SOURCE_DIR})

# 添加 httplib
set(HTTPLIB_PATH ${CMAKE_CURRENT_SOURCE_DIR}/httplib.h)
include_directories(${HTTPLIB_PATH})

add_executable(WebServer server.cpp)

# 链接 pthread
find_package(Threads REQUIRED)
target_link_libraries(WebServer PRIVATE pthread ${CMAKE_CURRENT_SOURCE_DIR}/libgflags.so.2.2)

# 设置输出目录
set_target_properties(WebServer PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
)
