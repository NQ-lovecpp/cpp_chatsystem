#ifndef ADDFRIENDDIALOG_H
#define ADDFRIENDDIALOG_H

#include <QDialog>
#include <QGridLayout>
#include <QLineEdit>

#include "model/data.h"

using model::UserInfo;

//////////////////////////////////////
/// 表示一个好友搜索的结果
//////////////////////////////////////
class FriendResultItem : public QWidget {
    Q_OBJECT
public:
    FriendResultItem(const UserInfo& userInfo);
    void clickAddBtn();

private:
    const UserInfo& userInfo;

    QPushButton* addBtn;
};

//////////////////////////////////////
/// 整个搜索好友的窗口
//////////////////////////////////////
class AddFriendDialog : public QDialog
{
    Q_OBJECT
public:
    AddFriendDialog(QWidget* parent);

    // 初始化结果显示区
    void initResultArea();

    // 往窗口中新增一个好友搜索结果
    void addResult(const UserInfo& userInfo);

    // 清空界面上所有的好友结果
    void clear();

    void setSearchKey(const QString& searchKey);

    void clickSearchBtn();
    void clickSearchBtnDone();

private:
    QLineEdit* searchEdit;

    // 整个窗口总的网格布局
    QGridLayout* layout;

    // 保存搜索好友的结果
    QWidget* resultContainer;
};


#endif // ADDFRIENDDIALOG_H
