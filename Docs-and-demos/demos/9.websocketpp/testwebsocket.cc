#include <websocketpp/config/asio_no_tls.hpp>  // 不使用TLS的Asio配置
#include <websocketpp/server.hpp>              // 包含WebSocket++服务器的定义

#include <iostream>  // 用于标准输入输出

// 定义WebSocket++服务器类型，基于不使用TLS的Asio配置
typedef websocketpp::server<websocketpp::config::asio> server;

using websocketpp::lib::placeholders::_1;  // 占位符，用于绑定函数时的第一个参数
using websocketpp::lib::placeholders::_2;  // 占位符，用于绑定函数时的第二个参数
using websocketpp::lib::bind;  // 引入bind函数，用于绑定回调函数

// 从服务器配置中提取消息指针类型
typedef server::message_ptr message_ptr;

// 定义连接建立时的回调函数
void on_open(websocketpp::server<websocketpp::config::asio>* s, websocketpp::connection_hdl hdl) {
    websocketpp::server<websocketpp::config::asio>::connection_ptr con = s->get_con_from_hdl(hdl);
    std::cout << "连接建立: " 
              << "客户端地址: " << con->get_remote_endpoint() << std::endl;
}

// 定义连接断开时的回调函数
void on_close(websocketpp::server<websocketpp::config::asio>* s, websocketpp::connection_hdl hdl) {
    websocketpp::server<websocketpp::config::asio>::connection_ptr con = s->get_con_from_hdl(hdl);
    std::cout << "连接断开: " 
              << "客户端地址: " << con->get_remote_endpoint()
              << std::endl;
}

// 定义一个回调函数，用于处理接收到的消息
void on_message(server* s, websocketpp::connection_hdl hdl, message_ptr msg) {
    std::cout << "on_message 被调用，hdl: " << hdl.lock().get()
              << " payload是: " << msg->get_payload()
              << std::endl;

    // 检查是否有一个特殊指令来停止服务器监听，以便安全退出
    if (msg->get_payload() == "stop-listening") {
        s->stop_listening();  // 停止服务器监听
        return;
    }

    try {
        // 将接收到的消息原样发送回客户端
        // s->send(hdl, msg->get_payload(), msg->get_opcode());

        // 获取通信连接
        auto conn = s->get_con_from_hdl(hdl);
        // 发送回声数据
        conn->send(msg->get_payload() + " - this is echo message!!!", websocketpp::frame::opcode::text);
    } catch (websocketpp::exception const & e) {
        // 如果回声发送失败，输出错误信息
        std::cout << "回声发送失败，原因: "
                  << "(" << e.what() << ")" << std::endl;
    }
}

int main() {
    // 1. 创建一个服务器端点
    server echo_server;

    try {
        // 2. 设置日志记录配置
        echo_server.set_access_channels(websocketpp::log::alevel::none);  // 关闭日志
        echo_server.clear_access_channels(websocketpp::log::alevel::frame_payload);  // 禁用帧负载日志

        // 3. 初始化Asio框架
        echo_server.init_asio();

        // 4. 注册消息处理器
        echo_server.set_open_handler(std::bind(on_open, &echo_server, ::_1));
        echo_server.set_close_handler(std::bind(on_close, &echo_server, ::_1));
        echo_server.set_message_handler(std::bind(on_message, &echo_server, ::_1, ::_2));

        // 5. 监听9002端口
        echo_server.listen(9002);

        // 6. 启动服务器接受连接的循环
        echo_server.start_accept();

        // 启动Asio的io_service运行循环
        echo_server.run();
    } catch (websocketpp::exception const & e) {
        // 捕获并输出WebSocket++的异常
        std::cout << e.what() << std::endl;
    } catch (...) {
        // 捕获其他异常并输出
        std::cout << "其他异常" << std::endl;
    }
}
