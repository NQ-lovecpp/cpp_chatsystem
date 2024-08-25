#ifndef HISTORYMESSAGEWIDGET_H
#define HISTORYMESSAGEWIDGET_H

#include <QDialog>
#include <QWidget>
#include <QGridLayout>
#include <QRadioButton>
#include <QLineEdit>
#include <QPushButton>
#include <QLabel>

#include "model/data.h"

using model::Message;

////////////////////////////////////////////////////////////////////
/// 表示一个历史消息元素
////////////////////////////////////////////////////////////////////

class HistoryItem : public QWidget {
    Q_OBJECT
public:
    HistoryItem() {}

    static HistoryItem* makeHistoryItem(const Message& message);
};

////////////////////////////////////////////////////////////////////
/// 展示历史消息窗口
////////////////////////////////////////////////////////////////////
class HistoryMessageWidget : public QDialog
{
    Q_OBJECT
public:
    HistoryMessageWidget(QWidget* parent);

    // 在窗口中添加一个历史消息
    void addHistoryMessage(const Message& message);

    // 清空窗口中所有的历史消息
    void clear();

    void clickSearchBtn();
    void clickSearchBtnDone();

private:
    // 持有所有的历史消息结果的容器对象
    QWidget* container;

    QLineEdit* searchEdit;
    QRadioButton* keyRadioBtn;
    QRadioButton* timeRadioBtn;
    QDateTimeEdit* begTimeEdit;
    QDateTimeEdit* endTimeEdit;

    void initScrollArea(QGridLayout* layout);
};

////////////////////////////////////////////////////////////////////
/// 展示图片历史消息
////////////////////////////////////////////////////////////////////

class ImageButton : public QPushButton {
public:
    ImageButton(const QString& fileId, const QByteArray& content);
    void updateUI(const QString& fileId, const QByteArray& content);

private:
    QString fileId;
};

////////////////////////////////////////////////////////////////////
/// 展示文件历史消息
////////////////////////////////////////////////////////////////////

class FileLabel : public QLabel {
public:
    FileLabel(const QString& fileId, const QString& fileName);

    void getContentDone(const QString& fileId, const QByteArray& fileContent);

    // 通过这个函数, 来处理鼠标点击操作.
    void mousePressEvent(QMouseEvent* event) override;

private:
    QString fileId;
    QByteArray content;
    QString fileName;
    bool loadDone = false;
};

////////////////////////////////////////////////////////////////////
/// 展示语音历史消息
////////////////////////////////////////////////////////////////////

class SpeechLabel : public QLabel {
public:
    SpeechLabel(const QString& fileId);

    void getContentDone(const QString& fileId, const QByteArray& content);

    // 通过这个函数处理鼠标点击
    void mousePressEvent(QMouseEvent* event) override;

private:
    QString fileId;
    QByteArray content;
    bool loadDone = false;
};

#endif // HISTORYMESSAGEWIDGET_H












