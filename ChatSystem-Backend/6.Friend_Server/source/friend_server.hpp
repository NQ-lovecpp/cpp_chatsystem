//实现语音识别子服务
#include <brpc/server.h>
#include <butil/logging.h>

#include "es_user_CRUD.hpp"      // es数据管理客户端封装
#include "mysql_chat_session_member.hpp"      // mysql数据管理客户端封装
#include "mysql_chat_session.hpp"      // mysql数据管理客户端封装
#include "mysql_relation.hpp"      // mysql数据管理客户端封装
#include "mysql_apply.hpp"      // mysql数据管理客户端封装
#include "etcd.hpp"     // 服务注册模块封装
#include "logger.hpp"   // 日志模块封装
#include "utility.hpp"    // 基础工具接口
#include "rpc_service_manager.hpp"  // 信道管理模块封装


#include "friend.pb.h"  // protobuf框架代码
#include "base.pb.h"  // protobuf框架代码
#include "user.pb.h"  // protobuf框架代码
#include "message_storage.pb.h"  // protobuf框架代码

namespace chen_im{
class FriendServiceImpl : public chen_im::FriendService {
    public:
        FriendServiceImpl(
            const std::shared_ptr<elasticlient::Client> &es_client,
            const std::shared_ptr<odb::mysql::database> &mysql_client,
            const std::shared_ptr<ServiceManager> &channel_manager,
            const std::string &user_service_name,
            const std::string &message_store_service_name) :
            _es_user(std::make_shared<ESUser>(es_client)),
            _mysql_apply(std::make_shared<FriendApplyTable>(mysql_client)),
            _mysql_chat_session(std::make_shared<ChatSessionTable>(mysql_client)),
            _mysql_chat_session_member(std::make_shared<ChatSessionMemeberTable>(mysql_client)),
            _mysql_relation(std::make_shared<RelationTable>(mysql_client)),
            _user_service_name(user_service_name),
            _message_store_service_name(message_store_service_name),
            _service_manager(channel_manager){}
        ~FriendServiceImpl(){}
        virtual void GetFriendList(::google::protobuf::RpcController* controller,
            const ::chen_im::GetFriendListReq* request,
            ::chen_im::GetFriendListRsp* response,
            ::google::protobuf::Closure* done) {
            brpc::ClosureGuard rpc_guard(done);
            //1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id, 
                const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            
            //1. 提取请求中的关键要素：用户ID
            std::string request_id = request->request_id();
            std::string uid = request->user_id();
            //2. 从数据库中查询获取用户的好友ID
            auto friend_id_lists = _mysql_relation->friends(uid);
            std::unordered_set<std::string> user_id_lists;
            for (auto &id : friend_id_lists) {
                user_id_lists.insert(id);
            }
            //3. 从用户子服务批量获取用户信息
            std::unordered_map<std::string, UserInfo> user_list;
            bool ret = GetUserInfo(request_id, user_id_lists, user_list);
            if (ret == false) {
                LOG_ERROR("{} - 批量获取用户信息失败!", request_id);
                return err_response(request_id, "批量获取用户信息失败!");
            }
            //4. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
            for (const auto & user_it : user_list) {
                auto user_info = response->add_friend_list();
                user_info->CopyFrom(user_it.second);
            }
        }
        virtual void FriendRemove(::google::protobuf::RpcController* controller,
            const ::chen_im::FriendRemoveReq* request,
            ::chen_im::FriendRemoveRsp* response,
            ::google::protobuf::Closure* done) {
            brpc::ClosureGuard rpc_guard(done);
            //1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id, 
                const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            //1. 提取关键要素：当前用户ID，要删除的好友ID
            std::string request_id = request->request_id();
            std::string uid = request->user_id();
            std::string pid = request->peer_id();
            //2. 从好友关系表中删除好友关系信息
            bool ret = _mysql_relation->remove(uid, pid);
            if (ret == false) {
                LOG_ERROR("{} - 从数据库删除好友信息失败！", request_id);
                return err_response(request_id, "从数据库删除好友信息失败！");
            }
            //3. 从会话信息表中，删除对应的聊天会话 -- 同时删除会话成员表中的成员信息
            ret = _mysql_chat_session->remove(uid, pid);
            if (ret == false) {
                LOG_ERROR("{}- 从数据库删除好友会话信息失败！", request_id);
                return err_response(request_id, "从数据库删除好友会话信息失败！");
            }
            //4. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
        }
        virtual void FriendAdd(::google::protobuf::RpcController* controller,
            const ::chen_im::FriendAddReq* request,
            ::chen_im::FriendAddRsp* response,
            ::google::protobuf::Closure* done) {
            brpc::ClosureGuard rpc_guard(done);
            //1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id, 
                const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            //1. 提取请求中的关键要素：申请人用户ID； 被申请人用户ID
            std::string request_id = request->request_id();
            std::string uid = request->user_id();
            std::string pid = request->respondent_id();
            //2. 判断两人是否已经是好友
            bool ret = _mysql_relation->exists(uid, pid);
            if (ret == true) {
                LOG_ERROR("{}- 申请好友失败-两者{}-{}已经是好友关系", request_id, uid, pid);
                return err_response(request_id, "两者已经是好友关系！");
            }
            //3. 当前是否已经申请过好友
            ret = _mysql_apply->exists(uid, pid);
            if (ret == true) {
                LOG_ERROR("{}- 申请好友失败-已经申请过对方好友！", request_id, uid, pid);
                return err_response(request_id, "已经申请过对方好友！");
            }
            //4. 向好友申请表中，新增申请信息
            std::string eid = generate_uuid();
            FriendApply ev(eid, uid, pid);
            ret = _mysql_apply->insert(ev);
            if (ret == false) {
                LOG_ERROR("{} - 向数据库新增好友申请事件失败！", request_id);
                return err_response(request_id, "向数据库新增好友申请事件失败！");
            }
            //3. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
            response->set_notify_event_id(eid);
        }
        virtual void FriendAddProcess(::google::protobuf::RpcController* controller,
            const ::chen_im::FriendAddProcessReq* request,
            ::chen_im::FriendAddProcessRsp* response,
            ::google::protobuf::Closure* done) {
            brpc::ClosureGuard rpc_guard(done);
            //1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id, 
                const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            //1. 提取请求中的关键要素：申请人用户ID；被申请人用户ID；处理结果；事件ID
            std::string request_id = request->request_id();
            std::string eid = request->notify_event_id();
            std::string uid = request->user_id(); //被申请人
            std::string pid = request->apply_user_id();//申请人
            bool agree = request->agree();
            //2. 判断有没有该申请事件
            bool ret = _mysql_apply->exists(pid, uid);
            if (ret == false) {
                LOG_ERROR("{}- 没有找到{}-{}对应的好友申请事件！", request_id, pid, uid);
                return err_response(request_id, "没有找到对应的好友申请事件!");
            }
            //3. 如果有： 可以处理； --- 删除申请事件--事件已经处理完毕
            ret = _mysql_apply->remove(pid, uid);
            if (ret == false) {
                LOG_ERROR("{}- 从数据库删除申请事件 {}-{} 失败！", request_id, pid, uid);
                return err_response(request_id, "从数据库删除申请事件失败!");
            }
            //4. 如果处理结果是同意：向数据库新增好友关系信息；新增单聊会话信息及会话成员
            std::string cssid;
            if (agree == true) {
                ret = _mysql_relation->insert(uid, pid);
                if (ret == false) {
                    LOG_ERROR("{}- 新增好友关系信息-{}-{}！", request_id, uid, pid);
                    return err_response(request_id, "新增好友关系信息!");
                }
                cssid = generate_uuid();
                ChatSession cs(cssid, "", ChatSessionType::SINGLE);
                ret = _mysql_chat_session->insert(cs);
                if (ret == false) {
                    LOG_ERROR("{}- 新增单聊会话信息-{}！", request_id, cssid);
                    return err_response(request_id, "新增单聊会话信息失败!");
                }
                ChatSessionMember csm1(cssid, uid);
                ChatSessionMember csm2(cssid, pid);
                std::vector<ChatSessionMember> mlist = {csm1, csm2};
                ret = _mysql_chat_session_member->append(mlist);
                if (ret == false) {
                    LOG_ERROR("{}- 没有找到{}-{}对应的好友申请事件！", request_id, pid, uid);
                    return err_response(request_id, "没有找到对应的好友申请事件!");
                }
            }
            //5. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
            response->set_new_session_id(cssid);
        }
        virtual void FriendSearch(::google::protobuf::RpcController* controller,
            const ::chen_im::FriendSearchReq* request,
            ::chen_im::FriendSearchRsp* response,
            ::google::protobuf::Closure* done) {
            brpc::ClosureGuard rpc_guard(done);
            //1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id, 
                const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            //1. 提取请求中的关键要素：搜索关键字（可能是用户ID，可能是手机号，可能是昵称的一部分）
            std::string request_id = request->request_id();
            std::string uid = request->user_id();
            std::string skey = request->search_key();
            LOG_DEBUG("{} 好友搜索 ： {}", uid, skey);
            //2. 根据用户ID，获取用户的好友ID列表
            auto friend_id_lists = _mysql_relation->friends(uid);
            //3. 从ES搜索引擎进行用户信息搜索 --- 过滤掉当前的好友
            std::unordered_set<std::string> user_id_lists;
            friend_id_lists.push_back(uid);// 把自己也过滤掉
            auto search_res = _es_user->search(skey, friend_id_lists);
            for (auto &it : search_res) {
                user_id_lists.insert(it.user_id());
            }
            //4. 根据获取到的用户ID， 从用户子服务器进行批量用户信息获取
            std::unordered_map<std::string, UserInfo> user_list;
            bool ret = GetUserInfo(request_id, user_id_lists, user_list);
            if (ret == false) {
                LOG_ERROR("{} - 批量获取用户信息失败!", request_id);
                return err_response(request_id, "批量获取用户信息失败!");
            }
            //5. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
            for (const auto & user_it : user_list) {
                auto user_info = response->add_user_info();
                user_info->CopyFrom(user_it.second);
            }
        }
        virtual void GetPendingFriendEventList(::google::protobuf::RpcController* controller,
            const ::chen_im::GetPendingFriendEventListReq* request,
            ::chen_im::GetPendingFriendEventListRsp* response,
            ::google::protobuf::Closure* done) {
            brpc::ClosureGuard rpc_guard(done);
            //1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id, 
                const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            //1. 提取关键要素：当前用户ID
            std::string request_id = request->request_id();
            std::string uid = request->user_id();
            //2. 从数据库获取待处理的申请事件信息 --- 申请人用户ID列表
            auto res = _mysql_apply->applyUsers(uid);
            std::unordered_set<std::string> user_id_lists;
            for (auto &id : res) {
                user_id_lists.insert(id);
            }
            //3. 批量获取申请人用户信息、
            std::unordered_map<std::string, UserInfo> user_list;
            bool ret = GetUserInfo(request_id, user_id_lists, user_list);
            if (ret == false) {
                LOG_ERROR("{} - 批量获取用户信息失败!", request_id);
                return err_response(request_id, "批量获取用户信息失败!");
            }
            //4. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
            for (const auto & user_it : user_list) {
                auto ev = response->add_event();
                ev->mutable_sender()->CopyFrom(user_it.second);
            }
        }
        virtual void GetChatSessionList(::google::protobuf::RpcController* controller,
            const ::chen_im::GetChatSessionListReq* request,
            ::chen_im::GetChatSessionListRsp* response,
            ::google::protobuf::Closure* done) {
            brpc::ClosureGuard rpc_guard(done);
            //1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id, 
                const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            //获取聊天会话的作用：一个用户登录成功后，能够展示自己的历史聊天信息
            //1. 提取请求中的关键要素：当前请求用户ID
            std::string request_id = request->request_id();
            std::string uid = request->user_id();
            //2. 从数据库中查询出用户的单聊会话列表
            auto sf_list = _mysql_chat_session->singleChatSession(uid);
            //  1. 从单聊会话列表中，取出所有的好友ID，从用户子服务获取用户信息
            std::unordered_set<std::string> users_id_list;
            for (const auto &f : sf_list) {
                users_id_list.insert(f.friend_id);
            }
            std::unordered_map<std::string, UserInfo> user_list;
            bool ret = GetUserInfo(request_id, users_id_list, user_list);
            if (ret == false) {
                LOG_ERROR("{} - 批量获取用户信息失败！", request_id);
                return err_response(request_id, "批量获取用户信息失败!");
            }
            //  2. 设置响应会话信息：会话名称就是好友名称；会话头像就是好友头像
            //3. 从数据库中查询出用户的群聊会话列表
            auto gc_list = _mysql_chat_session->groupChatSession(uid);

            //4. 根据所有的会话ID，从消息存储子服务获取会话最后一条消息
            //5. 组织响应
            for (const auto &f : sf_list) {
                auto chat_session_info = response->add_chat_session_info_list();
                chat_session_info->set_single_chat_friend_id(f.friend_id);
                chat_session_info->set_chat_session_id(f.chat_session_id);
                chat_session_info->set_chat_session_name(user_list[f.friend_id].nickname());
                chat_session_info->set_avatar(user_list[f.friend_id].avatar());
                MessageInfo msg;
                ret = GetRecentMsg(request_id, f.chat_session_id, msg);
                if (ret == false) {continue;}
                chat_session_info->mutable_prev_message()->CopyFrom(msg);
            }
            for (const auto &f : gc_list) {
                auto chat_session_info = response->add_chat_session_info_list();
                chat_session_info->set_chat_session_id(f.chat_session_id);
                chat_session_info->set_chat_session_name(f.chat_session_name);
                MessageInfo msg;
                ret = GetRecentMsg(request_id, f.chat_session_id, msg);
                if (ret == false) { continue; }
                chat_session_info->mutable_prev_message()->CopyFrom(msg);
            }
            response->set_request_id(request_id);
            response->set_success(true);
        }
        virtual void ChatSessionCreate(::google::protobuf::RpcController* controller,
            const ::chen_im::ChatSessionCreateReq* request,
            ::chen_im::ChatSessionCreateRsp* response,
            ::google::protobuf::Closure* done) {
            brpc::ClosureGuard rpc_guard(done);
            //1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id, 
                const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            //创建会话，其实针对的是用户要创建一个群聊会话
            //1. 提取请求关键要素：会话名称，会话成员
            std::string request_id = request->request_id();
            std::string uid = request->user_id();
            std::string cssname = request->chat_session_name();
            
            //2. 生成会话ID，向数据库添加会话信息，添加会话成员信息
            std::string cssid = generate_uuid();
            ChatSession cs(cssid, cssname, ChatSessionType::GROUP);
            bool ret = _mysql_chat_session->insert(cs);
            if (ret == false) {
                LOG_ERROR("{} - 向数据库添加会话信息失败: {}", request_id, cssname);
                return err_response(request_id, "向数据库添加会话信息失败!");
            }
            std::vector<ChatSessionMember> member_list;
            for (int i = 0; i < request->member_id_list_size(); i++) {
                ChatSessionMember csm(cssid, request->member_id_list(i));
                member_list.push_back(csm);
            }
            ret = _mysql_chat_session_member->append(member_list);
            if (ret == false) {
                LOG_ERROR("{} - 向数据库添加会话成员信息失败: {}", request_id, cssname);
                return err_response(request_id, "向数据库添加会话成员信息失败!");
            }
            //3. 组织响应---组织会话信息
            response->set_request_id(request_id);
            response->set_success(true);
            response->mutable_chat_session_info()->set_chat_session_id(cssid);
            response->mutable_chat_session_info()->set_chat_session_name(cssname);
        }
        virtual void GetChatSessionMember(::google::protobuf::RpcController* controller,
            const ::chen_im::GetChatSessionMemberReq* request,
            ::chen_im::GetChatSessionMemberRsp* response,
            ::google::protobuf::Closure* done) {
            brpc::ClosureGuard rpc_guard(done);
            //1. 定义错误回调
            auto err_response = [this, response](const std::string &request_id, 
                const std::string &errmsg) -> void {
                response->set_request_id(request_id);
                response->set_success(false);
                response->set_errmsg(errmsg);
                return;
            };
            //用于用户查看群聊成员信息的时候：进行成员信息展示
            //1. 提取关键要素：聊天会话ID
            std::string request_id = request->request_id();
            std::string uid = request->user_id();
            std::string cssid = request->chat_session_id();
            //2. 从数据库获取会话成员ID列表
            auto member_id_lists = _mysql_chat_session_member->members(cssid);
            std::unordered_set<std::string> uid_list;
            for (const auto &id : member_id_lists) {
                uid_list.insert(id);
            }
            //3. 从用户子服务批量获取用户信息
            std::unordered_map<std::string, UserInfo> user_list;
            bool ret = GetUserInfo(request_id, uid_list, user_list);
            if (ret == false) {
                LOG_ERROR("{} - 从用户子服务获取用户信息失败！", request_id);
                return err_response(request_id, "从用户子服务获取用户信息失败!");
            }
            //4. 组织响应
            response->set_request_id(request_id);
            response->set_success(true);
            for (const auto &uit : user_list) {
                auto user_info = response->add_member_info_list();
                user_info->CopyFrom(uit.second);
            }
        }
    private:
        bool GetRecentMsg(const std::string &request_id, 
            const std::string &cssid, MessageInfo &msg) {
            auto channel = _service_manager->get(_message_store_service_name);
            if (!channel) {
                LOG_ERROR("{} - 获取消息子服务信道失败！！", request_id);
                return false;
            }
            GetRecentMsgReq req;
            GetRecentMsgRsp rsp;
            req.set_request_id(request_id);
            req.set_chat_session_id(cssid);
            req.set_msg_count(1);
            brpc::Controller cntl;
            chen_im::MsgStorageService_Stub stub(channel.get());
            stub.GetRecentMsg(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed() == true) {
                LOG_ERROR("{} - 消息存储子服务调用失败: {}", request_id, cntl.ErrorText());
                return false;
            }
            if ( rsp.success() == false) {
                LOG_ERROR("{} - 获取会话 {} 最近消息失败: {}", request_id, cssid, rsp.errmsg());
                return false;
            }
            if (rsp.msg_list_size() > 0) {
                msg.CopyFrom(rsp.msg_list(0));
                return true;
            }
            return false;
        }
        bool GetUserInfo(const std::string &request_id, 
            const std::unordered_set<std::string> &uid_list,
            std::unordered_map<std::string, UserInfo> &user_list) {
            auto channel = _service_manager->get(_user_service_name);
            if (!channel) {
                LOG_ERROR("{} - 获取用户子服务信道失败！！", request_id);
                return false;
            }
            GetMultiUserInfoReq req;
            GetMultiUserInfoRsp rsp;
            req.set_request_id(request_id);
            for (auto &id : uid_list) {
                req.add_users_id(id);
            }
            brpc::Controller cntl;
            chen_im::UserService_Stub stub(channel.get());
            stub.GetMultiUserInfo(&cntl, &req, &rsp, nullptr);
            if (cntl.Failed() == true) {
                LOG_ERROR("{} - 用户子服务调用失败: {}", request_id, cntl.ErrorText());
                return false;
            }
            if ( rsp.success() == false) {
                LOG_ERROR("{} - 批量获取用户信息失败: {}", request_id, rsp.errmsg());
                return false;
            }
            for (const auto & user_it : rsp.users_info()) {
                user_list.insert(std::make_pair(user_it.first, user_it.second));
            }
            return true;
        }

    private:
        ESUser::ptr _es_user;

        FriendApplyTable::ptr _mysql_apply;
        ChatSessionTable::ptr _mysql_chat_session;
        ChatSessionMemeberTable::ptr _mysql_chat_session_member;
        RelationTable::ptr _mysql_relation;

        //这边是rpc调用客户端相关对象
        std::string _user_service_name;
        std::string _message_store_service_name;
        std::shared_ptr<ServiceManager> _service_manager;
};

class FriendServer {
    public:
        using ptr = std::shared_ptr<FriendServer>;
        FriendServer(const Discovery::ptr service_discoverer, 
            const Registry::ptr &reg_client,
            const std::shared_ptr<elasticlient::Client> &es_client,
            const std::shared_ptr<odb::mysql::database> &mysql_client,
            const std::shared_ptr<brpc::Server> &server):
            _service_discoverer(service_discoverer),
            _registry_client(reg_client),
            _es_client(es_client),
            _mysql_client(mysql_client),
            _rpc_server(server){}
        ~FriendServer(){}
        //搭建RPC服务器，并启动服务器
        void start() {
            _rpc_server->RunUntilAskedToQuit();
        }
    private:
        Discovery::ptr _service_discoverer;
        Registry::ptr _registry_client;
        std::shared_ptr<elasticlient::Client> _es_client;
        std::shared_ptr<odb::mysql::database> _mysql_client;
        std::shared_ptr<brpc::Server> _rpc_server;
};

class FriendServerFactory {
    public:
        //构造es客户端对象
        void make_es_object(const std::vector<std::string> host_list) {
            _es_client = ESClientFactory::create(host_list);
        }
        //构造mysql客户端对象
        void make_mysql_object(
            const std::string &user,
            const std::string &pswd,
            const std::string &host,
            const std::string &db,
            const std::string &cset,
            int port,
            int conn_pool_count) {
            _mysql_client = ODBFactory::create(user, pswd, db, host, port, cset, conn_pool_count);
        }
        //用于构造服务发现客户端&信道管理对象
        void make_discovery_object(const std::string &reg_host,
            const std::string &base_service_name,
            const std::string &user_service_name,
            const std::string &message_store_service_name) {
            _user_service_name = user_service_name;
            _message_store_service_name = message_store_service_name;
            _service_manager = std::make_shared<ServiceManager>();
            _service_manager->concern(user_service_name);
            _service_manager->concern(message_store_service_name);
            LOG_DEBUG("设置用户子服务为需添加管理的子服务：{}", user_service_name);
            LOG_DEBUG("设置消息子服务为需添加管理的子服务：{}", message_store_service_name);
            auto put_cb = std::bind(&ServiceManager::when_service_online, _service_manager.get(), std::placeholders::_1, std::placeholders::_2);
            auto del_cb = std::bind(&ServiceManager::when_service_offline, _service_manager.get(), std::placeholders::_1, std::placeholders::_2);
            _service_discoverer = std::make_shared<Discovery>(reg_host, base_service_name, put_cb, del_cb);
        }
        //用于构造服务注册客户端对象
        void make_registry_object(const std::string &reg_host,
            const std::string &service_name,
            const std::string &access_host) {
            _registry_client = std::make_shared<Registry>(reg_host);
            _registry_client->registry(service_name, access_host);
        }
        void make_rpc_server(uint16_t port, int32_t timeout, uint8_t num_threads) {
            if (!_es_client) {
                LOG_ERROR("还未初始化ES搜索引擎模块！");
                abort();
            }
            if (!_mysql_client) {
                LOG_ERROR("还未初始化Mysql数据库模块！");
                abort();
            }
            if (!_service_manager) {
                LOG_ERROR("还未初始化信道管理模块！");
                abort();
            }
            _rpc_server = std::make_shared<brpc::Server>();

            FriendServiceImpl *friend_service = new FriendServiceImpl(_es_client,
                _mysql_client, _service_manager, _user_service_name, _message_store_service_name);
            int ret = _rpc_server->AddService(friend_service, 
                brpc::ServiceOwnership::SERVER_OWNS_SERVICE);
            if (ret == -1) {
                LOG_ERROR("添加Rpc服务失败！");
                abort();
            }
            brpc::ServerOptions options;
            options.idle_timeout_sec = timeout;
            options.num_threads = num_threads;
            ret = _rpc_server->Start(port, &options);
            if (ret == -1) {
                LOG_ERROR("服务启动失败！");
                abort();
            }
        }
        //构造RPC服务器对象
        FriendServer::ptr build() {
            if (!_service_discoverer) {
                LOG_ERROR("还未初始化服务发现模块！");
                abort();
            }
            if (!_registry_client) {
                LOG_ERROR("还未初始化服务注册模块！");
                abort();
            }
            if (!_rpc_server) {
                LOG_ERROR("还未初始化RPC服务器模块！");
                abort();
            }
            FriendServer::ptr server = std::make_shared<FriendServer>(
                _service_discoverer, _registry_client,
                _es_client, _mysql_client, _rpc_server);
            return server;
        }
    private:
        Registry::ptr _registry_client;

        std::shared_ptr<elasticlient::Client> _es_client;
        std::shared_ptr<odb::mysql::database> _mysql_client;

        std::string _user_service_name;
        std::string _message_store_service_name;
        std::shared_ptr<ServiceManager> _service_manager;
        Discovery::ptr _service_discoverer;

        std::shared_ptr<brpc::Server> _rpc_server;
};
}