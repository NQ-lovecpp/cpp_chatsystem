#pragma once
#include <string>
#include <cstddef> // std::size_t
#include <boost/date_time/posix_time/posix_time.hpp>
#include <odb/core.hxx>

/* 在 C++ 中，要使用 ODB 将类声明为持久化类，
需要包含 ODB 的核心头文件，并使用 #pragma db object 指令 #pragma db object
指示 ODB 编译器将 person 类视为一个持久化类。 */

typedef boost::posix_time::ptime ptime;

#pragma db object
class Person
{
public:
    Person(const std::string &name, int age, const ptime &update) : _name(name), _age(age), _update(update) {}
    void age(int val) { _age = val; }
    int age() { return _age; }
    void name(const std::string &val) { _name = val; }
    std::string name() { return _name; }
    void update(const ptime &update) { _update = update; }
    std::string update() { return boost::posix_time::to_simple_string(_update); }

private:
    // 将 odb：：access 类作为 person 类的朋友。
    // 这是使数据库支持代码可访问默认构造函数和数据成员所必需的。
    // 如果类具有公共默认构造函数和公共数据成员或数据成员的公共访问器和修饰符，则不需要友元声明
    friend class odb::access;
    Person() {}
#pragma db id auto column("id")// auto表示字段自增
    unsigned long _id;
    unsigned short _age;
#pragma db type("Decimal")
    double _length;
#pragma db not_null unique index
    std::string _name;
#pragma db type("TIMESTAMP") not_null
    boost::posix_time::ptime _update;
};