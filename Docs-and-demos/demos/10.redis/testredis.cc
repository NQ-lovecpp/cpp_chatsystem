#include <sw/redis++/redis.h>
#include <gflags/gflags.h>
#include <iostream>
#include <thread>

DEFINE_string(ip, "127.0.0.1", "redis服务器地址");
DEFINE_int32(port, 6379, "redis服务器地址");
DEFINE_int32(db, 0, "redis服务器地址");
DEFINE_bool(keep_alive, true, "是否进行长连接保活");

void add_string(sw::redis::Redis &client) {
    client.set("会话ID_1", "用户ID_1");
    client.set("会话ID_2", "用户ID_2");
    client.set("会话ID_3", "用户ID_3");
    client.set("会话ID_4", "用户ID_4");
    client.set("会话ID_5", "用户ID_5");

    client.del("会话ID_3");
    
    auto user1 = client.get("会话ID_1");
    if (user1) std::cout << *user1 << std::endl;

    auto user2 = client.get("会话ID_2");
    if (user2) std::cout << *user2 << std::endl;

    auto user3 = client.get("会话ID_3");
    if (user3) std::cout << *user3 << std::endl;

    auto user4 = client.get("会话ID_4");
    if (user4) std::cout << *user4 << std::endl;

    auto user5 = client.get("会话ID_5");
    if (user5) std::cout << *user5 << std::endl;
}

void expire_test(sw::redis::Redis &client) {
    // 这里不仅修改了value，还新增了过期时间一秒钟
    client.set("会话ID_1", "hahahahahahha", std::chrono::seconds(5));

    while(true) {
        auto user1 = client.get("会话ID_1");
        if (user1) std::cout << *user1 << std::endl;

        auto user2 = client.get("会话ID_2");
        if (user2) std::cout << *user2 << std::endl;

        auto user3 = client.get("会话ID_3");
        if (user3) std::cout << *user3 << std::endl;

        auto user4 = client.get("会话ID_4");
        if (user4) std::cout << *user4 << std::endl;

        auto user5 = client.get("会话ID_5");
        if (user5) std::cout << *user5 << std::endl;

        std::cout << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
}

void list_test(sw::redis::Redis &client) {
    client.rpush("群聊1", "成员1"); // key是一个列表的key，向群聊1列表的右侧中插入成员1
    client.rpush("群聊1", "成员2");
    client.rpush("群聊1", "成员3");
    client.rpush("群聊1", "成员4");
    client.rpush("群聊1", "成员5");

    // 从redis中获取数据到vector
    std::vector<std::string> users;
    client.lrange("群聊1", 0, -1/* -1 表示所有*/, std::back_inserter(users));

    // 打印
    for(auto str : users) {
        std::cout << str << std::endl;
    }
}

int main(int argc, char* argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);

    // 1. 实例化一个redis客户端对象，构造连接选项，连接服务器
    sw::redis::ConnectionOptions connection_opt;
    connection_opt.host = FLAGS_ip;
    connection_opt.port = FLAGS_port;
    connection_opt.db = FLAGS_db;
    connection_opt.keep_alive = FLAGS_keep_alive;

    sw::redis::Redis client(connection_opt);

    // // 2. 添加字符串键值对，删除字符串键值对，获取字符串键值对（增删查改）
    // add_string(client);

    // // 3. 实践一下：控制数据有效实践的操作
    // expire_test(client);

    // 4. 列表的操作，主要实现数据的右插、左获取
    list_test(client);


    return 0;
}
