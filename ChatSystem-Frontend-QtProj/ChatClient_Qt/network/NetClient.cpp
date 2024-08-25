#include "netclient.h"

#include <QNetworkReply>
#include <QUuid>

#include "../model/data.h"
#include "../model/datacenter.h"

using namespace model;


namespace network {

NetClient::NetClient(model::DataCenter *dataCenter)
    : dataCenter(dataCenter)
{
    // 不应该在这个环节, 初始化 websocket, 放到 MainWidget 初始化的时候
    // initWebsocket();
}

void NetClient::ping()
{
    QNetworkRequest httpReq;
    httpReq.setUrl(QUrl(HTTP_URL + "/ping"));

    QNetworkReply* httpResp = httpClient.get(httpReq);
    connect(httpResp, &QNetworkReply::finished, this, [=]() {
        // 这里面, 说明响应已经回来了.
        if (httpResp->error() != QNetworkReply::NoError) {
            // 请求失败!
            LOG() << "HTTP 请求失败! " << httpResp->errorString();
            httpResp->deleteLater();
            return;
        }
        // 获取到响应的 body
        QByteArray body = httpResp->readAll();
        LOG() << "响应内容: " << body;
        httpResp->deleteLater();
    });
}

/////////////////////////////////////////////////////////////////////////////////
/// 下列逻辑都是 Websocket 相关的操作
/////////////////////////////////////////////////////////////////////////////////

void NetClient::initWebsocket()
{
    // 1. 准备好所有需要的信号槽
    connect(&websocketClient, &QWebSocket::connected, this, [=]() {
        LOG() << "websocket 连接成功!";
        // 不要忘记! 在 websocket 连接成功之后, 发送身份认证消息!
        sendAuth();
    });

    connect(&websocketClient, &QWebSocket::disconnected, this, [=]() {
        LOG() << "websocket 连接断开!";
    });

    connect(&websocketClient, &QWebSocket::errorOccurred, this, [=](QAbstractSocket::SocketError error) {
        LOG() << "websocket 连接出错!" << error;
    });

    connect(&websocketClient, &QWebSocket::textMessageReceived, this, [=](const QString& message) {
        LOG() << "websocket 收到文本消息!" << message;
    });

    connect(&websocketClient, &QWebSocket::binaryMessageReceived, this, [=](const QByteArray& byteArray) {
        LOG() << "websocket 收到二进制消息!" << byteArray.length();
        bite_im::NotifyMessage notifyMessage;
        notifyMessage.deserialize(&serializer, byteArray);
        handleWsResponse(notifyMessage);
    });

    // 2. 和服务器真正建立连接
    websocketClient.open(WEBSOCKET_URL);
}

void NetClient::handleWsResponse(const bite_im::NotifyMessage &notifyMessage)
{
    if (notifyMessage.notifyType() == bite_im::NotifyTypeGadget::NotifyType::CHAT_MESSAGE_NOTIFY) {
        // 收到消息
        // 1. 把 pb 中的 MessageInfo 转成客户端自己的 Message
        Message message;
        message.load(notifyMessage.newMessageInfo().messageInfo());
        // 2. 针对自己的 message 做进一步的处理
        handleWsMessage(message);
    } else if (notifyMessage.notifyType() == bite_im::NotifyTypeGadget::NotifyType::CHAT_SESSION_CREATE_NOTIFY) {
        // 创建新的会话通知
        ChatSessionInfo chatSessionInfo;
        chatSessionInfo.load(notifyMessage.newChatSessionInfo().chatSessionInfo());
        handleWsSessionCreate(chatSessionInfo);
    } else if (notifyMessage.notifyType() == bite_im::NotifyTypeGadget::NotifyType::FRIEND_ADD_APPLY_NOTIFY) {
        // 添加好友申请通知
        UserInfo userInfo;
        userInfo.load(notifyMessage.friendAddApply().userInfo());
        handleWsAddFriendApply(userInfo);
    } else if (notifyMessage.notifyType() == bite_im::NotifyTypeGadget::NotifyType::FRIEND_ADD_PROCESS_NOTIFY) {
        // 添加好友申请的处理结果通知
        UserInfo userInfo;
        userInfo.load(notifyMessage.friendProcessResult().userInfo());
        bool agree = notifyMessage.friendProcessResult().agree();
        handleWsAddFriendProcess(userInfo, agree);
    } else if (notifyMessage.notifyType() == bite_im::NotifyTypeGadget::NotifyType::FRIEND_REMOVE_NOTIFY) {
        // 删除好友通知
        const QString& userId = notifyMessage.friendRemove().userId();
        handleWsRemoveFriend(userId);
    }
}

void NetClient::handleWsMessage(const model::Message &message)
{
    // 这里要考虑两个情况
    QList<Message>* messageList = dataCenter->getRecentMessageList(message.chatSessionId);
    if (messageList == nullptr) {
        // 1. 如果当前这个消息所属的会话, 里面的消息列表, 没有在本地加载, 此时就需要通过网络先加载整个消息列表.
        connect(dataCenter, &DataCenter::getRecentMessageListDoneNoUI, this, &NetClient::receiveMessage, Qt::UniqueConnection);
        dataCenter->getRecentMessageListAsync(message.chatSessionId, false);
    } else {
        // 2. 如果当前这个消息所属的会话, 里面的消息已经在本地加载了, 直接把这个消息尾插到消息列表中即可.
        messageList->push_back(message);
        this->receiveMessage(message.chatSessionId);
    }
}

void NetClient::handleWsRemoveFriend(const QString &userId)
{
    // 1. 删除数据. DataCenter 好友列表的数据
    dataCenter->removeFriend(userId);
    // 2. 通知界面变化. 更新 好友列表 / 会话列表
    emit dataCenter->deleteFriendDone();
}

void NetClient::handleWsAddFriendApply(const model::UserInfo &userInfo)
{
    // 1. DataCenter 中有一个 好友申请列表. 需要把这个数据添加到好友申请列表中
    QList<UserInfo>* applyList = dataCenter->getApplyList();
    if (applyList == nullptr) {
        LOG() << "客户端没有加载到好友申请列表!";
        return;
    }
    // 把新的元素放到列表前面
    applyList->push_front(userInfo);

    // 2. 通知界面更新.
    emit dataCenter->receiveFriendApplyDone();
}

void NetClient::handleWsAddFriendProcess(const model::UserInfo &userInfo, bool agree)
{
    if (agree) {
        // 对方同意了你的好友申请
        QList<UserInfo>* friendList = dataCenter->getFriendList();
        if (friendList == nullptr) {
            LOG() << "客户端没有加载好友列表";
            return;
        }
        friendList->push_front(userInfo);

        // 同时也更新一下界面
        emit dataCenter->receiveFriendProcessDone(userInfo.nickname, agree);
    } else {
        // 对方未同意好友申请
        emit dataCenter->receiveFriendProcessDone(userInfo.nickname, agree);
    }
}

void NetClient::handleWsSessionCreate(const model::ChatSessionInfo& chatSessionInfo) {
    // 把这个 ChatSessionInfo 添加到会话列表中即可
    QList<ChatSessionInfo>* chatSessionList = dataCenter->getChatSessionList();
    if (chatSessionList == nullptr) {
        LOG() << "客户端没有加载会话列表";
        return;
    }
    // 新的元素添加到列表头部.
    chatSessionList->push_front(chatSessionInfo);
    // 发送一个信号, 通知界面更新
    emit dataCenter->receiveSessionCreateDone();
}

void NetClient::sendAuth()
{
    bite_im::ClientAuthenticationReq req;
    req.setRequestId(makeRequestId());
    req.setSessionId(dataCenter->getLoginSessionId());
    QByteArray body = req.serialize(&serializer);
    websocketClient.sendBinaryMessage(body);
    LOG() << "[WS身份认证] requestId=" << req.requestId() << ", loginSessionId=" << req.sessionId();
}

/////////////////////////////////////////////////////////////////////////////////
/// 下列逻辑都是 HTTP 相关的操作
/////////////////////////////////////////////////////////////////////////////////

QString NetClient::makeRequestId()
{
    // 基本要求, 确保每个请求的 id 都是不重复(唯一的)
    // 通过 UUID 来实现上述效果.
    return "R" + QUuid::createUuid().toString().sliced(25, 12);
}

// 通过这个函数, 把发送 HTTP 请求操作封装一下.
QNetworkReply *NetClient::sendHttpRequest(const QString &apiPath, const QByteArray &body)
{
    QNetworkRequest httpReq;
    httpReq.setUrl(QUrl(HTTP_URL + apiPath));
    httpReq.setHeader(QNetworkRequest::ContentTypeHeader, "application/x-protobuf");

    QNetworkReply* httpResp = httpClient.post(httpReq, body);
    return httpResp;
}

// 在这个函数内部, 完成具体的网络通信即可
void NetClient::getMyself(const QString &loginSessionId)
{
    // 1. 构造出 HTTP 请求 body 部分
    bite_im::GetUserInfoReq req;
    req.setRequestId(makeRequestId());
    req.setSessionId(loginSessionId);
    QByteArray body = req.serialize(&serializer);
    LOG() << "[获取个人信息] 发送请求 requestId=" << req.requestId() << ", loginSessionId=" << loginSessionId;

    // 2. 构造出 HTTP 请求, 并发送出去.
    QNetworkReply* httpResp = sendHttpRequest("/service/user/get_user_info", body);

    // 3. 通过信号槽, 获取到当前的响应. finished 信号表示响应已经返回到客户端了.
    connect(httpResp, &QNetworkReply::finished, this, [=]() {
        // a) 先处理响应对象
        bool ok = false;
        QString reason;
        auto resp = handleHttpResponse<bite_im::GetUserInfoRsp>(httpResp, &ok, &reason);

        // b) 判定响应是否正确
        if (!ok) {
            LOG() << "[获取个人信息] 出错! requestId=" << req.requestId() << "reason=" << reason;
            return;
        }

        // c) 把响应的数据, 保存到 DataCenter 中
        dataCenter->resetMyself(resp);

        // d) 通知调用逻辑, 响应已经处理完了. 仍然通过信号槽, 通知.
        emit dataCenter->getMyselfDone();

        // e) 打印日志.
        LOG() << "[获取个人信息] 处理响应 requestId=" << req.requestId();
    });
}

void NetClient::getFriendList(const QString& loginSessionId)
{
    // 1. 通过 protobuf 构造 body
    bite_im::GetFriendListReq req;
    req.setRequestId(makeRequestId());
    req.setSessionId(loginSessionId);
    QByteArray body = req.serialize(&serializer);
    LOG() << "[获取好友列表] 发送请求 requestId=" << req.requestId() << ", loginSessionId=" << loginSessionId;

    // 2. 发送 HTTP 请求
    QNetworkReply* httpResp = this->sendHttpRequest("/service/friend/get_friend_list", body);

    // 3. 处理响应
    connect(httpResp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto friendListResp = this->handleHttpResponse<bite_im::GetFriendListRsp>(httpResp, &ok, &reason);

        // b) 判定响应是否正确
        if (!ok) {
            LOG() << "[获取好友列表] 失败! requestId=" << req.requestId() << ", reason=" << reason;
            return;
        }

        // c) 把结果保存在 DataCenter 中
        dataCenter->resetFriendList(friendListResp);

        // d) 发送信号, 通知界面, 当前这个操作完成了.
        emit dataCenter->getFriendListDone();

        // e) 打印日志.
        LOG() << "[获取好友列表] 处理响应 requestId=" << req.requestId();
    });
}

void NetClient::getChatSessionList(const QString &loginSessionId)
{
    // 1. 通过 protobuf 构造 body
    bite_im::GetChatSessionListReq req;
    req.setRequestId(makeRequestId());
    req.setSessionId(loginSessionId);
    QByteArray body = req.serialize(&serializer);
    LOG() << "[获取会话列表] 发送请求 requestId=" << req.requestId() << ", loginSessionId=" << loginSessionId;

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/friend/get_chat_session_list", body);

    // 3. 针对响应进行处理
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::GetChatSessionListRsp>(resp, &ok, &reason);

        // b) 判定响应是否正确
        if (!ok) {
            LOG() << "[获取会话列表] 失败! reason=" << reason;
            return;
        }

        // c) 把得到的数据, 写入到 DataCenter 里
        dataCenter->resetChatSessionList(pbResp);

        // d) 通知调用者, 此处响应处理完毕
        emit dataCenter->getChatSessionListDone();

        // e) 打印日志
        LOG() << "[获取会话列表] 处理响应完毕! requestId=" << pbResp->requestId();
    });
}

void NetClient::getApplyList(const QString &loginSessionId)
{
    // 1. 通过 protobuf 构造 body
    bite_im::GetPendingFriendEventListReq req;
    req.setRequestId(makeRequestId());
    req.setSessionId(loginSessionId);
    QByteArray body = req.serialize(&serializer);
    LOG() << "[获取好友申请列表] 发送请求 requestId=" << req.requestId() << ", loginSessionId=" << loginSessionId;

    // 2. 发送 http 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/friend/get_pending_friend_events", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::GetPendingFriendEventListRsp>(resp, &ok, &reason);

        // b) 判定结果是否出错
        if (!ok) {
            LOG() << "[获取好友申请列表] 失败! reason=" << reason;
            return;
        }

        // c) 拿到的数据, 写入到 DataCenter 中
        dataCenter->resetApplyList(pbResp);

        // d) 通知界面, 处理完毕
        emit dataCenter->getApplyListDone();

        // e) 打印日志
        LOG() << "[获取好友申请列表] 处理响应完成! requestId=" << req.requestId();
    });
}

void NetClient::getRecentMessageList(const QString &loginSessionId, const QString &chatSessionId, bool updateUI)
{
    // 1. 通过 protobuf 构造请求 body
    bite_im::GetRecentMsgReq req;
    req.setRequestId(makeRequestId());
    req.setChatSessionId(chatSessionId);
    req.setMsgCount(50);	// 此处固定获取最近 50 条记录
    req.setSessionId(loginSessionId);
    QByteArray body = req.serialize(&serializer);
    LOG() << "[获取最近消息] 发送请求 requestId=" << req.requestId() << ", loginSessionId=" << loginSessionId << ", chatSessionId=" << chatSessionId;

    // 2. 发送 http 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/message_storage/get_recent", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应, 反序列化
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::GetRecentMsgRsp>(resp, &ok, &reason);

        // b) 判定响应是否出错
        if (!ok) {
            LOG() << "[获取最近消息] 失败! reason=" << reason;
            return;
        }

        // c) 把拿到的数据, 设置到 DataCenter 中
        dataCenter->resetRecentMessageList(chatSessionId, pbResp);

        // d) 发送信号, 告知界面进行更新
        if (updateUI) {
            emit dataCenter->getRecentMessageListDone(chatSessionId);
        } else {
            emit dataCenter->getRecentMessageListDoneNoUI(chatSessionId);
        }
    });
}

// 此处的 extraInfo, 可以用来传递 "扩展信息" . 尤其是对于文件消息来说, 通过这个字段表示 "文件名"
// 其他类型的消息暂时不涉及, 就直接设为 "". 如果后续有消息类型需要, 都可以给这个参数, 赋予一定的特殊含义.
void NetClient::sendMessage(const QString &loginSessionId, const QString &chatSessionId, MessageType messageType,
                            const QByteArray &content, const QString& extraInfo)
{
    // 1. 通过 protobuf 构造 body
    bite_im::NewMessageReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setChatSessionId(chatSessionId);

    // 构造 MessageContent
    bite_im::MessageContent messageContent;
    if (messageType == MessageType::TEXT_TYPE) {
        messageContent.setMessageType(bite_im::MessageTypeGadget::MessageType::STRING);

        bite_im::StringMessageInfo stringMessageInfo;
        stringMessageInfo.setContent(content);
        messageContent.setStringMessage(stringMessageInfo);
    } else if (messageType == MessageType::IMAGE_TYPE) {
        messageContent.setMessageType(bite_im::MessageTypeGadget::MessageType::IMAGE);

        bite_im::ImageMessageInfo imageMessageInfo;
        imageMessageInfo.setFileId("");			// fileId 是文件在服务器存储的时候, 生成的 id, 此时还无法获取到, 暂时填成 ""
        imageMessageInfo.setImageContent(content);
        messageContent.setImageMessage(imageMessageInfo);
    } else if (messageType == MessageType::FILE_TYPE) {
        messageContent.setMessageType(bite_im::MessageTypeGadget::MessageType::FILE);

        bite_im::FileMessageInfo fileMessageInfo;
        fileMessageInfo.setFileId(""); 			// fileId 是文件在服务器存储的时候, 生成的 id, 此时还无法获取到, 暂时填成 ""
        fileMessageInfo.setFileSize(content.size());
        fileMessageInfo.setFileName(extraInfo);
        fileMessageInfo.setFileContents(content);
        messageContent.setFileMessage(fileMessageInfo);
    } else if (messageType == MessageType::SPEECH_TYPE) {
        messageContent.setMessageType(bite_im::MessageTypeGadget::MessageType::SPEECH);

        bite_im::SpeechMessageInfo speechMessageInfo;
        speechMessageInfo.setFileId(""); 			// fileId 是文件在服务器存储的时候, 生成的 id, 此时还无法获取到, 暂时填成 ""
        speechMessageInfo.setFileContents(content);
        messageContent.setSpeechMessage(speechMessageInfo);
    } else {
        LOG() << "错误的消息类型! messageType=" << messageType;
    }
    pbReq.setMessage(messageContent);

    // 序列化
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[发送消息] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", chatSessionId=" << pbReq.chatSessionId() << ", messageType=" << pbReq.message().messageType();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/message_transmit/new_message", body);

    // 3. 处理 HTTP 响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 针对响应结果进行解析
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::NewMessageRsp>(resp, &ok, &reason);

        // b) 判定响应是否正确
        if (!ok) {
            LOG() << "[发送消息] 处理出错! reason=" << reason;
            return;
        }

        // c) 此处只是需要记录 "成功失败" , 不需要把内容写入到 DataCenter 中.

        // d) 通知调用者, 响应处理完毕
        emit dataCenter->sendMessageDone(messageType, content, extraInfo);

        // e) 打印日志
        LOG() << "[发送消息] 响应处理完毕! requestId=" << pbResp->requestId();
    });
}

void NetClient::receiveMessage(const QString &chatSessionId)
{
    // 先需要判定一下, 当前这个收到的消息对应的会话, 是否是正在被用户选中的 "当前会话"
    // 当前会话, 就需要把消息, 显示到消息展示区, 也需要更新会话列表的消息预览
    // 不是当前会话, 只需要更新会话列表中的消息预览, 并且更新 "未读消息数目"
    if (chatSessionId == dataCenter->getCurrentChatSessionId()) {
        // 收到的消息会话, 就是选中会话
        // 在消息展示区, 新增一个消息
        const Message& lastMessage = dataCenter->getRecentMessageList(chatSessionId)->back();
        // 通过信号, 让 NetClient 模块, 能够通知界面(消息展示区)
        emit dataCenter->receiveMessageDone(lastMessage);
    } else {
        // 收到的消息会话, 不是选中会话
        // 更新未读消息数目
        dataCenter->addUnread(chatSessionId);
    }
    // 统一更新会话列表的消息预览
    emit dataCenter->updateLastMessage(chatSessionId);
}

void NetClient::changeNickname(const QString &loginSessionId, const QString &nickname)
{
    // 1. 通过 protobuf 构造请求 body
    bite_im::SetUserNicknameReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setNickname(nickname);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[修改用户昵称] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", nickname=" << pbReq.nickname();

    // 2. 发送 http 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/user/set_nickname", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::SetUserNicknameRsp>(resp, &ok, &reason);

        // b) 判定是否出错
        if (!ok) {
            LOG() << "[修改用户昵称] 出错! reason=" << reason;
            return;
        }

        // c) 把数据设置到 DataCenter 里面. 这里的处理和前面不太一样.
        dataCenter->resetNickname(nickname);

        // d) 发送信号, 通知调用者, 这里处理完毕
        emit dataCenter->changeNicknameDone();

        // e) 打印日志
        LOG() << "[修改用户昵称] 处理响应完毕! requestId=" << pbResp->requestId();
    });
}

void NetClient::changeDescription(const QString &loginSessionId, const QString &desc)
{
    // 1. 通过 protobuf 构造请求 body
    bite_im::SetUserDescriptionReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setDescription(desc);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[修改签名] 发送请求 requestId=" << pbReq.requestId() << ", loginSessisonId=" << pbReq.sessionId()
          << ", desc=" << pbReq.description();

    // 2. 发送 http 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/user/set_description", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::SetUserDescriptionRsp>(resp, &ok, &reason);

        // b) 判定响应是否成功
        if (!ok) {
            LOG() << "[修改签名] 响应失败! reason=" << reason;
            return;
        }

        // c) 把得到的结果, 写入 DataCenter
        dataCenter->resetDescription(desc);

        // d) 发送信号, 通知修改完成
        emit dataCenter->changeDescriptionDone();

        // e) 打印日志
        LOG() << "[修改签名] 响应完成! requestId=" << pbResp->requestId();
    });
}

void NetClient::getVerifyCode(const QString &phone)
{
    // 1. 构造请求 body
    bite_im::PhoneVerifyCodeReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setPhoneNumber(phone);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[获取手机验证码] 发送请求 requestId=" << pbReq.requestId() << ", phone=" << phone;

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/user/get_phone_verify_code", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::PhoneVerifyCodeRsp>(resp, &ok, &reason);

        // b) 判定响应是否成功
        if (!ok) {
            LOG() << "[获取手机验证码] 失败! reason=" << reason;
            return;
        }

        // c) 保存数据到 DataCenter
        dataCenter->resetVerifyCodeId(pbResp->verifyCodeId());

        // d) 发送信号, 通知调用者
        emit dataCenter->getVerifyCodeDone();

        // e) 打印日志
        LOG() << "[获取手机验证码] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::changePhone(const QString &loginSessionId, const QString &phone, const QString &verifyCodeId, const QString &verifyCode)
{
    // 1. 构造请求 body
    bite_im::SetUserPhoneNumberReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setPhoneNumber(phone);
    pbReq.setPhoneVerifyCodeId(verifyCodeId);
    pbReq.setPhoneVerifyCode(verifyCode);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[修改手机号] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", phone=" << pbReq.phoneNumber() << ", verifyCodeId=" << pbReq.phoneVerifyCodeId() << ", verifyCode=" << pbReq.phoneVerifyCode();

    // 2. 发送 http 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/user/set_phone", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::SetUserPhoneNumberRsp>(resp, &ok, &reason);

        // b) 判定响应是否正确
        if (!ok) {
            LOG() << "[修改手机号] 响应失败! reason=" << reason;
            return;
        }

        // c) 把结果记录到 DataCenter 中
        dataCenter->resetPhone(phone);

        // d) 发送信号, 通知调用者完成
        emit dataCenter->changePhoneDone();

        // e) 打印日志
        LOG() << "[修改手机号] 相应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::changeAvatar(const QString &loginSessionId, const QByteArray &avatar)
{
    // 1. 构造请求 body
    bite_im::SetUserAvatarReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setAvatar(avatar);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[修改头像] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/user/set_avatar", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::SetUserAvatarRsp>(resp, &ok, &reason);

        // b) 判定响应结果是否正确
        if (!ok) {
            LOG() << "[修改头像] 响应出错! reason=" << reason;
            return;
        }

        // c) 把数据设置到 DataCenter 中
        dataCenter->resetAvatar(avatar);

        // d) 发送信号
        emit dataCenter->changeAvatarDone();

        // e) 打印日志
        LOG() << "[修改头像] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::deleteFriend(const QString &loginSessionId, const QString &userId)
{
    // 1. 构造请求 body
    bite_im::FriendRemoveReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setPeerId(userId);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[删除好友] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", peerId=" << pbReq.peerId();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/friend/remove_friend", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::FriendRemoveRsp>(resp, &ok, &reason);

        // b) 判定响应结果
        if (!ok) {
            LOG() << "[删除好友] 响应失败! reason=" << reason;
            return;
        }

        // c) 把结果写入 DataCenter. 把该删除的用户, 从好友列表中, 删除掉.
        dataCenter->removeFriend(userId);

        // d) 发送信号, 通知调用者当前好友删除完毕.
        emit dataCenter->deleteFriendDone();

        // e) 打印日志
        LOG() << "[删除好友] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::addFriendApply(const QString &loginSessionId, const QString &userId)
{
    // 1. 构造请求 body
    bite_im::FriendAddReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setRespondentId(userId);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[添加好友申请] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", userId=" << userId;

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/friend/add_friend_apply", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::FriendAddRsp>(resp, &ok, &reason);

        // b) 判定响应是否正确
        if (!ok) {
            LOG() << "[添加好友申请] 响应失败! reason=" << reason;
            return;
        }

        // c) 记录结果到 DataCenter, 此处不需要记录任何数据

        // d) 发送信号, 通知调用者
        emit dataCenter->addFriendApplyDone();

        // e) 打印日志
        LOG() << "[添加好友申请] 响应完毕 requestId=" << pbResp->requestId();
    });
}

void NetClient::acceptFriendApply(const QString &loginSessionId, const QString &userId)
{
    // 1. 构造请求 body
    bite_im::FriendAddProcessReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setAgree(true);
    pbReq.setApplyUserId(userId);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[同意好友申请] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", userId=" << pbReq.applyUserId();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/friend/add_friend_process", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::FriendAddRsp>(resp, &ok, &reason);

        // b) 判定响应结果是否正确
        if (!ok) {
            LOG() << "[同意好友申请] 处理失败! reason=" << reason;
            return;
        }

        // c) 此处做一个好友列表的更新
        //    一个是把数据从好友申请列表中, 删除掉
        //    另一个是把好友申请列表中的这个数据添加到好友列表中.
        UserInfo applyUser = dataCenter->removeFromApplyList(userId);
        QList<UserInfo>* friendList = dataCenter->getFriendList();
        friendList->push_front(applyUser);

        // d) 发送信号, 通知界面进行更新
        emit dataCenter->acceptFriendApplyDone();

        // e) 打印日志
        LOG() << "[同意好友申请] 响应完成! requestId=" << pbResp->requestId();
    });
}

void NetClient::rejectFriendApply(const QString &loginSessionId, const QString &userId)
{
    // 1. 构造请求 body
    bite_im::FriendAddProcessReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setAgree(false);
    pbReq.setApplyUserId(userId);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[拒绝好友申请] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", userId=" << pbReq.applyUserId();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/friend/add_friend_process", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::FriendAddRsp>(resp, &ok, &reason);

        // b) 判定响应结果是否正确
        if (!ok) {
            LOG() << "[拒绝好友申请] 处理失败! reason=" << reason;
            return;
        }

        // c) 此处不需要更新好友列表, 需要把这个记录从好友申请列表中, 删除掉.
        dataCenter->removeFromApplyList(userId);

        // d) 发送信号, 通知界面进行更新
        emit dataCenter->rejectFriendApplyDone();

        // e) 打印日志
        LOG() << "[拒绝好友申请] 响应完成! requestId=" << pbResp->requestId();
    });
}

void NetClient::createGroupChatSession(const QString &loginSessionId, const QList<QString> &userIdList)
{
    // 1. 构造请求 body
    bite_im::ChatSessionCreateReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setChatSessionName("新的群聊");
    pbReq.setMemberIdList(userIdList);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[创建群聊会话] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << loginSessionId
          << ", userIdList=" << userIdList;

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/friend/create_chat_session", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::ChatSessionCreateRsp>(resp, &ok, &reason);

        // b) 判定结果是否正确
        if (!ok) {
            LOG() << "[创建群聊会话] 响应失败! reason=" << reason;
            return;
        }

        // c) 往 DataCenter 存储数据. 由于此处创建好的会话, 是 websocket 推送过来的.
        //    在这里无需更新 DataCenter. 后续通过 websocket 的逻辑来更新即可.

        // d) 通知调用者, 响应处理完毕了
        emit dataCenter->createGroupChatSessionDone();

        // e) 打印日志
        LOG() << "[创建群聊会话] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::getMemberList(const QString &loginSessionId, const QString &chatSessionId)
{
    // 1. 构造请求 body
    bite_im::GetChatSessionMemberReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setChatSessionId(chatSessionId);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[获取会话成员列表] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", chatSessionId=" << pbReq.chatSessionId();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/friend/get_chat_session_member", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::GetChatSessionMemberRsp>(resp, &ok, &reason);

        // b) 判定响应结果是否正确
        if (!ok) {
            LOG() << "[获取会话成员列表] 响应失败 reason=" << reason;
            return;
        }

        // c) 把结果记录到 DataCenter
        dataCenter->resetMemberList(chatSessionId, pbResp->memberInfoList());

        // d) 发送信号
        emit dataCenter->getMemberListDone(chatSessionId);

        // e) 打印日志
        LOG() << "[获取会话成员列表] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::searchUser(const QString &loginSessionId, const QString &searchKey)
{
    // 1. 构造请求 body
    bite_im::FriendSearchReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setSearchKey(searchKey);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[搜索用户] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << loginSessionId
          << ", searchKey=" << searchKey;

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/friend/search_friend", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::FriendSearchRsp>(resp, &ok, &reason);

        // b) 判定响应成功
        if (!ok) {
            LOG() << "[搜索用户] 响应失败 reason=" << reason;
            return;
        }

        // c) 把得到的结果, 记录到 DataCenter
        dataCenter->resetSearchUserResult(pbResp->userInfo());

        // d) 发送信号, 通知调用者
        emit dataCenter->searchUserDone();

        // e) 打印日志
        LOG() << "[搜索用户] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::searchMessage(const QString &loginSessionId, const QString &chatSessionId, const QString &searchKey)
{
    // 1. 构造请求 body
    bite_im::MsgSearchReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setChatSessionId(chatSessionId);
    pbReq.setSearchKey(searchKey);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[按关键词搜索历史消息] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << pbReq.sessionId()
          << ", chatSessionId=" << pbReq.chatSessionId() << ", searchKey=" << searchKey;

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/message_storage/search_history", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::MsgSearchRsp>(resp, &ok, &reason);

        // b) 判定响应是否正确
        if (!ok) {
            LOG() << "[按关键词搜索历史消息] 响应失败! reason=" << reason;
            return;
        }

        // c) 把响应结果写入到 DataCenter
        dataCenter->resetSearchMessageResult(pbResp->msgList());

        // d) 发送信号
        emit dataCenter->searchMessageDone();

        // e) 打印日志
        LOG() << "[按关键词搜索历史消息] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::searchMessageByTime(const QString &loginSessionId, const QString &chatSessionId, const QDateTime &begTime, const QDateTime &endTime)
{
    // 1. 构造请求 body
    bite_im::GetHistoryMsgReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setChatSessionId(chatSessionId);
    pbReq.setStartTime(begTime.toSecsSinceEpoch());
    pbReq.setOverTime(endTime.toSecsSinceEpoch());
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[按时间搜索历史消息] 发送请求 requestId=" << pbReq.requestId() << ", loginSessionId=" << loginSessionId
          << ", chatSessionId=" << chatSessionId << ", begTime=" << begTime << ", endTime=" << endTime;

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/message_storage/get_history", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::GetHistoryMsgRsp>(resp, &ok, &reason);

        // b) 判定响应结果是否正确
        if (!ok) {
            LOG() << "[按时间搜索历史消息] 响应失败! reason=" << reason;
            return;
        }

        // c) 把响应结果记录到 DataCenter 中
        dataCenter->resetSearchMessageResult(pbResp->msgList());

        // d) 发送信号通知调用者
        emit dataCenter->searchMessageDone();

        // e) 打印日志
        LOG() << "[按时间搜索历史消息] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::userLogin(const QString &username, const QString &password)
{
    // 1. 构造请求 body
    bite_im::UserLoginReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setNickname(username);
    pbReq.setPassword(password);
    pbReq.setVerifyCodeId("");
    pbReq.setVerifyCode("");
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[用户名登录] 发送请求 requestId=" << pbReq.requestId() << ", username=" << pbReq.nickname() << ", password=" << pbReq.password();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/user/username_login", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应内容
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::UserLoginRsp>(resp, &ok, &reason);

        // b) 判定响应结果是否正确
        if (!ok) {
            LOG() << "[用户名登录] 处理失败 reason=" << reason;
            emit dataCenter->userLoginDone(false, reason);
            return;
        }

        // c) 记录一下当前返回的数据
        dataCenter->resetLoginSessionId(pbResp->loginSessionId());

        // d) 发送信号, 通知调用者, 处理完毕了.
        emit dataCenter->userLoginDone(true, "");

        // e) 打印日志
        LOG() << "[用户名登录] 处理响应 requestId=" << pbResp->requestId();
    });
}

void NetClient::userRegister(const QString &username, const QString &password)
{
    // 1. 构造请求 body
    bite_im::UserRegisterReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setNickname(username);
    pbReq.setPassword(password);
    pbReq.setVerifyCodeId("");
    pbReq.setVerifyCode("");
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[用户名注册] 发送请求 requestId=" << pbReq.requestId() << ", username=" << pbReq.nickname() << ", password=" << pbReq.password();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/user/username_register", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应 body
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::UserRegisterRsp>(resp, &ok, &reason);

        // b) 判定响应结果是否正确
        if (!ok) {
            LOG() << "[用户名注册] 响应失败! reason=" << reason;
            emit dataCenter->userRegisterDone(false, reason);
            return;
        }

        // c) 把返回的数据保存到 DataCenter 中
        // 对于注册来说, 不需要保存任何信息, 直接跳过这个环节.

        // d) 通知调用者响应处理完成
        emit dataCenter->userRegisterDone(true, "");

        // e) 打印日志
        LOG() << "[用户名注册] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::phoneLogin(const QString &phone, const QString &verifyCodeId, const QString &verifyCode)
{
    // 1. 构造请求 body
    bite_im::PhoneLoginReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setPhoneNumber(phone);
    pbReq.setVerifyCodeId(verifyCodeId);
    pbReq.setVerifyCode(verifyCode);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[手机号登录] 发送请求 requestId=" << pbReq.requestId() << ", phone=" << pbReq.phoneNumber()
          << ", verifyCodeId=" << pbReq.verifyCodeId() << ", verifyCode=" << pbReq.verifyCode();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/user/phone_login", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::PhoneLoginRsp>(resp, &ok, &reason);

        // b) 判定响应是否成功
        if (!ok) {
            LOG() << "[手机号登录] 响应出错! reason=" << reason;
            emit dataCenter->phoneLoginDone(false, reason);
            return;
        }

        // c) 把响应结果记录到 DataCenter
        dataCenter->resetLoginSessionId(pbResp->loginSessionId());

        // d) 发送信号
        emit dataCenter->phoneLoginDone(true, "");

        // e) 打印日志
        LOG() << "[手机号登录] 响应完毕 requestId=" << pbResp->requestId();
    });
}

void NetClient::phoneRegister(const QString& phone, const QString& verifyCodeId, const QString& verifyCode) {
    // 1. 构造请求 body
    bite_im::PhoneRegisterReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setPhoneNumber(phone);
    pbReq.setVerifyCodeId(verifyCodeId);
    pbReq.setVerifyCode(verifyCode);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[手机号注册] 发送请求 requestId=" << pbReq.requestId() << ", phone=" << pbReq.phoneNumber()
          << ", verifyCodeId=" << pbReq.verifyCodeId() << ", verifyCode=" << pbReq.verifyCode();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/user/phone_register", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::PhoneRegisterRsp>(resp, &ok, &reason);

        // b) 判定响应是否成功
        if (!ok) {
            LOG() << "[手机号注册] 响应失败! reason=" << reason;
            emit dataCenter->phoneRegisterDone(false, reason);
            return;
        }

        // c) 让 DataCenter 记录结果, 注册操作不需要记录

        // d) 发送信号
        emit dataCenter->phoneRegisterDone(true, "");

        // e) 打印日志
        LOG() << "[手机号注册] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::getSingleFile(const QString &loginSessionId, const QString &fileId)
{
    // 1. 构造请求 body
    bite_im::GetSingleFileReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setFileId(fileId);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[获取文件内容] 发送请求 requestId=" << pbReq.requestId() << ", fileId=" << fileId;

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/file/get_single_file", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::GetSingleFileRsp>(resp, &ok, &reason);

        // b) 判定响应结果
        if (!ok) {
            LOG() << "[获取文件内容] 响应失败 reason=" << reason;
            return;
        }

        // c) 响应结果保存下来. 之前都是把结果保存到 DataCenter 的.
        //    这里涉及到的文件可能会很多. 不使用 DataCenter 保存.
        //    直接通过信号把文件数据, 投送到调用者的位置上.

        // d) 发送信号
        emit dataCenter->getSingleFileDone(fileId, pbResp->fileData().fileContent());

        // e) 打印日志
        LOG() << "[获取文件内容] 响应完成 requestId=" << pbResp->requestId();
    });
}

void NetClient::speechConvertText(const QString &loginSessionId, const QString &fileId, const QByteArray &content)
{
    // 1. 构造请求 body
    bite_im::SpeechRecognitionReq pbReq;
    pbReq.setRequestId(makeRequestId());
    pbReq.setSessionId(loginSessionId);
    pbReq.setSpeechContent(content);
    QByteArray body = pbReq.serialize(&serializer);
    LOG() << "[语音转文字] 发送请求 requestId=" << pbReq.requestId() << ", loginSessonId=" << pbReq.sessionId();

    // 2. 发送 HTTP 请求
    QNetworkReply* resp = this->sendHttpRequest("/service/speech/recognition", body);

    // 3. 处理响应
    connect(resp, &QNetworkReply::finished, this, [=]() {
        // a) 解析响应
        bool ok = false;
        QString reason;
        auto pbResp = this->handleHttpResponse<bite_im::SpeechRecognitionRsp>(resp, &ok, &reason);

        // b) 判定响应结果
        if (!ok) {
            LOG() << "[语音转文字] 响应错误! reason=" << reason;
            return;
        }

        // c) 把结果写入到 DataCenter 中. 此处不打算通过 DataCenter 表示这里的语音识别结果. 直接通过 信号 通知结果即可.

        // d) 发送信号, 通知调用者
        emit dataCenter->speechConvertTextDone(fileId, pbResp->recognitionResult());

        // e) 打印日志
        LOG() << "[语音转文字] 响应完成 requestId=" << pbResp->requestId();
    });
}

}  // end network















