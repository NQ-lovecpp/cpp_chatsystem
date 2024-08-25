#pragma once

#include <QString>
#include <QIcon>
#include <QUuid>
#include <QDateTime>
#include <QFile>
#include <QFileInfo>
#include <QDebug>

#include "base.qpb.h"
#include "gateway.qpb.h"
#include "user.qpb.h"
#include "friend.qpb.h"
#include "file.qpb.h"
#include "notify.qpb.h"
#include "speech_recognition.qpb.h"
#include "message_storage.qpb.h"
#include "message_transmit.qpb.h"

// 创建命名空间
namespace model {

//////////////////////////////////////////////////////
/// 工具函数. 后续很多模块可能都要用到
//////////////////////////////////////////////////////

static inline QString getFileName(const QString& path) {
    QFileInfo fileInfo(path);
    return fileInfo.fileName();
}

// 封装一个 "宏" 作为打印日志的方式.
#define TAG QString("[%1:%2]").arg(model::getFileName(__FILE__), QString::number(__LINE__))
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

//////////////////////////////////////////////////////
/// 用户信息
//////////////////////////////////////////////////////

class UserInfo {
public:
    QString userId = "";			// 用户编号
    QString nickname = "";			// 用户昵称
    QString description = ""; 		// 用户签名
    QString phone = "";				// 手机号码
    QIcon avatar;					// 用户头像

    // 从 protobuffer 的 UserInfo 对象, 转成当前代码的 UserInfo 对象
    void load(const bite_im::UserInfo& userInfo) {
        this->userId = userInfo.userId();
        this->nickname = userInfo.nickname();
        this->phone = userInfo.phone();
        this->description = userInfo.description();
        if (userInfo.avatar().isEmpty()) {
            // 使用默认头像即可
            this->avatar = QIcon(":/resource/image/defaultAvatar.png");
        } else {
            this->avatar = makeIcon(userInfo.avatar());
        }
    }
};

//////////////////////////////////////////////////////
/// 消息信息
//////////////////////////////////////////////////////

enum MessageType {
    TEXT_TYPE,		// 文本消息
    IMAGE_TYPE, 	// 图片消息
    FILE_TYPE, 		// 文件消息
    SPEECH_TYPE 	// 语音消息
};

class Message {
public:
    QString messageId = "";				// 消息的编号
    QString chatSessionId = "";			// 消息所属会话的编号
    QString time = "";					// 消息的时间. 通过 "格式化" 时间的方式来表示. 形如 06-07 12:00:00
    MessageType messageType = TEXT_TYPE;// 消息类型
    UserInfo sender;					// 发送者的信息
    QByteArray content;					// 消息的正文内容
    QString fileId = "";				// 文件的身份标识. 当消息类型为 文件, 图片, 语音 的时候, 才有效. 当消息类型为 文本, 则为 ""
    QString fileName = ""; 				// 文件名称. 只是当消息类型为 文件 消息, 才有效. 其他消息均为 ""

    // 此处 extraInfo 目前只是在消息类型为文件消息时, 作为 "文件名" 补充.
    static Message makeMessage(MessageType messageType, const QString& chatSessionId, const UserInfo& sender,
                               const QByteArray& content, const QString& extraInfo) {
        if (messageType == TEXT_TYPE) {
            return makeTextMessage(chatSessionId, sender, content);
        } else if (messageType == IMAGE_TYPE) {
            return makeImageMessage(chatSessionId, sender, content);
        } else if (messageType == FILE_TYPE) {
            return makeFileMessage(chatSessionId, sender, content, extraInfo);
        } else if (messageType == SPEECH_TYPE) {
            return makeSpeechMessage(chatSessionId, sender, content);
        } else {
            // 触发了未知的消息类型
            return Message();
        }
    }

    void load(const bite_im::MessageInfo& messageInfo) {
        this->messageId = messageInfo.messageId();
        this->chatSessionId = messageInfo.chatSessionId();
        this->time = formatTime(messageInfo.timestamp());
        this->sender.load(messageInfo.sender());

        // 设置消息类型
        auto type = messageInfo.message().messageType();
        if (type == bite_im::MessageTypeGadget::MessageType::STRING) {
            this->messageType = TEXT_TYPE;
            this->content = messageInfo.message().stringMessage().content().toUtf8();
        } else if (type == bite_im::MessageTypeGadget::MessageType::IMAGE) {
            this->messageType = IMAGE_TYPE;
            if (messageInfo.message().imageMessage().hasImageContent()) {
                this->content = messageInfo.message().imageMessage().imageContent();
            }
            if (messageInfo.message().imageMessage().hasFileId()) {
                this->fileId = messageInfo.message().imageMessage().fileId();
            }
        } else if (type == bite_im::MessageTypeGadget::MessageType::FILE) {
            this->messageType = FILE_TYPE;
            if (messageInfo.message().fileMessage().hasFileContents()) {
                this->content = messageInfo.message().fileMessage().fileContents();
            }
            if (messageInfo.message().fileMessage().hasFileId()) {
                this->fileId = messageInfo.message().fileMessage().fileId();
            }
            this->fileName = messageInfo.message().fileMessage().fileName();
        } else if (type == bite_im::MessageTypeGadget::MessageType::SPEECH) {
            this->messageType = SPEECH_TYPE;
            if (messageInfo.message().speechMessage().hasFileContents()) {
                this->content = messageInfo.message().speechMessage().fileContents();
            }
            if (messageInfo.message().speechMessage().hasFileId()) {
                this->fileId = messageInfo.message().speechMessage().fileId();
            }
        } else {
            // 错误的类型, 啥都不做了, 只是打印一个日志
            LOG() << "非法的消息类型! type=" << type;
        }
    }

private:
    // 通过这个方法生成唯一的 messageId
    static QString makeId() {
        return "M" + QUuid::createUuid().toString().sliced(25, 12);
    }

    static Message makeTextMessage(const QString& chatSessionId, const UserInfo& sender, const QByteArray& content) {
        Message message;
        // 此处需要确保, 设置的 messageId 是 "唯一" 的
        message.messageId = makeId();
        message.chatSessionId = chatSessionId;
        message.sender = sender;
        message.time = formatTime(getTime()); // 生成一个格式化时间
        message.content = content;
        message.messageType = TEXT_TYPE;
        // 对于文本消息来说, 这俩属性不使用, 设为 ""
        message.fileId = "";
        message.fileName = "";
        return message;
    }

    static Message makeImageMessage(const QString& chatSessionId, const UserInfo& sender, const QByteArray& content) {
        Message message;
        message.messageId = makeId();
        message.chatSessionId = chatSessionId;
        message.sender = sender;
        message.time = formatTime(getTime());
        message.content = content;
        message.messageType = IMAGE_TYPE;
        // fileId 后续使用的时候再进一步设置
        message.fileId = "";
        // fileName 不使用, 直接设为 ""
        message.fileName = "";
        return message;
    }

    static Message makeFileMessage(const QString& chatSessionId, const UserInfo& sender, const QByteArray& content, const QString& fileName) {
        Message message;
        message.messageId = makeId();
        message.chatSessionId = chatSessionId;
        message.sender = sender;
        message.time = formatTime(getTime());
        message.content = content;
        message.messageType = FILE_TYPE;
        // fileId 后续使用的时候进一步设置
        message.fileId = "";
        message.fileName = fileName;
        return message;
    }

    static Message makeSpeechMessage(const QString& chatSessionId, const UserInfo& sender, const QByteArray& content) {
        Message message;
        message.messageId = makeId();
        message.chatSessionId = chatSessionId;
        message.sender = sender;
        message.time = formatTime(getTime());
        message.content = content;
        message.messageType = SPEECH_TYPE;
        // fileId 后续使用的时候进一步设置
        message.fileId = "";
        // fileName 不使用, 直接设为 ""
        message.fileName = "";
        return message;
    }
};

//////////////////////////////////////////////////////
/// 会话信息
//////////////////////////////////////////////////////

class ChatSessionInfo {
public:
    QString chatSessionId = "";	  		// 会话编号
    QString chatSessionName = "";		// 会话名字, 如果会话是单聊, 名字就是对方的昵称; 如果是群聊, 名字就是群聊的名称.
    Message lastMessage;				// 表示最新的消息.
    QIcon avatar;						// 会话头像. 如果会话是单聊, 头像就是对方的头像; 如果是群聊, 头像群聊的头像.
    QString userId = "";				// 对于单聊来说, 表示对方的用户 id, 对于群聊设为 ""

    void load(const bite_im::ChatSessionInfo& chatSessionInfo) {
        this->chatSessionId = chatSessionInfo.chatSessionId();
        this->chatSessionName = chatSessionInfo.chatSessionName();
        if (chatSessionInfo.hasSingleChatFriendId()) {
            this->userId = chatSessionInfo.singleChatFriendId();
        }
        if (chatSessionInfo.hasPrevMessage()) {
            lastMessage.load(chatSessionInfo.prevMessage());
        }
        if (chatSessionInfo.hasAvatar() && !chatSessionInfo.avatar().isEmpty()) {
            // 已经有头像了, 直接设置这个头像
            this->avatar = makeIcon(chatSessionInfo.avatar());
        } else {
            // 如果没有头像, 则根据当前会话是单聊还是群聊, 使用不同的默认头像.
            if (userId != "") {
                // 单聊
                this->avatar = QIcon(":/resource/image/defaultAvatar.png");
            } else {
                // 群聊
                this->avatar = QIcon(":/resource/image/groupAvatar.png");
            }
        }
    }
};


}  // end model
