#pragma once
#include "logger.hpp"
#include "mysql_odb_factory.hpp"
#include "message.hxx"
#include "message-odb.hxx"

namespace chen_im
{
    class MessageTable
    {
    public:
        using ptr = std::shared_ptr<MessageTable>;
        MessageTable(const std::shared_ptr<odb::core::database> &db) : _db(db) {}
        ~MessageTable() {}
        bool insert(Message &msg)
        {
            try
            {
                odb::transaction trans(_db->begin());
                _db->persist(msg);
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("新增消息失败 {}:{}！", msg.message_id(), e.what());
                return false;
            }
            return true;
        }
        bool remove(const std::string &ssid)
        {
            try
            {
                odb::transaction trans(_db->begin());
                typedef odb::query<Message> query;
                typedef odb::result<Message> result;
                _db->erase_query<Message>(query::session_id == ssid);
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("删除会话所有消息失败 {}:{}！", ssid, e.what());
                return false;
            }
            return true;
        }
        std::vector<Message> recent(const std::string &ssid, int count)
        {
            std::vector<Message> res;
            try
            {
                odb::transaction trans(_db->begin());
                typedef odb::query<Message> query;
                typedef odb::result<Message> result;
                // 本次查询是以ssid作为过滤条件，然后进行以时间字段进行逆序，通过limit
                //  session_id='xx' order by create_time desc  limit count;
                std::stringstream cond;
                cond << "session_id='" << ssid << "' ";
                cond << "order by create_time desc limit " << count;
                result r(_db->query<Message>(cond.str()));
                for (result::iterator i(r.begin()); i != r.end(); ++i)
                {
                    res.push_back(*i);
                }
                std::reverse(res.begin(), res.end());
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("获取最近消息失败:{}-{}-{}！", ssid, count, e.what());
            }
            return res;
        }
        std::vector<Message> range(const std::string &ssid,
                                   boost::posix_time::ptime &stime,
                                   boost::posix_time::ptime &etime)
        {
            std::vector<Message> res;
            try
            {
                odb::transaction trans(_db->begin());
                typedef odb::query<Message> query;
                typedef odb::result<Message> result;
                // 获取指定会话指定时间段的信息
                result r(_db->query<Message>(query::session_id == ssid &&
                                             query::create_time >= stime &&
                                             query::create_time <= etime));
                for (result::iterator i(r.begin()); i != r.end(); ++i)
                {
                    res.push_back(*i);
                }
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("获取区间消息失败:{}-{}:{}-{}！", ssid,
                          boost::posix_time::to_simple_string(stime),
                          boost::posix_time::to_simple_string(etime), e.what());
            }
            return res;
        }

    private:
        std::shared_ptr<odb::core::database> _db;
    };
}