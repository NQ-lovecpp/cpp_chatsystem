#ifndef SESSIONDETAILWIDGET_H
#define SESSIONDETAILWIDGET_H

#include <QDialog>
#include <QWidget>
#include <QLabel>

#include "model/data.h"

using model::UserInfo;

/////////////////////////////////////////////
/// 表示一个头像 +  一个名字组合控件
/////////////////////////////////////////////

class AvatarItem : public QWidget {
    Q_OBJECT
public:
    AvatarItem(const QIcon& avatar, const QString& name);

    QPushButton* getAvatar() {
        return avatarBtn;
    }

private:
    QPushButton* avatarBtn;
    QLabel* nameLabel;
};

/////////////////////////////////////////////
/// 表示 "单聊会话详情" 窗口
/////////////////////////////////////////////

class SessionDetailWidget : public QDialog
{
    Q_OBJECT
public:
    SessionDetailWidget(QWidget* parent, const UserInfo& userInfo);

    void clickDeleteFriendBtn();

private:
    QPushButton* deleteFriendBtn;

    UserInfo userInfo;
};



#endif // SESSIONDETAILWIDGET_H
