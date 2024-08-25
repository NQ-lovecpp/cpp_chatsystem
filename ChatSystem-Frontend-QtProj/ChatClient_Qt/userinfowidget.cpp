#include "userinfowidget.h"

#include <QGridLayout>
#include <QMessageBox>

#include "model/datacenter.h"
#include "mainwidget.h"

using namespace model;

UserInfoWidget::UserInfoWidget(const UserInfo& userInfo, QWidget* parent)
    : QDialog(parent), userInfo(userInfo) {
    // 1. 设置基本属性
    this->setFixedSize(400, 200);
    this->setWindowTitle("用户详情");
    this->setWindowIcon(QIcon(":/resource/image/logo.png"));
    this->setAttribute(Qt::WA_DeleteOnClose);
    this->move(QCursor::pos());

    // 2. 创建布局管理器
    QGridLayout* layout = new QGridLayout();
    layout->setVerticalSpacing(10);
    layout->setHorizontalSpacing(20);
    layout->setContentsMargins(40, 20, 0, 0);
    layout->setAlignment(Qt::AlignTop);
    this->setLayout(layout);

    // 3. 添加头像
    avatarBtn = new QPushButton();
    avatarBtn->setFixedSize(75, 75);
    avatarBtn->setIconSize(QSize(75, 75));
    avatarBtn->setIcon(userInfo.avatar);

    QString labelStyle = "QLabel { font-weight: 800; padding-left: 20px;}";
    QString btnStyle = "QPushButton { border: 1px solid rgb(100, 100, 100); border-radius: 5px; background-color: rgb(240, 240, 240); }";
    btnStyle += "QPushButton:pressed { background-color: rgb(205, 205, 205); }";

    int width = 80;
    int height = 30;

    // 4. 添加用户序号
    idTag = new QLabel();
    idTag->setText("序号");
    idTag->setStyleSheet(labelStyle);
    idTag->setFixedSize(width, height);
    idTag->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    idLabel = new QLabel();
    idLabel->setText(userInfo.userId);
    idLabel->setFixedSize(width, height);
    idLabel->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    // 5. 添加用户昵称
    nameTag = new QLabel();
    nameTag->setText("昵称");
    nameTag->setStyleSheet(labelStyle);
    nameTag->setFixedSize(width, height);
    nameTag->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    nameLabel = new QLabel();
    nameLabel->setText(userInfo.nickname);
    nameLabel->setFixedSize(width, height);
    nameLabel->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    // 6. 设置电话
    phoneTag = new QLabel();
    phoneTag->setText("电话");
    phoneTag->setStyleSheet(labelStyle);
    phoneTag->setFixedSize(width, height);
    phoneTag->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    phoneLabel = new QLabel();
    phoneLabel->setText(userInfo.phone);
    phoneLabel->setFixedSize(width, height);
    phoneLabel->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    // 7. 添加功能按钮
    applyBtn = new QPushButton();
    applyBtn->setText("申请好友");
    applyBtn->setFixedSize(80, 30);
    applyBtn->setStyleSheet(btnStyle);
    applyBtn->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    sendMessageBtn = new QPushButton();
    sendMessageBtn->setText("发送消息");
    sendMessageBtn->setFixedSize(80, 30);
    sendMessageBtn->setStyleSheet(btnStyle);
    sendMessageBtn->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    deleteFriendBtn = new QPushButton();
    deleteFriendBtn->setText("删除好友");
    deleteFriendBtn->setFixedSize(80, 30);
    deleteFriendBtn->setStyleSheet(btnStyle);
    deleteFriendBtn->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);

    // 8. 添加上述内容到布局管理器中
    layout->addWidget(avatarBtn, 0, 0, 3, 1);

    layout->addWidget(idTag, 0, 1);
    layout->addWidget(idLabel, 0, 2);

    layout->addWidget(nameTag, 1, 1);
    layout->addWidget(nameLabel, 1, 2);

    layout->addWidget(phoneTag, 2, 1);
    layout->addWidget(phoneLabel, 2, 2);

    layout->addWidget(applyBtn, 3, 0);
    layout->addWidget(sendMessageBtn, 3, 1);
    layout->addWidget(deleteFriendBtn, 3, 2);

    // 9. 初始化按钮的禁用关系
    //    判定依据就是拿着当前用户的 userId, 在 DataCenter 的好友列表中, 查询即可.
    DataCenter* dataCenter = DataCenter::getInstance();
    auto* myFriend = dataCenter->findFriendById(this->userInfo.userId);
    if (myFriend == nullptr) {
        // 不是好友
        sendMessageBtn->setEnabled(false);
        deleteFriendBtn->setEnabled(false);
    } else {
        // 是好友
        applyBtn->setEnabled(false);
    }

    // 10. 初始化信号槽
    initSignalSlot();
}

void UserInfoWidget::initSignalSlot()
{
    connect(sendMessageBtn, &QPushButton::clicked, this, [=]() {
        // 拿到主窗口指针, 通过主窗口中, 前面实现的 切换到会话 这样的功能, 直接调用即可.
        MainWidget* mainWidget = MainWidget::getInstance();
        mainWidget->switchSession(userInfo.userId);

        // 把本窗口关闭掉
        this->close();
    });

    connect(deleteFriendBtn, &QPushButton::clicked, this, &UserInfoWidget::clickDeleteFriendBtn);
    connect(applyBtn, &QPushButton::clicked, this, &UserInfoWidget::clickApplyBtn);
}

void UserInfoWidget::clickDeleteFriendBtn()
{
    // 1. 弹出对话框, 让用户确认是否要真的删除
    auto result = QMessageBox::warning(this, "确认删除", "确认删除当前好友?", QMessageBox::Ok | QMessageBox::Cancel);
    if (result != QMessageBox::Ok) {
        LOG() << "删除好友取消";
        return;
    }
    // 2. 发送网络请求, 实现删除好友功能.
    DataCenter* dataCenter = DataCenter::getInstance();
    // 由于此处信号的处理, 都是由主窗口这里进行的.
    dataCenter->deleteFriendAsync(userInfo.userId);
    // 3. 关闭本窗口
    this->close();
}

void UserInfoWidget::clickApplyBtn()
{
    // 1. 发送好友申请
    DataCenter* dataCenter = DataCenter::getInstance();
    dataCenter->addFriendApplyAsync(userInfo.userId);
    // 2. 关闭窗口
    this->close();
}










