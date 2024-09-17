#include "mysql_odb_factory.hpp"
#include "mysql_user_CRUD.hpp"
#include "user-odb.hxx"
#include <gflags/gflags.h>


DEFINE_bool(run_mode, false, "程序的运行模式，false-调试； true-发布；");
DEFINE_string(log_file, "", "发布模式下，用于指定日志的输出文件");
DEFINE_int32(log_level, 0, "发布模式下，用于指定日志输出等级");

// Mysql
DEFINE_string(mysql_host, "127.0.0.1", "这是MySQL的服务地址");
DEFINE_int32(mysql_port, 3306, "这是MySQL的服务端口");
DEFINE_string(db, "TestODB", "使用的数据库名称");
DEFINE_string(user, "chen", "MySQL用户名");
DEFINE_string(passwd, "Cydia4384!", "MySQL用户密码");
DEFINE_string(charset, "utf8", "字符集");
DEFINE_int32(max_pool, 3, "MySQL连接池的最大连接数");

void insert(chen_im::UserTable &user) {
    auto user1 = std::make_shared<User>("uid1", "昵称1", "123456");
    user.insert(user1);
    
    auto user2 = std::make_shared<User>("uid2", "15566667777");
    user.insert(user2);
}

void update_by_id(chen_im::UserTable &user_tb) {
    auto user = user_tb.select_by_uid("uid1");
    user->description("一个风一样的男人...");
    user_tb.update(user);
}

void update_by_phone(chen_im::UserTable &user_tb) {
    auto user = user_tb.select_by_phone("15566667777");
    user->password("22223333");
    user_tb.update(user);
}

void update_by_nickname(chen_im::UserTable &user_tb) {
    auto user = user_tb.select_by_nickname("uid2");
    user->nickname("昵称2");
    user_tb.update(user);
}

void select_users(chen_im::UserTable &user_tb) {
    std::vector<std::string> id_list = {"uid1", "uid2"};
    auto res = user_tb.select_by_multi_uid(id_list);
    for (auto user : res) {
        std::cout << user.nickname() << std::endl;
    }
}

int main(int argc, char *argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    chen_im::init_logger(FLAGS_run_mode, FLAGS_log_file, FLAGS_log_level);

    auto db = chen_im::ODBFactory::create(
        "chen", "Cydia4384!", "chen_im", 
        "127.0.0.1", 3306, "utf8", 3
    );
    
    chen_im::UserTable user(db);

    // insert(user);
    // update_by_id(user);
    // update_by_phone(user);
    // update_by_nickname(user);
    select_users(user);
    return 0;
}