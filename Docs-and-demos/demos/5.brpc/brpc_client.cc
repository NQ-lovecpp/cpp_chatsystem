// #include <brpc/channel.h>
// #include <brpc/server.h>
// #include <thread>
// #include "./main.pb.h"

// void callback(brpc::Controller *ctrl, 
//             ::example::EchoResponse *response)
// {
//     std::cout << "收到响应：" << response->message() << std::endl;
//     delete ctrl;
//     delete response;
// }

// int main(int argc, char *argv[])
// {
//     // 1. 构造一个channel，用于连接服务器
//     brpc::Channel channel;
//     brpc::ChannelOptions options;
//     options.connect_timeout_ms = -1; // -1 means wait indefinitely.
//     options.max_retry = 3; // 请求重试次数
//     options.protocol = "baidu_std";

//     int ret = channel.Init("127.0.0.1:8787", &options);
//     if (ret == -1) {
//         std::cout << "初始化信道失败" << std::endl;
//     }
//     // 2. 构造一个echoservice，用于进行rpc调用
//     example::EchoService_Stub stub(&channel);

//     // // 3. 进行rpc调用(同步调用)
//     // example::EchoRequest req;
//     // req.set_message("hello server, I'm clinet.");

//     // brpc::Controller *ctrl = new brpc::Controller();
//     // example::EchoResponse *resp = new example::EchoResponse();

//     // stub.Echo(ctrl, &req, resp, nullptr); // 这是真正的调用
//     // if (ctrl->Failed() == true) {
//     //     std::cout << "rpc调用失败：" << ctrl->ErrorText() << std::endl;
//     //     return -1;
//     // }
//     // std::cout << "收到响应：" << resp->message() << std::endl;

//     // delete ctrl;
//     // delete resp;

//     // 4. 进行rpc调用(异步调用)
//     example::EchoRequest req;
//     req.set_message("hello server, I'm clinet.");

//     brpc::Controller *ctrl = new brpc::Controller();
//     example::EchoResponse *resp = new example::EchoResponse();
//     google::protobuf::Closure *closure = google::protobuf::NewCallback(callback, ctrl, resp);
//     stub.Echo(ctrl, &req, resp, closure); // 这是真正的调用
//     if (ctrl->Failed() == true) {
//         std::cout << "rpc调用失败：" << ctrl->ErrorText() << std::endl;
//         return -1;
//     }
//     std::cout << "异步调用完成" << std::endl;
//     std::this_thread::sleep_for(std::chrono::seconds(10));
//     return 0;
// }




#include <gtest/gtest.h>
#include <brpc/channel.h>
#include <brpc/server.h>
#include <thread>
#include "./main.pb.h"

// 模拟的回调函数
void test_callback(brpc::Controller *ctrl, ::example::EchoResponse *response) {
    if (ctrl->Failed()) {
        std::cout << "异步rpc调用失败：" << ctrl->ErrorText() << std::endl;
    } else {
        std::cout << "收到异步响应：" << response->message() << std::endl;
    }

    delete ctrl;
    delete response;
}

// 同步调用的测试
TEST(EchoServiceTest, SyncCall) {
    // 1. 构造一个channel，用于连接服务器
    brpc::Channel channel;
    brpc::ChannelOptions options;
    options.connect_timeout_ms = -1;
    options.max_retry = 3;
    options.protocol = "baidu_std";

    int ret = channel.Init("127.0.0.1:8787", &options);
    ASSERT_EQ(ret, 0) << "初始化信道失败";

    // 2. 构造一个echoservice，用于进行rpc调用
    example::EchoService_Stub stub(&channel);

    // 3. 进行rpc调用(同步调用)
    example::EchoRequest req;
    req.set_message("hello server, I'm client.");

    brpc::Controller ctrl;
    example::EchoResponse resp;

    stub.Echo(&ctrl, &req, &resp, nullptr); // 这是真正的调用

    if (ctrl.Failed()) {
        std::cout << "rpc调用失败：" << ctrl.ErrorText() << std::endl;
    }
    ASSERT_FALSE(ctrl.Failed()) << "同步rpc调用失败";

    std::cout << "收到同步响应：" << resp.message() << std::endl;
}

// 异步调用的测试
TEST(EchoServiceTest, AsyncCall) {
    // 1. 构造一个channel，用于连接服务器
    brpc::Channel channel;
    brpc::ChannelOptions options;
    options.connect_timeout_ms = -1;
    options.max_retry = 3;
    options.protocol = "baidu_std";

    int ret = channel.Init("127.0.0.1:8787", &options);
    ASSERT_EQ(ret, 0) << "初始化信道失败";

    // 2. 构造一个echoservice，用于进行rpc调用
    example::EchoService_Stub stub(&channel);

    // 4. 进行rpc调用(异步调用)
    example::EchoRequest req;
    req.set_message("hello server, I'm client.");

    brpc::Controller *ctrl = new brpc::Controller();
    example::EchoResponse *resp = new example::EchoResponse();
    bool callback_triggered = false;

    google::protobuf::Closure *closure = google::protobuf::NewCallback(test_callback, ctrl, resp);
    stub.Echo(ctrl, &req, resp, closure); // 这是真正的调用

    std::this_thread::sleep_for(std::chrono::seconds(1)); // 等待回调执行

}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
