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

    // 8.向交换机发布消息
    for(int i = 0; i < 10; i++) {
        std::string msg = "我是猪[" + std::to_string(i) + "]";
        bool ret = channel.publish("test-exchange", "test-queue-key", msg);
        if (ret == false) {
            std::cerr << "publish失败!" << std::endl;
        }
    }


    // 9.启动网络通信框架，开启IO
    ev_run(loop, 0);


    // 9.休眠
    // 10.释放资源
    return 0;
}