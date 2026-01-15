#pragma once
#include <string>
#include <memory>  // std::auto_ptr
#include <cstdlib> // std::exit
#include <iostream>

#include <odb/database.hxx>
#include <mysql/plugin_auth_common.h>
#include <odb/mysql/database.hxx>
#include <gflags/gflags.h>

namespace chen_im
{
    class ODBFactory
    {
    public:
        static std::shared_ptr<odb::mysql::database> create(
            const std::string &user,
            const std::string &pswd,
            const std::string &db,
            const std::string &host,
            int port,
            const std::string &char_set,
            int max_connections)
        {
            // 1. 构造连接池工厂配置对象 
            std::unique_ptr<odb::mysql::connection_pool_factory> cpf(
                new odb::mysql::connection_pool_factory(
                    max_connections, 0
                )
            );
            
            // 2. 构造数据库操作对象
            auto res = std::make_shared<odb::mysql::database>(
                user, pswd, db, host, port, "", char_set, 0, std::move(cpf));
            
            return res;
        }
    };

}