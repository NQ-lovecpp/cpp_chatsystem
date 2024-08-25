#include "sessiondetailwidget.h"
#include <QVBoxLayout>
#include <QPushButton>
#include <QFontMetrics>
#include <QMessageBox>

#include "model/datacenter.h"
#include "choosefrienddialog.h"
#include "debug.h"

using namespace model;

/////////////////////////////////////////////
/// 表示一个头像 +  一个名字组合控件
/////////////////////////////////////////////

AvatarItem::AvatarItem(const QIcon &avatar, const QString &name)
{
    // 1. 设置自身的基本属性
    this->setFixedSize(70, 80);

    // 2. 创建布局管理器
    QVBoxLayout* layout = new QVBoxLayout();
    layout->setSpacing(0);
    layout->setContentsMargins(0, 0, 0, 0);
    layout->setAlignment(Qt::AlignHCenter);
    this->setLayout(layout);

    // 3. 创建头像
    avatarBtn = new QPushButton();
    avatarBtn->setFixedSize(45, 45);
    avatarBtn->setIconSize(QSize(45, 45));
    avatarBtn->setIcon(avatar);
    avatarBtn->setStyleSheet("QPushButton { border: none; }");

    // 4. 创建名字
    nameLabel = new QLabel();
    nameLabel->setText(name);
    QFont font("微软雅黑", 12);
    nameLabel->setFont(font);
    nameLabel->setAlignment(Qt::AlignCenter);

    // 5. 对名字做 "截断操作"
    const int MAX_WIDTH = 65;
    QFontMetrics metrics(font);
    int totalWidth = metrics.horizontalAdvance(name);
    if (totalWidth >= MAX_WIDTH) {
        // 需要截断
        QString tail = "...";
        int tailWidth = metrics.horizontalAdvance(tail);
        int availableWidth = MAX_WIDTH - tailWidth;
        int availableSize = name.size() * ((double)availableWidth / totalWidth);
        QString newName = name.left(availableSize);
        nameLabel->setText(newName + tail);
    }

    // 6.
    layout->addWidget(avatarBtn);
    layout->addWidget(nameLabel);
}

/////////////////////////////////////////////
/// 表示 "单聊会话详情" 窗口
/////////////////////////////////////////////

SessionDetailWidget::SessionDetailWidget(QWidget* parent, const UserInfo& userInfo) : QDialog(parent), userInfo(userInfo) {
    // 1. 设置基本属性
    this->setWindowTitle("会话详情");
    this->setWindowIcon(QIcon(":/resource/image/logo.png"));
    this->setFixedSize(300, 300);
    this->setStyleSheet("QWidget { background-color: rgb(255, 255, 255); }");
    this->setAttribute(Qt::WA_DeleteOnClose);

    // 2. 创建布局管理器
    QGridLayout* layout = new QGridLayout();
    layout->setSpacing(10);
    layout->setContentsMargins(50, 0, 50, 0);
    this->setLayout(layout);

    // 3. 添加 "创建群聊" 按钮
    AvatarItem* createGroupBtn = new AvatarItem(QIcon(":/resource/image/cross.png"), "添加");
    layout->addWidget(createGroupBtn, 0, 0);

    // 4. 添加当前用户的信息 (临时构造的假数据)
#if TEST_UI
    AvatarItem* currentUser = new AvatarItem(QIcon(":/resource/image/defaultAvatar.png"), "张三123456");
    layout->addWidget(currentUser, 0, 1);
#endif
    AvatarItem* currentUser = new AvatarItem(userInfo.avatar, userInfo.nickname);
    layout->addWidget(currentUser, 0, 1);

    // 5. 添加 "删除好友" 按钮
    deleteFriendBtn = new QPushButton();
    deleteFriendBtn->setFixedHeight(50);
    deleteFriendBtn->setText("删除好友");
    QString style = "QPushButton { border: 1px solid rgb(90, 90, 90); border-radius: 5px; } ";
    style += "QPushButton:pressed { background-color: rgb(235, 235, 235); }";
    deleteFriendBtn->setStyleSheet(style);
    layout->addWidget(deleteFriendBtn, 1, 0, 1, 3);

    // 6. 添加信号槽, 处理点击 "创建群聊" 按钮
    connect(createGroupBtn->getAvatar(), &QPushButton::clicked, this, [=]() {
        ChooseFriendDialog* chooseFriendDialog = new ChooseFriendDialog(this, userInfo.userId);
        chooseFriendDialog->exec();
    });

    connect(deleteFriendBtn, &QPushButton::clicked, this, &SessionDetailWidget::clickDeleteFriendBtn);
}

void SessionDetailWidget::clickDeleteFriendBtn()
{
    // 1. 弹出一个对话框让用户确认是否真的要删除
    auto result = QMessageBox::warning(this, "确认删除", "确认删除该好友?", QMessageBox::Ok | QMessageBox::Cancel);
    if (result != QMessageBox::Ok) {
        LOG() << "用户取消了好友删除";
        return;
    }

    // 2. 发送好友删除的请求
    DataCenter* dataCenter = DataCenter::getInstance();
    dataCenter->deleteFriendAsync(this->userInfo.userId);

    // 3. 关闭当前窗口
    this->close();
}










