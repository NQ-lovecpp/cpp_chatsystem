// 实现文件存储子服务
// 1. 实现文件rpc服务类 --- 实现rpc调用的业务处理接口
// 2. 实现文件存储子服务的服务器类
// 3. 实现文件存储子服务类的构造者
#include <brpc/server.h>
#include <butil/logging.h>

#include "etcd.hpp"   // 服务注册模块封装
#include "logger.hpp" // 日志模块封装
#include "utility.hpp"
#include "base.pb.h"
#include "file.pb.h"

namespace chen_im
{
    class FileServiceImpl : public chen_im::FileService
    {  
    private:
        std::string _storage_path;
    public:
        FileServiceImpl(const std::string &storage_path)
            : _storage_path(storage_path)
        {
            umask(0);
            mkdir(storage_path.c_str(), 0775);
            if (_storage_path.back() != '/')
                _storage_path.push_back('/');
        }
        ~FileServiceImpl() {}

        void GetSingleFile(google::protobuf::RpcController *controller,
                           const ::chen_im::GetSingleFileReq *request,
                           ::chen_im::GetSingleFileRsp *response,
                           ::google::protobuf::Closure *done)
        {
            LOG_INFO("用户 {} 请求获取单个文件...", request->user_id());

            brpc::ClosureGuard closure_guard(done);
            response->set_request_id(request->request_id());
            // 1. 取出请求中的文件ID（起始就是文件名）
            std::string fid = request->file_id();
            std::string filename = _storage_path + fid;
            // 2. 将文件ID作为文件名，读取文件数据
            std::string body;
            bool ret = read_file(filename, body);
            if (ret == false)
            {
                response->set_success(false);
                response->set_errmsg("读取文件数据失败！");
                LOG_ERROR("{} 读取文件数据失败！", request->request_id());
                return;
            }
            // 3. 组织响应
            response->set_success(true);
            response->mutable_file_data()->set_file_id(fid);
            response->mutable_file_data()->set_file_content(body);

            LOG_INFO("用户 {} 请求单个文件成功", request->user_id());
        }

        void GetMultiFile(google::protobuf::RpcController *controller,
                          const ::chen_im::GetMultiFileReq *request,
                          ::chen_im::GetMultiFileRsp *response,
                          ::google::protobuf::Closure *done)
        {
            LOG_INFO("用户 {} 请求获取多个文件...", request->user_id());

            brpc::ClosureGuard closure_guard(done);
            response->set_request_id(request->request_id());

            // 循环取出请求中的文件ID，读取文件数据进行填充
            for (int i = 0; i < request->file_id_list_size(); i++)
            {
                std::string fid = request->file_id_list(i);
                std::string filename = _storage_path + fid;
                std::string body;
                bool ret = read_file(filename, body);
                if (ret == false)
                {
                    response->set_success(false);
                    response->set_errmsg("读取文件数据失败！");
                    LOG_ERROR("{} 读取文件数据失败！", request->request_id());
                    return;
                }
                FileDownloadData data;
                data.set_file_id(fid);
                data.set_file_content(body);
                response->mutable_file_data()->insert({fid, data});
            }
            response->set_success(true);

            LOG_INFO("用户 {} 请求多个文件成功", request->user_id());
        }

        void PutSingleFile(google::protobuf::RpcController *controller,
                           const ::chen_im::PutSingleFileReq *request,
                           ::chen_im::PutSingleFileRsp *response,
                           ::google::protobuf::Closure *done)
        {
            LOG_INFO("用户 {} 上传单个文件...", request->user_id());

            brpc::ClosureGuard closure_guard(done);
            response->set_request_id(request->request_id());

            // 1. 为文件生成一个唯一uudi作为文件名 以及 文件ID
            std::string fid = generate_uuid();
            std::string filename = _storage_path + fid;

            // 2. 取出请求中的文件数据，进行文件数据写入
            bool ret = write_file(filename, request->file_data().file_content());
            if (ret == false)
            {
                response->set_success(false);
                response->set_errmsg("读取文件数据失败！");
                LOG_ERROR("{} 写入文件数据失败！", request->request_id());
                return;
            }
            
            // 3. 组织响应
            response->set_success(true);
            response->mutable_file_info()->set_file_id(fid);
            response->mutable_file_info()->set_file_size(request->file_data().file_size());
            response->mutable_file_info()->set_file_name(request->file_data().file_name());

            LOG_INFO("用户 {} 上传单个文件成功", request->user_id());
        }

        void PutMultiFile(google::protobuf::RpcController *controller,
                          const ::chen_im::PutMultiFileReq *request,
                          ::chen_im::PutMultiFileRsp *response,
                          ::google::protobuf::Closure *done)
        {
            LOG_INFO("用户 {} 上传多个文件...", request->user_id());

            brpc::ClosureGuard closure_guard(done);
            response->set_request_id(request->request_id());
            for (int i = 0; i < request->file_data_size(); i++)
            {
                std::string fid = generate_uuid();
                std::string filename = _storage_path + fid;
                bool ret = write_file(filename, request->file_data(i).file_content());
                if (ret == false)
                {
                    response->set_success(false);
                    response->set_errmsg("读取文件数据失败！");
                    LOG_ERROR("{} 写入文件数据失败！", request->request_id());
                    return;
                }
                chen_im::FileMessageInfo *info = response->add_file_info();
                info->set_file_id(fid);
                info->set_file_size(request->file_data(i).file_size());
                info->set_file_name(request->file_data(i).file_name());
            }
            response->set_success(true);

            LOG_INFO("用户 {} 上传单个文件成功", request->user_id());
        }

    };

    class FileServer
    {
    private:
        std::shared_ptr<Registry> _registry_client;
        std::shared_ptr<brpc::Server> _brpc_server;
    public:
        FileServer(const std::shared_ptr<Registry>     &reg_client,
                   const std::shared_ptr<brpc::Server> &server     )
            :_registry_client(reg_client)
            , _brpc_server(server) 
        {}

        ~FileServer() {}

        // 搭建RPC服务器，并启动服务器
        void run()
        {
            _brpc_server->RunUntilAskedToQuit();
        }
    };

    class FileServerFactory
    {
    public:
        // 用于构造服务注册客户端对象
        void build_registry_client(const std::string &reg_host,
                                   const std::string &service_name,
                                   const std::string &access_host)
        {
            _registry_client = std::make_shared<Registry>(reg_host);
            _registry_client->registry(service_name, access_host);
        }
        // 构造RPC服务器对象
        void build_brpc_server(uint16_t port, int32_t timeout,
                             uint8_t num_threads, const std::string &path = "./data/")
        {
            _brpc_server = std::make_shared<brpc::Server>();
            FileServiceImpl *file_service = new FileServiceImpl(path);
            int ret = _brpc_server->AddService(file_service,
                                              brpc::ServiceOwnership::SERVER_OWNS_SERVICE);
            if (ret == -1) {
                LOG_ERROR("添加Rpc服务失败！");
                abort();
            }
            brpc::ServerOptions options;
            options.idle_timeout_sec = timeout;
            options.num_threads = num_threads;
            ret = _brpc_server->Start(port, &options);
            if (ret == -1) {
                LOG_ERROR("brpc服务器启动失败！");
                abort();
            }
        }
        std::shared_ptr<FileServer> build()
        {
            if (!_registry_client) {
                LOG_ERROR("还未初始化注册中心客户端模块！");
                abort();
            }

            if (!_brpc_server) {
                LOG_ERROR("还未初始化RPC服务器模块！");
                abort();
            }
            std::shared_ptr<FileServer> server = std::make_shared<FileServer>(_registry_client, _brpc_server);
            return server;
        }

    private:
        std::shared_ptr<Registry> _registry_client;
        std::shared_ptr<brpc::Server> _brpc_server;
    };
}