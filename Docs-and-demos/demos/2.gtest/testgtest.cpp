#include <iostream>
#include <gtest/gtest.h>
#include <unordered_map>

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