// 聊天会话id 映射到 用户id
#pragma once
#include <string>
#include <cstddef>
#include <odb/core.hxx>

namespace chen_im
{
#pragma db object table("chat_session_member")
    class ChatSessionMember
    {
    public:
        ChatSessionMember() {}
        ChatSessionMember(const std::string &ssid, const std::string &uid) 
            : _chat_session_id(ssid), _user_id(uid) {}
        ~ChatSessionMember() {}

        std::string chat_session_id() const { return _chat_session_id; }
        void chat_session_id(std::string &ssid) { _chat_session_id = ssid; }

        std::string user_id() const { return _user_id; }
        void user_id(std::string &uid) { _user_id = uid; }

    private:
        friend class odb::access;
#pragma db id auto
        unsigned long _id;
#pragma db type("varchar(64)") index
        std::string _chat_session_id;
#pragma db type("varchar(64)")
        std::string _user_id;
    };
}

