cmake_minimum_required(VERSION 3.1.3)
project(chat-system-build-orchestrator)

# 顶层仅做编排：触发各子服务在各自 build/ 目录构建与清理
function(add_service_build target_name clean_target_name service_dir)
  set(service_src "${CMAKE_CURRENT_SOURCE_DIR}/${service_dir}")
  set(service_build "${service_src}/build")

  add_custom_target(${target_name}
    COMMAND ${CMAKE_COMMAND} -S "${service_src}" -B "${service_build}"
    COMMAND ${CMAKE_COMMAND} --build "${service_build}"
    WORKING_DIRECTORY "${service_src}"
    COMMENT "Build ${service_dir} in its own build directory"
    VERBATIM
  )

  # 子目录的 clean：对已配置过的 build 执行 cmake --build ... --target clean
  add_custom_target(${clean_target_name}
    COMMAND ${CMAKE_COMMAND} --build "${service_build}" --target clean
    WORKING_DIRECTORY "${service_src}"
    COMMENT "Clean ${service_dir} build directory"
    VERBATIM
  )
endfunction()

add_service_build(build_speech_server clean_speech_server "1.Speech_Server")
add_service_build(build_file_server clean_file_server "2.File_Server")
add_service_build(build_user_server clean_user_server "3.User_Server")
add_service_build(build_message_transmit_server clean_message_transmit_server "4.Message_Transmit_Server")
add_service_build(build_message_store_server clean_message_store_server "5.Message_Store_Server")
add_service_build(build_friend_server clean_friend_server "6.Friend_Server")
add_service_build(build_gateway_server clean_gateway_server "7.Gateway_Server")

add_custom_target(build_all
  DEPENDS
    build_speech_server
    build_file_server
    build_user_server
    build_message_transmit_server
    build_message_store_server
    build_friend_server
    build_gateway_server
)

# 所有子服务构建完成后，将 SQL_Code 下各表拼成 init_all.sql（ODB 生成的 SQL 为唯一来源）
set(SQL_CODE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/SQL_Code)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/GenInitAll.cmake ${CMAKE_BINARY_DIR}/GenInitAll.cmake @ONLY)
add_custom_target(gen_init_all ALL
  DEPENDS build_all
  COMMAND ${CMAKE_COMMAND} -P ${CMAKE_BINARY_DIR}/GenInitAll.cmake
  COMMENT "合并 ODB 生成的 SQL 为 init_all.sql"
  VERBATIM
)

# 一键清理所有子服务的 build 目录（需先 configure 过各子目录）
# 用法：make clean_all；若还要清理顶层 build：make clean && make clean_all
set(_service_dirs
  "1.Speech_Server"
  "2.File_Server"
  "3.User_Server"
  "4.Message_Transmit_Server"
  "5.Message_Store_Server"
  "6.Friend_Server"
  "7.Gateway_Server"
)
add_custom_target(clean_all
  COMMAND ${CMAKE_COMMAND} -E echo "Cleaning all sub-project build directories..."
)
foreach(_dir IN LISTS _service_dirs)
  set(_build "${CMAKE_CURRENT_SOURCE_DIR}/${_dir}/build")
  add_custom_command(TARGET clean_all POST_BUILD
    COMMAND ${CMAKE_COMMAND} --build "${_build}" --target clean
    WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/${_dir}"
    COMMENT "Clean ${_dir}"
    VERBATIM
  )
endforeach()