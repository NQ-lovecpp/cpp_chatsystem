#ifndef CHOOSEFRIENDDIALOG_H
#define CHOOSEFRIENDDIALOG_H

#include <QDialog>
#include <QWidget>
#include <QHBoxLayout>
#include <QCheckBox>
#include <QLabel>

////////////////////////////////////////////////
/// 选择好友窗口中的一个 元素/好友项
////////////////////////////////////////////////

class ChooseFriendDialog;

class ChooseFriendItem : public QWidget {
Q_OBJECT
public:
    ChooseFriendItem(ChooseFriendDialog* owner, const QString& userId, const QIcon& avatar, const QString& name, bool checked);

    void paintEvent(QPaintEvent* event) override;
    void enterEvent(QEnterEvent* event) override;
    void leaveEvent(QEvent* event) override;

    const QString& getUserId() const {
        return userId;
    }

    QCheckBox* getCheckBox() {
        return checkBox;
    }

private:
    bool isHover = false;

    QCheckBox* checkBox;
    QPushButton* avatarBtn;
    QLabel* nameLabel;
    ChooseFriendDialog* owner;			// 记录了哪个 QWidget 持有了这个 Item. 此处的 QWidget 应该是一个 ChooseFriendDialog

    QString userId;   					// 记录了当前 Item 对应的 userId 是啥.
};

////////////////////////////////////////////////
/// 选择好友的窗口
////////////////////////////////////////////////

class ChooseFriendDialog : public QDialog
{
    Q_OBJECT
public:
    ChooseFriendDialog(QWidget* parent, const QString& userId);

    void initLeft(QHBoxLayout* layout);
    void initRight(QHBoxLayout* layout);
    void clickOkBtn();
    QList<QString> generateMemberList();

    void initData();

    void addFriend(const QString& userId, const QIcon& avatar, const QString& name, bool checked);
    void addSelectedFriend(const QString& userId, const QIcon& avatar, const QString& name);
    void deleteSelectedFriend(const QString& userId);


private:
    // 保存左侧全部好友列表的 QWidget
    QWidget* totalContainer;
    // 保存右侧选中好友列表的 QWidget
    QWidget* selectedContainer;

    // 当前选择窗口是点击哪个用户来弹出的.
    QString userId;
};

#endif // CHOOSEFRIENDDIALOG_H
