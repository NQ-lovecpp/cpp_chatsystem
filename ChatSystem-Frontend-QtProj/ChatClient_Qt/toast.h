#ifndef TOAST_H
#define TOAST_H

#include <QDialog>
#include <QWidget>

class Toast : public QDialog
{
    Q_OBJECT
public:
    // 此处不需要指定父窗口. 全局通知的父窗口就是 桌面.
    Toast(const QString& text);

    // 并不需要手动来 new 这个对象, 而是通过 showMessage 来弹出窗口
    static void showMessage(const QString& text);
};

#endif // TOAST_H
