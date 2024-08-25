#include "sessionfriendarea.h"

#include <QScrollBar>
#include <QVBoxLayout>
#include <QPushButton>
#include <QLabel>
#include <QStyleOption>
#include <QPainter>

#include "model/data.h"
#include "model/datacenter.h"
#include "mainwidget.h"
#include "debug.h"

using namespace model;

SessionFriendArea::SessionFriendArea(QWidget *parent)
    : QScrollArea {parent}
{
    // 1. 设置必要的属性
    // 设置了这个属性, 才能够开启滚动效果
    this->setWidgetResizable(true);
    // 设置滚动条相关的样式
    this->verticalScrollBar()->setStyleSheet("QScrollBar:vertical { width: 2px; background-color: rgb(46, 46, 46);}");
    this->horizontalScrollBar()->setStyleSheet("QScrollBar:horizontal { height: 0px; }");
    this->setStyleSheet("QWidget { border: none;}");

    // 2. 把 widget 创建出来
    container = new QWidget();
    container->setFixedWidth(310);
    this->setWidget(container);

    // 3. 给这个 widget 指定布局管理器, 以便后续添加元素进去
    QVBoxLayout* layout = new QVBoxLayout();
    layout->setContentsMargins(0, 0, 0, 0);
    layout->setSpacing(0);
    layout->setAlignment(Qt::AlignTop);
    container->setLayout(layout);

    // 简单测试一下滚动的效果, 先去掉, 后续添加 Item
    // for (int i = 0; i < 50; ++i) {
    //     QPushButton* btn = new QPushButton();
    //     btn->setText("按钮");
    //     layout->addWidget(btn);
    // }

    // 构造出一些临时数据, 用来作为 "界面调试" 依据. 后续要删除掉
#if TEST_UI
    QIcon icon(":/resource/image/defaultAvatar.png");
    for (int i = 0; i < 30; ++i) {
        this->addItem(SessionItemType, QString::number(i), icon, "张三" + QString::number(i), "最后一条消息" + QString::number(i));
    }
#endif
}

void SessionFriendArea::clear()
{
    QLayout* layout = container->layout();
    // 遍历布局管理器中的所有元素, 并依次从布局管理器中删除掉
    for (int i = layout->count() - 1; i >= 0; --i) {
        // takeAt 就能移除对应下标的元素
        QLayoutItem* item = layout->takeAt(i);
        // 别忘了, 还需要对这个对象进行 "释放"
        if (item->widget()) {
            // 把这个移除的内容的 widget 进行释放.
            // 正常使用的时候, new 出来的对象添加到布局管理器的....
            delete item->widget();
        }
    }
}

// 此时这个函数添加的就不是 SessionFriendItem 了, 而是 SessionFriendItem 的子类.
// SessionItem, FriendItem, ApplyItem 其中的一个.
void SessionFriendArea::addItem(ItemType itemType, const QString& id, const QIcon &avatar, const QString &name, const QString &text)
{
    SessionFriendItem* item = nullptr;
    if (itemType == SessionItemType) {
        item = new SessionItem(this, id, avatar, name, text);
    } else if (itemType == FriendItemType) {
        item = new FriendItem(this, id, avatar, name, text);
    } else if (itemType == ApplyItemType) {
        item = new ApplyItem(this, id, avatar, name);
    } else {
        LOG() << "错误的 ItemType! itemType=" << itemType;
        return;
    }
    container->layout()->addWidget(item);
}

void SessionFriendArea::clickItem(int index)
{
    if (index < 0 || index >= container->layout()->count()) {
        LOG() << "点击元素的下标超出范围! index=" << index;
        return;
    }
    QLayoutItem* layoutItem = container->layout()->itemAt(index);
    if (layoutItem == nullptr || layoutItem->widget() == nullptr) {
        LOG() << "指定的元素不存在! index=" << index;
        return;
    }
    SessionFriendItem* item = dynamic_cast<SessionFriendItem*>(layoutItem->widget());
    item->select();
}

//////////////////////////////////////////////////////////
/// 滚动区域中的 Item 的实现
//////////////////////////////////////////////////////////

SessionFriendItem::SessionFriendItem(QWidget *owner, const QIcon &avatar, const QString &name, const QString &text)
    : owner(owner)
{
    this->setFixedHeight(70);
    this->setStyleSheet("QWidget { background-color: rgb(231, 231, 231); }");

    // 创建网格布局管理器
    QGridLayout* layout = new QGridLayout();
    layout->setContentsMargins(20, 0, 0, 0);
    layout->setHorizontalSpacing(10);
    layout->setVerticalSpacing(0);
    this->setLayout(layout);

    // 创建头像
    QPushButton* avatarBtn = new QPushButton();
    avatarBtn->setFixedSize(50, 50);
    avatarBtn->setIconSize(QSize(50, 50));
    avatarBtn->setIcon(avatar);
    avatarBtn->setStyleSheet("QPushButton {border: none;}");
    avatarBtn->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    // 创建名字
    QLabel* nameLabel = new QLabel();
    nameLabel->setText(name);
    nameLabel->setStyleSheet("QLabel { font-size: 18px; font-weight: 600; }");
    nameLabel->setFixedHeight(35);
    nameLabel->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);

    // 创建消息预览的 label
    messageLabel = new QLabel();
    messageLabel->setText(text);
    messageLabel->setFixedHeight(35);
    messageLabel->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);

    // 头像处于 0, 0 位置, 占据 2 行, 占据 2 列
    layout->addWidget(avatarBtn, 0, 0, 2, 2);
    // 名字处于 0, 2 位置, 占据 1 行, 占据 1 列
    layout->addWidget(nameLabel, 0, 2, 1, 8);
    // 消息预览处于 1, 2 位置, 占据 1 行, 占据 1 列
    layout->addWidget(messageLabel, 1, 2, 1, 8);
}

void SessionFriendItem::paintEvent(QPaintEvent *event)
{
    (void) event;
    QStyleOption opt;
    opt.initFrom(this);
    QPainter p(this);
    style()->drawPrimitive(QStyle::PE_Widget, &opt, &p, this);
}

void SessionFriendItem::mousePressEvent(QMouseEvent *event)
{
    (void) event;
    select();
}

void SessionFriendItem::enterEvent(QEnterEvent *event)
{
    (void) event;

    // 当前这个 item 是选中状态, 则背景色不受到该逻辑影响
    if (this->selected) {
        return;
    }
    // 设置一个更深的颜色
    this->setStyleSheet("QWidget { background-color: rgb(215, 215, 215);}");
}

void SessionFriendItem::leaveEvent(QEvent *event)
{
    (void) event;

    // 当前这个 item 是选中状态, 则背景色不受到该逻辑影响
    if (this->selected) {
        return;
    }
    // 还原背景色
    this->setStyleSheet("QWidget { background-color: rgb(231, 231, 231);}");
}

void SessionFriendItem::select()
{
    // 鼠标点击时会触发这个函数.
    // 拿到所有的兄弟元素
    const QObjectList children = this->parentWidget()->children();
    for (QObject* child : children) {
        if (!child->isWidgetType()) {
            // 判定是否是 widget.
            continue;
        }
        // 确实是 widget, 就把这里的child 强转成 SessionFriendItem
        SessionFriendItem* item = dynamic_cast<SessionFriendItem*>(child);
        if (item->selected) {
            item->selected = false;
            item->setStyleSheet("QWidget { background-color: rgb(231, 231, 231); }");
        }
    }

    // 点击时, 修改背景色.
    // 此处不仅仅要设置当前 item 背景色, 也要还原其他元素的背景色.
    this->setStyleSheet("QWidget { background-color: rgb(210, 210, 210); }");
    this->selected = true;

    // 调用 active
    this->active();
}

void SessionFriendItem::active()
{
    // 父类的 active
    // 并不需要实现任何逻辑.
}

//////////////////////////////////////////////////////////
/// 会话 Item 的实现
//////////////////////////////////////////////////////////

SessionItem::SessionItem(QWidget *owner, const QString &chatSessionId, const QIcon &avatar,
                         const QString &name, const QString &lastMessage)
    : SessionFriendItem(owner, avatar, name, lastMessage), chatSessionId(chatSessionId), text(lastMessage)
{
    // 处理更新最后一个消息的信号
    DataCenter* dataCenter = DataCenter::getInstance();
    connect(dataCenter, &DataCenter::updateLastMessage, this, &SessionItem::updateLastMessage);

    // 需要显示出未读消息的数目, 为了支持客户端重启之后, 未读消息仍然能正确显示.
    int unread = dataCenter->getUnread(chatSessionId);
    if (unread > 0) {
        // 存在未读消息
        this->messageLabel->setText(QString("[未读%1条] ").arg(unread) + text);
    }
}

void SessionItem::active()
{
    // 点击之后, 要加载会话的历史消息列表
    LOG() << "点击 SessionItem 触发的逻辑! chatSessionId=" << chatSessionId;

    // 加载会话历史消息, 即会涉及到当前内存的数据操作, 又会涉及到网络通信, 还涉及到界面的变更.
    MainWidget* mainWidget = MainWidget::getInstance();
    mainWidget->loadRecentMessage(chatSessionId);

    // 清空未读消息的数据, 并且更新显示
    DataCenter* dataCenter = DataCenter::getInstance();
    dataCenter->clearUnread(chatSessionId);

    // 更新界面的显示. 把会话消息预览这里, 前面的 "[未读x条]" 内容给干掉
    this->messageLabel->setText(text);
}

void SessionItem::updateLastMessage(const QString &chatSessionId)
{
    DataCenter* dataCenter = DataCenter::getInstance();
    // 1. 判定 chatSessionId 是否匹配
    if (this->chatSessionId != chatSessionId) {
        // 当前 SessionItem 不是你正在发消息的 SessionItem!
        return;
    }
    // chatSessionId 匹配, 真正更新最后一条消息!!

    // 2. 把最后一条消息, 获取到.
    QList<Message>* messageList = dataCenter->getRecentMessageList(chatSessionId);
    if (messageList == nullptr || messageList->size() == 0) {
        // 当前会话没有任何消息, 无需更新
        return;
    }

    const Message& lastMessage = messageList->back();

    // 3. 明确显示的文本内容
    //    由于消息有四种类型.
    //    文本消息, 直接显示消息的内容; 图片消息, 直接显示 "[图片]"; 文件消息, 直接显示 "[文件]"; 语音消息, 直接显示 "[语音]"
    if (lastMessage.messageType == TEXT_TYPE) {
        text = lastMessage.content;
    } else if (lastMessage.messageType == IMAGE_TYPE) {
        text = "[图片]";
    } else if (lastMessage.messageType == FILE_TYPE) {
        text = "[文件]";
    } else if (lastMessage.messageType == SPEECH_TYPE) {
        text = "[语音]";
    } else {
        LOG() << "错误的消息类型!";
        return;
    }

    // 4. 把这个内容, 显示到界面上
    //    针对这里的逻辑, 后续还需要考虑到 "未读消息" 情况. 关于未读消息的处理, 后续编写 "接收消息" 的时候再处理.
    //    先判定, 当前消息的会话, 是不是正在选中的会话. 如果是, 不会更新任何未读消息.
    //    如果不是, 看未读消息是否 > 0, 并且做出前缀的拼装
    if (chatSessionId == dataCenter->getCurrentChatSessionId()) {
        this->messageLabel->setText(text);
    } else {
        int unread = dataCenter->getUnread(chatSessionId);
        if (unread > 0) {
            this->messageLabel->setText(QString("[未读%1条] ").arg(unread) + text);
        }
    }
}

//////////////////////////////////////////////////////////
/// 好友 Item 的实现
//////////////////////////////////////////////////////////

FriendItem::FriendItem(QWidget *owner, const QString &userId, const QIcon &avatar,
                       const QString &name, const QString &description)
    : SessionFriendItem(owner, avatar, name, description), userId(userId)
{

}

void FriendItem::active()
{
    // 点击之后, 要激活对应的会话列表元素
    LOG() << "点击 FriendItem 触发的逻辑! userId=" << userId;

    MainWidget* mainWidget = MainWidget::getInstance();
    mainWidget->switchSession(userId);
}

//////////////////////////////////////////////////////////
/// 好友申请 Item 的实现
//////////////////////////////////////////////////////////

ApplyItem::ApplyItem(QWidget *owner, const QString &userId, const QIcon &avatar, const QString &name)
    : SessionFriendItem(owner, avatar, name, ""), userId(userId)
{
    // 1. 移除父类的 messageLabel
    QGridLayout* layout = dynamic_cast<QGridLayout*>(this->layout());
    layout->removeWidget(messageLabel);
    // 要记得释放内存, 否则会内存泄露.
    delete messageLabel;

    // 2. 创建两个按钮出来
    QPushButton* acceptBtn = new QPushButton();
    acceptBtn->setText("同意");
    QPushButton* rejectBtn = new QPushButton();
    rejectBtn->setText("拒绝");

    // 3. 添加到布局管理器中
    layout->addWidget(acceptBtn, 1, 2, 1, 1);
    layout->addWidget(rejectBtn, 1, 3, 1, 1);

    // 4. 添加信号槽
    connect(acceptBtn, &QPushButton::clicked, this, &ApplyItem::acceptFriendApply);
    connect(rejectBtn, &QPushButton::clicked, this, &ApplyItem::rejectFriendApply);
}

void ApplyItem::active()
{
    // 这个函数本身就不需要实现任何内容
    LOG() << "点击 ApplyItem 触发的逻辑! userId=" << userId;
}

void ApplyItem::acceptFriendApply()
{
    // 发送网络请求, 告知服务器, 同意了.
    DataCenter* dataCenter = DataCenter::getInstance();
    // 同意谁的好友申请了.
    // 针对这个操作, 信号处理, 是需要更新好友列表以及好友申请列表. 直接在主窗口中处理更合适的.
    dataCenter->acceptFriendApplyAsync(this->userId);
}

void ApplyItem::rejectFriendApply()
{
    DataCenter* dataCenter = DataCenter::getInstance();
    dataCenter->rejectFriendApplyAsync(this->userId);
}












