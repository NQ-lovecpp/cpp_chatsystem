#ifndef SOUNDRECORDER_H
#define SOUNDRECORDER_H

#include <QObject>
#include <QStandardPaths>
#include <QFile>
#include <QAudioSource>
#include <QAudioSink>
#include <QMediaDevices>

class SoundRecorder : public QObject
{
    Q_OBJECT
public:
    const QString RECORD_PATH = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation) + "/sound/tmpRecord.pcm";
    const QString PLAY_PATH = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation) + "/sound/tmpPlay.pcm";

public:
    static SoundRecorder* getInstance();

    /////////////////////////////////////////////////
    /// 录制语音语音
    /////////////////////////////////////////////////
    // 开始录制
    void startRecord();
    // 停止录制
    void stopRecord();

private:
    static SoundRecorder* instance;
    explicit SoundRecorder(QObject *parent = nullptr);

    QFile soundFile;
    QAudioSource* audioSource;

    /////////////////////////////////////////////////
    /// 播放语音
    /////////////////////////////////////////////////
public:
    // 开始播放
    void startPlay(const QByteArray& content);
    // 停止播放
    void stopPlay();

private:
    QAudioSink *audioSink;
    QMediaDevices *outputDevices;
    QAudioDevice outputDevice;
    QFile inputFile;

signals:
    // 录制完毕后发送这个信号
    void soundRecordDone(const QString& path);
    // 播放完毕发送这个信号
    void soundPlayDone();

};

#endif // SOUNDRECORDER_H
