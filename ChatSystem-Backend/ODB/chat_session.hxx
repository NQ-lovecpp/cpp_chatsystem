#pragma once
#include <string>
#include <cstddef>
#include <odb/nullable.hxx>
#include <odb/core.hxx>
#include "chat_session_member.hxx"

namespace chen_im
{
    enum class ChatSessionType
    {
        SINGLE = 1,
        GROUP = 2
    };

#pragma db object table("chat_session")
    class ChatSession
    {
    public:
        ChatSession() {}
        ChatSession(const std::string &ssid,
                    const std::string &ssname, const ChatSessionType sstype) : _chat_session_id(ssid),
                                                                               _chat_session_name(ssname),
                                                                               _chat_session_type(sstype) {}

        std::string chat_session_id() const { return _chat_session_id; }
        void chat_session_id(std::string &ssid) { _chat_session_id = ssid; }

        std::string chat_session_name() const { return _chat_session_name; }
        void chat_session_name(std::string &ssname) { _chat_session_name = ssname; }

        ChatSessionType chat_session_type() const { return _chat_session_type; }
        void chat_session_type(ChatSessionType val) { _chat_session_type = val; }

    private:
        friend class odb::access;
#pragma db id auto
        unsigned long _id;
#pragma db type("varchar(64)") index unique
        std::string _chat_session_id;
#pragma db type("varchar(64)")
        std::string _chat_session_name;
#pragma db type("tinyint")
        ChatSessionType _chat_session_type; // 1-单聊； 2-群聊
    };


// 这里条件必须是指定条件：  css::chat_session_type==1 && csm1.user_id=uid && csm2.user_id != csm1.user_id
// object() 用来描述如何将 C++ 类与数据库表关联起来 这里 ChatSession 是 C++ 类，css 是别名
// == 也可以定义连接条件
#pragma db view object(ChatSession = css)                                                     \
                object(ChatSessionMember = csm1 : css::_chat_session_id == csm1::_chat_session_id) \
                object(ChatSessionMember = csm2 : css::_chat_session_id == csm2::_chat_session_id) \
                query((?))
    struct SingleChatSession
    {
#pragma db column(css::_chat_session_id)
        std::string chat_session_id;
#pragma db column(csm2::_user_id)
        std::string friend_id; // 单聊的名称就是对方的昵称
    };

// 这里条件必须是指定条件：  css::chat_session_type==2 && csm.user_id=uid
#pragma db view object(ChatSession = css)                                                   \
                object(ChatSessionMember = csm : css::_chat_session_id == csm::_chat_session_id) \
                query((?))
    struct GroupChatSession
    {
#pragma db column(css::_chat_session_id)
        std::string chat_session_id;
#pragma db column(css::_chat_session_name)
        std::string chat_session_name;
    };
}