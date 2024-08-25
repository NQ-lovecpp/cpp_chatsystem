#ifndef SELFINFOWIDGET_H
#define SELFINFOWIDGET_H

#include <QDialog>
#include <QWidget>
#include <QPushButton>
#include <QLabel>
#include <QLineEdit>
#include <QGridLayout>

class SelfInfoWidget : public QDialog
{
    Q_OBJECT
public:
    SelfInfoWidget(QWidget* parent);

    void initSingalSlot();
    void clickNameSubmitBtn();
    void clickNameSubmitBtnDone();
    void clickDescSubmitBtn();
    void chickDescSubmitBtnDone();
    void clickGetVerifyCodeBtn();
    void clickPhoneSubmitBtn();
    void clickPhoneSubmitBtnDone();
    void clickAvatarBtn();
    void clickAvatarBtnDone();

private:
    QGridLayout* layout;

    QPushButton* avatarBtn;
    QLabel* idTag;								// 显示 "序号"
    QLabel* idLabel;							// 显示 "1234"

    QLabel* nameTag;							// 显示 "昵称"
    QLabel* nameLabel; 							// 显示 "张三"
    QLineEdit* nameEdit;						// 编辑昵称
    QPushButton* nameModifyBtn;					// 修改名字
    QPushButton* nameSubmitBtn;					// 提交修改

    QLabel* descTag;							// 显示 "签名"
    QLabel* descLabel;							// 显示 "从今天开始认真敲代码"
    QLineEdit* descEdit;						// 编辑签名
    QPushButton* descModifyBtn;					// 修改签名
    QPushButton* descSubmitBtn;					// 提交修改

    QLabel* phoneTag;							// 显示 "电话"
    QLabel* phoneLabel;							// 显示 "18612345678"
    QLineEdit* phoneEdit;						// 编辑电话
    QPushButton* phoneModifyBtn;				// 修改电话
    QPushButton* phoneSubmitBtn;				// 提交修改

    QLabel* verifyCodeTag;						// 显示 "验证码"
    QLineEdit* verifyCodeEdit;					// 输入验证码
    QPushButton* getVerifyCodeBtn;				// 获取验证码按钮

    // 要修改的新的手机号码
    QString phoneToChange;

    // 倒计时的时间
    int leftTime = 30;
};

#endif // SELFINFOWIDGET_H
