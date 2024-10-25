cmake_minimum_required(VERSION 3.1.3)
project(all-test)

# 设置安装路径为当前目录下的 bin 文件夹
set(CMAKE_INSTALL_PREFIX ${CMAKE_CURRENT_BINARY_DIR}/bin)
install(TARGET )

set(CMAKE_CXX_FLAGS_DEBUG "")
set(CMAKE_C_FLAGS_DEBUG "")
set(CMAKE_BUILD_TYPE "Release")
set(CMAKE_INSTALL_PREFIX ${CMAKE_CURRENT_BINARY_DIR})

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/1.Speech_Server)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/2.File_Server)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/3.User_Server)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/4.Message_Transmit_Server)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/5.Message_Store_Server)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/6.Friend_Server)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/7.Gateway_Server)