#include "mainwidget.h"

#include <QApplication>

#include "model/data.h"
#include "debug.h"

#include "loginwidget.h"

#include "model/datacenter.h"

FILE* output = nullptr;

void msgHandler(QtMsgType type, const QMessageLogContext& context, const QString& msg) {
    (void) type;
    (void) context;
    const QByteArray& log = msg.toUtf8();
    fprintf(output, "%s\n", log.constData());
    fflush(output);		// 确保数据落入硬盘
}

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    a.setStyleSheet("QLabel, QLineEdit, QPushButton { color: black; }");

    // 设置浅色模式的调色板
    QPalette lightPalette;
    lightPalette.setColor(QPalette::Window, QColor(240, 240, 240));
    lightPalette.setColor(QPalette::WindowText, Qt::black);
    lightPalette.setColor(QPalette::Base, QColor(255, 255, 255));
    lightPalette.setColor(QPalette::AlternateBase, QColor(225, 225, 225));
    lightPalette.setColor(QPalette::ToolTipBase, Qt::black);
    lightPalette.setColor(QPalette::ToolTipText, Qt::black);
    lightPalette.setColor(QPalette::Text, Qt::black);
    lightPalette.setColor(QPalette::Button, QColor(240, 240, 240));
    lightPalette.setColor(QPalette::ButtonText, Qt::black);
    lightPalette.setColor(QPalette::BrightText, Qt::red);
    lightPalette.setColor(QPalette::Link, QColor(0, 0, 255));
    lightPalette.setColor(QPalette::Highlight, QColor(0, 120, 215));
    lightPalette.setColor(QPalette::HighlightedText, Qt::white);

    // 设置应用程序使用的调色板
    a.setPalette(lightPalette);



#if DEPOLY
    output = fopen("./log.txt", "a");
    qInstallMessageHandler(msgHandler);
#endif

#if TEST_SKIP_LOGIN
    MainWidget* w = MainWidget::getInstance();
    w->show();
#else
    LoginWidget* loginWidget = new LoginWidget(nullptr);
    loginWidget->show();
#endif

#if TEST_NETWORK
    // network::NetClient netClient(nullptr);
    // netClient.ping();

    model::DataCenter* dataCenter = model::DataCenter::getInstance();
    dataCenter->ping();
#endif
    return a.exec();
}
