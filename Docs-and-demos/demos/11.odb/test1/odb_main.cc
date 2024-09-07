#include <string>
#include <memory>  // std::auto_ptr
#include <cstdlib> // std::exit
#include <iostream>

#include <odb/database.hxx>
#include <odb/mysql/database.hxx>

#include "person.hxx"
#include "person-odb.hxx"

int main()
{
    std::shared_ptr<odb::core::database> db(new odb::mysql::database("chen", "Cydia4384!", "TestODB", "139.196.238.17", 3306, 0, "utf8"));
    if (!db)
    {
        return -1;
    }
    ptime p = boost::posix_time::second_clock::local_time();
    Person zhang("小张", 18, p);
    Person wang("小王", 19, p);

    typedef odb::query<Person> query;
    typedef odb::result<Person> result;

    {// 事务1
        odb::core::transaction t(db->begin());
        size_t zid = db->persist(zhang);
        size_t wid = db->persist(wang);
        t.commit();
    }

    {
        ptime p = boost::posix_time::time_from_string("2024-05-22 09:09:39");
        ptime e = boost::posix_time::time_from_string("2024-05-22 09:13:29");
        odb::core::transaction t(db->begin());
        result r(db->query<Person>(query::update < e && query::update > p));
        for (result::iterator i(r.begin()); i != r.end(); ++i)
        {
            std::cout << "Hello, " << i->name() << " ";
            std::cout << i->age() << " " << i->update() << std::endl;
        }
        t.commit();
    }
    return 0;
}