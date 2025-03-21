// -*- C++ -*-
//
// This file was generated by ODB, object-relational mapping (ORM)
// compiler for C++.
//

#include <odb/pre.hxx>

#include "student-odb.hxx"

#include <cassert>
#include <cstring>  // std::memcpy


#include <odb/mysql/traits.hxx>
#include <odb/mysql/database.hxx>
#include <odb/mysql/transaction.hxx>
#include <odb/mysql/connection.hxx>
#include <odb/mysql/statement.hxx>
#include <odb/mysql/statement-cache.hxx>
#include <odb/mysql/simple-object-statements.hxx>
#include <odb/mysql/view-statements.hxx>
#include <odb/mysql/container-statements.hxx>
#include <odb/mysql/exceptions.hxx>
#include <odb/mysql/simple-object-result.hxx>
#include <odb/mysql/view-result.hxx>
#include <odb/mysql/enum.hxx>

namespace odb
{
  // Student
  //

  struct access::object_traits_impl< ::Student, id_mysql >::extra_statement_cache_type
  {
    extra_statement_cache_type (
      mysql::connection&,
      image_type&,
      id_image_type&,
      mysql::binding&,
      mysql::binding&)
    {
    }
  };

  access::object_traits_impl< ::Student, id_mysql >::id_type
  access::object_traits_impl< ::Student, id_mysql >::
  id (const id_image_type& i)
  {
    mysql::database* db (0);
    ODB_POTENTIALLY_UNUSED (db);

    id_type id;
    {
      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_value (
        id,
        i.id_value,
        i.id_null);
    }

    return id;
  }

  access::object_traits_impl< ::Student, id_mysql >::id_type
  access::object_traits_impl< ::Student, id_mysql >::
  id (const image_type& i)
  {
    mysql::database* db (0);
    ODB_POTENTIALLY_UNUSED (db);

    id_type id;
    {
      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_value (
        id,
        i._stu_id_value,
        i._stu_id_null);
    }

    return id;
  }

  bool access::object_traits_impl< ::Student, id_mysql >::
  grow (image_type& i,
        my_bool* t)
  {
    ODB_POTENTIALLY_UNUSED (i);
    ODB_POTENTIALLY_UNUSED (t);

    bool grew (false);

    // _stu_id
    //
    t[0UL] = 0;

    // _name
    //
    if (t[1UL])
    {
      i._name_value.capacity (i._name_size);
      grew = true;
    }

    // _age
    //
    t[2UL] = 0;

    // _class_id
    //
    t[3UL] = 0;

    return grew;
  }

  void access::object_traits_impl< ::Student, id_mysql >::
  bind (MYSQL_BIND* b,
        image_type& i,
        mysql::statement_kind sk)
  {
    ODB_POTENTIALLY_UNUSED (sk);

    using namespace mysql;

    std::size_t n (0);

    // _stu_id
    //
    if (sk != statement_update)
    {
      b[n].buffer_type = MYSQL_TYPE_LONGLONG;
      b[n].is_unsigned = 1;
      b[n].buffer = &i._stu_id_value;
      b[n].is_null = &i._stu_id_null;
      n++;
    }

    // _name
    //
    b[n].buffer_type = MYSQL_TYPE_STRING;
    b[n].buffer = i._name_value.data ();
    b[n].buffer_length = static_cast<unsigned long> (
      i._name_value.capacity ());
    b[n].length = &i._name_size;
    b[n].is_null = &i._name_null;
    n++;

    // _age
    //
    b[n].buffer_type = MYSQL_TYPE_SHORT;
    b[n].is_unsigned = 1;
    b[n].buffer = &i._age_value;
    b[n].is_null = &i._age_null;
    n++;

    // _class_id
    //
    b[n].buffer_type = MYSQL_TYPE_LONGLONG;
    b[n].is_unsigned = 1;
    b[n].buffer = &i._class_id_value;
    b[n].is_null = &i._class_id_null;
    n++;
  }

  void access::object_traits_impl< ::Student, id_mysql >::
  bind (MYSQL_BIND* b, id_image_type& i)
  {
    std::size_t n (0);
    b[n].buffer_type = MYSQL_TYPE_LONGLONG;
    b[n].is_unsigned = 1;
    b[n].buffer = &i.id_value;
    b[n].is_null = &i.id_null;
  }

  bool access::object_traits_impl< ::Student, id_mysql >::
  init (image_type& i,
        const object_type& o,
        mysql::statement_kind sk)
  {
    ODB_POTENTIALLY_UNUSED (i);
    ODB_POTENTIALLY_UNUSED (o);
    ODB_POTENTIALLY_UNUSED (sk);

    using namespace mysql;

    bool grew (false);

    // _stu_id
    //
    if (sk == statement_insert)
    {
      long unsigned int const& v =
        o._stu_id;

      bool is_null (false);
      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_image (
        i._stu_id_value, is_null, v);
      i._stu_id_null = is_null;
    }

    // _name
    //
    {
      ::std::string const& v =
        o._name;

      bool is_null (false);
      std::size_t size (0);
      std::size_t cap (i._name_value.capacity ());
      mysql::value_traits<
          ::std::string,
          mysql::id_string >::set_image (
        i._name_value,
        size,
        is_null,
        v);
      i._name_null = is_null;
      i._name_size = static_cast<unsigned long> (size);
      grew = grew || (cap != i._name_value.capacity ());
    }

    // _age
    //
    {
      ::odb::nullable< short unsigned int > const& v =
        o._age;

      bool is_null (true);
      mysql::value_traits<
          ::odb::nullable< short unsigned int >,
          mysql::id_ushort >::set_image (
        i._age_value, is_null, v);
      i._age_null = is_null;
    }

    // _class_id
    //
    {
      long unsigned int const& v =
        o._class_id;

      bool is_null (false);
      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_image (
        i._class_id_value, is_null, v);
      i._class_id_null = is_null;
    }

    return grew;
  }

  void access::object_traits_impl< ::Student, id_mysql >::
  init (object_type& o,
        const image_type& i,
        database* db)
  {
    ODB_POTENTIALLY_UNUSED (o);
    ODB_POTENTIALLY_UNUSED (i);
    ODB_POTENTIALLY_UNUSED (db);

    // _stu_id
    //
    {
      long unsigned int& v =
        o._stu_id;

      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_value (
        v,
        i._stu_id_value,
        i._stu_id_null);
    }

    // _name
    //
    {
      ::std::string& v =
        o._name;

      mysql::value_traits<
          ::std::string,
          mysql::id_string >::set_value (
        v,
        i._name_value,
        i._name_size,
        i._name_null);
    }

    // _age
    //
    {
      ::odb::nullable< short unsigned int >& v =
        o._age;

      mysql::value_traits<
          ::odb::nullable< short unsigned int >,
          mysql::id_ushort >::set_value (
        v,
        i._age_value,
        i._age_null);
    }

    // _class_id
    //
    {
      long unsigned int& v =
        o._class_id;

      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_value (
        v,
        i._class_id_value,
        i._class_id_null);
    }
  }

  void access::object_traits_impl< ::Student, id_mysql >::
  init (id_image_type& i, const id_type& id)
  {
    {
      bool is_null (false);
      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_image (
        i.id_value, is_null, id);
      i.id_null = is_null;
    }
  }

  const char access::object_traits_impl< ::Student, id_mysql >::persist_statement[] =
  "INSERT INTO `Student` "
  "(`stu_id`, "
  "`name`, "
  "`age`, "
  "`class_id`) "
  "VALUES "
  "(?, ?, ?, ?)";

  const char access::object_traits_impl< ::Student, id_mysql >::find_statement[] =
  "SELECT "
  "`Student`.`stu_id`, "
  "`Student`.`name`, "
  "`Student`.`age`, "
  "`Student`.`class_id` "
  "FROM `Student` "
  "WHERE `Student`.`stu_id`=?";

  const char access::object_traits_impl< ::Student, id_mysql >::update_statement[] =
  "UPDATE `Student` "
  "SET "
  "`name`=?, "
  "`age`=?, "
  "`class_id`=? "
  "WHERE `stu_id`=?";

  const char access::object_traits_impl< ::Student, id_mysql >::erase_statement[] =
  "DELETE FROM `Student` "
  "WHERE `stu_id`=?";

  const char access::object_traits_impl< ::Student, id_mysql >::query_statement[] =
  "SELECT "
  "`Student`.`stu_id`, "
  "`Student`.`name`, "
  "`Student`.`age`, "
  "`Student`.`class_id` "
  "FROM `Student`";

  const char access::object_traits_impl< ::Student, id_mysql >::erase_query_statement[] =
  "DELETE FROM `Student`";

  const char access::object_traits_impl< ::Student, id_mysql >::table_name[] =
  "`Student`";

  void access::object_traits_impl< ::Student, id_mysql >::
  persist (database& db, object_type& obj)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    callback (db,
              static_cast<const object_type&> (obj),
              callback_event::pre_persist);

    image_type& im (sts.image ());
    binding& imb (sts.insert_image_binding ());

    if (init (im, obj, statement_insert))
      im.version++;

    im._stu_id_value = 0;

    if (im.version != sts.insert_image_version () ||
        imb.version == 0)
    {
      bind (imb.bind, im, statement_insert);
      sts.insert_image_version (im.version);
      imb.version++;
    }

    {
      id_image_type& i (sts.id_image ());
      binding& b (sts.id_image_binding ());
      if (i.version != sts.id_image_version () || b.version == 0)
      {
        bind (b.bind, i);
        sts.id_image_version (i.version);
        b.version++;
      }
    }

    insert_statement& st (sts.persist_statement ());
    if (!st.execute ())
      throw object_already_persistent ();

    obj._stu_id = id (sts.id_image ());

    callback (db,
              static_cast<const object_type&> (obj),
              callback_event::post_persist);
  }

  void access::object_traits_impl< ::Student, id_mysql >::
  update (database& db, const object_type& obj)
  {
    ODB_POTENTIALLY_UNUSED (db);

    using namespace mysql;
    using mysql::update_statement;

    callback (db, obj, callback_event::pre_update);

    mysql::transaction& tr (mysql::transaction::current ());
    mysql::connection& conn (tr.connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    id_image_type& idi (sts.id_image ());
    init (idi, id (obj));

    image_type& im (sts.image ());
    if (init (im, obj, statement_update))
      im.version++;

    bool u (false);
    binding& imb (sts.update_image_binding ());
    if (im.version != sts.update_image_version () ||
        imb.version == 0)
    {
      bind (imb.bind, im, statement_update);
      sts.update_image_version (im.version);
      imb.version++;
      u = true;
    }

    binding& idb (sts.id_image_binding ());
    if (idi.version != sts.update_id_image_version () ||
        idb.version == 0)
    {
      if (idi.version != sts.id_image_version () ||
          idb.version == 0)
      {
        bind (idb.bind, idi);
        sts.id_image_version (idi.version);
        idb.version++;
      }

      sts.update_id_image_version (idi.version);

      if (!u)
        imb.version++;
    }

    update_statement& st (sts.update_statement ());
    if (st.execute () == 0)
      throw object_not_persistent ();

    callback (db, obj, callback_event::post_update);
    pointer_cache_traits::update (db, obj);
  }

  void access::object_traits_impl< ::Student, id_mysql >::
  erase (database& db, const id_type& id)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    id_image_type& i (sts.id_image ());
    init (i, id);

    binding& idb (sts.id_image_binding ());
    if (i.version != sts.id_image_version () || idb.version == 0)
    {
      bind (idb.bind, i);
      sts.id_image_version (i.version);
      idb.version++;
    }

    if (sts.erase_statement ().execute () != 1)
      throw object_not_persistent ();

    pointer_cache_traits::erase (db, id);
  }

  access::object_traits_impl< ::Student, id_mysql >::pointer_type
  access::object_traits_impl< ::Student, id_mysql >::
  find (database& db, const id_type& id)
  {
    using namespace mysql;

    {
      pointer_type p (pointer_cache_traits::find (db, id));

      if (!pointer_traits::null_ptr (p))
        return p;
    }

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    statements_type::auto_lock l (sts);

    if (l.locked ())
    {
      if (!find_ (sts, &id))
        return pointer_type ();
    }

    pointer_type p (
      access::object_factory<object_type, pointer_type>::create ());
    pointer_traits::guard pg (p);

    pointer_cache_traits::insert_guard ig (
      pointer_cache_traits::insert (db, id, p));

    object_type& obj (pointer_traits::get_ref (p));

    if (l.locked ())
    {
      select_statement& st (sts.find_statement ());
      ODB_POTENTIALLY_UNUSED (st);

      callback (db, obj, callback_event::pre_load);
      init (obj, sts.image (), &db);
      load_ (sts, obj, false);
      sts.load_delayed (0);
      l.unlock ();
      callback (db, obj, callback_event::post_load);
      pointer_cache_traits::load (ig.position ());
    }
    else
      sts.delay_load (id, obj, ig.position ());

    ig.release ();
    pg.release ();
    return p;
  }

  bool access::object_traits_impl< ::Student, id_mysql >::
  find (database& db, const id_type& id, object_type& obj)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    statements_type::auto_lock l (sts);
    assert (l.locked ()) /* Must be a top-level call. */;

    if (!find_ (sts, &id))
      return false;

    select_statement& st (sts.find_statement ());
    ODB_POTENTIALLY_UNUSED (st);

    reference_cache_traits::position_type pos (
      reference_cache_traits::insert (db, id, obj));
    reference_cache_traits::insert_guard ig (pos);

    callback (db, obj, callback_event::pre_load);
    init (obj, sts.image (), &db);
    load_ (sts, obj, false);
    sts.load_delayed (0);
    l.unlock ();
    callback (db, obj, callback_event::post_load);
    reference_cache_traits::load (pos);
    ig.release ();
    return true;
  }

  bool access::object_traits_impl< ::Student, id_mysql >::
  reload (database& db, object_type& obj)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    statements_type::auto_lock l (sts);
    assert (l.locked ()) /* Must be a top-level call. */;

    const id_type& id (object_traits_impl::id (obj));
    if (!find_ (sts, &id))
      return false;

    select_statement& st (sts.find_statement ());
    ODB_POTENTIALLY_UNUSED (st);

    callback (db, obj, callback_event::pre_load);
    init (obj, sts.image (), &db);
    load_ (sts, obj, true);
    sts.load_delayed (0);
    l.unlock ();
    callback (db, obj, callback_event::post_load);
    return true;
  }

  bool access::object_traits_impl< ::Student, id_mysql >::
  find_ (statements_type& sts,
         const id_type* id)
  {
    using namespace mysql;

    id_image_type& i (sts.id_image ());
    init (i, *id);

    binding& idb (sts.id_image_binding ());
    if (i.version != sts.id_image_version () || idb.version == 0)
    {
      bind (idb.bind, i);
      sts.id_image_version (i.version);
      idb.version++;
    }

    image_type& im (sts.image ());
    binding& imb (sts.select_image_binding ());

    if (im.version != sts.select_image_version () ||
        imb.version == 0)
    {
      bind (imb.bind, im, statement_select);
      sts.select_image_version (im.version);
      imb.version++;
    }

    select_statement& st (sts.find_statement ());

    st.execute ();
    auto_result ar (st);
    select_statement::result r (st.fetch ());

    if (r == select_statement::truncated)
    {
      if (grow (im, sts.select_image_truncated ()))
        im.version++;

      if (im.version != sts.select_image_version ())
      {
        bind (imb.bind, im, statement_select);
        sts.select_image_version (im.version);
        imb.version++;
        st.refetch ();
      }
    }

    return r != select_statement::no_data;
  }

  result< access::object_traits_impl< ::Student, id_mysql >::object_type >
  access::object_traits_impl< ::Student, id_mysql >::
  query (database& db, const query_base_type& q)
  {
    using namespace mysql;
    using odb::details::shared;
    using odb::details::shared_ptr;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));

    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    image_type& im (sts.image ());
    binding& imb (sts.select_image_binding ());

    if (im.version != sts.select_image_version () ||
        imb.version == 0)
    {
      bind (imb.bind, im, statement_select);
      sts.select_image_version (im.version);
      imb.version++;
    }

    std::string text (query_statement);
    if (!q.empty ())
    {
      text += " ";
      text += q.clause ();
    }

    q.init_parameters ();
    shared_ptr<select_statement> st (
      new (shared) select_statement (
        conn,
        text,
        false,
        true,
        q.parameters_binding (),
        imb));

    st->execute ();

    shared_ptr< odb::object_result_impl<object_type> > r (
      new (shared) mysql::object_result_impl<object_type> (
        q, st, sts, 0));

    return result<object_type> (r);
  }

  unsigned long long access::object_traits_impl< ::Student, id_mysql >::
  erase_query (database& db, const query_base_type& q)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));

    std::string text (erase_query_statement);
    if (!q.empty ())
    {
      text += ' ';
      text += q.clause ();
    }

    q.init_parameters ();
    delete_statement st (
      conn,
      text,
      q.parameters_binding ());

    return st.execute ();
  }

  // Class
  //

  struct access::object_traits_impl< ::Class, id_mysql >::extra_statement_cache_type
  {
    extra_statement_cache_type (
      mysql::connection&,
      image_type&,
      id_image_type&,
      mysql::binding&,
      mysql::binding&)
    {
    }
  };

  access::object_traits_impl< ::Class, id_mysql >::id_type
  access::object_traits_impl< ::Class, id_mysql >::
  id (const id_image_type& i)
  {
    mysql::database* db (0);
    ODB_POTENTIALLY_UNUSED (db);

    id_type id;
    {
      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_value (
        id,
        i.id_value,
        i.id_null);
    }

    return id;
  }

  access::object_traits_impl< ::Class, id_mysql >::id_type
  access::object_traits_impl< ::Class, id_mysql >::
  id (const image_type& i)
  {
    mysql::database* db (0);
    ODB_POTENTIALLY_UNUSED (db);

    id_type id;
    {
      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_value (
        id,
        i._class_id_value,
        i._class_id_null);
    }

    return id;
  }

  bool access::object_traits_impl< ::Class, id_mysql >::
  grow (image_type& i,
        my_bool* t)
  {
    ODB_POTENTIALLY_UNUSED (i);
    ODB_POTENTIALLY_UNUSED (t);

    bool grew (false);

    // _class_id
    //
    t[0UL] = 0;

    // _class_name
    //
    if (t[1UL])
    {
      i._class_name_value.capacity (i._class_name_size);
      grew = true;
    }

    return grew;
  }

  void access::object_traits_impl< ::Class, id_mysql >::
  bind (MYSQL_BIND* b,
        image_type& i,
        mysql::statement_kind sk)
  {
    ODB_POTENTIALLY_UNUSED (sk);

    using namespace mysql;

    std::size_t n (0);

    // _class_id
    //
    if (sk != statement_update)
    {
      b[n].buffer_type = MYSQL_TYPE_LONGLONG;
      b[n].is_unsigned = 1;
      b[n].buffer = &i._class_id_value;
      b[n].is_null = &i._class_id_null;
      n++;
    }

    // _class_name
    //
    b[n].buffer_type = MYSQL_TYPE_STRING;
    b[n].buffer = i._class_name_value.data ();
    b[n].buffer_length = static_cast<unsigned long> (
      i._class_name_value.capacity ());
    b[n].length = &i._class_name_size;
    b[n].is_null = &i._class_name_null;
    n++;
  }

  void access::object_traits_impl< ::Class, id_mysql >::
  bind (MYSQL_BIND* b, id_image_type& i)
  {
    std::size_t n (0);
    b[n].buffer_type = MYSQL_TYPE_LONGLONG;
    b[n].is_unsigned = 1;
    b[n].buffer = &i.id_value;
    b[n].is_null = &i.id_null;
  }

  bool access::object_traits_impl< ::Class, id_mysql >::
  init (image_type& i,
        const object_type& o,
        mysql::statement_kind sk)
  {
    ODB_POTENTIALLY_UNUSED (i);
    ODB_POTENTIALLY_UNUSED (o);
    ODB_POTENTIALLY_UNUSED (sk);

    using namespace mysql;

    bool grew (false);

    // _class_id
    //
    if (sk == statement_insert)
    {
      long unsigned int const& v =
        o._class_id;

      bool is_null (false);
      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_image (
        i._class_id_value, is_null, v);
      i._class_id_null = is_null;
    }

    // _class_name
    //
    {
      ::std::string const& v =
        o._class_name;

      bool is_null (false);
      std::size_t size (0);
      std::size_t cap (i._class_name_value.capacity ());
      mysql::value_traits<
          ::std::string,
          mysql::id_string >::set_image (
        i._class_name_value,
        size,
        is_null,
        v);
      i._class_name_null = is_null;
      i._class_name_size = static_cast<unsigned long> (size);
      grew = grew || (cap != i._class_name_value.capacity ());
    }

    return grew;
  }

  void access::object_traits_impl< ::Class, id_mysql >::
  init (object_type& o,
        const image_type& i,
        database* db)
  {
    ODB_POTENTIALLY_UNUSED (o);
    ODB_POTENTIALLY_UNUSED (i);
    ODB_POTENTIALLY_UNUSED (db);

    // _class_id
    //
    {
      long unsigned int& v =
        o._class_id;

      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_value (
        v,
        i._class_id_value,
        i._class_id_null);
    }

    // _class_name
    //
    {
      ::std::string& v =
        o._class_name;

      mysql::value_traits<
          ::std::string,
          mysql::id_string >::set_value (
        v,
        i._class_name_value,
        i._class_name_size,
        i._class_name_null);
    }
  }

  void access::object_traits_impl< ::Class, id_mysql >::
  init (id_image_type& i, const id_type& id)
  {
    {
      bool is_null (false);
      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_image (
        i.id_value, is_null, id);
      i.id_null = is_null;
    }
  }

  const char access::object_traits_impl< ::Class, id_mysql >::persist_statement[] =
  "INSERT INTO `Class` "
  "(`class_id`, "
  "`class_name`) "
  "VALUES "
  "(?, ?)";

  const char access::object_traits_impl< ::Class, id_mysql >::find_statement[] =
  "SELECT "
  "`Class`.`class_id`, "
  "`Class`.`class_name` "
  "FROM `Class` "
  "WHERE `Class`.`class_id`=?";

  const char access::object_traits_impl< ::Class, id_mysql >::update_statement[] =
  "UPDATE `Class` "
  "SET "
  "`class_name`=? "
  "WHERE `class_id`=?";

  const char access::object_traits_impl< ::Class, id_mysql >::erase_statement[] =
  "DELETE FROM `Class` "
  "WHERE `class_id`=?";

  const char access::object_traits_impl< ::Class, id_mysql >::query_statement[] =
  "SELECT "
  "`Class`.`class_id`, "
  "`Class`.`class_name` "
  "FROM `Class`";

  const char access::object_traits_impl< ::Class, id_mysql >::erase_query_statement[] =
  "DELETE FROM `Class`";

  const char access::object_traits_impl< ::Class, id_mysql >::table_name[] =
  "`Class`";

  void access::object_traits_impl< ::Class, id_mysql >::
  persist (database& db, object_type& obj)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    callback (db,
              static_cast<const object_type&> (obj),
              callback_event::pre_persist);

    image_type& im (sts.image ());
    binding& imb (sts.insert_image_binding ());

    if (init (im, obj, statement_insert))
      im.version++;

    im._class_id_value = 0;

    if (im.version != sts.insert_image_version () ||
        imb.version == 0)
    {
      bind (imb.bind, im, statement_insert);
      sts.insert_image_version (im.version);
      imb.version++;
    }

    {
      id_image_type& i (sts.id_image ());
      binding& b (sts.id_image_binding ());
      if (i.version != sts.id_image_version () || b.version == 0)
      {
        bind (b.bind, i);
        sts.id_image_version (i.version);
        b.version++;
      }
    }

    insert_statement& st (sts.persist_statement ());
    if (!st.execute ())
      throw object_already_persistent ();

    obj._class_id = id (sts.id_image ());

    callback (db,
              static_cast<const object_type&> (obj),
              callback_event::post_persist);
  }

  void access::object_traits_impl< ::Class, id_mysql >::
  update (database& db, const object_type& obj)
  {
    ODB_POTENTIALLY_UNUSED (db);

    using namespace mysql;
    using mysql::update_statement;

    callback (db, obj, callback_event::pre_update);

    mysql::transaction& tr (mysql::transaction::current ());
    mysql::connection& conn (tr.connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    id_image_type& idi (sts.id_image ());
    init (idi, id (obj));

    image_type& im (sts.image ());
    if (init (im, obj, statement_update))
      im.version++;

    bool u (false);
    binding& imb (sts.update_image_binding ());
    if (im.version != sts.update_image_version () ||
        imb.version == 0)
    {
      bind (imb.bind, im, statement_update);
      sts.update_image_version (im.version);
      imb.version++;
      u = true;
    }

    binding& idb (sts.id_image_binding ());
    if (idi.version != sts.update_id_image_version () ||
        idb.version == 0)
    {
      if (idi.version != sts.id_image_version () ||
          idb.version == 0)
      {
        bind (idb.bind, idi);
        sts.id_image_version (idi.version);
        idb.version++;
      }

      sts.update_id_image_version (idi.version);

      if (!u)
        imb.version++;
    }

    update_statement& st (sts.update_statement ());
    if (st.execute () == 0)
      throw object_not_persistent ();

    callback (db, obj, callback_event::post_update);
    pointer_cache_traits::update (db, obj);
  }

  void access::object_traits_impl< ::Class, id_mysql >::
  erase (database& db, const id_type& id)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    id_image_type& i (sts.id_image ());
    init (i, id);

    binding& idb (sts.id_image_binding ());
    if (i.version != sts.id_image_version () || idb.version == 0)
    {
      bind (idb.bind, i);
      sts.id_image_version (i.version);
      idb.version++;
    }

    if (sts.erase_statement ().execute () != 1)
      throw object_not_persistent ();

    pointer_cache_traits::erase (db, id);
  }

  access::object_traits_impl< ::Class, id_mysql >::pointer_type
  access::object_traits_impl< ::Class, id_mysql >::
  find (database& db, const id_type& id)
  {
    using namespace mysql;

    {
      pointer_type p (pointer_cache_traits::find (db, id));

      if (!pointer_traits::null_ptr (p))
        return p;
    }

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    statements_type::auto_lock l (sts);

    if (l.locked ())
    {
      if (!find_ (sts, &id))
        return pointer_type ();
    }

    pointer_type p (
      access::object_factory<object_type, pointer_type>::create ());
    pointer_traits::guard pg (p);

    pointer_cache_traits::insert_guard ig (
      pointer_cache_traits::insert (db, id, p));

    object_type& obj (pointer_traits::get_ref (p));

    if (l.locked ())
    {
      select_statement& st (sts.find_statement ());
      ODB_POTENTIALLY_UNUSED (st);

      callback (db, obj, callback_event::pre_load);
      init (obj, sts.image (), &db);
      load_ (sts, obj, false);
      sts.load_delayed (0);
      l.unlock ();
      callback (db, obj, callback_event::post_load);
      pointer_cache_traits::load (ig.position ());
    }
    else
      sts.delay_load (id, obj, ig.position ());

    ig.release ();
    pg.release ();
    return p;
  }

  bool access::object_traits_impl< ::Class, id_mysql >::
  find (database& db, const id_type& id, object_type& obj)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    statements_type::auto_lock l (sts);
    assert (l.locked ()) /* Must be a top-level call. */;

    if (!find_ (sts, &id))
      return false;

    select_statement& st (sts.find_statement ());
    ODB_POTENTIALLY_UNUSED (st);

    reference_cache_traits::position_type pos (
      reference_cache_traits::insert (db, id, obj));
    reference_cache_traits::insert_guard ig (pos);

    callback (db, obj, callback_event::pre_load);
    init (obj, sts.image (), &db);
    load_ (sts, obj, false);
    sts.load_delayed (0);
    l.unlock ();
    callback (db, obj, callback_event::post_load);
    reference_cache_traits::load (pos);
    ig.release ();
    return true;
  }

  bool access::object_traits_impl< ::Class, id_mysql >::
  reload (database& db, object_type& obj)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    statements_type::auto_lock l (sts);
    assert (l.locked ()) /* Must be a top-level call. */;

    const id_type& id (object_traits_impl::id (obj));
    if (!find_ (sts, &id))
      return false;

    select_statement& st (sts.find_statement ());
    ODB_POTENTIALLY_UNUSED (st);

    callback (db, obj, callback_event::pre_load);
    init (obj, sts.image (), &db);
    load_ (sts, obj, true);
    sts.load_delayed (0);
    l.unlock ();
    callback (db, obj, callback_event::post_load);
    return true;
  }

  bool access::object_traits_impl< ::Class, id_mysql >::
  find_ (statements_type& sts,
         const id_type* id)
  {
    using namespace mysql;

    id_image_type& i (sts.id_image ());
    init (i, *id);

    binding& idb (sts.id_image_binding ());
    if (i.version != sts.id_image_version () || idb.version == 0)
    {
      bind (idb.bind, i);
      sts.id_image_version (i.version);
      idb.version++;
    }

    image_type& im (sts.image ());
    binding& imb (sts.select_image_binding ());

    if (im.version != sts.select_image_version () ||
        imb.version == 0)
    {
      bind (imb.bind, im, statement_select);
      sts.select_image_version (im.version);
      imb.version++;
    }

    select_statement& st (sts.find_statement ());

    st.execute ();
    auto_result ar (st);
    select_statement::result r (st.fetch ());

    if (r == select_statement::truncated)
    {
      if (grow (im, sts.select_image_truncated ()))
        im.version++;

      if (im.version != sts.select_image_version ())
      {
        bind (imb.bind, im, statement_select);
        sts.select_image_version (im.version);
        imb.version++;
        st.refetch ();
      }
    }

    return r != select_statement::no_data;
  }

  result< access::object_traits_impl< ::Class, id_mysql >::object_type >
  access::object_traits_impl< ::Class, id_mysql >::
  query (database& db, const query_base_type& q)
  {
    using namespace mysql;
    using odb::details::shared;
    using odb::details::shared_ptr;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));

    statements_type& sts (
      conn.statement_cache ().find_object<object_type> ());

    image_type& im (sts.image ());
    binding& imb (sts.select_image_binding ());

    if (im.version != sts.select_image_version () ||
        imb.version == 0)
    {
      bind (imb.bind, im, statement_select);
      sts.select_image_version (im.version);
      imb.version++;
    }

    std::string text (query_statement);
    if (!q.empty ())
    {
      text += " ";
      text += q.clause ();
    }

    q.init_parameters ();
    shared_ptr<select_statement> st (
      new (shared) select_statement (
        conn,
        text,
        false,
        true,
        q.parameters_binding (),
        imb));

    st->execute ();

    shared_ptr< odb::object_result_impl<object_type> > r (
      new (shared) mysql::object_result_impl<object_type> (
        q, st, sts, 0));

    return result<object_type> (r);
  }

  unsigned long long access::object_traits_impl< ::Class, id_mysql >::
  erase_query (database& db, const query_base_type& q)
  {
    using namespace mysql;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));

    std::string text (erase_query_statement);
    if (!q.empty ())
    {
      text += ' ';
      text += q.clause ();
    }

    q.init_parameters ();
    delete_statement st (
      conn,
      text,
      q.parameters_binding ());

    return st.execute ();
  }

  // class_student_view
  //

  bool access::view_traits_impl< ::class_student_view, id_mysql >::
  grow (image_type& i,
        my_bool* t)
  {
    ODB_POTENTIALLY_UNUSED (i);
    ODB_POTENTIALLY_UNUSED (t);

    bool grew (false);

    // _stu_id
    //
    t[0UL] = 0;

    // _name
    //
    if (t[1UL])
    {
      i._name_value.capacity (i._name_size);
      grew = true;
    }

    // _age
    //
    t[2UL] = 0;

    // _class_name
    //
    if (t[3UL])
    {
      i._class_name_value.capacity (i._class_name_size);
      grew = true;
    }

    return grew;
  }

  void access::view_traits_impl< ::class_student_view, id_mysql >::
  bind (MYSQL_BIND* b,
        image_type& i)
  {
    using namespace mysql;

    mysql::statement_kind sk (statement_select);
    ODB_POTENTIALLY_UNUSED (sk);

    std::size_t n (0);

    // _stu_id
    //
    b[n].buffer_type = MYSQL_TYPE_LONGLONG;
    b[n].is_unsigned = 1;
    b[n].buffer = &i._stu_id_value;
    b[n].is_null = &i._stu_id_null;
    n++;

    // _name
    //
    b[n].buffer_type = MYSQL_TYPE_STRING;
    b[n].buffer = i._name_value.data ();
    b[n].buffer_length = static_cast<unsigned long> (
      i._name_value.capacity ());
    b[n].length = &i._name_size;
    b[n].is_null = &i._name_null;
    n++;

    // _age
    //
    b[n].buffer_type = MYSQL_TYPE_SHORT;
    b[n].is_unsigned = 1;
    b[n].buffer = &i._age_value;
    b[n].is_null = &i._age_null;
    n++;

    // _class_name
    //
    b[n].buffer_type = MYSQL_TYPE_STRING;
    b[n].buffer = i._class_name_value.data ();
    b[n].buffer_length = static_cast<unsigned long> (
      i._class_name_value.capacity ());
    b[n].length = &i._class_name_size;
    b[n].is_null = &i._class_name_null;
    n++;
  }

  void access::view_traits_impl< ::class_student_view, id_mysql >::
  init (view_type& o,
        const image_type& i,
        database* db)
  {
    ODB_POTENTIALLY_UNUSED (o);
    ODB_POTENTIALLY_UNUSED (i);
    ODB_POTENTIALLY_UNUSED (db);

    // _stu_id
    //
    {
      long unsigned int& v =
        o._stu_id;

      mysql::value_traits<
          long unsigned int,
          mysql::id_ulonglong >::set_value (
        v,
        i._stu_id_value,
        i._stu_id_null);
    }

    // _name
    //
    {
      ::std::string& v =
        o._name;

      mysql::value_traits<
          ::std::string,
          mysql::id_string >::set_value (
        v,
        i._name_value,
        i._name_size,
        i._name_null);
    }

    // _age
    //
    {
      ::odb::nullable< short unsigned int >& v =
        o._age;

      mysql::value_traits<
          ::odb::nullable< short unsigned int >,
          mysql::id_ushort >::set_value (
        v,
        i._age_value,
        i._age_null);
    }

    // _class_name
    //
    {
      ::std::string& v =
        o._class_name;

      mysql::value_traits<
          ::std::string,
          mysql::id_string >::set_value (
        v,
        i._class_name_value,
        i._class_name_size,
        i._class_name_null);
    }
  }

  access::view_traits_impl< ::class_student_view, id_mysql >::query_base_type
  access::view_traits_impl< ::class_student_view, id_mysql >::
  query_statement (const query_base_type& q)
  {
    query_base_type r (
      "SELECT "
      "`Student`.`stu_id`, "
      "`Student`.`name`, "
      "`Student`.`age`, "
      "`Class`.`class_name` ");

    r += "FROM `Student`";

    r += " LEFT JOIN `Class` AS `Class` ON";
    // From student.hxx:104:17
    r += query_columns::Student::class_id == query_columns::Class::class_id;

    query_base_type c (
      // From student.hxx:105:17
      (q.empty () ? query_base_type::true_expr : q));

    c.optimize ();

    if (!c.empty ())
    {
      r += " ";
      r += c.clause_prefix ();
      r += c;
    }

    return r;
  }

  result< access::view_traits_impl< ::class_student_view, id_mysql >::view_type >
  access::view_traits_impl< ::class_student_view, id_mysql >::
  query (database& db, const query_base_type& q)
  {
    using namespace mysql;
    using odb::details::shared;
    using odb::details::shared_ptr;

    mysql::connection& conn (
      mysql::transaction::current ().connection (db));
    statements_type& sts (
      conn.statement_cache ().find_view<view_type> ());

    image_type& im (sts.image ());
    binding& imb (sts.image_binding ());

    if (im.version != sts.image_version () || imb.version == 0)
    {
      bind (imb.bind, im);
      sts.image_version (im.version);
      imb.version++;
    }

    const query_base_type& qs (query_statement (q));
    qs.init_parameters ();
    shared_ptr<select_statement> st (
      new (shared) select_statement (
        conn,
        qs.clause (),
        false,
        true,
        qs.parameters_binding (),
        imb));

    st->execute ();

    shared_ptr< odb::view_result_impl<view_type> > r (
      new (shared) mysql::view_result_impl<view_type> (
        qs, st, sts, 0));

    return result<view_type> (r);
  }
}

#include <odb/post.hxx>
