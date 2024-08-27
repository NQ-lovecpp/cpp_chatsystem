
# 1. gflags安装及使用

## 1.1 gflags介绍

gflags 是 Google 开发的一个开源库，用于 C++ 应用程序中命令行参数的声明、定义和解析。gflags 库提供了一种简单的方式来添加、解析和文档化命令行标志（flags），使得程序可以根据不同的运行时配置进行调整。

它具有如下几个特点：

- **易于使用**：gflags 提供了一套简单直观的 API 来定义和解析命令行标志，使得开发者可以轻松地为应用程序添加新的参数。
- **自动帮助和文档**：gflags 可以自动生成每个标志的帮助信息和文档，这有助于用户理解如何使用程序及其参数。
- **类型安全**：gflags 支持多种数据类型的标志，包括布尔值、整数、字符串等，并且提供了类型检查和转换。
- **多平台支持**：gflags 可以在多种操作系统上使用，包括 Windows、Linux 和 macOS。
- **可扩展性**：gflags 允许开发者自定义标志的注册和解析逻辑，提供了强大的扩展性。

官方文档：[gflags Documentation](https://gflags.github.io/gflags/)

代码仓库：[gflags GitHub](https://github.com/gflags/gflags.git)

## 1.2 gflags安装

### 1.2.1 直接命令安装

```bash
sudo apt-get install libgflags-dev
```

### 1.2.2 源码安装

```bash
# 下载源码
git clone https://github.com/gflags/gflags.git
# 切换目录
cd gflags/
mkdir build 
cd build/
# 生成 Makefile
cmake ..
# 编译代码
make
# 安装
make install
```

至此，gflags 安装完毕。

## 1.3 gflags使用

### 1.3.1 包含头文件

使用 gflags 库来定义/解析命令行参数必须包含如下头文件：

```cpp
#include <gflags/gflags.h>
```

### 1.3.2 定义参数

利用 gflags 提供的宏定义来定义参数。该宏的 3 个参数分别为命令行参数名，参数默认值，参数的帮助信息。

```cpp
DEFINE_bool(reuse_addr, true, "是否开始网络地址重用选项");
DEFINE_int32(log_level, 1, "日志等级：1-DEBUG, 2-WARN, 3-ERROR");
DEFINE_string(log_file, "stdout", "日志输出位置设置，默认为标准输出");
```

gflags 支持定义多种类型的宏函数：

- `DEFINE_bool`
- `DEFINE_int32`
- `DEFINE_int64`
- `DEFINE_uint64`
- `DEFINE_double`
- `DEFINE_string`

### 1.3.3 访问参数

我们可以在程序中通过 `FLAGS_name` 像正常变量一样访问标志参数。例如：

```cpp
std::cout << "日志等级: " << FLAGS_log_level << std::endl;
```

### 1.3.4 不同文件访问参数

如果需要在另外一个文件中访问当前文件的参数，可以使用宏 `DECLARE_bool(name)` 来声明引入这个参数。

例如：

```cpp
DECLARE_bool(reuse_addr);
```

### 1.3.5 初始化所有参数

定义好参数后，需要在 `main` 函数中调用以下函数来解析命令行传入的参数：

```cpp
google::ParseCommandLineFlags(&argc, &argv, true);
```

- `argc` 和 `argv` 是 `main` 的入口参数。
- 第三个参数 `remove_flags` 若为 `true`，则 `ParseCommandLineFlags` 会从 `argv` 中移除标识及其参数，减少 `argc` 的值。

### 1.3.6 运行参数设置

gflags 提供了多种命令行设置参数的方式。

>设置 `string` 和 `int` 类型参数

```bash
exec --log_file="./main.log"
exec -log_file="./main.log"
exec --log_file "./main.log"
exec -log_file "./main.log"
```

>设置 `bool` 类型参数

```bash
exec --reuse_addr            # 为true
exec --noreuse_addr          # 为true
exec --reuse_addr=true
exec --reuse_addr=false
```

### 1.3.7 配置文件的使用

配置文件可以标准化程序的运行参数配置。配置文件中的选项名称必须与代码中定义的选项名称一致。

示例配置文件内容：

```txt
-reuse_addr=true
-log_level=3
-log_file=./log/main.log
```

### 1.3.8 特殊参数标识

gflags 还提供了几个特殊的标识：

- `--help`：显示所有标识的帮助信息。
- `--helpshort`：只显示当前执行文件里的标志。
- `--helpxml`：以 XML 方式打印，方便处理。
- `--version`：打印版本信息。
- `--flagfile`：从文件中读取命令行参数。

## 1.4 入门案例

### 1.4.1 样例编写

编写样例代码：`main.cc`

```cpp
#include <gflags/gflags.h>
#include <iostream>

DEFINE_bool(reuse_addr, true, "是否开始网络地址重用选项");
DEFINE_int32(log_level, 1, "日志等级：1-DEBUG, 2-WARN, 3-ERROR");
DEFINE_string(log_file, "stdout", "日志输出位置设置，默认为标准输出");

int main(int argc, char* argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    std::cout << "reuse: " << FLAGS_reuse_addr << std::endl;
    std::cout << "日志等级: " << FLAGS_log_level << std::endl;
    std::cout << "日志输出位置: " << FLAGS_log_file << std::endl;
    return 0;
}
```

### 1.4.2 样例运行

>运行代码 1

```bash
./main --help
```

输出:

```bash
Flags from main.cc:
    -log_file (日志输出位置设置，默认为标准输出) type: string default: "stdout"
    -log_level (日志等级：1-DEBUG, 2-WARN, 3-ERROR) type: int32 default: 1
    -reuse_addr (是否开始网络地址重用选项) type: bool default: true
```

>运行代码 2

```bash
./main
```

输出:

```bash
reuse: true
日志等级: 1
日志输出位置: stdout
```

>运行代码 3

```bash
./main --log_level=2 -- --log_file=./log
```

输出:

```bash
reuse: true
日志等级: 2
日志输出位置: stdout
```

>运行代码 4

```bash
./main -flagfile=./main.conf
```

输出:

```bash
reuse: true
日志等级: 3
日志输出位置: ./log/main.log
```


# 2. gtest框架安装与使用

## 2.1 安装

### 2.1.1 命令安装

```bash
sudo apt-get install libgtest-dev
```

## 2.2 介绍

GTest 是一个跨平台的 C++单元测试框架，由 Google 公司发布。gtest 旨在为编写 C++单元测试提供便利，支持在多种平台上使用。它提供了丰富的断言、致命和非致命判断、参数化测试等所需的宏，以及全局测试和单元测试组件。

### 2.2.1 头文件包含

要使用 gtest 框架，需要在代码中包含如下头文件：

```cpp
#include <gtest/gtest.h>
```

### 2.2.2 框架初始化接口

在 `main` 函数中初始化 gtest：

```cpp
testing::InitGoogleTest(&argc, argv);
```

### 2.2.3 调用测试样例

调用所有测试样例并运行：

```cpp
RUN_ALL_TESTS();
```

## 2.3 TEST宏

### 2.3.1 TEST宏

用于创建一个简单测试，定义一个测试函数，可以在该函数中使用任何 C++ 代码并利用框架提供的断言进行检查。

```cpp
TEST(测试名称, 测试样例名称)
```

### 2.3.2 TEST_F宏

适用于多个测试场景需要相同的数据配置时使用，例如相同的数据测不同的行为。

```cpp
TEST_F(test_fixture, test_name)
```

## 2.4 断言宏

GTest 中的断言宏可以分为两类：

- **ASSERT_ 系列**：如果当前点检测失败则退出当前函数。
- **EXPECT_ 系列**：如果当前点检测失败则继续往下执行。

### 2.4.1 常用断言宏

```cpp
// bool 值检查
ASSERT_TRUE(参数);  // 期待结果为 true
ASSERT_FALSE(参数);  // 期待结果为 false

// 数值型数据检查
ASSERT_EQ(参数1, 参数2);  // 相等检查
ASSERT_NE(参数1, 参数2);  // 不等检查
ASSERT_LT(参数1, 参数2);  // 小于检查
ASSERT_GT(参数1, 参数2);  // 大于检查
ASSERT_LE(参数1, 参数2);  // 小于等于检查
ASSERT_GE(参数1, 参数2);  // 大于等于检查
```

## 2.5 样例

以下是一个简单的 gtest 使用示例：

```cpp
#include<iostream>
#include<gtest/gtest.h>

int abs(int x)
{
    return x > 0 ? x : -x;
}

TEST(abs_test, test1)
{
    ASSERT_TRUE(abs(1) == 1);
    ASSERT_TRUE(abs(-1) == 1);
    ASSERT_FALSE(abs(-2) == -2);
    ASSERT_EQ(abs(1), abs(-1));
    ASSERT_NE(abs(-1), 0);
    ASSERT_LT(abs(-1), 2);
    ASSERT_GT(abs(-1), 0);
    ASSERT_LE(abs(-1), 2);
    ASSERT_GE(abs(-1), 0);
}

int main(int argc, char* argv[])
{
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
```

编写 Makefile：

```makefile
main : main.cc
    g++ -std=c++17 $^ -o $@ -lgtest
```

运行代码：

```bash
./main
```

输出：

```bash
[==========] Running 1 test from 1 test case.
[----------] Global test environment set-up.
[----------] 1 test from abs_test
[ RUN      ] abs_test.test1
[       OK ] abs_test.test1 (0 ms)
[----------] 1 test from abs_test (0 ms total)
[----------] Global test environment tear-down
[==========] 1 test from 1 test case ran. (0 ms total)
[  PASSED  ] 1 test.
```

## 2.6 事件机制

GTest 中的事件机制是指在测试前和测试后提供给用户自行添加操作的机制，它允许同一测试套件下的测试用例共享数据。

### 2.6.1 全局事件

全局事件是针对整个测试程序的事件机制。需要创建一个类继承 `testing::Environment`，并实现 `SetUp` 和 `TearDown` 函数。

```cpp
#include <iostream>
#include <gtest/gtest.h>

std::unordered_map<std::string, std::string> dict;

class HashTestEnv : public testing::Environment {
    public:
        virtual void SetUp() override {
            std::cout << "测试前:提前准备数据!!\n";
            dict.insert(std::make_pair("Hello", "你好"));
            dict.insert(std::make_pair("hello", "你好"));
            dict.insert(std::make_pair("雷吼", "你好"));
        }
        virtual void TearDown() override {
            std::cout << "测试结束后:清理数据!!\n";
            dict.clear();
        }
};

TEST(hash_case_test, find_test) {
    auto it = dict.find("hello");
    ASSERT_NE(it, dict.end());
}

TEST(hash_case_test, size_test) {
    ASSERT_GT(dict.size(), 0);
}

int main(int argc, char *argv[])
{
    testing::AddGlobalTestEnvironment(new HashTestEnv);
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
```

运行结果：

```bash
./event
[==========] Running 2 tests from 1 test case.
[----------] Global test environment set-up.
测试前:提前准备数据!!
[----------] 2 tests from hash_case_test
[ RUN      ] hash_case_test.find_test
[       OK ] hash_case_test.find_test (0 ms)
[ RUN      ] hash_case_test.size_test
[       OK ] hash_case_test.size_test (0 ms)
[----------] 2 tests from hash_case_test (0 ms total)
[----------] Global test environment tear-down
测试结束后:清理数据!!
[==========] 2 tests from 1 test case ran. (0 ms total)
[  PASSED  ] 2 tests.
```

### 2.6.2 TestSuite事件

TestSuite事件是针对一个测试套件的事件机制。需要创建一个类继承 `testing::Test`，并实现 `SetUpTestCase` 和 `TearDownTestCase` 函数。

```cpp
#include <iostream>
#include <gtest/gtest.h>

class HashTestEnv1 : public testing::Test {
    public:
        static void SetUpTestCase() {
            std::cout << "环境 1 第一个 TEST 之前调用\n";
        }
        static void TearDownTestCase() {
            std::cout << "环境 1 最后一个 TEST 之后调用\n";
        }
    public:
        std::unordered_map<std::string, std::string> dict;
};

TEST_F(HashTestEnv1, insert_test) {
    std::cout << "环境 1,中间 insert 测试\n";
    dict.insert(std::make_pair("Hello", "你好"));
    dict.insert(std::make_pair("hello", "你好"));
    dict.insert(std::make_pair("雷吼", "你好"));
    auto it = dict.find("hello");
    ASSERT_NE(it, dict.end());
}

TEST_F(HashTestEnv1, sizeof) {
    std::cout << "环境 1,中间 size 测试\n";
    ASSERT_GT(dict.size(), 0);
}

int main(int argc, char *argv[])
{
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
```

运行结果：

```bash
./event
[==========] Running 2 tests from 1 test case.
[----------] Global test environment set-up.
[----------] 2 tests from HashTestEnv1
环境 1 第一个 TEST 之前调用
[ RUN      ] HashTestEnv1.insert_test
环境 1,中间 insert 测试
[       OK ] HashTestEnv1.insert_test (0 ms)
[ RUN      ] HashTestEnv1.sizeof
环境 1,中间 size 测试
event.cpp:81: Failure
Expected: (dict.size()) > (0), actual: 0 vs 0
[  FAILED  ] HashTestEnv1.sizeof (0 ms)
环境 1 最后一个 TEST 之后调用
[----------] 2 tests from HashTestEnv1 (0 ms total)
[==========] 2 tests from 1 test case ran. (1 ms total)
[  PASSED  ] 1 test.
[  FAILED  ] 1 test.
```

### 2.6.3 TestCase事件

TestCase事件是针对每一个测试用例的事件机制。需要在环境类中实现 `SetUp` 和 `TearDown` 函数。

```cpp
class HashTestEnv2 : public testing::Test {
    public:
        static void SetUpTestCase() {
            std::cout << "环境 2 第一个 TEST 之前被调用,进行总体环境配置\n";
        }
        static void TearDownTestCase() {
            std::cout << "环境 2 最后一个 TEST 

之后被调用,进行总体环境清理\n";
        }
        virtual void SetUp() override {
            std::cout << "环境 2 测试前:提前准备数据!!\n";
            dict.insert(std::make_pair("bye", "再见"));
            dict.insert(std::make_pair("see you", "再见"));
        }
        virtual void TearDown() override {
            std::cout << "环境 2 测试结束后:清理数据!!\n";
            dict.clear();
        }
    public:
        std::unordered_map<std::string, std::string> dict;
};

TEST_F(HashTestEnv2, insert_test) {
    std::cout << "环境 2,中间测试\n";
    dict.insert(std::make_pair("hello", "你好"));
    ASSERT_EQ(dict.size(), 3);
}

TEST_F(HashTestEnv2, size_test) {
    std::cout << "环境 2,中间 size 测试\n";
    auto it = dict.find("hello");
    ASSERT_EQ(it, dict.end());
    ASSERT_EQ(dict.size(), 2);
}

int main(int argc, char *argv[])
{
    testing::InitGoogleTest(&argc, argv);
    RUN_ALL_TESTS();
    return 0;
}
```

运行结果：

```bash
./event
[==========] Running 2 tests from 1 test case.
[----------] Global test environment set-up.
[----------] 2 tests from HashTestEnv2
环境 2 第一个 TEST 之前被调用,进行总体环境配置
[ RUN      ] HashTestEnv2.insert_test
环境 2 测试前:提前准备数据!!
环境 2,中间测试
环境 2 测试结束后:清理数据!!
[       OK ] HashTestEnv2.insert_test (1 ms)
[ RUN      ] HashTestEnv2.size_test
环境 2 测试前:提前准备数据!!
环境 2,中间 size 测试
环境 2 测试结束后:清理数据!!
[       OK ] HashTestEnv2.size_test (0 ms)
环境 2 最后一个 TEST 之后被调用,进行总体环境清理
[==========] 2 tests from HashTestEnv2 (1 ms total)
[==========] 2 tests from 1 test case ran. (1 ms total)
[  PASSED  ] 2 tests.
```


# 3. spdlog 日志组件的安装及使用

## 3.1 介绍

Spdlog 是一个高性能、超快速、零配置的 C++ 日志库，它旨在提供简洁的 API 和丰富的功能，同时保持高性能的日志记录。Spdlog 支持多种输出目标、格式化选项、线程安全以及异步日志记录。

### 3.1.1 特点

- **高性能**：spdlog 专为速度而设计，即使在高负载情况下也能保持良好的性能。
- **零配置**：无需复杂的配置，只需包含头文件即可在项目中使用。
- **异步日志**：支持异步日志记录，减少对主线程的影响。
- **格式化**：支持自定义日志消息的格式化，包括时间戳、线程 ID、日志级别等。
- **多平台**：跨平台兼容，支持 Windows、Linux、macOS 等操作系统。
- **丰富的 API**：提供丰富的日志级别和操作符重载，方便记录各种类型的日志。

GitHub 链接：[spdlog GitHub](https://github.com/gabime/spdlog)

## 3.2 安装

### 3.2.1 命令安装

```bash
sudo apt-get install libspdlog-dev
```

### 3.2.2 源码安装

```bash
git clone https://github.com/gabime/spdlog.git
cd spdlog/
mkdir build && cd build
cmake -DCMAKE_INSTALL_PREFIX=/usr ..
make && sudo make install
```

## 3.3 使用

### 3.3.1 包含头文件

在你的 C++ 源文件中包含 spdlog 的头文件：

```cpp
#include <spdlog/spdlog.h>
```

### 3.3.2 日志输出等级枚举

Spdlog 提供了多个日志级别：

```cpp
namespace level {
    enum level_enum : int {
        trace = SPDLOG_LEVEL_TRACE,
        debug = SPDLOG_LEVEL_DEBUG,
        info = SPDLOG_LEVEL_INFO,
        warn = SPDLOG_LEVEL_WARN,
        err = SPDLOG_LEVEL_ERROR,
        critical = SPDLOG_LEVEL_CRITICAL,
        off = SPDLOG_LEVEL_OFF,
        n_levels
    };
}
```

### 3.3.3 日志输出格式自定义

可以自定义日志消息的格式：

```cpp
logger->set_pattern("%Y-%m-%d %H:%M:%S [%t] [%-7l] %v");
```



#### 时间相关占位符


- %Y - 年（Year），格式为四位数字（如 2024）。
- %m - 月（Month），格式为两位数字（如 08）。
- %d - 日（Day），格式为两位数字（如 26）。
- %H - 小时（24-hour format），格式为两位数字（如 14 表示下午2点）。
- %I - 小时（12-hour format），格式为两位数字（如 02 表示下午2点）。
- %M - 分钟（Minute），格式为两位数字（如 45 表示45分钟）。
- %S - 秒（Second），格式为两位数字（如 07 表示7秒）。
- %e - 毫秒（Milliseconds），格式为三位数字（如 123 表示123毫秒）。
- %f - 微秒（Microseconds），格式为六位数字（如 123456 表示123456微秒）。
- %F - 纳秒（Nanoseconds），格式为九位数字（如 123456789 表示123456789纳秒）。
- %T - ISO 8601格式的时间（等价于%H:%M:%S）。

#### 日志信息相关占位符
- %t - 线程 ID（Thread ID），通常用于多线程环境下区分日志来源。
- %L - 日志级别缩写（如 I 表示INFO, D 表示DEBUG, E 表示ERROR）。
- %l - 日志级别全称（如 INFO, DEBUG, ERROR）。
- %n - 日志器名称（Logger's name），即创建日志器时指定的名称。
- %v - 日志内容（Log message text），即实际的日志信息。
- %P - 进程ID（Process ID），显示当前进程的ID。

#### 文件和行号相关占位符
- %s - 当前日志语句的文件名（Filename），只包含文件名，不包含路径。
- %g - 完整文件路径（Full filepath），包含文件的完整路径。
- %# - 当前日志语句的行号（Line number）。
- %! - 当前日志语句所在的函数名（Function name）。

#### 其他常用占位符
- %^ - 开启文本颜色（Start color range），配合 %$ 使用，用于强制启用颜色输出。
- %$ - 关闭文本颜色（End color range），配合 %^ 使用，用于关闭颜色输出。
- %% - 百分号符号（Literal % character），用于在日志输出中显示 % 字符。

#### 格式控制符
- %p - 调用日志的函数的指针值（在某些平台上可能无效或返回 0）。
- %E - 错误码（Error code）或状态信息（在使用异常处理的上下文中可能有效）。

### 3.3.4 日志记录器类

创建一个基本的日志记录器，并设置日志级别和输出模式：

```cpp
namespace spdlog {
class logger {
    logger(std::string name);
    logger(std::string name, sink_ptr single_sink);
    logger(std::string name, sinks_init_list sinks);
    void set_level(level::level_enum log_level);
    void set_formatter(std::unique_ptr<formatter> f);
    template<typename... Args>
    void trace(fmt::format_string<Args...> fmt, Args &&...args);
    template<typename... Args>
    void debug(fmt::format_string<Args...> fmt, Args &&...args);
    template<typename... Args>
    void info(fmt::format_string<Args...> fmt, Args &&...args);
    template<typename... Args>
    void warn(fmt::format_string<Args...> fmt, Args &&...args);
    template<typename... Args>
    void error(fmt::format_string<Args...> fmt, Args &&...args);
    template<typename... Args>
    void critical(fmt::format_string<Args...> fmt, Args &&...args);

    void flush();  // 刷新日志
    void flush_on(level::level_enum log_level);  // 设置立即刷新等级
};
}
```

### 3.3.5 异步日志记录类

为了异步记录日志，可以使用 `spdlog::async_logger`：

```cpp
class async_logger final : public logger {
    async_logger(std::string logger_name, sinks_init_list sinks_list, std::weak_ptr<details::thread_pool> tp, async_overflow_policy overflow_policy = async_overflow_policy::block);
    async_logger(std::string logger_name, sink_ptr single_sink, std::weak_ptr<details::thread_pool> tp, async_overflow_policy overflow_policy = async_overflow_policy::block);

    // 线程池类
    class SPDLOG_API thread_pool {
        thread_pool(size_t q_max_items, size_t threads_n, std::function<void()> on_thread_start, std::function<void()> on_thread_stop);
        thread_pool(size_t q_max_items, size_t threads_n, std::function<void()> on_thread_start);
        thread_pool(size_t q_max_items, size_t threads_n);
    };
};

auto async_logger = spdlog::async_logger_mt("async_logger", "logs/async_log.txt");
async_logger->info("This is an asynchronous info message");
```

### 3.3.6 日志记录器工厂类

Spdlog 提供了多种日志记录器的创建方式：

```cpp
// 创建一个彩色输出到标准输出的日志记录器
template<typename Factory = spdlog::synchronous_factory>
std::shared_ptr<logger> stdout_color_mt(const std::string &logger_name, color_mode mode = color_mode::automatic);

// 指定文件
template<typename Factory = spdlog::synchronous_factory>
std::shared_ptr<logger> basic_logger_mt(const std::string &logger_name, const filename_t &filename, bool truncate = false);
```

### 3.3.7 日志落地类

Spdlog 支持将日志落地到多种形式的存储介质，如文件、网络、数据库等：

```cpp
namespace spdlog {
namespace sinks {
    sink_ptr rotating_file_sink(filename_t base_filename, std::size_t max_size, std::size_t max_files, bool rotate_on_open = false);

    sink_ptr basic_file_sink(const filename_t &filename, bool truncate = false);

    // 更多 sink 类型
    // * _st：单线程版本，不用加锁，效率更高。
    // * _mt：多线程版本，用于多线程程序是线程安全的。
}
}
```

### 3.3.8 全局接口

Spdlog 提供了一些全局接口来管理日志行为：

```cpp
// 输出等级设置接口
void set_level(level::level_enum log_level);

// 日志刷新策略-每隔 N 秒刷新一次
void flush_every(std::chrono::seconds interval);

// 日志刷新策略-触发指定等级立即刷新
void flush_on(level::level_enum log_level);
```

### 3.3.9 记录日志

使用日志记录器记录不同级别的日志：

```cpp
logger->trace("This is a trace message");
logger->debug("This is a debug message");
logger->info("This is an info message");
logger->warn("This is a warning message");
logger->error("This is an error message");
logger->critical("This is a critical message");
```

### 3.3.10 使用样例

```cpp
#include <spdlog/spdlog.h>
#include <spdlog/sinks/stdout_color_sinks.h>
#include <spdlog/sinks/basic_file_sink.h>
#include <spdlog/async.h>

void multi_sink_example() {
    auto console_sink = std::make_shared<spdlog::sinks::stdout_color_sink_mt>();
    console_sink->set_level(spdlog::level::warn);
    console_sink->set_pattern("[multi_sink_example] [%^%l%$] %v");

    auto file_sink = std::make_shared<spdlog::sinks::basic_file_sink_mt>("logs/multisink.txt", true);
    file_sink->set_level(spdlog::level::trace);

    spdlog::logger logger("multi_sink", {console_sink, file_sink});
    logger.set_level(spdlog::level::debug);
    logger.set_pattern("%Y-%m-%d %H:%M:%S [%l] %v");
    logger.warn("this should appear in both console and file");
    logger.info("this message should not appear in the console, only in the file");
}

void async_example() {
    spdlog::init_thread_pool(32768, 1);
    auto async_logger = spdlog::basic_logger_mt<spdlog::async_factory>("async_file_logger", "logs/async_log.txt");
    async_logger->set_pattern("%Y-%m-%d %H:%M:%S [%l] %v");
    for (int i = 1; i < 101; ++i) {
        async_logger->info("Async message #{} {}", i, "hello");
    }
}

int main() {
    async_example();
    return 0;
}
```

编写 Makefile：

```makefile
main : main.cc
    g++ -std=c++17 $^ -o $@ -lspdlog -lfmt
```

### 3.3.11 二次封装

1. 由于 spdlog 的日志输出对文件名和行号并不是很友好
2. 且使用默认日志器每次进行单例获取效率较低
3. 封装出一个初始化接口，便于使用：
    - 调试模式输出到标准输出
    - 否则输出到文件中

因此可以进行二次封装，简化使用：
1. 封装出一个全局的接口，用户就行日志器的创建和初始化
2. 对日志输出的接口，进行宏的封装，加入文件名和行号的输出

```cpp
#include <spdlog/spdlog.h>
#include <spdlog/sinks/stdout_color_sinks.h>
#include <spdlog/sinks/basic_file_sink.h>
#include <spdlog/async.h>
#include <iostream>
#include <memory>
#include <string>
#include <string_view>

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
#define LOG_TRACE(format, ...)    g_default_logger->trace(   std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_DEBUG(format, ...)    g_default_logger->debug(   std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_INFO(format, ...)     g_default_logger->info(    std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_WARN(format, ...)     g_default_logger->warn(    std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_ERROR(format, ...)    g_default_logger->error(   std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
#define LOG_CRITICAL(format, ...) g_default_logger->critical(std::string("[{:>10s}:{:<4d}] ") + format , __FILE__, __LINE__, ##__VA_ARGS__)
```

## 3.4 spdlog与glog组件对比

### 3.4.1 glog

Glog 是由 Google 开发的一个开源 C++ 日志库，提供了丰富的日志功能，包括多种日志级别、条件日志记录、日志文件管理、信号处理、自定义日志格式等。Glog 默认情况下是同步记录日志的，每次写日志操作都会阻塞直到日志数据被写入磁盘。

### 3.4.2 性能对比

根据性能测试，glog 在同步调用的场景下的性能较 spdlog 慢。在一台低配的服务器上，glog 处理十万笔日志数据耗时 1.027 秒，而 spdlog 仅耗时 0.135 秒。此外，spdlog 还支持异步日志记录，其异步模式的耗时为 0.158 秒。

### 3.4.3 对比总结

- **性能**：spdlog 在同步调用场景下的性能优于 glog。
- **异步日志**：spdlog 支持异步日志记录，适用于高负载应用程序。
- **易用性**：spdlog 集成和配置简单，而 glog 可能需要额外的编译和配置步骤。
- **功能**：glog 提供了条件日志记录和信号处理等功能，在某些场景下更为适用。
- **使用场景**：glog 适用于功能需求较多但对性能要求不高的场景；spdlog 适合需要高性能日志记录和异步日志能力的应用程序。

## 3.5 总结

Spdlog 是一个功能强大且易于使用的 C++ 日志库，它提供了丰富的功能和高性能的日志记录能力。通过简单的 API，开发者可以快速地在项目中实现日志记录，保持代码的清晰和可维护性。无论是在开发阶段还是生产环境中，spdlog 都能提供稳定和高效的日志服务。
