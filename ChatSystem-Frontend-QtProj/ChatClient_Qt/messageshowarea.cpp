#include "messageshowarea.h"

#include <QScrollBar>
#include <QVBoxLayout>
#include <QPushButton>
#include <QLabel>
#include <QFontMetrics>
#include <QPainter>
#include <QPainterPath>
#include <QFileDialog>
#include <QTimer>
#include <QMenu>

#include "mainwidget.h"
#include "soundrecorder.h"
#include "userinfowidget.h"
#include "toast.h"
#include "model/datacenter.h"
#include "debug.h"

using namespace model;

////////////////////////////////////////////////////////
/// 表示消息展示区
////////////////////////////////////////////////////////
MessageShowArea::MessageShowArea() {
    // 1. 初始化基本属性
    this->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    this->setWidgetResizable(true);
    // 设置滚动条的样式
    this->verticalScrollBar()->setStyleSheet("QScrollBar:vertical { width: 2px; background-color: rgb(240, 240, 240); }");
    this->horizontalScrollBar()->setStyleSheet("QScrollBar:horizontal { height: 0;}");
    this->setStyleSheet("QScrollArea { border: none; }");

    // 2. 创建 Container 这样的 widget, 作为包含内部元素的容器
    container = new QWidget();
    this->setWidget(container);

    // 3. 给 container 添加布局管理器
    QVBoxLayout* layout = new QVBoxLayout();
    layout->setSpacing(0);
    layout->setContentsMargins(0, 0, 0, 0);
    container->setLayout(layout);

    // 添加 "构造测试数据" 逻辑.
#if TEST_UI
    UserInfo userInfo;
    userInfo.userId = QString::number(1000);
    userInfo.nickname = "张三";
    userInfo.description = "从今天开始认真敲代码";
    userInfo.avatar = QIcon(":/resource/image/defaultAvatar.png");
    userInfo.phone = "18612345678";
    Message message = Message::makeMessage(TEXT_TYPE, "", userInfo, QString("这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息这是一条测试消息").toUtf8(), "");
    this->addMessage(false, message);

    for (int i = 1; i <= 30; ++i) {
        UserInfo userInfo;
        userInfo.userId = QString::number(1000 + i);
        userInfo.nickname = "张三" + QString::number(i);
        userInfo.description = "从今天开始认真敲代码";
        userInfo.avatar = QIcon(":/resource/image/defaultAvatar.png");
        userInfo.phone = "18612345678";
        Message message = Message::makeMessage(TEXT_TYPE, "", userInfo, (QString("这是一条测试消息") + QString::number(i)).toUtf8(), "");
        this->addMessage(true, message);
    }
#endif
}

void MessageShowArea::addMessage(bool isLeft, const Message &message)
{
    // 构造 MessageItem, 添加到布局管理器中.
    MessageItem* messageItem = MessageItem::makeMessageItem(isLeft, message);
    container->layout()->addWidget(messageItem);
}

void MessageShowArea::addFrontMessage(bool isLeft, const Message &message)
{
    MessageItem* messageItem = MessageItem::makeMessageItem(isLeft, message);
    QVBoxLayout* layout = dynamic_cast<QVBoxLayout*>(container->layout());
    layout->insertWidget(0, messageItem);
}

void MessageShowArea::clear()
{
    // 遍历布局管理器, 删除里面的元素
    QLayout* layout = container->layout();
    for (int i = layout->count() - 1; i >= 0; --i) {
        QLayoutItem* item = layout->takeAt(i);
        if (item != nullptr && item->widget() != nullptr) {
            delete item->widget();
        }
    }
}

void MessageShowArea::scrollToEnd()
{
    // 实现思路:
    // 拿到滚动区域中的滚动条(垂直滚动条)
    // 获取到滚动条的最大值
    // 根据最大值, 设置滚动条的滚动位置.
    // 为了使滚动效果更佳, 能够在界面绘制好之后进行滚动条的设置
    // 给这里的滚动操作, 加上个 "延时"

    QTimer* timer = new QTimer();
    connect(timer, &QTimer::timeout, this, [=]() {
        // 获取到垂直滚动条的最大值
        int maxValue = this->verticalScrollBar()->maximum();
        // 设置滚动条的滚动位置
        this->verticalScrollBar()->setValue(maxValue);

        timer->stop();
        timer->deleteLater();
    });
    timer->start(500);
}

////////////////////////////////////////////////////////
/// 表示一个消息元素
////////////////////////////////////////////////////////

MessageItem::MessageItem(bool isLeft) : isLeft(isLeft)
{

}

MessageItem *MessageItem::makeMessageItem(bool isLeft, const Message &message)
{
    // 1. 创建对象和布局管理器
    MessageItem* messageItem = new MessageItem(isLeft);
    QGridLayout* layout = new QGridLayout();
    layout->setContentsMargins(30, 10, 40, 0);
    layout->setSpacing(10);
    // 这个 MessageItem 最低不能低于 100
    messageItem->setMinimumHeight(100);
    messageItem->setLayout(layout);

    // 2. 创建头像
    QPushButton* avatarBtn = new QPushButton();
    avatarBtn->setFixedSize(40, 40);
    avatarBtn->setIconSize(QSize(40, 40));
    avatarBtn->setIcon(message.sender.avatar);
    avatarBtn->setStyleSheet("QPushButton { border: none;}");
    if (isLeft) {
        layout->addWidget(avatarBtn, 0, 0, 2, 1, Qt::AlignTop | Qt::AlignLeft);
    } else {
        layout->addWidget(avatarBtn, 0, 1, 2, 1, Qt::AlignTop | Qt::AlignLeft);
    }

    // 3. 创建名字和时间
    QLabel* nameLabel = new QLabel();
    nameLabel->setText(message.sender.nickname + " | " + message.time);
    nameLabel->setAlignment(Qt::AlignBottom);
    nameLabel->setStyleSheet("QLabel { font-size: 12px; color: rgb(178, 178, 178); }");
    if (isLeft) {
        layout->addWidget(nameLabel, 0, 1);
    } else {
        layout->addWidget(nameLabel, 0, 0, Qt::AlignRight);
    }

    // 4. 创建消息体
    QWidget* contentWidget = nullptr;
    switch (message.messageType) {
    case TEXT_TYPE:
        contentWidget = makeTextMessageItem(isLeft, message.content);
        break;
    case IMAGE_TYPE:
        contentWidget = makeImageMessageItem(isLeft, message.fileId, message.content);
        break;
    case FILE_TYPE:
        contentWidget = makeFileMessageItem(isLeft, message);
        break;
    case SPEECH_TYPE:
        contentWidget = makeSpeechMessageItem(isLeft, message);
        break;
    default:
        LOG() << "错误的消息类型! messageType=" << message.messageType;
    }
    if (isLeft) {
        layout->addWidget(contentWidget, 1, 1);
    } else {
        layout->addWidget(contentWidget, 1, 0);
    }

    // 5. 连接信号槽, 处理用户点击头像的操作
    connect(avatarBtn, &QPushButton::clicked, messageItem, [=]() {
        MainWidget* mainWidget = MainWidget::getInstance();
        UserInfoWidget* userInfoWidget = new UserInfoWidget(message.sender, mainWidget);
        userInfoWidget->exec();
    });

    // 6. 当用户修改了昵称的时候, 同步修改此处的用户昵称.
    if (!isLeft) {
        // 只是针对右侧消息(自己的消息) 做下列操作.
        DataCenter* dataCenter = DataCenter::getInstance();
        connect(dataCenter, &DataCenter::changeNicknameDone, messageItem, [=]() {
            nameLabel->setText(dataCenter->getMyself()->nickname + " | " + message.time);
        });

        connect(dataCenter, &DataCenter::changeAvatarDone, messageItem, [=]() {
            UserInfo* myself = dataCenter->getMyself();
            avatarBtn->setIcon(myself->avatar);
        });
    }

    return messageItem;
}

QWidget *MessageItem::makeTextMessageItem(bool isLeft, const QString& text)
{
    MessageContentLabel* messageContentLabel = new MessageContentLabel(text, isLeft, TEXT_TYPE, "", QByteArray());
    return messageContentLabel;
}

QWidget *MessageItem::makeImageMessageItem(bool isLeft, const QString& fileId, const QByteArray& content)
{
    MessageImageLabel* messageImageLabel = new MessageImageLabel(fileId, content, isLeft);
    return messageImageLabel;
}

QWidget *MessageItem::makeFileMessageItem(bool isLeft, const Message& message)
{
    MessageContentLabel* messageContentLabel = new MessageContentLabel("[文件] " + message.fileName, isLeft, message.messageType,
                                                                       message.fileId, message.content);
    return messageContentLabel;
}

QWidget *MessageItem::makeSpeechMessageItem(bool isLeft, const Message& message)
{
    MessageContentLabel* messageContentLabel = new MessageContentLabel("[语音]", isLeft, message.messageType,
                                                                       message.fileId, message.content);
    return messageContentLabel;
}

////////////////////////////////////////////////////////
/// 创建类表示 "文本消息" 正文部分
/// 也能表示文件消息
////////////////////////////////////////////////////////
MessageContentLabel::MessageContentLabel(const QString &text, bool isLeft, model::MessageType messageType, const QString& fileId,
        const QByteArray& content)
    : isLeft(isLeft), messageType(messageType), fileId(fileId), content(content)
{
    // 设置一下 SizePolicy
    this->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);

    QFont font;
    font.setFamily("微软雅黑");
    font.setPixelSize(16);

    this->label = new QLabel(this);
    this->label->setText(text);
    this->label->setFont(font);
    this->label->setAlignment(Qt::AlignVCenter | Qt::AlignLeft);
    this->label->setWordWrap(true);    // 设置文本自动换行
    this->label->setStyleSheet("QLabel { padding: 0 10px; line-height: 1.2; background-color: transparent; }");

    // 针对文件消息, 并且 content 为空的情况下, 通过网络来加载数据
    if (messageType == model::TEXT_TYPE) {
        return;
    }

    if (this->content.isEmpty()) {
        DataCenter* dataCenter = DataCenter::getInstance();
        connect(dataCenter, &DataCenter::getSingleFileDone, this, &MessageContentLabel::updateUI);
        dataCenter->getSingleFileAsync(this->fileId);
    } else {
        // content 不为空, 说明当前的这个数据就是已经现成. 直接就把 表示加载状态的变量设为 true
        this->loadContentDone = true;
    }
}

// 这个函数会该控件被显示的时候自动调用到.
void MessageContentLabel::paintEvent(QPaintEvent *event)
{
    (void) event;

    // 1. 获取到父元素的宽度
    QObject* object = this->parent();
    if (!object->isWidgetType()) {
        // 当前这个对象的父元素不是预期的 QWidget, 此时不需要进行任何后续的绘制操作.
        return;
    }
    QWidget* parent = dynamic_cast<QWidget*>(object);
    int width = parent->width() * 0.6;

    // 2. 计算当前文本, 如果是一行放置, 需要多宽.
    QFontMetrics metrics(this->label->font());
    int totalWidth = metrics.horizontalAdvance(this->label->text());

    // 3. 计算出此处的行数是多少 (40 表示左右各有 20px 的边距)
    int rows = (totalWidth / (width - 40)) + 1;
    if (rows == 1) {
        // 如果此时得到的行数就只有一行
        width = totalWidth + 40;
    }

    // 4. 根据行数, 计算得到高度. (20 表示上下各有 10px 的边距)
    int height = rows * (this->label->font().pixelSize() * 1.2 ) + 20;

    // 5. 绘制圆角矩形和箭头
    QPainter painter(this);
    QPainterPath path;
    // 设置 "抗锯齿"
    painter.setRenderHint(QPainter::Antialiasing);
    if (isLeft) {
        painter.setPen(QPen(QColor(255, 255, 255)));
        painter.setBrush(QColor(255, 255, 255));

        // 绘制圆角矩形
        painter.drawRoundedRect(10, 0, width, height, 10, 10);
        // 绘制箭头
        path.moveTo(10, 15);
        path.lineTo(0, 20);
        path.lineTo(10, 25);
        path.closeSubpath();   // 绘制的线形成闭合的多边形, 才能进行使用 Brush 填充颜色.
        painter.drawPath(path);  // 不要忘记真正的绘制操作

        this->label->setGeometry(10, 0, width, height);
    } else {
        painter.setPen(QPen(QColor(137, 217, 97)));
        painter.setBrush(QColor(137, 217, 97));

        // 圆角矩形左侧边的横坐标位置
        int leftPos = this->width() - width - 10; // 10 是用来容纳 箭头 的宽度
        // 圆角矩形右侧边的横坐标位置
        int rightPos = this->width() - 10;
        // 绘制圆角矩形
        painter.drawRoundedRect(leftPos, 0, width, height, 10, 10);
        // 绘制箭头
        path.moveTo(rightPos, 15);
        path.lineTo(rightPos + 10, 20);
        path.lineTo(rightPos, 25);
        path.closeSubpath();
        painter.drawPath(path);

        this->label->setGeometry(leftPos, 0, width, height);
    }

    // 6. 重新设置父元素的高度, 确保父元素足够高, 能够容纳下上述绘制的消息显示的区域
    //    注意高度要涵盖之前名字和时间的 label 的高度, 以及留点冗余空间.
    parent->setFixedHeight(height + 50);
}

void MessageContentLabel::mousePressEvent(QMouseEvent *event)
{
    // 实现鼠标点击之后, 触发文件另存为
    if (event->button() == Qt::LeftButton) {
        // 左键按下
        if (this->messageType == FILE_TYPE) {
            // 真正触发另存为
            if (!this->loadContentDone) {
                Toast::showMessage("数据尚未加载成功, 请稍后重试");
                return;
            }
            saveAsFile(this->content);
        } else if (this->messageType == SPEECH_TYPE) {
            if (!this->loadContentDone) {
                Toast::showMessage("数据尚未加载成功, 请稍后重试");
                return;
            }
            SoundRecorder* soundRecorder = SoundRecorder::getInstance();
            this->label->setText("播放中...");
            connect(soundRecorder, &SoundRecorder::soundPlayDone, this, &MessageContentLabel::playDone, Qt::UniqueConnection);
            soundRecorder->startPlay(this->content);
        } else {
            // 其他消息, 比如普通的文本消息
            // 啥都不做
        }
    }
}

void MessageContentLabel::updateUI(const QString &fileId, const QByteArray &fileContent)
{
    // 也和刚才图片消息的处理一样, 就需要判定收到的数据属于哪个 fileId 的.
    if (fileId != this->fileId) {
        return;
    }
    this->content = fileContent;
    this->loadContentDone = true;
    // 对于文件消息来说, 要在界面上显示 "[文件] test.txt" 这样形式. 这个内容和文件 content 无关.
    // 在从服务器拿到文件正文之前, 界面内容应该就是绘制好了. 此时拿到正文之后, 界面应该也不必做出任何实质性的调整.
    // 所以下列的 this->update(), 没有也行.
    this->update();
}

void MessageContentLabel::saveAsFile(const QByteArray &content)
{
    // 弹出对话框, 让用户选择路径
    QString filePath = QFileDialog::getSaveFileName(this, "另存为", QDir::homePath(), "*");
    if (filePath.isEmpty()) {
        LOG() << "用户取消了文件另存为";
        return;
    }
    writeByteArrayToFile(filePath, content);
}

void MessageContentLabel::playDone()
{
    if (this->label->text() == "播放中...") {
        this->label->setText("[语音]");
    }
}

void MessageContentLabel::contextMenuEvent(QContextMenuEvent *event)
{
    (void) event;
    if (messageType != SPEECH_TYPE) {
        LOG() << "非语音消息暂时不支持右键菜单";
        return;
    }

    QMenu* menu = new QMenu(this);
    QAction* action = menu->addAction("语音转文字");
    menu->setStyleSheet("QMenu { color: rgb(0, 0, 0); }");
    connect(action, &QAction::triggered, this, [=]() {
        DataCenter* dataCenter = DataCenter::getInstance();
        connect(dataCenter, &DataCenter::speechConvertTextDone, this, &MessageContentLabel::speechConvertTextDone, Qt::UniqueConnection);
        dataCenter->speechConvertTextAsync(this->fileId, this->content);
    });
    // 此处弹出 "模态对话框" 显示菜单/菜单项. exec 会在用户进一步操作之前, 阻塞.
    menu->exec(event->globalPos());
    delete menu;
}

void MessageContentLabel::speechConvertTextDone(const QString &fileId, const QString &text)
{
    if (this->fileId != fileId) {
        // 直接跳过, 此时的结果不是针对这一条语音消息的结果.
        return;
    }
    // 修改界面内容
    this->label->setText("[语音转文字] " + text);
    this->update();
}

////////////////////////////////////////////////////////
/// 创建类表示 "图片消息" 正文部分
////////////////////////////////////////////////////////
MessageImageLabel::MessageImageLabel(const QString &fileId, const QByteArray &content, bool isLeft)
    : fileId(fileId), content(content), isLeft(isLeft)
{
    this->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);

    imageBtn = new QPushButton(this);
    imageBtn->setStyleSheet("QPushButton { border: none; }");

    if (content.isEmpty()) {
        // 此处这个控件, 是针对 "从服务器拿到图片消息" 这种情况.
        // 拿着 fileId, 去服务器获取图片内容
        DataCenter* dataCenter = DataCenter::getInstance();
        connect(dataCenter, &DataCenter::getSingleFileDone, this, &MessageImageLabel::updateUI);
        dataCenter->getSingleFileAsync(fileId);
    }
}

void MessageImageLabel::updateUI(const QString& fileId, const QByteArray& content)
{
    if (this->fileId != fileId) {
        // 没对上 fileId, 当前响应的图片是其他的 图片消息 请求的.
        return;
    }
    // 对上了, 真正显示图片内容
    this->content = content;

    // 进行绘制图片到界面上的操作.
    this->update();
}

// 真正进行绘制图片到界面上的操作.
void MessageImageLabel::paintEvent(QPaintEvent *event)
{
    (void) event;
    // 1. 先拿到该元素的父元素, 看父元素的宽度是多少.
    //    此处显示的图片宽度的上限 父元素宽度的 60% .
    QObject* object = this->parent();
    if (!object->isWidgetType()) {
        // 这个逻辑理论上来说是不会存在的.
        return;
    }
    QWidget* parent = dynamic_cast<QWidget*>(object);
    int width = parent->width() * 0.6;

    // 2. 加载二进制数据为图片对象
    QImage image;
    if (content.isEmpty()) {
        // 此时图片的响应数据还没回来.
        // 此处先拿一个 "固定默认图片" 顶替一下.
        QByteArray tmpContent = loadFileToByteArray(":/resource/image/image.png");
        image.loadFromData(tmpContent);
    } else {
        // 此处的 load 操作 QImage 能够自动识别当前图片是啥类型的 (png, jpg....)
        image.loadFromData(content);
    }

    // 3. 针对图片进行缩放.
    int height = 0;
    if (image.width() > width) {
        // 发现图片更宽, 就需要把图片缩放一下, 使用 width 作为实际的宽度
        // 等比例缩放.
        height = ((double)image.height() / image.width()) * width;
    } else {
        // 图片本身不太宽, 不需要缩放.
        width = image.width();
        height = image.height();
    }

    // pixmap 只是一个中间变量. QImage 不能直接转成 QIcon, 需要 QPixmap 中转一下
    QPixmap pixmap = QPixmap::fromImage(image);
    // imageBtn->setFixedSize(width, height);
    imageBtn->setIconSize(QSize(width, height));
    imageBtn->setIcon(QIcon(pixmap));

    // 4. 由于图片高度是计算算出来的. 该元素的父对象的高度, 能够容纳下当前的元素.
    //    此处 + 50 是为了能够容纳下 上方的 "名字" 部分. 同时留下一点 冗余 空间.
    parent->setFixedHeight(height + 50);

    // 5. 确定按钮所在的位置.
    //    左侧消息, 和右侧消息, 要显示的位置是不同的.
    if (isLeft) {
        imageBtn->setGeometry(10, 0, width, height);
    } else {
        int leftPos = this->width() - width - 10;
        imageBtn->setGeometry(leftPos, 0, width, height);
    }
}





















