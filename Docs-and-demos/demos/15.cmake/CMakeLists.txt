# 声明cmake版本
cmake_minimum_required(VERSION 3.0.0)

# 定义工程项目名称
project(test)

# 设置生成目标
set(target "main")
set(src_arr "")
list(APPEND src_arr "hello.cc" "main.cc")


# 指定标准
set(CMAKE_CXX_STANDARD 17)

add_executable(target main.cc)

# CMAKE_CURRENT_BINARY_DIR # 执行cmake命令的路径
# CMAKE_CURRENT_SOURCE_DIR # cmakelist.txt的目录

# CMAKE_INSTALL_PREFIX # Cmake安装路径

# include_directories()

message(FATAL_ERROR "错误")