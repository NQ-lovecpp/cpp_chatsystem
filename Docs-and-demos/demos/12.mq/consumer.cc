/**
 *  @author czw
 */

/**
 *  Dependencies
 */
#include <ev.h>
#include <amqpcpp.h>
#include <amqpcpp/libev.h>
#include <openssl/ssl.h>
#include <openssl/opensslv.h>
#include <amqpcpp/message.h>

#include <functional>

class Message;

// void(const Message &message, uint64_t deliveryTag, bool redelivered)

// 实现一个消息处理的回调函数
void My_on_get_msg(AMQP::TcpChannel *channel, const AMQP::Message &message, uint64_t deliveryTag, bool redelivered) {
    std::string msg;
    msg.assign(message.body(), message.bodySize());
    // std::cout << message.body() << std::endl;
    std::cout << "收到消息：" << msg << std::endl;
    channel->ack(deliveryTag);// 确认
}


int main()
{
    // 1.实例化底层网络通信框架的I/O事件监控句柄
    auto *loop = EV_DEFAULT;
    
    // 2.实例化libEventHandler句柄，将AMQP框架与事件监控关联起来
    AMQP::LibEvHandler handler(loop);

    // // init the SSL library
    // #if OPENSSL_VERSION_NUMBER < 0x10100000L
    //     SSL_library_init();
    // #else
    //     OPENSSL_init_ssl(0, NULL);
    // #endif


    // 3.实例化连接对象
    AMQP::Address address("amqp://chen:czhuowen@127.0.0.1:5672/"); // "amqp://guest:guest@localhost/"
    AMQP::TcpConnection connection(&handler, address);

    // 4.实例化信道对象
    AMQP::TcpChannel channel(&connection);

    // 5.声明交换机
    auto& exchanger_deferred = channel.declareExchange("test-exchange", AMQP::ExchangeType::direct);
        // using ErrorCallback   =   std::function<void(const char *message)>;
    exchanger_deferred.onError([](const char *msg){
        std::cerr << "声明交换机失败: " << msg << std::endl;
        exit(0);
    });
    exchanger_deferred.onSuccess([&](){
        std::cerr << "声明交换机成功！" << std::endl;
    });

    // 6.声明队列
    auto& queue_deferred = channel.declareQueue("test-queue");
    queue_deferred.onError([](const char *msg){
        std::cerr << "声明队列失败: " << msg << std::endl;
        exit(0);
    });
    queue_deferred.onSuccess([&](){
        std::cerr << "声明队列成功！" << std::endl;
    });

    // 7.交换机和队列进行绑定到信道中
    auto& binding_deferred = channel.bindQueue("test-exchange", "test-queue", "test-queue-key");
    binding_deferred.onError([](const char *msg){
        std::cerr << "绑定失败: " << msg << std::endl;
        exit(0);
    });
    binding_deferred.onSuccess([&](){
        std::cerr << "绑定成功！" << std::endl;
    });

    // 8.订阅消息队列，并设置回调处理函数
    auto& consumer_deferred = channel.consume("test-queue", "consumer-tag");
    consumer_deferred.onError([](const char* msg){
        std::cerr << "订阅 test-queue 失败, 原因: " << msg << std::endl;
        exit(0);
    });

    std::function<void(const AMQP::Message&, uint64_t, bool)> callback = std::bind(
        My_on_get_msg, &channel, 
        std::placeholders::_1,
        std::placeholders::_2, 
        std::placeholders::_3
    );
    consumer_deferred.onReceived(callback);

    // 9.启动网络通信框架，开启IO
    ev_run(loop, 0);
  

    //休眠
    //释放资源
    return 0;
}