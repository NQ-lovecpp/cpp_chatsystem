// 对用户表的增删查改
#pragma once
#include <string>
#include <memory>  // std::auto_ptr
#include <cstdlib> // std::exit
#include <iostream>

#include <odb/database.hxx>
#include <odb/mysql/database.hxx>
#include <gflags/gflags.h>

#include "mysql_odb_factory.hpp"
#include "user-odb.hxx"
#include "logger.hpp"

// 用户注册
// 用户登录
// 手机号注册
// 手机号登录
// 获取用户信息：
//    通过昵称获取用户信息
//    通过手机号获取用户信息
//    通过用户ID获取用户信息
//    通过多个用户ID获取多个用户信息

// 修改用户信息：
//    设置头像
//    设置昵称
//    设置签名
//    设置绑定手机号

namespace chen_im {

class UserTable
{
private:
    std::shared_ptr<odb::mysql::database> _db; // odb的客户端，内有连接池，用来发起事务
public:
    UserTable(const std::shared_ptr<odb::mysql::database> &db)
        :_db(db)
    {}
    ~UserTable() {}

    // 向mysql中新增用户
    bool insert(const std::shared_ptr<User> &user)
    {
        try {        
            odb::mysql::transaction t(_db->begin());
            _db->persist(*user);
            t.commit();
        } catch(const std::exception &e) {
            LOG_ERROR("向mysql新增用户数据失败！原因：{}", e.what());
            return false;
        }
        return true;
    }

    /// @brief 向mysql中更新用户数据
    /// @param user 需要先查询出user对象，再传入它的智能指针
    bool update(const std::shared_ptr<User> &user)
    {
        try {        
            odb::mysql::transaction t(_db->begin());
            _db->update(*user);
            t.commit();
        } catch(const std::exception &e) {
            LOG_ERROR("向mysql更新用户数据失败！原因：{}", e.what());
            return false;
        }
        return true;
    }

    // 根据昵称查询用户信息
    std::shared_ptr<User> select_by_nickname(const std::string &nickname)
    {
        std::shared_ptr<User> ret;
        try {        
            odb::mysql::transaction t(_db->begin());
            typedef odb::query<User> query;
            typedef odb::result<User> result;

            // 查询
            ret.reset(_db->query_one<User>(query::nickname == nickname));

            t.commit();
        } catch(const std::exception &e) {
            LOG_ERROR("根据昵称查询mysql用户数据失败！原因：{}", e.what());
        }

        return ret;
    }

    // 根据手机号查询用户信息
    std::shared_ptr<User> select_by_phone(const std::string &phone)
    {
        std::shared_ptr<User> ret;
        try {        
            odb::mysql::transaction t(_db->begin());
            typedef odb::query<User> query;
            typedef odb::result<User> result;

            // 查询
            ret.reset(_db->query_one<User>(query::phone == phone));

            t.commit();
        } catch(const std::exception &e) {
            LOG_ERROR("根据手机号查询mysql用户数据失败！原因：{}", e.what());
        }

        return ret;
    }

    // 根据用户id查询用户信息
    std::shared_ptr<User> select_by_uid(const std::string &uid)
    {
        std::shared_ptr<User> ret;
        try {        
            odb::mysql::transaction t(_db->begin());
            typedef odb::query<User> query;
            typedef odb::result<User> result;

            // 查询
            ret.reset(_db->query_one<User>(query::user_id == uid));

            t.commit();
        } catch(const std::exception &e) {
            LOG_ERROR("根据用户ID查询mysql用户数据失败！原因：{}", e.what());
        }

        return ret;
    }

    // 根据一组用户id查询一组用户
    std::vector<User> select_by_multi_uid(std::vector<std::string> &uid_array)
    {
        if (uid_array.empty()) {
            return {};
        }
        std::vector<User> ret;
        try {        
            odb::mysql::transaction t(_db->begin());
            typedef odb::query<User> query;
            typedef odb::result<User> result;

            // 使用范围查询，并传入起始和结束迭代器
            query q;
            q = query::user_id.in_range(uid_array.begin(), uid_array.end());

            // 查询
            result query_result(_db->query<User>(q));

            for (result::iterator i = query_result.begin(); i != query_result.end(); i++) {
                ret.push_back(*i);
            }

            t.commit();
        } catch(const std::exception &e) {
            LOG_ERROR("根据批量用户ID查询批量用户数据失败！原因：{}", e.what());
        }

        return ret;
    }

};

}