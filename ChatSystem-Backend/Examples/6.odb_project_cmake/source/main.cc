#include <string>
#include <memory>  // std::auto_ptr
#include <cstdlib> // std::exit
#include <iostream>

#include <odb/database.hxx>
#include <odb/mysql/database.hxx>
#include <gflags/gflags.h>

#include "student.hxx"
#include "student-odb.hxx"


DEFINE_string(mysql_host, "127.0.0.1", "这是MySQL的服务地址");
DEFINE_int32(mysql_port, 3306, "这是MySQL的服务端口");
DEFINE_string(db, "TestODB", "使用的数据库名称");
DEFINE_string(user, "chen", "MySQL用户名");
DEFINE_string(passwd, "Cydia4384!", "MySQL用户密码");
DEFINE_string(charset, "utf8", "字符集");
DEFINE_int32(max_pool, 3, "MySQL连接池的最大连接数");


// 插入班级表
bool insert_class(odb::mysql::database &db) 
{
    try {
        odb::mysql::transaction transaction1(db.begin());
        Class c1("一年级1班");
        Class c2("一年级2班");
        Class c3("一年级3班");
        db.persist(c1);
        db.persist(c2);
        db.persist(c3);
        transaction1.commit();
        return true;
    } catch (const std::exception & e) {
        std::cerr << e.what() << std::endl;
        return false;
    }
}

bool insert_student(odb::mysql::database &db) 
{
    try {
        odb::mysql::transaction transaction2(db.begin());
        Student s1("chen"  , 12, 1);
        Student s2("fas"   , 22, 1);
        Student s3("fadsf" , 14, 1);
        Student s4("zdfgho", 23, 2);
        Student s5("zretw" , 25, 2);
        Student s6("h3asdf", 54, 2);
        Student s7("5hq3"  , 34, 3);
        Student s8("qerwfn", 33, 3);
        Student s9("gqwr"  , 25, 3);
        db.persist(s1);
        db.persist(s2);
        db.persist(s3);
        db.persist(s4);
        db.persist(s5);
        db.persist(s6);
        db.persist(s7);
        db.persist(s8);
        db.persist(s9);
        transaction2.commit();
        return true;
    } catch (const std::exception & e) {
        std::cerr << e.what() << std::endl;
        return false;
    }
}

Student select_student(odb::mysql::database &db) 
{
    Student ret;
    try {
        odb::mysql::transaction transaction2(db.begin());

        typedef odb::query<Student> query;
        typedef odb::result<Student> result;
        result r(db.query<Student>(query::name == "chen"));
        if(r.size() != 1) {
            throw "数据数量不对！";
        }

        ret = *r.begin();

        transaction2.commit();
        return ret;
    } catch (const std::exception & e) {
        std::cerr << e.what() << std::endl;
        return ret;
    }
}

// 多表查询
std::vector<struct class_student_view> join_student_class(odb::mysql::database &db) 
{
    try {
        odb::mysql::transaction transaction2(db.begin());

        typedef odb::query<struct class_student_view> query;
        typedef odb::result<struct class_student_view> result;
        result r(db.query<struct class_student_view>(query::Student::class_id == query::Student::class_id));
        if(r.size() < 0) {
            throw "数据数量不对！";
            transaction2.commit();
            return {};
        } else {
            return std::vector<struct class_student_view>(r.begin(), r.end());
        }

    } catch (const std::exception & e) {
        std::cerr << e.what() << std::endl;
        return {};
    }
}

int main(int argc, char* argv[])
{
    google::ParseCommandLineFlags(&argc, &argv, true);
    // 1. 构造连接池工厂配置对象 
    std::unique_ptr<odb::mysql::connection_pool_factory> connection_factory(
        new odb::mysql::connection_pool_factory(
            FLAGS_max_pool, 0
        )
    );

    // 2. 构造数据库操作对象
    odb::mysql::database db(
        FLAGS_user,
        FLAGS_passwd,
        FLAGS_db,
        FLAGS_mysql_host,
        FLAGS_mysql_port,
        "",
        FLAGS_charset,
        0,
        std::move(connection_factory)
    );


    // 3. 获取事务操作对象，开启事务
    // 4. 数据的增删查改操作
    // 5. 提交事务

    // insert_class(db);
    // insert_student(db);

    // Student ret = select_student(db);
    // std::cout << ret.GetName() << std::endl;
    // std::cout << (ret.GetAge() ? ret.GetAge().get() : -1) << std::endl;
    // std::cout << ret.GetClassID() << std::endl;
    // std::cout << ret.GetStuID() << std::endl;

    std::vector<struct class_student_view> ret = join_student_class(db);
    for(auto &e : ret) {
        std::cout << (e._age ? *e._age : -1) << "\t"
                  << e._name << "\t"
                  << e._class_name << "\t"
                  << e._stu_id << std::endl;
    }

    return 0;
}