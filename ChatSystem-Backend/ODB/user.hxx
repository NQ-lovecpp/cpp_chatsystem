#pragma once
#include <string>
#include <cstddef> // std::size_t
#include <boost/date_time/posix_time/posix_time.hpp>
#include <odb/nullable.hxx>
#include <odb/core.hxx>

/* 在 C++ 中，要使用 ODB 将类声明为持久化类，
需要包含 ODB 的核心头文件，并使用 #pragma db object 指令 #pragma db object
指示 ODB 编译器将 person 类视为一个持久化类。 */

typedef boost::posix_time::ptime ptime;

#pragma db object table("user")
class User
{
    friend class odb::access;

private:
#pragma db id auto
    unsigned long _id;
#pragma db type("varchar(64)") index unique
    std::string _user_id;
#pragma db type("varchar(64)") index unique
    odb::nullable<std::string> _nickname;    // 用户昵称-不一定存在
    odb::nullable<std::string> _description; // 用户签名 - 不一定存在
#pragma db type("varchar(64)")
    odb::nullable<std::string> _password; // 用户密码 - 不一定存在
#pragma db type("varchar(64)") index unique
    odb::nullable<std::string> _phone; // 用户手机号 - 不一定存在
#pragma db type("varchar(64)")
    odb::nullable<std::string> _avatar_id; // 用户头像文件ID - 不一定存在

public:
    // 用户名+密码注册
    User(const std::string &uid, const std::string &nickname, const std::string &password) : _user_id(uid), _nickname(nickname), _password(password) {}

    // 手机号+密码注册
    User(const std::string &uid, const std::string &phone) : _user_id(uid), _nickname(uid), _phone(phone) {}

    void user_id(const std::string &val)
    {
        _user_id = val;
    }
    std::string user_id() { return _user_id; }

    std::string nickname()
    {
        if (_nickname)
            return *_nickname;
        return std::string();
    }
    void nickname(const std::string &val) { _nickname = val; }

    std::string description()
    {
        if (!_description)
            return std::string();
        return *_description;
    }
    void description(const std::string &val) { _description = val; }

    std::string password()
    {
        if (!_password)
            return std::string();
        return *_password;
    }
    void password(const std::string &val) { _password = val; }

    std::string phone()
    {
        if (!_phone)
            return std::string();
        return *_phone;
    }
    void phone(const std::string &val) { _phone = val; }

    std::string avatar_id()
    {
        if (!_avatar_id)
            return std::string();
        return *_avatar_id;
    }
    void avatar_id(const std::string &val) { _avatar_id = val; }

    User() {}
    ~User() {}
};

// odb -d mysql --std c++17 --generate-query --generate-schema --profile boost/date-time user.hxx