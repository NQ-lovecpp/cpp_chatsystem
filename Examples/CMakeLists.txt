cmake_minimum_required(VERSION 3.1.3)
project(all_tests)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/6.odb_project_cmake)
set(CMAKE_INSTALL_PREFIX ${CMAKE_CURRENT_BINARY_DIR})