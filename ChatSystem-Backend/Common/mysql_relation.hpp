#pragma once
#include "logger.hpp"
#include "mysql_odb_factory.hpp"
#include "relation.hxx"
#include "relation-odb.hxx"

namespace chen_im
{
    class RelationTable
    {
    public:
        using ptr = std::shared_ptr<RelationTable>;
        RelationTable(const std::shared_ptr<odb::mysql::database> &db) : _db(db) {}
        // 新增关系信息
        bool insert(const std::string &uid, const std::string &pid)
        {
            //{1,2} {2,1}
            // 1的好友是2，2的好友是1
            try
            {
                Relation r1(uid, pid);
                Relation r2(pid, uid);
                odb::transaction trans(_db->begin());
                _db->persist(r1);
                _db->persist(r2);
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("新增用户好友关系信息失败 {}-{}:{}！", uid, pid, e.what());
                return false;
            }
            return true;
        }
        // 移除关系信息
        bool remove(const std::string &uid, const std::string &pid)
        {
            try
            {
                odb::transaction trans(_db->begin());
                typedef odb::query<Relation> query;
                typedef odb::result<Relation> result;
                _db->erase_query<Relation>(query::user_id == uid && query::peer_id == pid);
                _db->erase_query<Relation>(query::user_id == pid && query::peer_id == uid);
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("删除好友关系信息失败 {}-{}:{}！", uid, pid, e.what());
                return false;
            }
            return true;
        }
        // 判断关系是否存在
        bool exists(const std::string &uid, const std::string &pid)
        {
            typedef odb::query<Relation> query;
            typedef odb::result<Relation> result;
            result r;
            bool flag = false;
            try
            {
                odb::transaction trans(_db->begin());
                r = _db->query<Relation>(query::user_id == uid && query::peer_id == pid);
                flag = !r.empty();
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("获取用户好友关系失败:{}-{}-{}！", uid, pid, e.what());
            }
            return flag;
        }
        
        // 获取指定用户的所有好友ID
        std::vector<std::string> get_friends(const std::string &uid)
        {
            std::vector<std::string> res;
            try
            {
                odb::transaction trans(_db->begin());
                typedef odb::query<Relation> query;
                typedef odb::result<Relation> result;
                result r(_db->query<Relation>(query::user_id == uid));
                for (result::iterator i(r.begin()); i != r.end(); ++i)
                {
                    res.push_back(i->peer_id());
                }
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("通过用户-{}的所有好友ID失败:{}！", uid, e.what());
            }
            return res;
        }

    private:
        std::shared_ptr<odb::mysql::database> _db;
    };
}