// 实现语音识别子服务
#include <brpc/server.h>
#include <butil/logging.h>

#include "elasticsearch_user.hpp"    // es数据管理客户端封装
#include "redis_CRUD.hpp"      // redis数据管理客户端封装
#include "mysql_user.hpp" // mysql数据管理客户端封装
#include "etcd.hpp"            // 服务注册模块封装
#include "logger.hpp"          // 日志模块封装
#include "utility.hpp"         // 基础工具接口
#include "dms.hpp"             // 短信平台SDK模块封装
#include "rpc_service_manager.hpp"         // 信道管理模块封装

#include "user.hxx"
#include "user-odb.hxx"

#include "user.pb.h" // protobuf框架代码
#include "base.pb.h" // protobuf框架代码
#include "file.pb.h" // protobuf框架代码

namespace chen_im
{
    class UserServiceImpl : public chen_im::UserService
    {     
    private:
        std::shared_ptr<ESUser>    _es_user;
        std::shared_ptr<UserTable> _mysql_user_table;
        std::shared_ptr<Session>   _redis_session;
        std::shared_ptr<Status>    _redis_status;
        std::shared_ptr<Codes>     _redis_codes;

        // 这边是rpc调用客户端相关对象
        std::string                     _file_service_name;
        std::shared_ptr<ServiceManager> _service_manager;
        std::shared_ptr<DMSClient>      _dms_client;

    public:
        UserServiceImpl(const shared_ptr<DMSClient> &dms_client,
                        const std::shared_ptr<elasticlient::Client> &es_client,
                        const std::shared_ptr<odb::mysql::database> &mysql_client,
                        const std::shared_ptr<sw::redis::Redis> &redis_client,
                        const std::shared_ptr<ServiceManager> &channel_manager,
                        const std::string &file_service_name)
            :_es_user(std::make_shared<ESUser>(es_client))
            , _mysql_user_table(std::make_shared<UserTable>(mysql_client))
            , _redis_session(std::make_shared<Session>(redis_client))
            ,  _redis_status(std::make_shared<Status>(redis_client))
            , _redis_codes(std::make_shared<Codes>(redis_client))
            , _file_service_name(file_service_name)
            , _service_manager(channel_manager)
            , _dms_client(dms_client)
        {
            _es_user->create_index();
        }

        ~UserServiceImpl() {}

        // 检查昵称是否合法
        bool nickname_check(const std::string &nickname)
        {
            return nickname.size() < 22;
        }

        // 检查密码是否合法：
        // 1. 6<长度<15 
        // 2. 字母、数字、下划线、横杠
        bool password_check(const std::string &password)
        {
            if (password.size() < 6 || password.size() > 15)
            {
                LOG_ERROR("密码长度不合法：{}-{}", password, password.size());
                return false;
            }
            for (int i = 0; i < password.size(); i++)
            {
                if (!((password[i] >= 'a' && password[i] <= 'z') ||
                      (password[i] >= 'A' && password[i] <= 'Z') ||
                      (password[i] >= '0' && password[i] <= '9') ||
                      password[i] == '_' || password[i] == '-'))
                {
                    LOG_ERROR("密码字符不合法：{}", password);
                    return false;
                }
            }
            return true;
        }

        // 通过昵称+密码注册新用户
        // request：请求id、昵称、密码
        // response：请求id、是否成功、错误信息
        virtual void UserRegister(::google::protobuf::RpcController *controller,
                                  const ::chen_im::UserRegisterReq *request,
                                  ::chen_im::UserRegisterRsp *response,
                                  ::google::protobuf::Closure *done) override
        {
            LOG_DEBUG("收到用户注册请求！");
            brpc::ClosureGuard rpc_guard(done); // 把Closure指针管理起来，Closure在释放的时候会调用Run();
            // 定义一个错误处理函数，当出错的时候主动调用它
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };

            // 1. 从请求中取出昵称和密码
            std::string nickname = request->nickname();
            std::string password = request->password();

            // 2. 检查昵称是否合法（只能包含字母，数字，连字符-，下划线_，长度限制 3~15 之间）
            bool ret = nickname_check(nickname);
            if (ret == false) {
                LOG_ERROR("注册请求失败，用户名长度不合法！request_id: {}", request->request_id());
                return err_response(request->request_id(), "用户名长度不合法！");
            }

            // 3. 检查密码是否合法（只能包含字母，数字，长度限制 6~15 之间）
            ret = password_check(password);
            if (ret == false) {
                LOG_ERROR("注册请求失败，密码格式不合法！request_id: {}", request->request_id());
                return err_response(request->request_id(), "密码格式不合法！");
            }

            // 4. 根据昵称在数据库进行判断是否昵称已存在
            auto user = _mysql_user_table->select_by_nickname(nickname);
            if (user) {
                LOG_ERROR("注册请求失败，该用户名被占用：{}, request_id: {}", request->request_id(), nickname);
                return err_response(request->request_id(), "用户名被占用!");
            }

            // 5. 向数据库新增数据
            std::string uid = generate_uuid();
            user = std::make_shared<User>(uid, nickname, password);
            ret = _mysql_user_table->insert(user);
            if (ret == false) {
                LOG_ERROR("向Mysql数据库新增数据失败！request_id: {}", request->request_id());
                return err_response(request->request_id(), "Mysql数据库新增数据失败!");
            }

            // 6. 向 ES 服务器中新增用户信息
            ret = _es_user->append_user(uid, "", nickname, "", "");
            if (ret == false) {
                LOG_ERROR("向ES搜索引擎新增数据失败！request_id: {}", request->request_id());
                return err_response(request->request_id(), "ES搜索引擎新增数据失败！");
            }

            // 7. 组织响应，进行成功与否的响应即可。
            response->set_request_id(request->request_id());
            response->set_success(true);
        }

        // 通过昵称+密码登录
        // request：请求id、昵称、密码
        // response：请求id、是否成功、错误信息
        virtual void UserLogin(::google::protobuf::RpcController *controller,
                               const ::chen_im::UserLoginReq *request,
                               ::chen_im::UserLoginRsp *response,
                               ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到用户登录请求！");
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };

            // 1. 从请求中取出昵称和密码
            std::string nickname = request->nickname();
            std::string password = request->password();

            // 2. 通过昵称获取用户信息，进行密码是否一致的判断
            auto user = _mysql_user_table->select_by_nickname(nickname);
            if (!user || password != user->password()) {
                LOG_ERROR("用户名或密码错误，递交的昵称：{}，密码{}，request_id：{}！", nickname, password, request->request_id());
                return err_response(request->request_id(), "用户名或密码错误!");
            }

            // 3. 若 status 已存在（旧会话残留），覆盖式重新登录而非阻塞
            if (_redis_status->exists(user->user_id())) {
                LOG_WARN("{} - 用户 {} 存在残留 status，执行覆盖式重新登录", request->request_id(), nickname);
                _redis_status->remove(user->user_id());
            }

            // 4. 构造会话 ID，生成会话键值对，向 redis 中添加会话信息以及登录标记信息
            std::string ssid = generate_uuid();
            _redis_session->append(ssid, user->user_id());
            _redis_status->append(user->user_id());

            // 5. 组织响应，返回生成的会话 ID
            response->set_request_id(request->request_id());
            response->set_login_session_id(ssid);
            response->set_success(true);
        }

        // 验证手机号的合规性
        bool phone_check(const std::string &phone)
        {
            if (phone.size() != 11)
                return false;
            if (phone[0] != '1')
                return false;
            if (phone[1] < '3' || phone[1] > '9')
                return false;
            for (int i = 2; i < 11; i++)
            {
                if (phone[i] < '0' || phone[i] > '9')
                    return false;
            }
            return true;
        }

        // 给用户发送一个验证码，在redis中存放 <code_id, code>
        virtual void GetPhoneVerifyCode(::google::protobuf::RpcController *controller,
                                        const ::chen_im::PhoneVerifyCodeReq *request,
                                        ::chen_im::PhoneVerifyCodeRsp *response,
                                        ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到短信验证码获取请求！");
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 1. 从请求中取出手机号码
            std::string phone = request->phone_number();

            // 2. 验证手机号码格式是否正确（必须以 1 开始，第二位 3~9 之间，后边 9 个数字字符）
            bool ret = phone_check(phone);
            if (ret == false) {
                LOG_ERROR("手机号码格式错误！手机号：{}，request_id：{}", phone, request->request_id());
                return err_response(request->request_id(), "手机号码格式错误!");
            }

            // 3. 生成 4 位随机验证码
            std::string code_id = generate_uuid();
            std::string code = generate_verification_code();

            // 4. 基于短信平台 SDK 发送验证码
            ret = _dms_client->send(phone, code);
            if (ret == false) {
                LOG_ERROR("向{}发送短信验证码失败，request_id: {}！", phone, request->request_id());
                return err_response(request->request_id(), "短信验证码发送失败!");
            }

            // 5. 构造验证码 ID，添加到 redis 验证码映射键值索引中
            _redis_codes->append(code_id, code);

            // 6. 组织响应，返回生成的验证码 ID
            response->set_request_id(request->request_id());
            response->set_success(true);
            response->set_verify_code_id(code_id);
            LOG_DEBUG("获取短信验证码处理完成！");
        }

        virtual void PhoneRegister(::google::protobuf::RpcController *controller,
                                   const ::chen_im::PhoneRegisterReq *request,
                                   ::chen_im::PhoneRegisterRsp *response,
                                   ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到手机号注册请求！");
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };

            // 1. 从请求中取出手机号码和验证码,验证码ID
            std::string phone = request->phone_number();
            std::string code_id = request->verify_code_id();
            std::string code = request->verify_code();

            // 2. 检查注册手机号码是否合法
            bool ret = phone_check(phone);
            if (ret == false) {
                LOG_ERROR("手机号码格式错误：{}，request_id: {}！", phone, request->request_id());
                return err_response(request->request_id(), "手机号码格式错误!");
            }

            // 3. 从 redis 数据库中进行验证码 ID-验证码一致性匹配
            auto real_verification_code = _redis_codes->code(code_id);
            if (real_verification_code != code) {
                LOG_ERROR("验证码不匹配: code_id：{}，code：{}，request_id: {}, ", code_id, code, request->request_id());
                return err_response(request->request_id(), "验证码错误!");
            }

            // 4. 通过数据库查询判断手机号是否已经注册过
            auto user = _mysql_user_table->select_by_phone(phone);
            if (user) {
                LOG_ERROR("{} 该手机号已注册过用户！request_id: {}", phone, request->request_id());
                return err_response(request->request_id(), "该手机号已注册过用户!");
            }

            // 5. 向数据库新增用户信息
            std::string uid = generate_uuid();
            user = std::make_shared<User>(uid, phone);
            ret = _mysql_user_table->insert(user);
            if (ret == false) {
                LOG_ERROR("向数据库添加用户信息失败, phone: {}, request_id: {}！", phone, request->request_id());
                return err_response(request->request_id(), "向数据库添加用户信息失败!");
            }

            // 6. 向 ES 服务器中新增用户信息
            ret = _es_user->append_user(uid, phone, uid, "", "");
            if (ret == false)
            {
                LOG_ERROR("ES搜索引擎新增数据失败！request_id: {}", request->request_id());
                return err_response(request->request_id(), "ES搜索引擎新增数据失败！");
            }

            // 7. 组织响应，进行成功与否的响应即可。
            response->set_request_id(request->request_id());
            response->set_success(true);
        }

        // 手机号+验证码登录
        virtual void PhoneLogin(::google::protobuf::RpcController *controller,
                                const ::chen_im::PhoneLoginReq *request,
                                ::chen_im::PhoneLoginRsp *response,
                                ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到手机号登录请求！");
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };

            // 1. 从请求中取出手机号码和验证码 ID，以及验证码。
            std::string phone = request->phone_number();
            std::string code_id = request->verify_code_id();
            std::string code = request->verify_code();

            // 2. 检查注册手机号码是否合法
            bool ret = phone_check(phone);
            if (ret == false) {
                LOG_ERROR("手机号{}格式错误！request_id：{}", phone, request->request_id());
                return err_response(request->request_id(), "手机号码格式错误!");
            }

            // 3. 根据手机号从数据数据进行用户信息查询，判断用用户是否存在
            auto user = _mysql_user_table->select_by_phone(phone);
            if (!user) {
                LOG_ERROR("手机号{}未注册！request_id：{}！", phone, request->request_id());
                return err_response(request->request_id(), "该手机号未注册用户!");
            }

            // 4. 从 redis 数据库中进行验证码 ID-验证码一致性匹配
            auto generate_verification_code = _redis_codes->code(code_id);
            if (generate_verification_code != code) {
                LOG_ERROR("验证码错误{}-{}，request_id: {}！", code_id, code, request->request_id());
                return err_response(request->request_id(), "验证码错误!");
            }
            _redis_codes->remove(code_id);

            // 5. 若 status 已存在（旧会话残留），覆盖式重新登录而非阻塞
            if (_redis_status->exists(user->user_id())) {
                LOG_WARN("{} - 用户 {} 存在残留 status，执行覆盖式重新登录", request->request_id(), phone);
                _redis_status->remove(user->user_id());
            }

            // 6. 构造会话 ID，生成会话键值对，向 redis 中添加会话信息以及登录标记信息
            std::string ssid = generate_uuid();
            _redis_session->append(ssid, user->user_id());
            _redis_status->append(user->user_id());

            // 7. 组织响应，返回生成的会话 ID
            response->set_request_id(request->request_id());
            response->set_login_session_id(ssid);
            response->set_success(true);
        }

        // 获取用户信息，这是用户登录之后才会进行的操作
        virtual void GetUserInfo(::google::protobuf::RpcController *controller,
                                 const ::chen_im::GetUserInfoReq *request,
                                 ::chen_im::GetUserInfoRsp *response,
                                 ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到获取单个用户信息请求！");
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 1. 从请求中取出用户 ID
            std::string uid = request->user_id();

            // 2. 通过用户 ID，从数据库中查询用户信息
            auto user = _mysql_user_table->select_by_uid(uid);
            if (!user) {
                LOG_ERROR("未找到用户信息{}, request_id: {}", uid, request->request_id());
                return err_response(request->request_id(), "未找到用户信息!");
            }

            // 3. 根据用户信息中的头像 ID，从文件服务器获取头像文件数据，组织完整用户信息
            UserInfo *user_info = response->mutable_user_info();
            user_info->set_user_id(user->user_id());
            user_info->set_nickname(user->nickname());
            user_info->set_description(user->description());
            user_info->set_phone(user->phone());

            if (!user->avatar_id().empty()) {
                // 从信道管理对象中，获取到连接了文件管理子服务的channel
                auto channel = _service_manager->get(_file_service_name);
                if (!channel)
                {
                    LOG_ERROR("{} - 未找到文件管理子服务节点 - {} - {}！",
                              request->request_id(), _file_service_name, uid);
                    return err_response(request->request_id(), "未找到文件管理子服务节点!");
                }

                // 进行文件子服务的rpc请求，进行头像文件下载
                chen_im::FileService_Stub stub(channel.get());
                chen_im::GetSingleFileReq req;
                chen_im::GetSingleFileRsp rsp;
                req.set_request_id(request->request_id());
                req.set_file_id(user->avatar_id());
                brpc::Controller cntl;
                stub.GetSingleFile(&cntl, &req, &rsp, nullptr);
                if (cntl.Failed() == true || rsp.success() == false)
                {
                    LOG_ERROR("{} - 文件子服务调用失败：{}！", request->request_id(), cntl.ErrorText());
                    return err_response(request->request_id(), "文件子服务调用失败!");
                }
                user_info->set_avatar(rsp.file_data().file_content());
            }

            // 4. 组织响应，返回用户信息
            response->set_request_id(request->request_id());
            response->set_success(true);
        }

        // 获取一组用户信息，这是用户登录之后才会进行的操作
        virtual void GetMultiUserInfo(::google::protobuf::RpcController *controller,
                                      const chen_im::GetMultiUserInfoReq *request,
                                      chen_im::GetMultiUserInfoRsp *response,
                                      ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到批量用户信息获取请求！");
            brpc::ClosureGuard rpc_guard(done);
            // 1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 2. 从请求中取出用户ID --- 列表
            std::vector<std::string> uid_lists;
            for (int i = 0; i < request->users_id_size(); i++)
            {
                uid_lists.push_back(request->users_id(i));
            }
            // 3. 从数据库进行批量用户信息查询
            auto users = _mysql_user_table->select_by_multi_uid(uid_lists);
            if (users.size() != request->users_id_size())
            {
                LOG_ERROR("{} - 从数据库查找的用户信息数量不一致 {}-{}！",
                          request->request_id(), request->users_id_size(), users.size());
                return err_response(request->request_id(), "从数据库查找的用户信息数量不一致!");
            }
            // 4. 批量从文件管理子服务进行文件下载
            auto channel = _service_manager->get(_file_service_name);
            if (!channel)
            {
                LOG_ERROR("{} - 未找到文件管理子服务节点 - {}！", request->request_id(), _file_service_name);
                return err_response(request->request_id(), "未找到文件管理子服务节点!");
            }
            chen_im::FileService_Stub stub(channel.get());
            chen_im::GetMultiFileReq req;
            chen_im::GetMultiFileRsp rsp;
            req.set_request_id(request->request_id());
            for (auto &user : users)
            {
                if (user.avatar_id().empty())
                    continue;
                req.add_file_id_list(user.avatar_id());
            }
            brpc::Controller cntl;
            stub.GetMultiFile(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed() == true || rsp.success() == false)
            {
                LOG_ERROR("{} - 文件子服务调用失败：{} - {}！", request->request_id(),
                          _file_service_name, cntl.ErrorText());
                return err_response(request->request_id(), "文件子服务调用失败!");
            }
            // 5. 组织响应（）
            for (auto &user : users)
            {
                auto user_map = response->mutable_users_info(); // 本次请求要响应的用户信息map
                auto file_map = rsp.mutable_file_data();        // 这是批量文件请求响应中的map
                UserInfo user_info;
                user_info.set_user_id(user.user_id());
                user_info.set_nickname(user.nickname());
                user_info.set_description(user.description());
                user_info.set_phone(user.phone());
                user_info.set_avatar((*file_map)[user.avatar_id()].file_content());
                (*user_map)[user_info.user_id()] = user_info;
            }
            response->set_request_id(request->request_id());
            response->set_success(true);
        }

        // 设置用户头像
        virtual void SetUserAvatar(::google::protobuf::RpcController *controller,
                                   const ::chen_im::SetUserAvatarReq *request,
                                   ::chen_im::SetUserAvatarRsp *response,
                                   ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到用户头像设置请求！");
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 1. 从请求中取出用户 ID 与头像数据
            std::string uid = request->user_id();
            // 2. 从数据库通过用户 ID 进行用户信息查询，判断用户是否存在
            auto user = _mysql_user_table->select_by_uid(uid);
            if (!user)
            {
                LOG_ERROR("{} - 未找到用户信息 - {}！", request->request_id(), uid);
                return err_response(request->request_id(), "未找到用户信息!");
            }
            // 3. 上传头像文件到文件子服务，
            auto channel = _service_manager->get(_file_service_name);
            if (!channel)
            {
                LOG_ERROR("{} - 未找到文件管理子服务节点 - {}！", request->request_id(), _file_service_name);
                return err_response(request->request_id(), "未找到文件管理子服务节点!");
            }
            chen_im::FileService_Stub stub(channel.get());
            chen_im::PutSingleFileReq req;
            chen_im::PutSingleFileRsp rsp;
            req.set_request_id(request->request_id());
            req.mutable_file_data()->set_file_name("");
            req.mutable_file_data()->set_file_size(request->avatar().size());
            req.mutable_file_data()->set_file_content(request->avatar());
            brpc::Controller cntl;
            stub.PutSingleFile(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed() == true || rsp.success() == false)
            {
                LOG_ERROR("{} - 文件子服务调用失败：{}！", request->request_id(), cntl.ErrorText());
                return err_response(request->request_id(), "文件子服务调用失败!");
            }
            std::string avatar_id = rsp.file_info().file_id();
            // 4. 将返回的头像文件 ID 更新到数据库中
            user->avatar_id(avatar_id);
            bool ret = _mysql_user_table->update(user);
            if (ret == false)
            {
                LOG_ERROR("{} - 更新数据库用户头像ID失败 ：{}！", request->request_id(), avatar_id);
                return err_response(request->request_id(), "更新数据库用户头像ID失败!");
            }
            // 5. 更新 ES 服务器中用户信息
            ret = _es_user->append_user(user->user_id(), user->phone(),
                                        user->nickname(), user->description(), user->avatar_id());
            if (ret == false)
            {
                LOG_ERROR("{} - 更新搜索引擎用户头像ID失败 ：{}！", request->request_id(), avatar_id);
                return err_response(request->request_id(), "更新搜索引擎用户头像ID失败!");
            }
            // 6. 组织响应，返回更新成功与否
            response->set_request_id(request->request_id());
            response->set_success(true);
        }

        // 设置用户昵称
        virtual void SetUserNickname(::google::protobuf::RpcController *controller,
                                     const ::chen_im::SetUserNicknameReq *request,
                                     ::chen_im::SetUserNicknameRsp *response,
                                     ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到用户昵称设置请求！");
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 1. 从请求中取出用户 ID 与新的昵称
            std::string uid = request->user_id();
            std::string new_nickname = request->nickname();
            // 2. 判断昵称格式是否正确
            bool ret = nickname_check(new_nickname);
            if (ret == false)
            {
                LOG_ERROR("{} - 用户名长度不合法！", request->request_id());
                return err_response(request->request_id(), "用户名长度不合法！");
            }
            // 3. 从数据库通过用户 ID 进行用户信息查询，判断用户是否存在
            auto user = _mysql_user_table->select_by_uid(uid);
            if (!user)
            {
                LOG_ERROR("{} - 未找到用户信息 - {}！", request->request_id(), uid);
                return err_response(request->request_id(), "未找到用户信息!");
            }
            // 4. 将新的昵称更新到数据库中
            user->nickname(new_nickname);
            ret = _mysql_user_table->update(user);
            if (ret == false)
            {
                LOG_ERROR("{} - 更新数据库用户昵称失败 ：{}！", request->request_id(), new_nickname);
                return err_response(request->request_id(), "更新数据库用户昵称失败!");
            }
            // 5. 更新 ES 服务器中用户信息
            ret = _es_user->append_user(user->user_id(), user->phone(),
                                        user->nickname(), user->description(), user->avatar_id());
            if (ret == false)
            {
                LOG_ERROR("{} - 更新搜索引擎用户昵称失败 ：{}！", request->request_id(), new_nickname);
                return err_response(request->request_id(), "更新搜索引擎用户昵称失败!");
            }
            // 6. 组织响应，返回更新成功与否
            response->set_request_id(request->request_id());
            response->set_success(true);
        }
        
        // 设置用户签名
        virtual void SetUserDescription(::google::protobuf::RpcController *controller,
                                        const ::chen_im::SetUserDescriptionReq *request,
                                        ::chen_im::SetUserDescriptionRsp *response,
                                        ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到用户签名设置请求！");
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 1. 从请求中取出用户 ID 与新的昵称
            std::string uid = request->user_id();
            std::string new_description = request->description();
            // 3. 从数据库通过用户 ID 进行用户信息查询，判断用户是否存在
            auto user = _mysql_user_table->select_by_uid(uid);
            if (!user)
            {
                LOG_ERROR("{} - 未找到用户信息 - {}！", request->request_id(), uid);
                return err_response(request->request_id(), "未找到用户信息!");
            }
            // 4. 将新的昵称更新到数据库中
            user->description(new_description);
            bool ret = _mysql_user_table->update(user);
            if (ret == false)
            {
                LOG_ERROR("{} - 更新数据库用户签名失败 ：{}！", request->request_id(), new_description);
                return err_response(request->request_id(), "更新数据库用户签名失败!");
            }
            // 5. 更新 ES 服务器中用户信息
            ret = _es_user->append_user(user->user_id(), user->phone(),
                                        user->nickname(), user->description(), user->avatar_id());
            if (ret == false)
            {
                LOG_ERROR("{} - 更新搜索引擎用户签名失败 ：{}！", request->request_id(), new_description);
                return err_response(request->request_id(), "更新搜索引擎用户签名失败!");
            }
            // 6. 组织响应，返回更新成功与否
            response->set_request_id(request->request_id());
            response->set_success(true);
        }
        
        // 设置用户手机号
        virtual void SetUserPhoneNumber(::google::protobuf::RpcController *controller,
                                        const ::chen_im::SetUserPhoneNumberReq *request,
                                        ::chen_im::SetUserPhoneNumberRsp *response,
                                        ::google::protobuf::Closure *done)
        {
            LOG_DEBUG("收到用户手机号设置请求！");
            brpc::ClosureGuard rpc_guard(done);
            auto err_response = [this, response](const std::string &request_id,
                                                 const std::string &errmsg) -> void
            {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            // 1. 从请求中取出用户 ID 与新的昵称
            std::string uid = request->user_id();
            std::string new_phone = request->phone_number();
            std::string code = request->phone_verify_code();
            std::string code_id = request->phone_verify_code_id();
            // 2. 对验证码进行验证
            auto generate_verification_code = _redis_codes->code(code_id);
            if (generate_verification_code != code)
            {
                LOG_ERROR("{} - 验证码错误 - {}-{}！", request->request_id(), code_id, code);
                return err_response(request->request_id(), "验证码错误!");
            }
            // 3. 从数据库通过用户 ID 进行用户信息查询，判断用户是否存在
            auto user = _mysql_user_table->select_by_uid(uid);
            if (!user)
            {
                LOG_ERROR("{} - 未找到用户信息 - {}！", request->request_id(), uid);
                return err_response(request->request_id(), "未找到用户信息!");
            }
            // 4. 将新的昵称更新到数据库中
            user->phone(new_phone);
            bool ret = _mysql_user_table->update(user);
            if (ret == false)
            {
                LOG_ERROR("{} - 更新数据库用户手机号失败 ：{}！", request->request_id(), new_phone);
                return err_response(request->request_id(), "更新数据库用户手机号失败!");
            }
            // 5. 更新 ES 服务器中用户信息
            ret = _es_user->append_user(user->user_id(), user->phone(),
                                        user->nickname(), user->description(), user->avatar_id());
            if (ret == false)
            {
                LOG_ERROR("{} - 更新搜索引擎用户手机号失败 ：{}！", request->request_id(), new_phone);
                return err_response(request->request_id(), "更新搜索引擎用户手机号失败!");
            }
            // 6. 组织响应，返回更新成功与否
            response->set_request_id(request->request_id());
            response->set_success(true);
        }
    };

    class UserServer
    {
    private:
        std::shared_ptr<Discovery>            _service_discovery_client;  // 需要调用文件子服务，所以要发现文件子服务
        std::shared_ptr<Registry>             _service_registry_client;   // 自己作为用户服务，要向注册中心注册自己

        std::shared_ptr<elasticlient::Client> _es_client;           // 搜索引擎客户端
        std::shared_ptr<odb::mysql::database> _mysql_client;        // mysql客户端
        std::shared_ptr<sw::redis::Redis>     _redis_client;        // redis客户端
        std::shared_ptr<brpc::Server>         _rpc_server;          // 因为自己提供用户相关的rpc调用接口，所以自己时一个brpc服务器
    public:
        using ptr = std::shared_ptr<UserServer>;
        UserServer(const std::shared_ptr<Discovery> service_discoverer,
                   const std::shared_ptr<Registry> &reg_client,
                   const std::shared_ptr<elasticlient::Client> &es_client,
                   const std::shared_ptr<odb::mysql::database> &mysql_client,
                   std::shared_ptr<sw::redis::Redis> &redis_client,
                   const std::shared_ptr<brpc::Server> &server) 
            :_service_discovery_client(service_discoverer)
            , _service_registry_client(reg_client)
            , _es_client(es_client)
            , _mysql_client(mysql_client)
            , _redis_client(redis_client)
            , _rpc_server(server) 
        {}

        ~UserServer() {}
        // 启动RPC服务器，一直运行直到
        void start()
        {
            _rpc_server->RunUntilAskedToQuit();
        }

    };

    class UserServerFactory
    {
    private:
        std::shared_ptr<Discovery>            _service_discoverer;     //   
        std::shared_ptr<Registry>             _registry_client;        //     
        
        std::shared_ptr<elasticlient::Client> _es_client;              //     
        std::shared_ptr<odb::mysql::database> _mysql_client;           //        
        std::shared_ptr<sw::redis::Redis>     _redis_client;           //        
        
        std::string                           _file_service_name;      //             
        std::shared_ptr<ServiceManager>       _service_manager;        //       
       
        std::shared_ptr<DMSClient>            _dms_client;             //      
        std::shared_ptr<brpc::Server>         _rpc_server;             //      
    public:
        // 构造es客户端对象
        void make_es_object(const std::vector<std::string> host_list)
        {
            _es_client = ESClientFactory::create(host_list);
        }

        void make_dms_object(const std::string &access_key_id,
                             const std::string &access_key_secret)
        {
            _dms_client = std::make_shared<DMSClient>(access_key_id, access_key_secret);
        }

        // 构造mysql客户端对象
        void make_mysql_object(
            const std::string &user,
            const std::string &pswd,
            const std::string &host,
            const std::string &db,
            const std::string &char_set,
            int port,
            int conn_pool_count)
        {
            _mysql_client = ODBFactory::create(user, pswd, db, host, port, char_set, conn_pool_count);
        }
        // 构造redis客户端对象
        void make_redis_object(const std::string &host,
                               int port,
                               int db,
                               bool keep_alive)
        {
            _redis_client = RedisClientFactory::create(host, port, db, keep_alive);
        }

        // 用于构造服务发现客户端&信道管理对象
        void make_discovery_object(const std::string &reg_host,
                                   const std::string &base_service_name,
                                   const std::string &file_service_name)
        {
            _file_service_name = file_service_name;
            _service_manager = std::make_shared<ServiceManager>();
            _service_manager->concern(file_service_name);
            LOG_DEBUG("将文件子服务 {} 设置为“关心”", file_service_name);
            auto put_cb = std::bind(&ServiceManager::when_service_online, _service_manager.get(), std::placeholders::_1, std::placeholders::_2);
            auto del_cb = std::bind(&ServiceManager::when_service_offline, _service_manager.get(), std::placeholders::_1, std::placeholders::_2);
            _service_discoverer = std::make_shared<Discovery>(reg_host, base_service_name, put_cb, del_cb);
        }

        // 用于构造服务注册客户端对象
        void make_registry_object(const std::string &reg_host,
                                  const std::string &service_name,
                                  const std::string &access_host)
        {
            _registry_client = std::make_shared<Registry>(reg_host);
            _registry_client->registry(service_name, access_host);
            _service_manager->concern(service_name);
        }
        void make_rpc_server(uint16_t port, int32_t timeout, uint8_t num_threads)
        {
            if (!_es_client)
            {
                LOG_ERROR("还未初始化ES搜索引擎模块！");
                abort();
            }
            if (!_mysql_client)
            {
                LOG_ERROR("还未初始化Mysql数据库模块！");
                abort();
            }
            if (!_redis_client)
            {
                LOG_ERROR("还未初始化Redis数据库模块！");
                abort();
            }
            if (!_service_manager)
            {
                LOG_ERROR("还未初始化信道管理模块！");
                abort();
            }
            if (!_dms_client)
            {
                LOG_ERROR("还未初始化短信平台模块！");
                abort();
            }
            _rpc_server = std::make_shared<brpc::Server>();

            UserServiceImpl *user_service = new UserServiceImpl(_dms_client, _es_client,
                                                                _mysql_client, _redis_client,
                                                                _service_manager, _file_service_name);
            int ret = _rpc_server->AddService(user_service,
                                              brpc::ServiceOwnership::SERVER_OWNS_SERVICE);
            if (ret == -1) {
                LOG_ERROR("添加Rpc服务失败！");
                abort();
            }
            brpc::ServerOptions options;
            options.idle_timeout_sec = timeout;
            options.num_threads = num_threads;
            ret = _rpc_server->Start(port, &options);
            if (ret == -1)
            {
                LOG_ERROR("服务启动失败！");
                abort();
            }
        }
        // 构造RPC服务器对象
        UserServer::ptr build()
        {
            if (!_service_discoverer)
            {
                LOG_ERROR("还未初始化服务发现模块！");
                abort();
            }
            if (!_registry_client)
            {
                LOG_ERROR("还未初始化服务注册模块！");
                abort();
            }
            if (!_rpc_server)
            {
                LOG_ERROR("还未初始化RPC服务器模块！");
                abort();
            }
            UserServer::ptr server = std::make_shared<UserServer>(
                _service_discoverer, _registry_client,
                _es_client, _mysql_client, _redis_client, _rpc_server);
            return server;
        }
    };
}