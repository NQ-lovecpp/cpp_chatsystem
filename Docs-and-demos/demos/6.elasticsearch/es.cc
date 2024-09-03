#include <elasticlient/client.h>
#include <cpr/cpr.h>
#include <iostream>

int main()
{
    // 1. 构造ES客户端
    elasticlient::Client client({"http://127.0.0.1:9200/"});

    try 
    {    
        // 2. 发起搜索请求
        auto resp = client.search("user", "_doc", R"(
            {
                "query": {
                    "match_all": {}
                }
            }
        )");

        // 3. 打印响应状态码和响应正文
        std::cout << "状态码: " << resp.status_code << std::endl;
        std::cout << "内容：" << resp.text << std::endl;
    } 
    catch(std::exception &e) 
    {
        std::cout << e.what() << std::endl;
    }

    return 0;
}