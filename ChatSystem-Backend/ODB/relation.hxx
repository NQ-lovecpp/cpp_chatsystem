#pragma once
#include <string>
#include <cstddef>
#include <odb/nullable.hxx>
#include <odb/core.hxx>

namespace chen_im
{
#pragma db object table("relation")
    class Relation
    {        
        friend class odb::access;
    public:
        Relation() {}
        Relation(const std::string &uid, const std::string &pid) : _user_id(uid), _peer_id(pid) {}

        std::string user_id() const { return _user_id; }
        void user_id(std::string &uid) { _user_id = uid; }

        std::string peer_id() const { return _peer_id; }
        void peer_id(std::string &uid) { _peer_id = uid; }

    private:
#pragma db id auto
        unsigned long _id;
#pragma db type("varchar(64)") index
        std::string _user_id; // 用户id
#pragma db type("varchar(64)")
        std::string _peer_id; // 该用户的好友的id
    };
    // odb -d mysql --std c++11 --generate-query --generate-schema --profile boost/date-time person.hxx
}