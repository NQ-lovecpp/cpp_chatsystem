#include "verifycodewidget.h"

#include <QPainter>

#include "model/data.h"

VerifyCodeWidget::VerifyCodeWidget(QWidget *parent) : QWidget(parent), randomGenerator(model::getTime())
{
    verifyCode = generateVerifyCode();
}

// 下列代码, 生成的是 "随机的大写字母", 类似的思路, 也可以生成小写字母和阿拉伯数字
// 如果代码中, 同时混着存在大小写字母和阿拉伯数字的话, 可能存在一个问题:
// 有些字符, 会混淆. 比如 O o 0; 再比如 I 1 l;
QString VerifyCodeWidget::generateVerifyCode()
{
    QString code;
    for (int i = 0; i < 4; ++i) {
        // 每次循环生成一个字符.
        int init = 'A';
        init += randomGenerator.generate() % 26;
        code += static_cast<QChar>(init);
    }
    return code;
}

void VerifyCodeWidget::refreshVerifyCode()
{
    verifyCode = generateVerifyCode();
    // 通过 update 就可以起到 "刷新界面" , 本身就是触发 paintEvent
    this->update();
}

bool VerifyCodeWidget::checkVerifyCode(const QString &verifyCode)
{
    // 此处比较验证码的时候, 需要忽略大小写.
    return this->verifyCode.compare(verifyCode, Qt::CaseInsensitive) == 0;
}

void VerifyCodeWidget::paintEvent(QPaintEvent *event)
{
    (void) event;
    const int width = 180;
    const int height = 80;

    QPainter painter(this);
    QPen pen;
    QFont font("楷体",25,QFont::Bold,true);
    painter.setFont(font);

    // 画点: 添加随机噪点
    for(int i = 0; i < 100; i++)
    {
        pen = QPen(QColor(randomGenerator.generate() % 256, randomGenerator.generate() % 256, randomGenerator.generate() % 256));
        painter.setPen(pen);
        painter.drawPoint(randomGenerator.generate() % width, randomGenerator.generate() % height);
    }

    // 画线: 添加随机干扰线
    for(int i = 0; i < 5; i++)
    {
        pen = QPen(QColor(randomGenerator.generate() % 256, randomGenerator.generate() % 256, randomGenerator.generate() % 256));
        painter.setPen(pen);
        painter.drawLine(randomGenerator.generate() % width, randomGenerator.generate() % height,
                         randomGenerator.generate() % width, randomGenerator.generate() % height);
    }

    // 绘制验证码
    for(int i = 0; i < verifyCode.size(); i++)
    {
        pen = QPen(QColor(randomGenerator.generate() % 255, randomGenerator.generate() % 255, randomGenerator.generate() % 255));
        painter.setPen(pen);
        painter.drawText(5+20*i, randomGenerator.generate() % 10, 30, 30, Qt::AlignCenter, QString(verifyCode[i]));
    }
}

void VerifyCodeWidget::mousePressEvent(QMouseEvent *event)
{
    (void) event;
    this->refreshVerifyCode();
}






