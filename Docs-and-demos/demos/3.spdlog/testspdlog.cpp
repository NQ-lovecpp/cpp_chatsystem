#include <gtest/gtest.h>
#include <gflags/gflags.h>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/stdout_color_sinks.h>
#include <spdlog/sinks/basic_file_sink.h>
#include <spdlog/async.h>
#include <iostream>
#include <unistd.h>
#include "logger.hpp"

DEFINE_bool(run_mode, false, "程序的运行模式，false：调试，true：发布");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件名");
DEFINE_int32(log_level, spdlog::level::level_enum::trace, "发布模式下，日志等级和刷新时机");

// 同步日志器，工厂接口默认创建的是同步日志器
void test_synchronoized_logger() 
{
    // 1. 设置全局的日志刷新策略
    spdlog::flush_every(std::chrono::seconds(5));

    // 2. 遇到debug及以上的日志，立即刷新
    spdlog::flush_on(spdlog::level::level_enum::info);

    // 3. 创建同步日志器
    auto logger = spdlog::stdout_color_mt("sync_logger", spdlog::color_mode::automatic);

    // 4. 设置日志输出格式
    logger->set_pattern("[%n][%H:%M:%S][%t][%^%-8l%$] %v");

    // 5. 日志输出
    logger->trace("hello world, I am a debug log message! {}", "小明");
    logger->info("hello world, I am a debug log message! {}", "小明");
    logger->debug("hello world, I am a debug log message! {}", "小明");
    logger->warn("hello world, I am a debug log message! {}", "小明");
    logger->error("hello world, I am a debug log message! {}", "小明");
    logger->critical("hello world, I am a debug log message! {}", "小明");
    std::cout << "同步日志输出完毕！" << std::endl;
}

// 异步日志测试
void test_async_logger() 
{
    std::cout << "pid: " << getpid() << std::endl;
    // 0. 设置线程池
    spdlog::init_thread_pool(5, 5);

    // 1. 设置全局的日志刷新策略
    spdlog::flush_every(std::chrono::seconds(5));

    // 2. 遇到debug及以上的日志，立即刷新
    spdlog::flush_on(spdlog::level::level_enum::info);

    // 3. 创建同步日志器
    auto async_logger = spdlog::stdout_color_mt<spdlog::async_factory>("async_logger", spdlog::color_mode::automatic);

    // 4. 设置日志输出格式
    async_logger->set_pattern("[%n][%H:%M:%S][%t][%^%-8l%$] %v");

    // 5. 日志输出
    // pid_t tid = syscall(SYS_gettid);
    // for(int i = 0; i < 1000; i++)
    // {
    //     async_logger->trace("Thread ID (syscall): {}", tid);
    //     async_logger->info("Thread ID (syscall): {}", tid);
    //     async_logger->debug("Thread ID (syscall): {}", tid);
    //     async_logger->error("Thread ID (syscall): {}", tid);
    //     async_logger->warn("Thread ID (syscall): {}", tid);
    //     async_logger->critical("Thread ID (syscall): {}", tid);
    // }

    async_logger->trace("hello world, I am a debug log message! {}", "小明");
    async_logger->info("hello world, I am a debug log message! {}", "小明");
    async_logger->debug("hello world, I am a debug log message! {}", "小明");
    async_logger->warn("hello world, I am a debug log message! {}", "小明");
    async_logger->error("hello world, I am a debug log message! {}", "小明");
    async_logger->critical("hello world, I am a debug log message! {}", "小明");

    // for(int i = 0; i < 10000; i++)
    // {
    //     async_logger->warn("hello world, I am a debug log message! {} {}", i, "小明");
    // }


    std::cout << "异步日志输出完毕！" << std::endl;

    sleep(10);
}

TEST(log_test, sync_logger)
{
    test_synchronoized_logger();
}

TEST(log_test, async_logger)
{
    test_async_logger();
}

TEST(mylogger, 1)
{
    init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);
    LOG_DEBUG("我正在测试自己封装的日志器，{}，{}", 123, "456");
    LOG_DEBUG("我正在测试自己封装的日志器，{}，{}", 123, "456");
    LOG_DEBUG("我正在测试自己封装的日志器，{}，{}", 123, "456");
    LOG_DEBUG("我正在测试自己封装的日志器，{}，{}", 123, "456");
}

int main(int argc, char* argv[]) {
    google::ParseCommandLineFlags(&argc, &argv, true);
    testing::InitGoogleTest(&argc, argv);
    RUN_ALL_TESTS();
    return 0;
}
