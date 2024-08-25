#ifndef VERIFYCODEWIDGET_H
#define VERIFYCODEWIDGET_H

#include <QWidget>
#include <QRandomGenerator>

class VerifyCodeWidget : public QWidget
{
    Q_OBJECT
public:
    explicit VerifyCodeWidget(QWidget *parent = nullptr);

    // 通过这个函数, 生成随机的验证码字符串
    QString generateVerifyCode();

    // 重新生成验证码并显示到界面上
    void refreshVerifyCode();

    // 检验验证码是否匹配
    bool checkVerifyCode(const QString& verifyCode);

    void paintEvent(QPaintEvent* event) override;

    // 用户点击的时候, 刷新验证码, 并重新显示.
    void mousePressEvent(QMouseEvent* event) override;

private:
    // 随机数生成器
    QRandomGenerator randomGenerator;

    // 保存验证码的值
    QString verifyCode = "";

signals:
};

#endif // VERIFYCODEWIDGET_H
