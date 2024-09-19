/// @namespace chen_im  
/// 命名空间chen_im包含项目中一些公共的工具类接口  
  
#include <iostream>  
#include <fstream>  
#include <sstream>  
#include <string>  
#include <atomic>  
#include <random>  
#include <iomanip>  
#include "logger.hpp"  
  
namespace chen_im {  
  
    /// @brief 生成一个唯一ID  
    /// @return 返回生成的唯一ID字符串 形如：34cc-e65243b7-0000
    std::string generate_uuid() {  
        std::random_device rd;  
        std::mt19937 generator(rd());  
        std::uniform_int_distribution<int> distribution(0,255);  
  
        std::stringstream ss;  
        for (int i = 0; i < 6; i++) {  
            if (i == 2) ss << "-";  
            ss << std::setw(2) << std::setfill('0') << std::hex << distribution(generator);  
        }  
        ss << "-";  
  
        static std::atomic<short> idx(0);  
        short tmp = idx.fetch_add(1);  
        ss << std::setw(4) << std::setfill('0') << std::hex << tmp;  
        return ss.str();  
    }  
  
    /// @brief 生成一个四位数字的验证码  
    /// @return 返回生成的验证码字符串  
    std::string generate_verification_code() {  
        std::random_device rd;  
        std::mt19937 generator(rd());  
        std::uniform_int_distribution<int> distribution(0,9);  
  
        std::stringstream ss;  
        for (int i = 0; i < 4; i++) {  
            ss << distribution(generator);  
        }  
        return ss.str();  
    }  
  
    /// @brief 读取文件内容  
    /// @param filename 文件名  
    /// @param body 用于存储文件内容的字符串  
    /// @return 读取成功返回true，失败返回false  
    bool read_file(const std::string &filename, std::string &body) {  
        std::ifstream ifs(filename, std::ios::binary | std::ios::in);  
        if (!ifs.is_open()) {  
            LOG_ERROR("打开文件 {} 失败！", filename);  
            return false;  
        }  
        ifs.seekg(0, std::ios::end);  
        size_t flen = ifs.tellg();  
        ifs.seekg(0, std::ios::beg);  
        body.resize(flen);  
        ifs.read(&body[0], flen);  
        if (!ifs.good()) {  
            LOG_ERROR("读取文件 {} 数据失败！", filename);  
            ifs.close();  
            return false;  
        }  
        ifs.close();  
        return true;  
    }  
  
    /// @brief 写入文件内容  
    /// @param filename 文件名  
    /// @param body 要写入文件的内容  
    /// @return 写入成功返回true，失败返回false  
    bool write_file(const std::string &filename, const std::string &body) {  
        std::ofstream ofs(filename, std::ios::out | std::ios::binary | std::ios::trunc);  
        if (!ofs.is_open()) {  
            LOG_ERROR("打开文件 {} 失败！", filename);  
            return false;  
        }  
        ofs.write(body.c_str(), body.size());  
        if (!ofs.good()) {  
            LOG_ERROR("写入文件 {} 数据失败！", filename);  
            ofs.close();  
            return false;  
        }  
        ofs.close();  
        return true;  
    }  
  
}