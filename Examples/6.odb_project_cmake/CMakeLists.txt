# 1. 添加cmake版本声明
cmake_minimum_required(VERSION 3.1.3)

# 2. 声明工程名称
project(odb_test)

# 3. 检测并生成ODB框架代码
set(odb_path ${CMAKE_CURRENT_SOURCE_DIR}/entity)
set(odb_files student.hxx)

set(odb_hxx "")
set(odb_cxx "")
set(odb_srcs "")


# 完整路径指定 ODB 可执行文件
find_program(ODB_EXECUTABLE odb)

if (NOT ODB_EXECUTABLE)
    message(FATAL_ERROR "odb not found. Please install ODB and make sure it's available in your PATH.")
endif()

foreach(odb_file ${odb_files})
    string(REPLACE ".hxx" "-odb.hxx" odb_hxx ${odb_file})
    string(REPLACE ".hxx" "-odb.cxx" odb_cxx ${odb_file})

    if (NOT EXISTS ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx})
        add_custom_command(
            OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx}
            COMMAND ${ODB_EXECUTABLE}
            ARGS -d mysql --std c++11 --generate-query --generate-schema --profile boost/date-time ${odb_path}/${odb_file}
            DEPENDS ${odb_path}/${odb_file}
            COMMENT "生成ODB框架代码文件：" ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx}
            VERBATIM
        )
    endif()

    list(APPEND odb_srcs ${CMAKE_CURRENT_BINARY_DIR}/${odb_cxx})
endforeach()

# 4. 获取源码目录下的所有源码文件
set(src_files "")
aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR}/source src_files)

# 5. 声明目标及依赖
add_executable(main ${src_files} ${odb_srcs})

# 6. 设置头文件的默认搜索路径
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/entity)
include_directories(${CMAKE_CURRENT_BINARY_DIR})

# 7. 设置需要链接的库
target_link_libraries(main odb-mysql odb odb-boost boost_system gflags)




# Install the executable 'main' to the bin directory under CMAKE_INSTALL_PREFIX
install(TARGETS main DESTINATION bin)

# Install any necessary headers, for example:
install(FILES ${CMAKE_CURRENT_SOURCE_DIR}/entity/student.hxx DESTINATION include/entity)