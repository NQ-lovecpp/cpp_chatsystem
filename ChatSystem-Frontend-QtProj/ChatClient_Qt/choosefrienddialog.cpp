#include "choosefrienddialog.h"

#include <QHBoxLayout>
#include <QScrollArea>
#include <QScrollBar>
#include <QPushButton>
#include <QPainter>

#include "model/datacenter.h"

#include "toast.h"
#include "debug.h"

using namespace model;

////////////////////////////////////////////////
/// 选择好友窗口中的一个 元素/好友项
////////////////////////////////////////////////

ChooseFriendItem::ChooseFriendItem(ChooseFriendDialog* owner, const QString& userId, const QIcon &avatar, const QString &name, bool checked)
    : userId(userId)
{
    // 1. 设置控件的基本属性
    this->setFixedHeight(50);
    this->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);

    // 2. 设置布局管理器
    QHBoxLayout* layout = new QHBoxLayout();
    layout->setSpacing(10);
    layout->setContentsMargins(20, 0, 20, 0);
    this->setLayout(layout);

    // 3. 创建复选框
    checkBox = new QCheckBox();
    checkBox->setChecked(checked);
    checkBox->setFixedSize(25, 25);
    QString style = "QCheckBox { background-color: transparent; } QCheckBox::indicator { width: 20px; height: 20px; image: url(:/resource/image/unchecked.png);}";
    style += "QCheckBox::indicator:checked { image: url(:/resource/image/checked.png);}";
    checkBox->setStyleSheet(style);

    // 4. 创建头像
    avatarBtn = new QPushButton();
    avatarBtn->setFixedSize(40, 40);
    avatarBtn->setIconSize(QSize(40, 40));
    avatarBtn->setIcon(avatar);

    // 5. 创建名字
    nameLabel = new QLabel();
    nameLabel->setText(name);
    nameLabel->setStyleSheet("QLabel {background-color: transparent;}");

    // 6. 添加上述内容到布局管理器中
    layout->addWidget(checkBox);
    layout->addWidget(avatarBtn);
    layout->addWidget(nameLabel);

    // 7. 连接信号槽
    connect(checkBox, &QCheckBox::toggled, this, [=](bool checked) {
        if (checked) {
            // 勾选了复选框, 把当前这个 Item, 添加到右侧的已选择区域
            owner->addSelectedFriend(userId, avatar, name);
        } else {
            // 取消勾选
            owner->deleteSelectedFriend(userId);
        }
    });
}

void ChooseFriendItem::paintEvent(QPaintEvent *event)
{
    (void) event;
    // 根据鼠标的进入状态, 来决定绘制成不同的颜色
    QPainter painter(this);
    if (isHover) {
        // 绘制成深色
        painter.fillRect(this->rect(), QColor(230, 230, 230));
    } else {
        // 绘制成浅色
        painter.fillRect(this->rect(), QColor(255, 255, 255));
    }
}

void ChooseFriendItem::enterEvent(QEnterEvent *event)
{
    (void) event;
    isHover = true;
    // update 相当于 "更新界面"
    this->update();
    // 或者使用下列代码
    // this->repaint();
}

void ChooseFriendItem::leaveEvent(QEvent *event)
{
    (void) event;
    isHover =  false;
    this->update();
}

////////////////////////////////////////////////
/// 选择好友的窗口
////////////////////////////////////////////////

ChooseFriendDialog::ChooseFriendDialog(QWidget* parent, const QString& userId) : QDialog(parent), userId(userId) {
    // 1. 设置窗口的基本属性
    this->setWindowTitle("选择好友");
    this->setWindowIcon(QIcon(":/resource/image/logo.png"));
    this->setFixedSize(750, 550);
    this->setStyleSheet("QDialog { background-color: rgb(255, 255, 255);}");
    this->setAttribute(Qt::WA_DeleteOnClose);

    // 2. 创建布局管理器
    QHBoxLayout* layout = new QHBoxLayout();
    layout->setContentsMargins(0, 0, 0, 0);
    layout->setSpacing(0);
    this->setLayout(layout);

    // 3. 针对左侧窗口进行初始化
    initLeft(layout);

    // 4. 针对右侧窗口进行初始化
    initRight(layout);

    // 5. 加载数据到窗口中
    initData();
}

void ChooseFriendDialog::initLeft(QHBoxLayout *layout)
{
    // 1. 创建滚动区域
    QScrollArea* scrollArea = new QScrollArea();
    scrollArea->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    scrollArea->setWidgetResizable(true);
    scrollArea->horizontalScrollBar()->setStyleSheet("QScrollBar:horizontal { height: 0px;}");
    scrollArea->verticalScrollBar()->setStyleSheet("QScrollBar:vertical { width: 2px; background-color: rgb(255, 255, 255) }");
    scrollArea->setStyleSheet("QScrollArea { border:none; }");
    layout->addWidget(scrollArea, 1);

    // 2. 创建 QWidget 设置到滚动区域中.
    totalContainer = new QWidget();
    totalContainer->setObjectName("totalContainer");
    totalContainer->setStyleSheet("#totalContainer { background-color: rgb(255, 255, 255); }");
    scrollArea->setWidget(totalContainer);

    // 3. 创建左侧子窗口内部的 垂直布局管理器
    QVBoxLayout* vlayout = new QVBoxLayout();
    vlayout->setSpacing(0);
    vlayout->setContentsMargins(0, 0, 0, 0);
    vlayout->setAlignment(Qt::AlignTop);
    totalContainer->setLayout(vlayout);

    // 还需要进一步的添加 vlayout 内部的元素, 才能看到效果!
    // 此处也是先构造测试数据, 后续接入服务器之后, 从服务器拿到真实的好友列表, 再添加真实的数据
#if TEST_UI
    QIcon defaultAvatar(":/resource/image/defaultAvatar.png");
    for (int i = 0; i < 30; ++i) {
        this->addFriend(QString::number(1000 + i), defaultAvatar, "张三" + QString::number(i), false);
    }
#endif
}

void ChooseFriendDialog::initRight(QHBoxLayout *layout)
{
    // 1. 创建右侧的布局管理器
    QGridLayout* gridLayout = new QGridLayout();
    gridLayout->setContentsMargins(20, 0, 20, 20);
    gridLayout->setSpacing(10);
    layout->addLayout(gridLayout, 1);

    // 2. 创建 "提示" label
    QLabel* tipLabel = new QLabel();
    tipLabel->setText("选择联系人");
    tipLabel->setFixedHeight(30);
    tipLabel->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
    tipLabel->setAlignment(Qt::AlignLeft | Qt::AlignVCenter);
    tipLabel->setStyleSheet("QLabel { font-size: 16px; font-weight: 700}");

    // 3. 创建滚动区域
    QScrollArea* scrollArea = new QScrollArea();
    scrollArea->setWidgetResizable(true);
    scrollArea->verticalScrollBar()->setStyleSheet("QScrollBar:vertical { width: 2px; background-color: rgb(255, 255, 255);}");
    scrollArea->horizontalScrollBar()->setStyleSheet("QScrollBar:horizontal {height: 0px;}");
    scrollArea->setStyleSheet("QScrollArea {border: none;}");
    scrollArea->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);

    // 4. 创建滚动区域中的 QWidget
    selectedContainer = new QWidget();
    selectedContainer->setObjectName("selectedContainer");
    selectedContainer->setStyleSheet("#selectedContainer { background-color: rgb(255, 255, 255); }");
    scrollArea->setWidget(selectedContainer);

    // 5. 创建 selectedContainer 中的 "垂直布局"
    QVBoxLayout* vlayout = new QVBoxLayout();
    vlayout->setSpacing(0);
    vlayout->setContentsMargins(0, 0, 0, 0);
    vlayout->setAlignment(Qt::AlignTop);
    selectedContainer->setLayout(vlayout);

    // 6. 创建底部按钮
    QString style = "QPushButton { color: rgb(7, 191, 96); background-color: rgb(240, 240, 240); border: none; border-radius: 5px;}";
    style += "QPushButton:hover { background-color: rgb(220, 220, 220); } QPushButton:pressed { background-color: rgb(200, 200, 200); }";

    QPushButton* okBtn = new QPushButton();
    okBtn->setFixedHeight(40);
    okBtn->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
    okBtn->setText("完成");
    okBtn->setStyleSheet(style);

    QPushButton* cancelBtn = new QPushButton();
    cancelBtn->setFixedHeight(40);
    cancelBtn->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
    cancelBtn->setText("取消");
    cancelBtn->setStyleSheet(style);

    // 7. 把上述控件添加到布局中
    gridLayout->addWidget(tipLabel, 0, 0, 1, 9);
    gridLayout->addWidget(scrollArea, 1, 0, 1, 9);
    gridLayout->addWidget(okBtn, 2, 1, 1, 3);
    gridLayout->addWidget(cancelBtn, 2, 5, 1, 3);

    // 构造一些数据用来进行测试界面
#if 0
    // 此处的数据通过勾选左侧列表来生成.
    QIcon defaultAvatar(":/resource/image/defaultAvatar.png");
    for (int i = 0; i < 10; ++i) {
        this->addSelectedFriend(QString::number(1000 + i), defaultAvatar, "张三" + QString::number(i));
    }
#endif

    // 8. 添加信号槽, 处理 ok 和 cancel 的点击
    connect(okBtn, &QPushButton::clicked, this, &ChooseFriendDialog::clickOkBtn);
    connect(cancelBtn, &QPushButton::clicked, this, [=]() {
        this->close();
    });
}

void ChooseFriendDialog::clickOkBtn()
{
    // 1. 根据选中的好友列表中的元素, 得到所有的要创建群聊会话的用户 id 列表
    QList<QString> userIdList = generateMemberList();
    if (userIdList.size() < 3) {
        Toast::showMessage("群聊中的成员不足三个, 无法创建群聊");
        return;
    }

    // 2. 发送网络请求, 创建群聊
    DataCenter* dataCenter = DataCenter::getInstance();
    dataCenter->createGroupChatSessionAsync(userIdList);

    // 3. 关闭当前窗口
    this->close();
}

QList<QString> ChooseFriendDialog::generateMemberList()
{
    QList<QString> result;

    // 1. 把自己添加到结果中
    DataCenter* dataCenter = DataCenter::getInstance();
    if (dataCenter->getMyself() == nullptr) {
        LOG() << "个人信息尚未加载!";
        return result;
    }
    result.push_back(dataCenter->getMyself()->userId);

    // 2. 遍历选中的列表
    QVBoxLayout* layout = dynamic_cast<QVBoxLayout*>(selectedContainer->layout());
    for (int i = 0; i < layout->count(); ++i) {
        auto* item = layout->itemAt(i);
        if (item == nullptr || item->widget() == nullptr) {
            continue;
        }
        auto* chooseFriendItem = dynamic_cast<ChooseFriendItem*>(item->widget());
        result.push_back(chooseFriendItem->getUserId());
    }
    return result;
}

void ChooseFriendDialog::initData()
{
    // 遍历 好友列表, 把好友列表中的所有的元素, 添加到这个窗口界面上.
    DataCenter* dataCenter = DataCenter::getInstance();
    QList<UserInfo>* friendList = dataCenter->getFriendList();
    if (friendList == nullptr) {
        LOG() << "加载数据时发现好友列表为空!";
        return;
    }
    for (auto it = friendList->begin(); it != friendList->end(); ++it) {
        if (it->userId == this->userId) {
            this->addSelectedFriend(it->userId, it->avatar, it->nickname);
            this->addFriend(it->userId, it->avatar, it->nickname, true);
        } else {
            this->addFriend(it->userId, it->avatar, it->nickname, false);
        }
    }
}

void ChooseFriendDialog::addFriend(const QString& userId, const QIcon &avatar, const QString &name, bool checked)
{
    ChooseFriendItem* item = new ChooseFriendItem(this, userId, avatar, name, checked);
    totalContainer->layout()->addWidget(item);
}

void ChooseFriendDialog::addSelectedFriend(const QString& userId, const QIcon &avatar, const QString &name)
{
    ChooseFriendItem* item = new ChooseFriendItem(this, userId, avatar, name, true);
    selectedContainer->layout()->addWidget(item);
}

void ChooseFriendDialog::deleteSelectedFriend(const QString &userId)
{
    // 遍历 selectedContainer 中的每个 Item, 对比每个 Item 里的 userId , 是否是要删除的 userId.
    QVBoxLayout* vlayout = dynamic_cast<QVBoxLayout*>(selectedContainer->layout());
    // 由于是要 "遍历" + "删除" 需要从后往前进行
    for (int i = vlayout->count() - 1; i >= 0; --i) {
        auto* item = vlayout->itemAt(i);
        if (item == nullptr || item->widget() == nullptr) {
            continue;
        }
        ChooseFriendItem* chooseFriendItem = dynamic_cast<ChooseFriendItem*>(item->widget());
        // 判定当前的 Item 的 userId 是否是要删除的 userId
        if (chooseFriendItem->getUserId() != userId) {
            continue;
        }
        vlayout->removeWidget(chooseFriendItem);
        // 此处直接使用 delete 可能导致程序直接崩溃. 因为 delete 该对象的时候, 该对象内部的 QCheckBox 还在使用中 (触发着信号槽呢)
        // 改成 deleteLater, 就相当于把 delete 操作委托给 Qt 自身来完成了. 告诉 Qt 框架说, 你要删除这个对象. 至于啥时候删除 Qt
        // 会确保在 Qt 自身用完了之后, 去真正删除.
        // delete chooseFriendItem;
        chooseFriendItem->deleteLater();
    }

    // 再遍历一下左侧列表, 把左侧列表中对应 item 的 checkBox 勾选状态取消掉.
    QVBoxLayout* vlayoutLeft = dynamic_cast<QVBoxLayout*>(totalContainer->layout());
    for (int i = 0; i < vlayoutLeft->count(); ++i) {
        auto* item = vlayoutLeft->itemAt(i);
        if (item == nullptr || item->widget() == nullptr) {
            continue;
        }
        ChooseFriendItem* chooseFriendItem = dynamic_cast<ChooseFriendItem*>(item->widget());
        if (chooseFriendItem->getUserId() != userId) {
            continue;
        }
        // 取消 checkBox 选中状态
        chooseFriendItem->getCheckBox()->setChecked(false);
    }
}








