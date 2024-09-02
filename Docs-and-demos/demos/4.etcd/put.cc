#include <etcd/Client.hpp>
// #include <etcd/SyncClient.hpp  
#include <etcd/KeepAlive.hpp>  
#include <etcd/Value.hpp>  
#include <etcd/Watcher.hpp>

#include <thread>

#include <gtest/gtest.h>


int main(int argc, char* argv[])
{
    // 这个url是etcd服务器接收client请求的url
    std::string etcd_host_url = "http://127.0.0.1:2379";
    // 实例化一个etcd客户端
    etcd::Client client(etcd_host_url);
    // 获取一个租约保活对象，伴随着创建一个指定时长的租约
    auto keep_alive = client.leasekeepalive(3).get();
    // 获取租约ID
    auto lease_id = keep_alive->Lease();
    // 向etcd新增数据，有租约
    auto resp = client.put("/service/user", "127.0.0.1:8080", lease_id).get();
    if(resp.is_ok() == false)
    {
        std::cout << "新增数据失败：" << resp.error_message() << std::endl;
        return -1;
    }

    // 向etcd新增数据，没有租约
    resp = client.put("/service/friend", "127.0.0.1:9090", lease_id).get();
    if(resp.is_ok() == false)
    {
        std::cout << "新增数据失败：" << resp.error_message() << std::endl;
        return -1;
    }

    // 等待10秒钟
    std::this_thread::sleep_for(std::chrono::seconds(10));
    // 手动停止租约的心跳机制
    keep_alive.reset(); // 销毁KeepAlive对象，停止心跳
    std::cout << "已经停止续租..." << std::endl;

    std::this_thread::sleep_for(std::chrono::seconds(10));
    std::cout << "退出..." << std::endl;
    return 0;
}