#include "widget.h"

#include <QApplication>
#include <QOperatingSystemVersion>
#include "server.h"

int main(int argc, char *argv[])
{

    QApplication a(argc, argv);

    HttpServer* httpServer = HttpServer::getInstance();
    if(!httpServer->init()) {
        qDebug() << "HTTP 服务器启动失败!";
        return 1;
    }
    qDebug() << "HTTP 服务器启动成功!";

    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    if (!websocketServer->init()) {
        qDebug() << "websocket 服务器启动失败!";
        return 1;
    }
    qDebug() << "websocket 服务器启动成功!";

    Widget w;

    // 设置浅色模式的调色板
    QPalette lightPalette;
    lightPalette.setColor(QPalette::Window, QColor(243, 243, 243));
    lightPalette.setColor(QPalette::WindowText, Qt::black);
    lightPalette.setColor(QPalette::Base, QColor(243, 243, 243));
    lightPalette.setColor(QPalette::AlternateBase, QColor(243, 243, 243));
    lightPalette.setColor(QPalette::ToolTipBase, Qt::black);
    lightPalette.setColor(QPalette::ToolTipText, Qt::black);
    lightPalette.setColor(QPalette::Text, Qt::black);
    lightPalette.setColor(QPalette::Button, QColor(251, 251, 251));
    lightPalette.setColor(QPalette::ButtonText, Qt::black);
    lightPalette.setColor(QPalette::BrightText, Qt::red);
    lightPalette.setColor(QPalette::Link, QColor(0, 0, 255));
    lightPalette.setColor(QPalette::Highlight, QColor(0, 120, 215));
    lightPalette.setColor(QPalette::HighlightedText, Qt::white);

    // 设置应用程序使用的调色板
    a.setPalette(lightPalette);


    w.show();
    return a.exec();
}
