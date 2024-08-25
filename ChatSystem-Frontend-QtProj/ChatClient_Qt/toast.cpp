#include "toast.h"

#include <QApplication>
#include <QScreen>
#include <QVBoxLayout>
#include <QLabel>
#include <QTimer>

Toast::Toast(const QString &text)
{
    // 1. 设置窗口的基本参数
    this->setFixedSize(800, 150);
    this->setWindowTitle("消息通知");
    this->setWindowIcon(QIcon(":/resource/image/logo.png"));
    this->setAttribute(Qt::WA_DeleteOnClose);
    this->setStyleSheet("QDialog { background-color: rgb(255, 255, 255); }");
    // 去掉窗口的标题栏
    this->setWindowFlags(Qt::FramelessWindowHint);

    // 2. 先考虑一下窗口的位置.
    // 获取到整个屏幕的尺寸, 通过 primaryScreen 来获取.
    QScreen* screen = QApplication::primaryScreen();
    int width = screen->size().width();
    int height = screen->size().height();
    int x = (width - this->width()) / 2;
    int y = height - this->height() - 100;	// 此处的 100 是窗口底边距离屏幕底边的间隔
    this->move(x, y);

    // 3. 添加一个布局管理器
    QVBoxLayout* layout = new QVBoxLayout();
    layout->setSpacing(0);
    layout->setContentsMargins(0, 0, 0, 0);
    this->setLayout(layout);

    // 4. 创建显示文本的 Label
    QLabel* label = new QLabel();
    label->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    label->setAlignment(Qt::AlignCenter);
    label->setStyleSheet("QLabel { font-size: 32px; }");
    label->setText(text);
    layout->addWidget(label);

    // 5. 实现 2s 之后自动关闭.
    QTimer* timer = new QTimer(this);
    connect(timer, &QTimer::timeout, this, [=]() {
        timer->stop();
        // 核心代码, 关闭当前窗口
        this->close();
    });
    timer->start(2000);
}

void Toast::showMessage(const QString &text)
{
    Toast* toast = new Toast(text);
    toast->show();
}

























