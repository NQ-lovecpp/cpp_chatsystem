#pragma once
#include "logger.hpp"
#include "mysql_odb_factory.hpp"
#include "message.hxx"
#include "message-odb.hxx"

#include <odb/mysql/database.hxx>
#include <odb/query.hxx>
#include <odb/result.hxx>


namespace chen_im
{
    // mysql数据库的message表的增删查改接口
    class MessageTable
    {
    private:
        std::shared_ptr<odb::mysql::database> _db; // 对数据库message表的增删查改操作，变成了对这个数据库对象的操作

    public:
        using ptr = std::shared_ptr<MessageTable>;
        MessageTable(const std::shared_ptr<odb::mysql::database> &db) : _db(db) {}
        ~MessageTable() {}


        /// @brief MySQL事务：向message表插入一条消息
        /// @param msg Message对象，在"message.hxx"里面定义的
        /// @return 插入是否成功
        bool insert(Message &msg)
        {
            try
            {
                //1. 获取事务对象开启事务
                odb::transaction trans(_db->begin());

                //2. 持久化
                _db->persist(msg);
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("向mysql数据库的message表插入一条消息失败，message_id：{}，错误原因：{}！", msg.message_id(), e.what());
                return false;
            }
            LOG_DEBUG("向mysql数据库的message表插入一条消息成功！");
            return true;
        }


        /// @brief MySQL事务：删除message表中指定聊天会话id下的所有消息
        /// @param ssid 聊天会话id
        /// @return 是否成功
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
                LOG_ERROR("删除会话 {} 的所有消息失败，错误原因: {}！", ssid, e.what());
                return false;
            }
            LOG_DEBUG("删除会话 {} 的所有消息成功！", ssid);

            return true;
        }


        /// @brief MySQL事务：获取message表中某个聊天会话下的最近的 `count` 条消息
        /// @param ssid 聊天会话id
        /// @param count 消息条数
        /// @return 消息数组
        std::vector<Message> recent(const std::string &ssid, int count)
        {
            std::vector<Message> res;
            try
            {
                odb::transaction trans(_db->begin());
                typedef odb::query<Message> query;
                typedef odb::result<Message> result;
                // 本次查询是以ssid作为过滤条件，然后进行以时间字段进行逆序，通过limit
                // select * from message where session_id='xx' order by create_time desc limit count;
                std::stringstream cond;
                cond << "session_id='" << ssid << "' ";
                cond << "order by create_time desc limit " << count;

                result r(_db->query<Message>(cond.str()));
                for (auto i(r.begin()); i != r.end(); ++i)
                {
                    res.push_back(*i);
                }
                std::reverse(res.begin(), res.end());
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("获取最近的 {} 条消息失败！聊天会话id: {}, 错误原因：{}", count, ssid, e.what());
            }
            return res;
        }


        /// @brief MySQL事务：获取message表中某个聊天会话下的指定时间范围内的消息
        /// @param ssid 聊天会话id
        /// @param stime 开始时间
        /// @param etime 结束时间
        /// @return 消息数组
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
                for (auto i(r.begin()); i != r.end(); ++i)
                {
                    res.push_back(*i);
                }
                trans.commit();
            }
            catch (std::exception &e)
            {
                LOG_ERROR("获取指定时间范围内的消息失败，时间范围：{}-{}，会话id：{}，错误原因：{}！",
                          boost::posix_time::to_simple_string(stime),
                          boost::posix_time::to_simple_string(etime),
                          ssid, 
                          e.what());
            }
            return res;
        }


    };
}