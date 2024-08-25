#include "messageeditarea.h"
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QScrollBar>
#include <QFileDialog>

#include "historymessagewidget.h"
#include "soundrecorder.h"
#include "mainwidget.h"
#include "model/datacenter.h"
#include "toast.h"

using namespace model;

MessageEditArea::MessageEditArea(QWidget *parent) : QWidget(parent)
{
    // 1. 设置必要的属性
    this->setFixedHeight(200);
    this->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);

    // 2. 创建垂直方向的布局管理器
    QVBoxLayout* vlayout = new QVBoxLayout();
    vlayout->setSpacing(0);
    vlayout->setContentsMargins(10, 0, 10, 10);
    this->setLayout(vlayout);

    // 3. 创建水平方向的布局管理器
    QHBoxLayout* hlayout = new QHBoxLayout();
    hlayout->setSpacing(0);
    hlayout->setContentsMargins(10, 0, 0, 0);
    hlayout->setAlignment(Qt::AlignLeft | Qt::AlignTop);
    vlayout->addLayout(hlayout);

    // 4. 把上方的四个按钮, 创建好并添加到水平布局中
    QString btnStyle = "QPushButton { background-color: rgb(245, 245, 245); border: none; } QPushButton:pressed { background-color: rgb(255, 255, 255); }";
    QSize btnSize(35, 35);
    QSize iconSize(25, 25);

    sendImageBtn = new QPushButton();
    sendImageBtn->setFixedSize(btnSize);
    sendImageBtn->setIconSize(iconSize);
    sendImageBtn->setIcon(QIcon(":/resource/image/image.png"));
    sendImageBtn->setStyleSheet(btnStyle);
    hlayout->addWidget(sendImageBtn);

    sendFileBtn = new QPushButton();
    sendFileBtn->setFixedSize(btnSize);
    sendFileBtn->setIconSize(iconSize);
    sendFileBtn->setIcon(QIcon(":/resource/image/file.png"));
    sendFileBtn->setStyleSheet(btnStyle);
    hlayout->addWidget(sendFileBtn);

    sendSpeechBtn = new QPushButton();
    sendSpeechBtn->setFixedSize(btnSize);
    sendSpeechBtn->setIconSize(iconSize);
    sendSpeechBtn->setIcon(QIcon(":/resource/image/sound.png"));
    sendSpeechBtn->setStyleSheet(btnStyle);
    hlayout->addWidget(sendSpeechBtn);

    showHistoryBtn = new QPushButton();
    showHistoryBtn->setFixedSize(btnSize);
    showHistoryBtn->setIconSize(iconSize);
    showHistoryBtn->setIcon(QIcon(":/resource/image/history.png"));
    showHistoryBtn->setStyleSheet(btnStyle);
    hlayout->addWidget(showHistoryBtn);

    // 5. 添加多行编辑框
    textEdit = new QPlainTextEdit();
    textEdit->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    textEdit->setStyleSheet("QPlainTextEdit { border: none; background-color: transparent; font-size: 14px; padding: 10px; }");
    textEdit->verticalScrollBar()->setStyleSheet("QScrollBar:vertical { width: 2px; background-color: rgb(45, 45, 45); }");
    vlayout->addWidget(textEdit);

    // 6. 添加提示 "录制中" 这样的 QLabel
    tipLabel = new QLabel();
    tipLabel->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    tipLabel->setText("录音中...");
    tipLabel->setAlignment(Qt::AlignCenter);
    tipLabel->setFont(QFont("微软雅黑", 24, 600));
    vlayout->addWidget(tipLabel);
    tipLabel->hide();

    // 7. 添加发送文本消息的按钮
    sendTextBtn = new QPushButton();
    sendTextBtn->setText("发送");
    sendTextBtn->setFixedSize(120, 40);
    QString style = "QPushButton { font-size: 16px; color: rgb(7, 193, 96); border: none; background-color: rgb(233, 233, 233); border-radius: 10px; } ";
    style += "QPushButton:hover { background-color: rgb(210, 210, 210); }";
    style += "QPushButton:pressed { background-color: rgb(190, 190, 190); }";
    sendTextBtn->setStyleSheet(style);
    vlayout->addWidget(sendTextBtn, 0, Qt::AlignRight | Qt::AlignVCenter);

    // 8. 统一初始化信号槽
    initSignalSlot();
}

void MessageEditArea::initSignalSlot()
{
    DataCenter* dataCenter = DataCenter::getInstance();

    // 1. 关联 "显示历史消息窗口" 信号槽
    connect(showHistoryBtn, &QPushButton::clicked, this, [=]() {
        if (dataCenter->getCurrentChatSessionId().isEmpty()) {
            return;
        }
        HistoryMessageWidget* historyMessageWidget = new HistoryMessageWidget(this);
        historyMessageWidget->exec();
    });

    // 2. 关联 "发送文本消息" 信号槽
    connect(sendTextBtn, &QPushButton::clicked, this, &MessageEditArea::sendTextMessage);
    connect(dataCenter, &DataCenter::sendMessageDone, this, &MessageEditArea::addSelfMessage);

    // 3. 关联 "收到消息" 信号槽
    connect(dataCenter, &DataCenter::receiveMessageDone, this, &MessageEditArea::addOtherMessage);

    // 4. 关联 "发送图片" 信号槽
    connect(sendImageBtn, &QPushButton::clicked, this, &MessageEditArea::clickSendImageBtn);

    // 5. 关联 "发送文件" 信号槽
    connect(sendFileBtn, &QPushButton::clicked, this, &MessageEditArea::clickSendFileBtn);

    // 6. 关联 "发送语音" 信号槽
    connect(sendSpeechBtn, &QPushButton::pressed, this, &MessageEditArea::soundRecordPressed);
    connect(sendSpeechBtn, &QPushButton::released, this, &MessageEditArea::soundRecordReleased);
    SoundRecorder* soundRecorder = SoundRecorder::getInstance();
    connect(soundRecorder, &SoundRecorder::soundRecordDone, this, &MessageEditArea::sendSpeech);
}

void MessageEditArea::sendTextMessage()
{
    // 1. 先确认当前是否有会话选中了. 如果没有会话被选中, 则啥都不做.
    DataCenter* dataCenter = DataCenter::getInstance();
    if (dataCenter->getCurrentChatSessionId().isEmpty()) {
        LOG() << "当前未选中任何会话, 不会发送消息!";
        // 上述日志, 只是在开发阶段能看到. 程序发布出去了, 此时就无法看到了.
        // 因此需要让普通用户, 也能看到 "提示"
        Toast::showMessage("当前未选中会话, 不发送任何消息!");
        return;
    }

    // 2. 获取到输入框的内容, 看输入框里是否有内容. 啥都没输入, 此时也不做任何操作.
    const QString& content = textEdit->toPlainText().trimmed();
    if (content.isEmpty()) {
        LOG() << "输入框为空";
        return;
    }

    // 3. 清空输入框已有内容
    textEdit->setPlainText("");

    // 4. 通过网络发送数据给服务器
    dataCenter->sendTextMessageAsync(dataCenter->getCurrentChatSessionId(), content);
}

// 针对自己发送消息的操作, 做处理. 把自己发的消息, 显示到界面上
void MessageEditArea::addSelfMessage(MessageType messageType, const QByteArray &content, const QString &extraInfo)
{
    DataCenter* dataCenter = DataCenter::getInstance();
    const QString& currentChatSessionId = dataCenter->getCurrentChatSessionId();

    // 1. 构造出一个消息对象
    Message message = Message::makeMessage(messageType, currentChatSessionId, *dataCenter->getMyself(), content, extraInfo);
    dataCenter->addMessage(message);

    // 2. 把这个新的消息, 显示到消息展示区
    MainWidget* mainWidget = MainWidget::getInstance();
    MessageShowArea* messageShowArea = mainWidget->getMessageShowArea();
    messageShowArea->addMessage(false, message);

    // 3. 控制消息显示区, 滚动条, 滚动到末尾.
    messageShowArea->scrollToEnd();

    // 4. 发送信号, 通知会话列表, 更新最后一条消息
    emit dataCenter->updateLastMessage(currentChatSessionId);
}

void MessageEditArea::addOtherMessage(const model::Message &message)
{
    // 1. 通过主界面, 拿到消息展示区.
    MainWidget* mainWidget = MainWidget::getInstance();
    MessageShowArea* messageShowArea = mainWidget->getMessageShowArea();

    // 2. 把收到的新的消息, 添加到消息展示区
    messageShowArea->addMessage(true, message);

    // 3. 控制消息展示区的滚动条, 把窗口滚动到末尾
    messageShowArea->scrollToEnd();

    // 4. 提示一个收到消息
    Toast::showMessage("收到新消息!");
}

void MessageEditArea::clickSendImageBtn()
{
    DataCenter* dataCenter = DataCenter::getInstance();
    // 1. 判定当前是否有选中的会话
    if (dataCenter->getCurrentChatSessionId().isEmpty()) {
        // 没有选中会话
        Toast::showMessage("您尚未选择任何会话, 不能发送图片!");
        return;
    }

    // 2. 弹出文件对话框
    QString filter = "Image Files (*.png *.jpg *.jpeg)";
    QString imagePath = QFileDialog::getOpenFileName(this, "选择图片", QDir::homePath(), filter);
    if (imagePath.isEmpty()) {
        LOG() << "用户取消选择图片";
        return;
    }

    // 3. 读取图片的内容
    QByteArray imageContent = loadFileToByteArray(imagePath);

    // 4. 发送请求
    dataCenter->sendImageMessageAsync(dataCenter->getCurrentChatSessionId(), imageContent);
}

void MessageEditArea::clickSendFileBtn()
{
    DataCenter* dataCenter = DataCenter::getInstance();
    // 1. 判定当前是否选中了会话.
    if (dataCenter->getCurrentChatSessionId().isEmpty()) {
        // 没有选中会话
        Toast::showMessage("您尚未选择任何会话, 不能发送文件!");
        return;
    }

    // 2. 弹出对话框, 选择文件.
    QString filter = "*";
    QString path = QFileDialog::getOpenFileName(this, "选择文件", QDir::homePath(), filter);
    if (path.isEmpty()) {
        // 如果用户弹框之后, 没有真正选择文件, 而是取消了. 返回值就是 ""
        LOG() << "用户取消选择文件";
        return;
    }

    // 3. 读取文件内容
    //    此处暂时不考虑大文件的情况
    //    比如有的文件, 几百 MB, 或者几个 GB.
    //    如果是针对大文件的话, 编写专门的网络通信接口, 实现 "分片传输" 效果.
    QByteArray content = loadFileToByteArray(path);

    // 4. 传输文件, 还需要获取到 文件名
    QFileInfo fileInfo(path);
    const QString& fileName = fileInfo.fileName();

    // 5. 发送消息
    dataCenter->sendFileMessageAsync(dataCenter->getCurrentChatSessionId(), fileName, content);
}

void MessageEditArea::soundRecordPressed()
{
    // 判定当前是否选中会话.
    DataCenter* dataCenter = DataCenter::getInstance();
    if (dataCenter->getCurrentChatSessionId().isEmpty()) {
        LOG() << "未选中任何会话, 不能发送语音消息";
        return;
    }

    // 切换语音按钮的图标
    sendSpeechBtn->setIcon(QIcon(":/resource/image/sound_active.png"));

    // 开始录音
    SoundRecorder* soundRecorder = SoundRecorder::getInstance();
    soundRecorder->startRecord();

    tipLabel->show();
    textEdit->hide();
}

void MessageEditArea::soundRecordReleased()
{
    // 判定当前是否选中会话.
    DataCenter* dataCenter = DataCenter::getInstance();
    if (dataCenter->getCurrentChatSessionId().isEmpty()) {
        LOG() << "未选中任何会话, 不能发送语音消息";
        return;
    }

    // 切换语音按钮的图标
    sendSpeechBtn->setIcon(QIcon(":/resource/image/sound.png"));

    // 停止录音
    SoundRecorder* soundRecorder = SoundRecorder::getInstance();
    soundRecorder->stopRecord();

    tipLabel->hide();
    textEdit->show();
}

void MessageEditArea::sendSpeech(const QString &path)
{
    DataCenter* dataCenter = DataCenter::getInstance();
    // 1. 读取到语音文件的内容
    QByteArray content = loadFileToByteArray(path);
    if (content.isEmpty()) {
        LOG() << "语音文件加载失败";
        return;
    }
    dataCenter->sendSpeechMessageAsync(dataCenter->getCurrentChatSessionId(), content);
}










