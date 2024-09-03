#include "../../../Common/httplib.h"

int main()
{
    //1．实例化服务器对象
    httplib::Server server;

    //2.注册回调函数void(const httplib::Request &,httplib::Response &)
    server.Get("/hi",[](const httplib::Request &req, httplib::Response &rsp) {
        std::cout << req.method << std::endl;
        std::cout << req.path << std::endl;
        for(auto it : req.headers)
        {
            std::cout << it.first << ": " << it.second << std::endl;
            std::string body = "<html><body><h1>Hello Bite</h1></body></html>";
            rsp.set_content(body,"text/html");
            rsp.status = 200;
        }
    });    
    
    //3．启动服务器
    server.listen("0.0.0.0", 11111);
    return 0;
}