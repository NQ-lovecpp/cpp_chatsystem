#include "widget.h"
#include "./ui_widget.h"
#include "server.h"

Widget::Widget(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::Widget)
{
    ui->setupUi(this);
}

Widget::~Widget()
{
    delete ui;
}

void Widget::on_pushButton_clicked()
{
    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    emit websocketServer->sendTextResp();
}


void Widget::on_pushButton_2_clicked()
{
    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    emit websocketServer->sendFriendRemove();
}


void Widget::on_pushButton_3_clicked()
{
    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    emit websocketServer->sendAddFriendApply();
}


void Widget::on_pushButton_4_clicked()
{
    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    emit websocketServer->sendAddFriendProcess(true);
}


void Widget::on_pushButton_5_clicked()
{
    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    emit websocketServer->sendAddFriendProcess(false);
}


void Widget::on_pushButton_6_clicked()
{
    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    emit websocketServer->sendCreateChatSession();
}


void Widget::on_pushButton_7_clicked()
{
    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    emit websocketServer->sendImageResp();
}


void Widget::on_pushButton_8_clicked()
{
    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    emit websocketServer->sendFileResp();
}

void Widget::on_pushButton_9_clicked()
{
    WebsocketServer* websocketServer = WebsocketServer::getInstance();
    emit websocketServer->sendSpeechResp();
}

