#include <json/json.h>
#include <memory>
#include <string>
#include <iostream>
#include <sstream>

bool Serialize(const Json::Value &val, std::string *out_str)
{
    // 先定义
    Json::StreamWriterBuilder swb;
    std::unique_ptr<Json::StreamWriter> stream_writer(swb.newStreamWriter());
    // 通过streamwriter中的write接口进行序列化
    std::stringstream ss;
    int ret = stream_writer->write(val, &ss);
    if(ret != 0) {
        std::cerr << "反序列化失败\n";
        return false;
    }
    *out_str = ss.str();
    return true;
}

bool Deserialize(const std::string &src, Json::Value *out_value)
{
    Json::CharReaderBuilder crb;
    std::unique_ptr<Json::CharReader> cr(crb.newCharReader());
    std::string err;
    bool ret = cr->parse(src.c_str(), src.c_str() + src.size(), out_value, &err);
    if (ret == false) {
        std::cout << "json反序列化失败，原因：" << err << std::endl;
        return false;
    }
    return true;
}

int main()
{
    char name[] = "张三";
    int age = 10;
    float score[] = {43.43, 234.23, 445};

    Json::Value stu;
    stu["姓名"] = name;
    stu["年龄"] = age;
    stu["成绩"].append(score[0]);
    stu["成绩"].append(score[1]);
    stu["成绩"].append(score[2]);

    // 1. 序列化
    std::string stu_str; // 序列
    bool ret = Serialize(stu, &stu_str);
    if (ret == false) return -1;
    else {
        std::cout << "这是序列化的结果：" << std::endl;
        std::cout << stu_str << std::endl;
        std::cout << "--------end---------" << std::endl;
    }

    // 2. 反序列化
    Json::Value ret_val;
    ret = Deserialize(stu_str, &ret_val);
    if (ret == false) {
        return -1;
    } else {
        std::cout << "这是返序列化后的结果：" << std::endl;
        std::cout << ret_val["姓名"].asString() << std::endl;
        std::cout << ret_val["年龄"].asInt() << std::endl;
        std::cout << ret_val["成绩"][0] << std::endl;
        std::cout << ret_val["成绩"][1] << std::endl;
        std::cout << ret_val["成绩"][2] << std::endl;
        std::cout << "--------end---------" << std::endl;
    }
    return 0;
}