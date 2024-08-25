#ifndef MAINWIDGET_H
#define MAINWIDGET_H

#include <QWidget>
#include <QPushButton>
#include <QLineEdit>

#include "messageshowarea.h"
#include "messageeditarea.h"
#include "sessionfriendarea.h"

QT_BEGIN_NAMESPACE
namespace Ui {
class MainWidget;
}
QT_END_NAMESPACE

class MainWidget : public QWidget
{
    Q_OBJECT

private:
    static MainWidget* instance;
    // 对于单例模式来说, 最关键的部分, 不是 "创建实例" , 而是限制别人创建实例.
    MainWidget(QWidget *parent = nullptr);

public:
    static MainWidget* getInstance();
    ~MainWidget();

private:
    Ui::MainWidget *ui;

    // 窗口最左侧部分
    QWidget* windowLeft;
    // 窗口中间部分
    QWidget* windowMid;
    // 窗口右侧部分
    QWidget* windowRight;

    // 用户头像
    QPushButton* userAvatar;
    // 会话标签页按钮
    QPushButton* sessionTabBtn;
    // 好友标签页按钮
    QPushButton* friendTabBtn;
    // 好友申请标签页按钮
    QPushButton* applyTabBtn;

    // 用户搜索框
    QLineEdit* searchEdit;
    // 添加好友按钮
    QPushButton* addFriendBtn;

    SessionFriendArea* sessionFriendArea;

    // 显示会话标题
    QLabel* sessionTitleLabel;

    // 显示会话详情按钮
    QPushButton* extraBtn;

    // 消息展示区
    MessageShowArea* messageShowArea;

    // 消息编辑区
    MessageEditArea* messageEditArea;

    enum ActiveTab {
        SESSION_LIST,
        FRIEND_LIST,
        APPLY_LIST
    };

    ActiveTab activeTab = SESSION_LIST;

public:
    void initMainWindow();
    void initLeftWindow();
    void initMidWindow();
    void initRightWindow();

    void initSignalSlot();
    void initWebsocket();

    void switchTabToSession();
    void switchTabToFriend();
    void switchTabToApply();

    void loadSessionList();
    void loadFriendList();
    void loadApplyList();

    void updateFriendList();
    void updateChatSessionList();
    void updateApplyList();

    void loadRecentMessage(const QString& chatSessionId);
    void updateRecentMessage(const QString& chatSessionId);

    // 点击好友项之后, 切换到会话列表的总的函数. 上方的 switchTabToSession 只是其中的一个环节.
    void switchSession(const QString& userId);

    MessageShowArea* getMessageShowArea();
};
#endif // MAINWIDGET_H
