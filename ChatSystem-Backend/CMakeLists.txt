cmake_minimum_required(VERSION 3.1.3)
project(chat-system-build-orchestrator)

# 顶层仅做编排：触发各子服务在各自 build/ 目录构建
function(add_service_build target_name service_dir)
  set(service_src "${CMAKE_CURRENT_SOURCE_DIR}/${service_dir}")
  set(service_build "${service_src}/build")

  add_custom_target(${target_name}
    COMMAND ${CMAKE_COMMAND} -S "${service_src}" -B "${service_build}"
    COMMAND ${CMAKE_COMMAND} --build "${service_build}"
    WORKING_DIRECTORY "${service_src}"
    COMMENT "Build ${service_dir} in its own build directory"
    VERBATIM
  )
endfunction()

add_service_build(build_speech_server "1.Speech_Server")
add_service_build(build_file_server "2.File_Server")
add_service_build(build_user_server "3.User_Server")
add_service_build(build_message_transmit_server "4.Message_Transmit_Server")
add_service_build(build_message_store_server "5.Message_Store_Server")
add_service_build(build_friend_server "6.Friend_Server")
add_service_build(build_gateway_server "7.Gateway_Server")

add_custom_target(build_all ALL
  DEPENDS
    build_speech_server
    build_file_server
    build_user_server
    build_message_transmit_server
    build_message_store_server
    build_friend_server
    build_gateway_server
)