#include "server.h"

#include "base.qpb.h"
#include "user.qpb.h"
#include "gateway.qpb.h"
#include "friend.qpb.h"
#include "file.qpb.h"
#include "message_storage.qpb.h"
#include "message_transmit.qpb.h"
#include "speech_recognition.qpb.h"
#include "notify.qpb.h"

#include <QDateTime>
#include <QDebug>

//////////////////////////////////////////////////////////////////
/// 一些辅助函数
//////////////////////////////////////////////////////////////////

// 生成默认的 UserInfo 对象
bite_im::UserInfo makeUserInfo(int index, const QByteArray& avatar) {
    bite_im::UserInfo userInfo;
    userInfo.setUserId(QString::number(1000 + index));
    userInfo.setNickname("张三" + QString::number(index));
    userInfo.setDescription("个性签名" + QString::number(index));
    userInfo.setPhone("18612345678");
    userInfo.setAvatar(avatar);
    return userInfo;
}

// 生成默认的 MessageInfo 对象. 文本消息
bite_im::MessageInfo makeTextMessageInfo(int index, const QString& chatSessionId, const QByteArray& avatar) {
    bite_im::MessageInfo messageInfo;
    messageInfo.setMessageId(QString::number(3000 + index));
    messageInfo.setChatSessionId(chatSessionId);
    messageInfo.setTimestamp(getTime());
    messageInfo.setSender(makeUserInfo(index, avatar));

    bite_im::StringMessageInfo stringMessageInfo;
    stringMessageInfo.setContent("这是一条消息内容" + QString::number(index));

    bite_im::MessageContent messageContent;
    messageContent.setMessageType(bite_im::MessageTypeGadget::MessageType::STRING);
    messageContent.setStringMessage(stringMessageInfo);
    messageInfo.setMessage(messageContent);
    return messageInfo;
}

bite_im::MessageInfo makeImageMessageInfo(int index, const QString& chatSessionId, const QByteArray& avatar) {
    bite_im::MessageInfo messageInfo;
    messageInfo.setMessageId(QString::number(3000 + index));
    messageInfo.setChatSessionId(chatSessionId);
    messageInfo.setTimestamp(getTime());
    messageInfo.setSender(makeUserInfo(index, avatar));

    bite_im::ImageMessageInfo imageMessageInfo;
    imageMessageInfo.setFileId("testImage");
    // 真实服务器推送的消息数据里, 本身也就不带图片的正文. 只是 fileId.
    // 需要通过 fileId, 二次发起请求, 通过 getSingleFile 接口来获取到内容.
    // imageMessageInfo.setImageContent();

    bite_im::MessageContent messageContent;
    messageContent.setMessageType(bite_im::MessageTypeGadget::MessageType::IMAGE);
    messageContent.setImageMessage(imageMessageInfo);
    messageInfo.setMessage(messageContent);
    return messageInfo;
}

bite_im::MessageInfo makeFileMessageInfo(int index, const QString& chatSessionId, const QByteArray& avatar) {
    bite_im::MessageInfo messageInfo;
    messageInfo.setMessageId(QString::number(3000 + index));
    messageInfo.setChatSessionId(chatSessionId);
    messageInfo.setTimestamp(getTime());
    messageInfo.setSender(makeUserInfo(index, avatar));

    bite_im::FileMessageInfo fileMessageInfo;
    fileMessageInfo.setFileId("testFile");
    // 真实服务器推送的消息数据里, 本身也就不带图片的正文. 只是 fileId.
    // 需要通过 fileId, 二次发起请求, 通过 getSingleFile 接口来获取到内容.
    fileMessageInfo.setFileName("test.txt");
    // 此处文件大小, 无法设置. 由于 fileSize 属性, 不是 optional , 此处先设置一个 0 进来
    fileMessageInfo.setFileSize(0);

    bite_im::MessageContent messageContent;
    messageContent.setMessageType(bite_im::MessageTypeGadget::MessageType::FILE);
    messageContent.setFileMessage(fileMessageInfo);
    messageInfo.setMessage(messageContent);
    return messageInfo;
}

bite_im::MessageInfo makeSpeechMessageInfo(int index, const QString& chatSessionId, const QByteArray& avatar) {
    bite_im::MessageInfo messageInfo;
    messageInfo.setMessageId(QString::number(3000 + index));
    messageInfo.setChatSessionId(chatSessionId);
    messageInfo.setTimestamp(getTime());
    messageInfo.setSender(makeUserInfo(index, avatar));

    bite_im::SpeechMessageInfo speechMessageInfo;
    // 真实服务器推送的消息数据里, 本身也就不带图片的正文. 只是 fileId.
    // 需要通过 fileId, 二次发起请求, 通过 getSingleFile 接口来获取到内容.
    speechMessageInfo.setFileId("testSpeech");

    bite_im::MessageContent messageContent;
    messageContent.setMessageType(bite_im::MessageTypeGadget::MessageType::SPEECH);
    messageContent.setSpeechMessage(speechMessageInfo);
    messageInfo.setMessage(messageContent);
    return messageInfo;
}

//////////////////////////////////////////////////////////////////
/// HTTP 服务器
//////////////////////////////////////////////////////////////////

HttpServer* HttpServer::instance = nullptr;

HttpServer *HttpServer::getInstance()
{
    if (instance == nullptr) {
        instance = new HttpServer();
    }
    return instance;
}

bool HttpServer::init()
{
    // 返回的值是 int, 表示成功绑定的端口号的数值.
    int ret = httpServer.listen(QHostAddress::Any, 8000);

    // 配置路由
    httpServer.route("/ping", [](const QHttpServerRequest& req) {
        (void) req;
        qDebug() << "[http] 收到 ping 请求";
        return "pong";
    });

    httpServer.route("/service/user/get_user_info", [=](const QHttpServerRequest& req) {
        return this->getUserInfo(req);
    });

    httpServer.route("/service/friend/get_friend_list", [=](const QHttpServerRequest& req) {
        return this->getFriendList(req);
    });

    httpServer.route("/service/friend/get_chat_session_list", [=](const QHttpServerRequest& req) {
        return this->getChatSessionList(req);
    });

    httpServer.route("/service/friend/get_pending_friend_events", [=](const QHttpServerRequest& req) {
        return this->getApplyList(req);
    });

    httpServer.route("/service/message_storage/get_recent", [=](const QHttpServerRequest& req) {
        return this->getRecent(req);
    });

    httpServer.route("/service/message_transmit/new_message", [=](const QHttpServerRequest& req) {
        return this->newMessage(req);
    });

    httpServer.route("/service/user/set_nickname", [=](const QHttpServerRequest& req) {
        return this->setNickname(req);
    });

    httpServer.route("/service/user/set_description", [=](const QHttpServerRequest& req) {
        return this->setDesc(req);
    });

    httpServer.route("/service/user/get_phone_verify_code", [=](const QHttpServerRequest& req) {
        return this->getPhoneVerifyCode(req);
    });

    httpServer.route("/service/user/set_phone", [=](const QHttpServerRequest& req) {
        return this->setPhone(req);
    });

    httpServer.route("/service/user/set_avatar", [=](const QHttpServerRequest& req) {
        return this->setAvatar(req);
    });

    httpServer.route("/service/friend/remove_friend", [=](const QHttpServerRequest& req) {
        return this->removeFriend(req);
    });

    httpServer.route("/service/friend/add_friend_apply", [=](const QHttpServerRequest& req) {
        return this->addFriendApply(req);
    });

    httpServer.route("/service/friend/add_friend_process", [=](const QHttpServerRequest& req) {
        return this->addFriendProcess(req);
    });

    httpServer.route("/service/friend/create_chat_session", [=](const QHttpServerRequest& req) {
        return this->createChatSession(req);
    });

    httpServer.route("/service/friend/get_chat_session_member", [=](const QHttpServerRequest& req) {
        return this->getChatSessionMember(req);
    });

    httpServer.route("/service/friend/search_friend", [=](const QHttpServerRequest& req) {
        return this->searchFriend(req);
    });

    httpServer.route("/service/message_storage/search_history", [=](const QHttpServerRequest& req) {
        return this->searchHistory(req);
    });

    httpServer.route("/service/message_storage/get_history", [=](const QHttpServerRequest& req) {
        return this->getHistory(req);
    });

    httpServer.route("/service/user/username_login", [=](const QHttpServerRequest& req) {
        return this->usernameLogin(req);
    });

    httpServer.route("/service/user/username_register", [=](const QHttpServerRequest& req) {
        return this->usernameRegister(req);
    });

    httpServer.route("/service/user/phone_login", [=](const QHttpServerRequest& req) {
        return this->phoneLogin(req);
    });

    httpServer.route("/service/user/phone_register", [=](const QHttpServerRequest& req) {
        return this->phoneRegister(req);
    });

    httpServer.route("/service/file/get_single_file", [=](const QHttpServerRequest& req) {
        return this->getSingleFile(req);
    });

    httpServer.route("/service/speech/recognition", [=](const QHttpServerRequest& req) {
        return this->recognition(req);
    });

    return ret == 8000;
}

QHttpServerResponse HttpServer::getUserInfo(const QHttpServerRequest &req)
{
    // 解析请求, 把 req 的 body 取出来, 并且通过 pb 进行反序列化
    bite_im::GetUserInfoReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 获取用户信息] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId();

    // 构造响应数据
    bite_im::GetUserInfoRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");

    bite_im::UserInfo userInfo;
    userInfo.setUserId("1029");    // 调整自己的用户 id, 和返回的消息列表的内容匹配上
    userInfo.setNickname("张三");
    userInfo.setDescription("这是个性签名");
    userInfo.setPhone("18612345678");
    userInfo.setAvatar(loadFileToByteArray(":/resource/image/groupAvatar.png"));
    pbResp.setUserInfo(userInfo);

    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应数据
    QHttpServerResponse httpResp(body, QHttpServerResponse::StatusCode::Ok);
    httpResp.setHeader("Content-Type", "application/x-protobuf");
    return httpResp;
}

QHttpServerResponse HttpServer::getFriendList(const QHttpServerRequest &req)
{
    // 解析请求, 把 req 的 body 拿出来.
    bite_im::GetFriendListReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 获取好友列表] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId();

    // 构造响应
    bite_im::GetFriendListRsp pbRsp;
    pbRsp.setRequestId(pbReq.requestId());
    pbRsp.setSuccess(true);
    pbRsp.setErrmsg("");

    // 从文件读取数据操作, 其实是比较耗时的. (读取硬盘)
    // 耗时操作如果放在循环内部, 就会使整个的响应处理时间, 更长.
    QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
    for (int i = 0; i < 20; ++i) {
        bite_im::UserInfo userInfo = makeUserInfo(i, avatar);
        pbRsp.friendList().push_back(userInfo);
    }

    // 进行序列化
    QByteArray body = pbRsp.serialize(&serializer);

    // 构造成 HTTP 响应对象
    QHttpServerResponse httpResp(body, QHttpServerResponse::StatusCode::Ok);
    httpResp.setHeader("Content-Type", "application/x-protobuf");
    return httpResp;
}

QHttpServerResponse HttpServer::getChatSessionList(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::GetChatSessionListReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 获取会话列表] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId();

    // 构造响应
    bite_im::GetChatSessionListRsp pbRsp;
    pbRsp.setRequestId(pbReq.requestId());
    pbRsp.setSuccess(true);
    pbRsp.setErrmsg("");

    QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");

    // 构造若干个单聊会话
    for (int i = 0; i < 30; ++i) {
        bite_im::ChatSessionInfo chatSessionInfo;
        chatSessionInfo.setChatSessionId(QString::number(2000 + i));
        chatSessionInfo.setChatSessionName("会话" + QString::number(i));
        chatSessionInfo.setSingleChatFriendId(QString::number(1000 + i));
        chatSessionInfo.setAvatar(avatar);
        bite_im::MessageInfo messageInfo = makeTextMessageInfo(i, chatSessionInfo.chatSessionId(), avatar);

        chatSessionInfo.setPrevMessage(messageInfo);

        pbRsp.chatSessionInfoList().push_back(chatSessionInfo);
    }

    // 构造一个群聊会话
    QByteArray groupAvatar = loadFileToByteArray(":/resource/image/groupAvatar.png");
    bite_im::ChatSessionInfo chatSessionInfo;
    chatSessionInfo.setChatSessionId(QString::number(2100));
    chatSessionInfo.setChatSessionName("会话" + QString::number(2100));
    chatSessionInfo.setSingleChatFriendId("");
    chatSessionInfo.setAvatar(groupAvatar);
    bite_im::MessageInfo messageInfo = makeTextMessageInfo(0, chatSessionInfo.chatSessionId(), avatar);
    chatSessionInfo.setPrevMessage(messageInfo);
    pbRsp.chatSessionInfoList().push_back(chatSessionInfo);

    // 序列化响应
    QByteArray body = pbRsp.serialize(&serializer);
    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::getApplyList(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::GetPendingFriendEventListReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 获取好友申请列表] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId();

    // 构造响应
    bite_im::GetPendingFriendEventListRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");

    // 循环构造出 event 对象, 构造出整个结果数组
    QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
    for (int i = 0; i < 5; ++i) {
        bite_im::FriendEvent friendEvent;
        friendEvent.setEventId("");	// 此处不再使用这个 eventId, 直接设为 ""
        friendEvent.setSender(makeUserInfo(i, avatar));

        pbResp.event().push_back(friendEvent);
    }

    // 序列化成字节数组
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应对象
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::getRecent(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::GetRecentMsgReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 获取最近消息列表] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", chatSessionId=" << pbReq.chatSessionId();

    // 构造响应
    bite_im::GetRecentMsgRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");

    QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");

    for (int i = 0; i < 30; ++i) {
        bite_im::MessageInfo messageInfo = makeTextMessageInfo(i, "2000", avatar);
        pbResp.msgList().push_back(messageInfo);
    }
    bite_im::MessageInfo imageMessageInfo = makeImageMessageInfo(30, "2000", avatar);
    pbResp.msgList().push_back(imageMessageInfo);
    bite_im::MessageInfo fileMessageInfo = makeFileMessageInfo(31, "2000", avatar);
    pbResp.msgList().push_back(fileMessageInfo);
    bite_im::MessageInfo speechMessageInfo = makeSpeechMessageInfo(32, "2000", avatar);
    pbResp.msgList().push_back(speechMessageInfo);

    // 序列化
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应对象
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::newMessage(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::NewMessageReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 发送消息] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", chatSessionId=" << pbReq.chatSessionId() << ", messageType=" << pbReq.message().messageType();

    if (pbReq.message().messageType() == bite_im::MessageTypeGadget::MessageType::STRING) {
        LOG() << "发送的消息内容=" << pbReq.message().stringMessage().content();
    }

    // 构造响应
    bite_im::NewMessageRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");

    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::setNickname(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::SetUserNicknameReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 修改用户昵称] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", nickname=" << pbReq.nickname();

    // 构造响应
    bite_im::SetUserNicknameRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::setDesc(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::SetUserDescriptionReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 修改用户签名] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", desc=" << pbReq.description();

    // 构造响应
    bite_im::SetUserDescriptionRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::getPhoneVerifyCode(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::PhoneVerifyCodeReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 获取短信验证码] requestId=" << pbReq.requestId() << ", phone=" << pbReq.phoneNumber();

    // 构造响应 body
    bite_im::PhoneVerifyCodeRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    pbResp.setVerifyCodeId("testVerifyCodeId");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::setPhone(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::SetUserPhoneNumberReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 修改手机号] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId() << ", phone=" << pbReq.phoneNumber()
          << ", verifyCodeId=" << pbReq.phoneVerifyCodeId() << ", verifyCode=" << pbReq.phoneVerifyCode();

    // 构造响应 body
    bite_im::SetUserPhoneNumberRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::setAvatar(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::SetUserAvatarReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 修改头像] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId();

    // 构造响应 body
    bite_im::SetUserAvatarRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::removeFriend(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::FriendRemoveReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 删除好友] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", peerId=" << pbReq.peerId();

    // 构造响应 body
    bite_im::FriendRemoveRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::addFriendApply(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::FriendAddReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 添加好友申请] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", userId=" << pbReq.respondentId();

    // 构造响应 body
    bite_im::FriendAddRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    pbResp.setNotifyEventId("");

    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::addFriendProcess(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::FriendAddProcessReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 添加好友申请处理] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", applyUserId=" << pbReq.applyUserId() << ", agree=" << pbReq.agree();

    // 构造响应 body
    bite_im::FriendAddProcessRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    pbResp.setNewSessionId("");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::createChatSession(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::ChatSessionCreateReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 创建会话] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", userIdList=" << pbReq.memberIdList();

    // 构造响应 body
    bite_im::ChatSessionCreateRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::getChatSessionMember(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::GetChatSessionMemberReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 获取会话成员列表] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", chatSessionId=" << pbReq.chatSessionId();

    // 构造响应
    bite_im::GetChatSessionMemberRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");

    // 循环的构造多个 userInfo, 添加到 memberInfoList 中
    QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
    for (int i = 0; i < 10; ++i) {
        bite_im::UserInfo userInfo = makeUserInfo(i, avatar);
        pbResp.memberInfoList().push_back(userInfo);
    }

    // 序列化
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::searchFriend(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::FriendSearchReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 搜索好友] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", searchKey=" << pbReq.searchKey();

    // 构造响应 body
    bite_im::FriendSearchRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");

    QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
    for (int i = 0; i < 30; ++i) {
        bite_im::UserInfo userInfo = makeUserInfo(i, avatar);
        pbResp.userInfo().push_back(userInfo);
    }
    QByteArray body = pbResp.serialize(&serializer);

    // 发送响应给客户端
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::searchHistory(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::MsgSearchReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 搜索历史消息] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", chatSessionId=" << pbReq.chatSessionId() << ", searchKey=" << pbReq.searchKey();

    // 构造响应 body
    bite_im::MsgSearchRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");

    QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
    for (int i = 0; i < 10; ++i) {
        bite_im::MessageInfo message = makeTextMessageInfo(i, pbReq.chatSessionId(), avatar);
        pbResp.msgList().push_back(message);
    }
    // 构造图片消息
    bite_im::MessageInfo message = makeImageMessageInfo(10, pbReq.chatSessionId(), avatar);
    pbResp.msgList().push_back(message);
    // 构造文件消息
    message = makeFileMessageInfo(11, pbReq.chatSessionId(), avatar);
    pbResp.msgList().push_back(message);
    // 构造语音消息
    message = makeSpeechMessageInfo(12, pbReq.chatSessionId(), avatar);
    pbResp.msgList().push_back(message);

    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::getHistory(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::GetHistoryMsgReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 按时间搜索历史消息] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", chatSessionId=" << pbReq.chatSessionId() << ", begTime=" << pbReq.startTime() << ", endTime=" << pbReq.overTime();

    // 构造响应
    bite_im::GetHistoryMsgRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");

    QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
    for (int i = 0; i < 10; ++i) {
        bite_im::MessageInfo message = makeTextMessageInfo(i, pbReq.chatSessionId(), avatar);
        pbResp.msgList().push_back(message);
    }
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::usernameLogin(const QHttpServerRequest& req) {
    // 解析请求
    bite_im::UserLoginReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 用户名密码登录] requestId=" << pbReq.requestId() << ", username=" << pbReq.nickname()
          << ", password=" << pbReq.password();

    // 构造响应 body
    bite_im::UserLoginRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    pbResp.setLoginSessionId("testLoginSessionId");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::usernameRegister(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::UserRegisterReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 用户名密码注册] requestId=" << pbReq.requestId() << ", username=" << pbReq.nickname()
          << ", password=" << pbReq.password();

    // 构造响应 body
    bite_im::UserRegisterRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    QString body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::phoneLogin(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::PhoneLoginReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 手机号登录] requestId=" << pbReq.requestId() << ", phone=" << pbReq.phoneNumber()
          << ", verifyCodeId=" << pbReq.verifyCodeId() << ", verifyCode=" << pbReq.verifyCode();

    // 构造响应
    bite_im::PhoneLoginRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    pbResp.setLoginSessionId("testLoginSessionId");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::phoneRegister(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::PhoneRegisterReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 手机号注册] requestId=" << pbReq.requestId() << ", phone=" << pbReq.phoneNumber()
          << ", verifyCodeId=" << pbReq.verifyCodeId() << ", verifyCode=" << pbReq.verifyCode();

    // 构造响应 body
    bite_im::PhoneRegisterRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    return resp;
}

QHttpServerResponse HttpServer::getSingleFile(const QHttpServerRequest &req)
{
    // 解析请求
    bite_im::GetSingleFileReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 获取单个文件] requestId=" << pbReq.requestId() << ", fileId=" << pbReq.fileId();

    // 构造响应 body
    bite_im::GetSingleFileRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");

    bite_im::FileDownloadData fileDownloadData;
    fileDownloadData.setFileId(pbReq.fileId());
    // 此处后续要能够支持三个情况, 图片文件, 普通文件, 语音文件.
    // 直接使用 fileId 做区分
    if (pbReq.fileId() == "testImage") {
        // fileDownloadData.setFileContent(loadFileToByteArray(":/resource/image/logo.png"));
        fileDownloadData.setFileContent(loadFileToByteArray(":/resource/image/defaultAvatar.png"));
    } else if (pbReq.fileId() == "testFile") {
        fileDownloadData.setFileContent(loadFileToByteArray(":/resource/file/test.txt"));
    } else if (pbReq.fileId() == "testSpeech") {
        // 由于此处暂时还没有音频文件. 得后面写了 录音功能 才能生成.
        fileDownloadData.setFileContent(loadFileToByteArray(":/resource/file/speech.pcm"));
    } else {
        pbResp.setSuccess(false);
        pbResp.setErrmsg("fileId 不是预期的测试 fileId");
    }
    pbResp.setFileData(fileDownloadData);

    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-Type", "application/x-protobuf");
    return resp;
}

QHttpServerResponse HttpServer::recognition(const QHttpServerRequest &req)
{
    // 解析请求 body
    bite_im::SpeechRecognitionReq pbReq;
    pbReq.deserialize(&serializer, req.body());
    LOG() << "[REQ 语音转文字] requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId();

    // 构造响应 body
    bite_im::SpeechRecognitionRsp pbResp;
    pbResp.setRequestId(pbReq.requestId());
    pbResp.setSuccess(true);
    pbResp.setErrmsg("");
    pbResp.setRecognitionResult("你好你好, 这是一段语音消息, 你好你好, 这是一段语音消息");
    QByteArray body = pbResp.serialize(&serializer);

    // 构造 HTTP 响应
    QHttpServerResponse resp(body, QHttpServerResponse::StatusCode::Ok);
    resp.setHeader("Content-type", "application/x-protobuf");
    return resp;
}

//////////////////////////////////////////////////////////////////
/// Websocket 服务器
//////////////////////////////////////////////////////////////////
WebsocketServer* WebsocketServer::instance = nullptr;

WebsocketServer *WebsocketServer::getInstance()
{
    if (instance == nullptr) {
        instance = new WebsocketServer();
    }
    return instance;
}

// 针对 websocket 服务器进行初始化操作
bool WebsocketServer::init()
{
    // 1. 连接信号槽
    connect(&websocketServer, &QWebSocketServer::newConnection, this, [=]() {
        // 连接建立成功之后.
        qDebug() << "[websocket] 连接建立成功!";

        // 获取到用来通信的 socket 对象. nextPendingConnection 类似于 原生 socket 中的 accept
        QWebSocket* socket = websocketServer.nextPendingConnection();

        // 针对这个 socket 对象, 进行剩余信号的处理
        connect(socket, &QWebSocket::disconnected, this, [=]() {
            qDebug() << "[websocket] 连接断开!";
            disconnect(this, &WebsocketServer::sendTextResp, this, nullptr);
            disconnect(this, &WebsocketServer::sendFriendRemove, this, nullptr);
            disconnect(this, &WebsocketServer::sendAddFriendApply, this, nullptr);
            disconnect(this, &WebsocketServer::sendAddFriendProcess, this, nullptr);
            disconnect(this, &WebsocketServer::sendCreateChatSession, this, nullptr);
            disconnect(this, &WebsocketServer::sendImageResp, this, nullptr);
            disconnect(this, &WebsocketServer::sendFileResp, this, nullptr);
            disconnect(this, &WebsocketServer::sendSpeechResp, this, nullptr);
        });

        connect(socket, &QWebSocket::errorOccurred, this, [=](QAbstractSocket::SocketError error) {
            qDebug() << "[websocket] 连接出错! " << error;
        });

        connect(socket, &QWebSocket::textMessageReceived, this, [=](const QString& message) {
            qDebug() << "[websocket] 收到文本数据! message=" << message;
        });

        connect(socket, &QWebSocket::binaryMessageReceived, this, [=](const QByteArray& byteArray) {
            qDebug() << "[websocket] 收到二进制数据! " << byteArray.length();
        });

        connect(this, &WebsocketServer::sendTextResp, this, [=]() {
            // 此处就可以捕获到 socket 对象, 从而可以通过 socket 对象给客户端返回数据.
            if (socket == nullptr || !socket->isValid()) {
                LOG() << "socket 对象无效!";
                return;
            }
            // 构造响应数据
            QByteArray avatar = loadFileToByteArray(":/resouce/image/defaultAvatar.png");
            bite_im::MessageInfo messageInfo = makeTextMessageInfo(this->messageIndex++, "2000", avatar);

            bite_im::NotifyNewMessage notifyNewMessage;
            notifyNewMessage.setMessageInfo(messageInfo);

            bite_im::NotifyMessage notifyMessage;
            notifyMessage.setNotifyEventId("");
            notifyMessage.setNotifyType(bite_im::NotifyTypeGadget::NotifyType::CHAT_MESSAGE_NOTIFY);
            notifyMessage.setNewMessageInfo(notifyNewMessage);

            // 序列化
            QByteArray body = notifyMessage.serialize(&this->serializer);

            // 发送消息给客户端
            socket->sendBinaryMessage(body);

            LOG() << "发送文本消息响应: " << messageInfo.message().stringMessage().content();
        });

        connect(this, &WebsocketServer::sendImageResp, this, [=]() {
            // 此处就可以捕获到 socket 对象, 从而可以通过 socket 对象给客户端返回数据.
            if (socket == nullptr || !socket->isValid()) {
                LOG() << "socket 对象无效!";
                return;
            }
            // 构造响应数据
            QByteArray avatar = loadFileToByteArray(":/resouce/image/defaultAvatar.png");
            bite_im::MessageInfo messageInfo = makeImageMessageInfo(this->messageIndex++, "2000", avatar);

            bite_im::NotifyNewMessage notifyNewMessage;
            notifyNewMessage.setMessageInfo(messageInfo);

            bite_im::NotifyMessage notifyMessage;
            notifyMessage.setNotifyEventId("");
            notifyMessage.setNotifyType(bite_im::NotifyTypeGadget::NotifyType::CHAT_MESSAGE_NOTIFY);
            notifyMessage.setNewMessageInfo(notifyNewMessage);

            // 序列化
            QByteArray body = notifyMessage.serialize(&this->serializer);

            // 发送消息给客户端
            socket->sendBinaryMessage(body);

            LOG() << "发送图片消息响应";
        });

        connect(this, &WebsocketServer::sendFileResp, this, [=]() {
            // 此处就可以捕获到 socket 对象, 从而可以通过 socket 对象给客户端返回数据.
            if (socket == nullptr || !socket->isValid()) {
                LOG() << "socket 对象无效!";
                return;
            }
            // 构造响应数据
            QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
            bite_im::MessageInfo messageInfo = makeFileMessageInfo(this->messageIndex++, "2000", avatar);

            bite_im::NotifyNewMessage notifyNewMessage;
            notifyNewMessage.setMessageInfo(messageInfo);

            bite_im::NotifyMessage notifyMessage;
            notifyMessage.setNotifyEventId("");
            notifyMessage.setNotifyType(bite_im::NotifyTypeGadget::NotifyType::CHAT_MESSAGE_NOTIFY);
            notifyMessage.setNewMessageInfo(notifyNewMessage);

            // 序列化
            QByteArray body = notifyMessage.serialize(&this->serializer);

            // 发送消息给客户端
            socket->sendBinaryMessage(body);

            LOG() << "发送文件消息响应";
        });

        connect(this, &WebsocketServer::sendSpeechResp, this, [=]() {
            // 此处就可以捕获到 socket 对象, 从而可以通过 socket 对象给客户端返回数据.
            if (socket == nullptr || !socket->isValid()) {
                LOG() << "socket 对象无效!";
                return;
            }
            // 构造响应数据
            QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
            bite_im::MessageInfo messageInfo = makeSpeechMessageInfo(this->messageIndex++, "2000", avatar);

            bite_im::NotifyNewMessage notifyNewMessage;
            notifyNewMessage.setMessageInfo(messageInfo);

            bite_im::NotifyMessage notifyMessage;
            notifyMessage.setNotifyEventId("");
            notifyMessage.setNotifyType(bite_im::NotifyTypeGadget::NotifyType::CHAT_MESSAGE_NOTIFY);
            notifyMessage.setNewMessageInfo(notifyNewMessage);

            // 序列化
            QByteArray body = notifyMessage.serialize(&this->serializer);

            // 发送消息给客户端
            socket->sendBinaryMessage(body);

            LOG() << "发送语音消息响应";
        });

        connect(this, &WebsocketServer::sendFriendRemove, this, [=]() {
            if (socket == nullptr || !socket->isValid()) {
                LOG() << "socket 对象无效";
                return;
            }

            bite_im::NotifyMessage notifyMessage;
            notifyMessage.setNotifyEventId("");
            notifyMessage.setNotifyType(bite_im::NotifyTypeGadget::NotifyType::FRIEND_REMOVE_NOTIFY);

            bite_im::NotifyFriendRemove notifyFriendRemove;
            notifyFriendRemove.setUserId("1000");
            notifyMessage.setFriendRemove(notifyFriendRemove);

            QByteArray body = notifyMessage.serialize(&serializer);
            socket->sendBinaryMessage(body);
            LOG() << "通知对方好友被删除 userId=1000";
        });

        connect(this, &WebsocketServer::sendAddFriendApply, this, [=]() {
            if (socket == nullptr || !socket->isValid()) {
                LOG() << "socket 对象无效";
                return;
            }

            bite_im::NotifyMessage notifyMessage;
            notifyMessage.setNotifyEventId("");
            notifyMessage.setNotifyType(bite_im::NotifyTypeGadget::NotifyType::FRIEND_ADD_APPLY_NOTIFY);

            QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
            bite_im::UserInfo userInfo = makeUserInfo(100, avatar);

            bite_im::NotifyFriendAddApply friendAddApply;
            friendAddApply.setUserInfo(userInfo);

            notifyMessage.setFriendAddApply(friendAddApply);

            QByteArray body = notifyMessage.serialize(&serializer);
            socket->sendBinaryMessage(body);
            LOG() << "通知对方好友申请数据";
        });

        connect(this, &WebsocketServer::sendAddFriendProcess, this, [=](bool agree) {
            if (socket == nullptr || !socket->isValid()) {
                LOG() << "socket 对象无效!";
                return;
            }

            bite_im::NotifyMessage notifyMessage;
            notifyMessage.setNotifyEventId("");
            notifyMessage.setNotifyType(bite_im::NotifyTypeGadget::NotifyType::FRIEND_ADD_PROCESS_NOTIFY);

            QByteArray avatar = loadFileToByteArray(":/resource/image/defaultAvatar.png");
            bite_im::UserInfo userInfo = makeUserInfo(100, avatar);

            bite_im::NotifyFriendAddProcess friendAddProcess;
            friendAddProcess.setUserInfo(userInfo);
            friendAddProcess.setAgree(agree);

            notifyMessage.setFriendProcessResult(friendAddProcess);

            QByteArray body = notifyMessage.serialize(&serializer);
            socket->sendBinaryMessage(body);
            LOG() << "通知好友申请的处理结果 userId=" << userInfo.userId() << ", agree=" << agree;
        });

        connect(this, &WebsocketServer::sendCreateChatSession, this, [=]() {
            if (socket == nullptr || !socket->isValid()) {
                LOG() << "socket 对象无效!";
                return;
            }

            QByteArray avatar = loadFileToByteArray(":/resource/image/groupAvatar.png");

            bite_im::NotifyMessage notifyMessage;
            notifyMessage.setNotifyEventId("");
            notifyMessage.setNotifyType(bite_im::NotifyTypeGadget::NotifyType::CHAT_SESSION_CREATE_NOTIFY);

            bite_im::MessageInfo messageInfo = makeTextMessageInfo(0, "2100", avatar);

            bite_im::ChatSessionInfo chatSessionInfo;
            chatSessionInfo.setChatSessionId("2100");
            chatSessionInfo.setSingleChatFriendId("");
            chatSessionInfo.setChatSessionName("新的群聊");
            chatSessionInfo.setPrevMessage(messageInfo);
            chatSessionInfo.setAvatar(avatar);

            bite_im::NotifyNewChatSession newChatSession;
            newChatSession.setChatSessionInfo(chatSessionInfo);
            notifyMessage.setNewChatSessionInfo(newChatSession);

            // 序列化操作
            QByteArray body = notifyMessage.serialize(&serializer);

            // 通过 websocket 推送数据
            socket->sendBinaryMessage(body);
            LOG() << "通知创建会话!";
        });
    });

    // 2. 绑定端口, 启动服务
    bool ok = websocketServer.listen(QHostAddress::Any, 8001);
    return ok;
}











