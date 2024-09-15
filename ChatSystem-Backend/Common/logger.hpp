#pragma once
#include <spdlog/spdlog.h>
#include <spdlog/sinks/stdout_color_sinks.h>
#include <spdlog/sinks/basic_file_sink.h>
#include <spdlog/async.h>
#include <iostream>
#include <memory>
#include <string>
#include <string_view>

namespace chen_im {

// 全局的日志器
std::shared_ptr<spdlog::logger> g_default_logger;

/// @brief 初始化日志器
/// @param mode 运行模式：true-发布模式，false-调试模式
/// @param file_name 发布模式下，如果输出到文件，输出到的文件名
/// @param level 发布模式下的日志等级和刷新时机
void init_logger(bool mode, const std::string &file_name, int log_level)
{
    if(mode == false) {
        // 如果是调试模式，则创建标准输出的同步日志器，输出等级为最低
        // 1. 创建同步日志器
        g_default_logger = spdlog::stdout_color_mt("global_sync_logger", spdlog::color_mode::automatic);

        // 2. 设置等级(刷新阈值)
        g_default_logger->set_level(spdlog::level::level_enum::trace);

        // 3. 刷新时机
        g_default_logger->flush_on(spdlog::level::level_enum::trace);
    } else {
        // 如果是发布模式，则创建文件输出的异步日志器，输出等级依参数而定
        // 1. 创建异步日志器
        g_default_logger = spdlog::basic_logger_mt("global_async_logger", file_name, false);

        // 2. 设置等级(刷新阈值)
        g_default_logger->set_level(static_cast<spdlog::level::level_enum>(log_level));

        // 3. 刷新时机
        g_default_logger->flush_on(static_cast<spdlog::level::level_enum>(log_level));
    }

    // 4. 设置格式 [日志器名称][时间][线程ID][日志等级全称]
    g_default_logger->set_pattern("[%n][%H:%M:%S][%t][%^%-8l%$]%v");
}

// [文件名:行号]
#define LOG_TRACE(format, ...)    chen_im::g_default_logger->trace(   std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_DEBUG(format, ...)    chen_im::g_default_logger->debug(   std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_INFO(format, ...)     chen_im::g_default_logger->info(    std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_WARN(format, ...)     chen_im::g_default_logger->warn(    std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_ERROR(format, ...)    chen_im::g_default_logger->error(   std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_CRITICAL(format, ...) chen_im::g_default_logger->critical(std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)


}