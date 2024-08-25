#ifndef SERVER_H
#define SERVER_H

#include <QObject>
#include <QHttpServer>
#include <QProtobufSerializer>
#include <QWebSocketServer>
#include <QFileInfo>
#include <QFile>
#include <QPixmap>
#include <QIcon>

//////////////////////////////////////////////////////
/// 工具函数. 后续很多模块可能都要用到
//////////////////////////////////////////////////////

static inline QString getFileName(const QString& path) {
    QFileInfo fileInfo(path);
    return fileInfo.fileName();
}

// 封装一个 "宏" 作为打印日志的方式.
#define TAG QString("[%1:%2]").arg(getFileName(__FILE__), QString::number(__LINE__))
// #define TAG "[" << __LINE__ << "]"

// qDebug 打印字符串的时候, 就会自动加上 " "
#define LOG() qDebug().noquote() << TAG

// 要求函数的定义如果写在 .h 中, 必须加 static 或者 inline (当然两个都加也可以), 避免链接阶段出现 "函数重定义" 的问题.
static inline QString formatTime(int64_t timestamp) {
    // 先把时间戳, 转换成 QDateTime 对象
    QDateTime dateTime = QDateTime::fromSecsSinceEpoch(timestamp);
    // 把 QDateTime 对象转成 "格式化时间"
    return dateTime.toString("MM-dd HH:mm:ss");
}

// 通过这个函数得到 秒级 的时间
static inline int64_t getTime() {
    return QDateTime::currentSecsSinceEpoch();
}

// 根据 QByteArray, 转成 QIcon
static inline QIcon makeIcon(const QByteArray& byteArray) {
    QPixmap pixmap;
    pixmap.loadFromData(byteArray);
    QIcon icon(pixmap);
    return icon;
}

// 读写文件操作.
// 从指定文件中, 读取所有的二进制内容. 得到一个 QByteArray
static inline QByteArray loadFileToByteArray(const QString& path) {
    QFile file(path);
    bool ok = file.open(QFile::ReadOnly);
    if (!ok) {
        LOG() << "文件打开失败!";
        return QByteArray();
    }
    QByteArray content = file.readAll();
    file.close();
    return content;
}

// 把 QByteArray 中的内容, 写入到某个指定文件里
static inline void writeByteArrayToFile(const QString& path, const QByteArray& content) {
    QFile file(path);
    bool ok = file.open(QFile::WriteOnly);
    if (!ok) {
        LOG() << "文件打开失败!";
        return;
    }
    file.write(content);
    file.flush();
    file.close();
}


//////////////////////////////////////////////////////////////////
/// HTTP 服务器
//////////////////////////////////////////////////////////////////

class HttpServer : public QObject {
    Q_OBJECT

private:
    static HttpServer* instance;
    HttpServer() {}

    QHttpServer httpServer;
    QProtobufSerializer serializer;

public:
    static HttpServer* getInstance();

    // 通过这个函数, 针对 HTTP Server 进行初始化 (绑定端口, 配置路由....)
    bool init();

    // 获取个人用户信息
    QHttpServerResponse getUserInfo(const QHttpServerRequest& req);
    // 获取好友列表
    QHttpServerResponse getFriendList(const QHttpServerRequest& req);
    // 获取会话列表
    QHttpServerResponse getChatSessionList(const QHttpServerRequest& req);
    // 获取好友申请列表
    QHttpServerResponse getApplyList(const QHttpServerRequest& req);
    // 获取指定会话的最近消息列表
    QHttpServerResponse getRecent(const QHttpServerRequest& req);
    // 处理发送消息
    QHttpServerResponse newMessage(const QHttpServerRequest& req);
    // 修改用户昵称
    QHttpServerResponse setNickname(const QHttpServerRequest& req);
    // 修改用户签名
    QHttpServerResponse setDesc(const QHttpServerRequest& req);
    // 获取短信验证码
    QHttpServerResponse getPhoneVerifyCode(const QHttpServerRequest& req);
    // 修改手机号
    QHttpServerResponse setPhone(const QHttpServerRequest& req);
    // 修改头像
    QHttpServerResponse setAvatar(const QHttpServerRequest& req);
    // 删除好友
    QHttpServerResponse removeFriend(const QHttpServerRequest& req);
    // 添加好友申请
    QHttpServerResponse addFriendApply(const QHttpServerRequest& req);
    // 添加好友申请的处理
    QHttpServerResponse addFriendProcess(const QHttpServerRequest& req);
    // 创建会话
    QHttpServerResponse createChatSession(const QHttpServerRequest& req);
    // 获取会话成员列表
    QHttpServerResponse getChatSessionMember(const QHttpServerRequest& req);
    // 搜索好友
    QHttpServerResponse searchFriend(const QHttpServerRequest& req);
    // 搜索历史消息
    QHttpServerResponse searchHistory(const QHttpServerRequest& req);
    // 按时间搜索历史消息
    QHttpServerResponse getHistory(const QHttpServerRequest& req);
    // 基于用户名密码登录
    QHttpServerResponse usernameLogin(const QHttpServerRequest& req);
    // 基于用户名密码注册
    QHttpServerResponse usernameRegister(const QHttpServerRequest& req);
    // 手机号登录
    QHttpServerResponse phoneLogin(const QHttpServerRequest& req);
    // 手机号注册
    QHttpServerResponse phoneRegister(const QHttpServerRequest& req);
    // 获取单个文件
    QHttpServerResponse getSingleFile(const QHttpServerRequest& req);
    // 语音转文字
    QHttpServerResponse recognition(const QHttpServerRequest& req);
};

//////////////////////////////////////////////////////////////////
/// Websocket 服务器
//////////////////////////////////////////////////////////////////

class WebsocketServer : public QObject {
    Q_OBJECT

private:
    static WebsocketServer* instance;
    WebsocketServer() : websocketServer("websocket server", QWebSocketServer::NonSecureMode) {}

    QWebSocketServer websocketServer;
    QProtobufSerializer serializer;

    int messageIndex = 0;

public:
    static WebsocketServer* getInstance();

    bool init();

signals:
    void sendTextResp();
    void sendImageResp();
    void sendFileResp();
    void sendSpeechResp();
    void sendFriendRemove();
    void sendAddFriendApply();
    void sendAddFriendProcess(bool agree);
    void sendCreateChatSession();
};


#endif // SERVER_H








