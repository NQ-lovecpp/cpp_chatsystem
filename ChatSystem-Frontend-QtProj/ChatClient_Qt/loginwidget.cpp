#include "loginwidget.h"

#include <QGridLayout>
#include <QLabel>
#include <QLineEdit>
#include <QPushButton>

#include "phoneloginwidget.h"
#include "model/datacenter.h"
#include "mainwidget.h"
#include "toast.h"

using namespace model;

LoginWidget::LoginWidget(QWidget *parent)
    : QWidget{parent}
{
    // 1. 设置本窗口的基本属性
    this->setFixedSize(400, 350);
    this->setWindowTitle("登录");
    this->setWindowIcon(QIcon(":/resource/image/logo.png"));
    this->setStyleSheet("QWidget { background-color: rgb(255, 255, 255); }");
    this->setAttribute(Qt::WA_DeleteOnClose);

    // 2. 创建布局管理器
    QGridLayout* layout = new QGridLayout();
    layout->setSpacing(0);
    layout->setContentsMargins(50, 0, 50, 0);
    this->setLayout(layout);

    // 3. 创建标题
    titleLabel = new QLabel();
    titleLabel->setText("登录");
    titleLabel->setAlignment(Qt::AlignCenter);
    titleLabel->setFixedHeight(50);
    titleLabel->setStyleSheet("QLabel { font-size: 40px; font-weight: 600; }");

    // 4. 创建用户名输入框
    QString editStyle = "QLineEdit { border: none; border-radius: 10px; font-size: 20px; background-color: rgb(240, 240, 240); padding-left:5px; }";
    usernameEdit = new QLineEdit();
    usernameEdit->setFixedHeight(40);
    usernameEdit->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
    usernameEdit->setPlaceholderText("输入用户名");
    usernameEdit->setStyleSheet(editStyle);

    // 5. 创建密码输入框
    passwordEdit = new QLineEdit();
    passwordEdit->setFixedHeight(40);
    passwordEdit->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
    passwordEdit->setPlaceholderText("输入密码");
    passwordEdit->setStyleSheet(editStyle);
    passwordEdit->setEchoMode(QLineEdit::Password);

    // 6. 创建验证码输入框
    verifyCodeEdit = new QLineEdit();
    verifyCodeEdit->setFixedHeight(40);
    verifyCodeEdit->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
    verifyCodeEdit->setPlaceholderText("输入验证码");
    verifyCodeEdit->setStyleSheet(editStyle);

    // 7. 创建显示验证码图片的控件 (此处先用 QPushButton 来表示一下, 后续进一步编写这里的逻辑)
    //    后续会自定义 QWidget, 通过画图 api 来实现这里的验证码功能.
    // QPushButton* verifyCodeWidget = new QPushButton();
    // verifyCodeWidget->setText("验证码");
    // verifyCodeWidget->setStyleSheet("QWidget { border: none; }");
    verifyCodeWidget = new VerifyCodeWidget(this);

    // 8. 创建登录按钮
    submitBtn = new QPushButton();
    submitBtn->setText("登录");
    submitBtn->setFixedHeight(40);
    submitBtn->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
    QString btnGreenStyle = "QPushButton { border: none; border-radius: 10px; background-color: rgb(44, 182, 61); color: rgb(255, 255, 255); }";
    btnGreenStyle += "QPushButton:pressed { background-color: rgb(240, 240, 240); }";
    submitBtn->setStyleSheet(btnGreenStyle);

    // 9. 创建切换到手机号登录按钮
    phoneModeBtn = new QPushButton();
    phoneModeBtn->setFixedSize(100, 40);
    phoneModeBtn->setText("手机号登录");
    QString btnWhiteStyle = "QPushButton { border: none; border-radius: 10px; background-color: transparent; }";
    btnWhiteStyle += "QPushButton:pressed { background-color: rgb(240, 240, 240); }";
    phoneModeBtn->setStyleSheet(btnWhiteStyle);

    // 10. 创建切换模式(登录和注册)按钮
    switchModeBtn = new QPushButton();
    switchModeBtn->setFixedSize(100, 40);
    switchModeBtn->setText("注册");
    switchModeBtn->setStyleSheet(btnWhiteStyle);

    // 11. 添加到布局管理器中
    layout->addWidget(titleLabel, 0, 0, 1, 5);
    layout->addWidget(usernameEdit, 1, 0, 1, 5);
    layout->addWidget(passwordEdit, 2, 0, 1, 5);
    layout->addWidget(verifyCodeEdit, 3, 0, 1, 4);
    layout->addWidget(verifyCodeWidget, 3, 4, 1, 1);
    layout->addWidget(submitBtn, 4, 0, 1, 5);
    layout->addWidget(phoneModeBtn, 5, 0, 1, 1);
    layout->addWidget(switchModeBtn, 5, 4, 1, 1);

    // 12. 处理信号槽
    connect(switchModeBtn, &QPushButton::clicked, this, &LoginWidget::switchMode);

    connect(phoneModeBtn, &QPushButton::clicked, this, [=]() {
        // 此处还可以把 isLoginMode 这个值传到新的窗口中, 让新的窗口决定自己是登录状态还是注册状态. 大家自行尝试实现.
        PhoneLoginWidget* phoneLoginWidget = new PhoneLoginWidget(nullptr);
        phoneLoginWidget->show();

        // 关闭当前窗口
        this->close();
    });

    connect(submitBtn, &QPushButton::clicked, this, &LoginWidget::clickSubmitBtn);
}

// 这个函数用来 "切换模式" , 把登录模式切换成注册, 注册切换成登录
void LoginWidget::switchMode()
{
    if (isLoginMode) {
        // 当前是登录模式, 切换到注册模式
        this->setWindowTitle("注册");
        titleLabel->setText("注册");
        submitBtn->setText("注册");
        phoneModeBtn->setText("手机号注册");
        switchModeBtn->setText("登录");
    } else {
        // 当前是注册模式, 切换到登录模式
        this->setWindowTitle("登录");
        titleLabel->setText("登录");
        submitBtn->setText("登录");
        phoneModeBtn->setText("手机号登录");
        switchModeBtn->setText("注册");
    }
    isLoginMode = !isLoginMode;
}

void LoginWidget::clickSubmitBtn()
{
    // 1. 先从输入框拿到必要的内容
    const QString& username = usernameEdit->text();
    const QString& password = passwordEdit->text();
    const QString& verifyCode = verifyCodeEdit->text();
    if (username.isEmpty() || password.isEmpty() || verifyCode.isEmpty()) {
        Toast::showMessage("用户名/密码/验证码不能为空!");
        return;
    }

    // 2. 对比验证码是否正确
    if (!verifyCodeWidget->checkVerifyCode(verifyCode)) {
        Toast::showMessage("验证码不正确!");
        return;
    }

    // 3. 真正去发送网络请求.
    DataCenter* dataCenter = DataCenter::getInstance();
    if (isLoginMode) {
        // 登录
        connect(dataCenter, &DataCenter::userLoginDone, this, &LoginWidget::userLoginDone);
        dataCenter->userLoginAsync(username, password);
    } else {
        // 注册
        connect(dataCenter, &DataCenter::userRegisterDone, this, &LoginWidget::userRegisterDone);
        dataCenter->userRegisterAsync(username, password);
    }
}

void LoginWidget::userLoginDone(bool ok, const QString& reason)
{
    // 此处区分一下是否登录成功.
    // 登录失败, 给用户反馈失败原因.
    if (!ok) {
        Toast::showMessage("登录失败! " + reason);
        return;
    }

    // 登录成功, 需要跳转到主界面.
    MainWidget* mainWidget = MainWidget::getInstance();
    mainWidget->show();

    this->close();
}

void LoginWidget::userRegisterDone(bool ok, const QString &reason)
{
    if (!ok) {
        Toast::showMessage("注册失败! " + reason);
        return;
    }
    Toast::showMessage("注册成功!");

    // 切换到登录界面
    this->switchMode();

    // 输入框清空一下.
    // 主要是要清空用户名和密码, 验证码输入框的内容的.
    // 但是此处, 只清空一下验证码. 用户名密码这里的情况大概率还是同样的内容.
    verifyCodeEdit->clear();

    // 更新验证码
    verifyCodeWidget->refreshVerifyCode();
}














