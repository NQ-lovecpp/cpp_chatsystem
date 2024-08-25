#ifndef NETCLIENT_H
#define NETCLIENT_H

#include <QObject>
#include <QNetworkAccessManager>
#include <QWebSocket>
#include <QProtobufSerializer>
#include <QNetworkReply>

#include "../model/data.h"

// 此处为了避免 "循环包含" 问题, 就需要使用 前置声明 代替包含头文件
namespace model {
    class DataCenter;

}  // end model

namespace network {

class NetClient : public QObject
{
    Q_OBJECT
private:
    // 定义重要常量. ip 都暂时使用本地的环回 ip. 端口号约定成 8000 和 8001
    const QString HTTP_URL = "http://127.0.0.1:8000";
    const QString WEBSOCKET_URL = "ws://127.0.0.1:8001/ws";

public:
    NetClient(model::DataCenter* dataCenter);

    // 验证网络联通
    void ping();

    // 初始化 websocket
    void initWebsocket();

    // 针对 websocket 的处理
    void handleWsResponse(const bite_im::NotifyMessage& notifyMessage);
    void handleWsMessage(const model::Message& message);
    void handleWsRemoveFriend(const QString& userId);
    void handleWsAddFriendApply(const model::UserInfo& userInfo);
    void handleWsAddFriendProcess(const model::UserInfo& userInfo, bool agree);
    void handleWsSessionCreate(const model::ChatSessionInfo& chatSessionInfo);

    // 发送身份认证请求
    void sendAuth();

    // 生成请求 id
    static QString makeRequestId();

    // 封装发送请求的逻辑
    QNetworkReply* sendHttpRequest(const QString& apiPath, const QByteArray& body);

    // 封装处理响应的逻辑(包括判定 HTTP 正确性, 反序列化, 判定业务上的正确性)
    // 由于不同的 api, 返回的 pb 对象结构, 不同, 为了让一个函数能处理多种不同类型, 需要使用 模板.
    // 通过输出型参数, 表示这次操作是成功还是失败, 以及失败的原因.
    template <typename T>
    std::shared_ptr<T> handleHttpResponse(QNetworkReply* httpResp, bool* ok, QString* reason) {
        // 1. 判定 HTTP 层面上, 是否出错
        if (httpResp->error() != QNetworkReply::NoError) {
            *ok = false;
            *reason = httpResp->errorString();
            httpResp->deleteLater();
            return std::shared_ptr<T>();
        }

        // 2. 获取到响应的 body
        QByteArray respBody = httpResp->readAll();

        // 3. 针对 body 反序列化
        std::shared_ptr<T> respObj = std::make_shared<T>();
        respObj->deserialize(&serializer, respBody);

        // 4. 判定业务上的结果是否正确
        if (!respObj->success()) {
            *ok = false;
            *reason = respObj->errmsg();
            httpResp->deleteLater();
            return std::shared_ptr<T>();
        }

        // 5. 释放 httpResp 对象
        httpResp->deleteLater();
        *ok = true;
        return respObj;
    }

    void getMyself(const QString& loginSessionId);
    void getFriendList(const QString& loginSessionId);
    void getChatSessionList(const QString& loginSessionId);
    void getApplyList(const QString& loginSessionId);
    void getRecentMessageList(const QString& loginSessionId, const QString& chatSessionId, bool updateUI);
    void sendMessage(const QString& loginSessionId, const QString& chatSessionId, model::MessageType messageType,
                     const QByteArray& content, const QString& extraInfo);
    void receiveMessage(const QString& chatSessionId);
    void changeNickname(const QString& loginSessionId, const QString& nickname);
    void changeDescription(const QString& loginSessionId, const QString& desc);
    void getVerifyCode(const QString& phone);
    void changePhone(const QString& loginSessionId, const QString& phone, const QString& verifyCodeId, const QString& verifyCode);
    void changeAvatar(const QString& loginSessionId, const QByteArray& avatar);
    void deleteFriend(const QString& loginSessionId, const QString& userId);
    void addFriendApply(const QString& loginSessionId, const QString& userId);
    void acceptFriendApply(const QString& loginSessionId, const QString& userId);
    void rejectFriendApply(const QString& loginSessionId, const QString& userId);
    void createGroupChatSession(const QString& loginSessionId, const QList<QString>& userIdList);
    void getMemberList(const QString& loginSessionId, const QString& chatSessionId);
    void searchUser(const QString& loginSessionId, const QString& searchKey);
    void searchMessage(const QString& loginSessionId, const QString& chatSessionId, const QString& searchKey);
    void searchMessageByTime(const QString& loginSessionId, const QString& chatSessionId, const QDateTime& begTime, const QDateTime& endTime);
    void userLogin(const QString& username, const QString& password);
    void userRegister(const QString& username, const QString& password);
    void phoneLogin(const QString& phone, const QString& verifyCodeId, const QString& verifyCode);
    void phoneRegister(const QString& phone, const QString& verifyCodeId, const QString& verifyCode);
    void getSingleFile(const QString& loginSessionId, const QString& fileId);
    void speechConvertText(const QString& loginSessionId, const QString& fileId, const QByteArray& content);

private:
    model::DataCenter* dataCenter;

    // http 客户端
    QNetworkAccessManager httpClient;

    // websocket 客户端
    QWebSocket websocketClient;

    // 序列化器
    QProtobufSerializer serializer;

signals:
};

}  // end network

#endif // NETCLIENT_H
