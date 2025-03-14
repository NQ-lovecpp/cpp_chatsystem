// -*- C++ -*-
//
// This file was generated by ODB, object-relational mapping (ORM)
// compiler for C++.
//

#ifndef STUDENT_ODB_HXX
#define STUDENT_ODB_HXX

// Begin prologue.
//
#include <odb/boost/version.hxx>
#if ODB_BOOST_VERSION != 2047700 // 2.5.0-b.27
#  error ODB and C++ compilers see different libodb-boost interface versions
#endif
#include <odb/boost/date-time/mysql/gregorian-traits.hxx>
#include <odb/boost/date-time/mysql/posix-time-traits.hxx>
//
// End prologue.

#include <odb/version.hxx>

#if ODB_VERSION != 20477UL
#error ODB runtime version mismatch
#endif

#include <odb/pre.hxx>

#include "student.hxx"

#include <memory>
#include <cstddef>
#include <utility>

#include <odb/core.hxx>
#include <odb/traits.hxx>
#include <odb/callback.hxx>
#include <odb/wrapper-traits.hxx>
#include <odb/pointer-traits.hxx>
#include <odb/container-traits.hxx>
#include <odb/no-op-cache-traits.hxx>
#include <odb/result.hxx>
#include <odb/simple-object-result.hxx>
#include <odb/view-image.hxx>
#include <odb/view-result.hxx>

#include <odb/details/unused.hxx>
#include <odb/details/shared-ptr.hxx>

namespace odb
{
  // Student
  //
  template <>
  struct class_traits< ::Student >
  {
    static const class_kind kind = class_object;
  };

  template <>
  class access::object_traits< ::Student >
  {
    public:
    typedef ::Student object_type;
    typedef ::Student* pointer_type;
    typedef odb::pointer_traits<pointer_type> pointer_traits;

    static const bool polymorphic = false;

    typedef long unsigned int id_type;

    static const bool auto_id = true;

    static const bool abstract = false;

    static id_type
    id (const object_type&);

    typedef
    no_op_pointer_cache_traits<pointer_type>
    pointer_cache_traits;

    typedef
    no_op_reference_cache_traits<object_type>
    reference_cache_traits;

    static void
    callback (database&, object_type&, callback_event);

    static void
    callback (database&, const object_type&, callback_event);
  };

  // Class
  //
  template <>
  struct class_traits< ::Class >
  {
    static const class_kind kind = class_object;
  };

  template <>
  class access::object_traits< ::Class >
  {
    public:
    typedef ::Class object_type;
    typedef ::Class* pointer_type;
    typedef odb::pointer_traits<pointer_type> pointer_traits;

    static const bool polymorphic = false;

    typedef long unsigned int id_type;

    static const bool auto_id = true;

    static const bool abstract = false;

    static id_type
    id (const object_type&);

    typedef
    no_op_pointer_cache_traits<pointer_type>
    pointer_cache_traits;

    typedef
    no_op_reference_cache_traits<object_type>
    reference_cache_traits;

    static void
    callback (database&, object_type&, callback_event);

    static void
    callback (database&, const object_type&, callback_event);
  };

  // class_student_view
  //
  template <>
  struct class_traits< ::class_student_view >
  {
    static const class_kind kind = class_view;
  };

  template <>
  class access::view_traits< ::class_student_view >
  {
    public:
    typedef ::class_student_view view_type;
    typedef ::class_student_view* pointer_type;

    static void
    callback (database&, view_type&, callback_event);
  };
}

#include <odb/details/buffer.hxx>

#include <odb/mysql/version.hxx>
#include <odb/mysql/forward.hxx>
#include <odb/mysql/binding.hxx>
#include <odb/mysql/mysql-types.hxx>
#include <odb/mysql/query.hxx>

namespace odb
{
  // Student
  //
  template <typename A>
  struct query_columns< ::Student, id_mysql, A >
  {
    // stu_id
    //
    typedef
    mysql::query_column<
      mysql::value_traits<
        long unsigned int,
        mysql::id_ulonglong >::query_type,
      mysql::id_ulonglong >
    stu_id_type_;

    static const stu_id_type_ stu_id;

    // name
    //
    typedef
    mysql::query_column<
      mysql::value_traits<
        ::std::string,
        mysql::id_string >::query_type,
      mysql::id_string >
    name_type_;

    static const name_type_ name;

    // age
    //
    typedef
    mysql::query_column<
      mysql::value_traits<
        short unsigned int,
        mysql::id_ushort >::query_type,
      mysql::id_ushort >
    age_type_;

    static const age_type_ age;

    // class_id
    //
    typedef
    mysql::query_column<
      mysql::value_traits<
        long unsigned int,
        mysql::id_ulonglong >::query_type,
      mysql::id_ulonglong >
    class_id_type_;

    static const class_id_type_ class_id;
  };

  template <typename A>
  const typename query_columns< ::Student, id_mysql, A >::stu_id_type_
  query_columns< ::Student, id_mysql, A >::
  stu_id (A::table_name, "`stu_id`", 0);

  template <typename A>
  const typename query_columns< ::Student, id_mysql, A >::name_type_
  query_columns< ::Student, id_mysql, A >::
  name (A::table_name, "`name`", 0);

  template <typename A>
  const typename query_columns< ::Student, id_mysql, A >::age_type_
  query_columns< ::Student, id_mysql, A >::
  age (A::table_name, "`age`", 0);

  template <typename A>
  const typename query_columns< ::Student, id_mysql, A >::class_id_type_
  query_columns< ::Student, id_mysql, A >::
  class_id (A::table_name, "`class_id`", 0);

  template <typename A>
  struct pointer_query_columns< ::Student, id_mysql, A >:
    query_columns< ::Student, id_mysql, A >
  {
  };

  template <>
  class access::object_traits_impl< ::Student, id_mysql >:
    public access::object_traits< ::Student >
  {
    public:
    struct id_image_type
    {
      unsigned long long id_value;
      my_bool id_null;

      std::size_t version;
    };

    struct image_type
    {
      // _stu_id
      //
      unsigned long long _stu_id_value;
      my_bool _stu_id_null;

      // _name
      //
      details::buffer _name_value;
      unsigned long _name_size;
      my_bool _name_null;

      // _age
      //
      unsigned short _age_value;
      my_bool _age_null;

      // _class_id
      //
      unsigned long long _class_id_value;
      my_bool _class_id_null;

      std::size_t version;
    };

    struct extra_statement_cache_type;

    using object_traits<object_type>::id;

    static id_type
    id (const id_image_type&);

    static id_type
    id (const image_type&);

    static bool
    grow (image_type&,
          my_bool*);

    static void
    bind (MYSQL_BIND*,
          image_type&,
          mysql::statement_kind);

    static void
    bind (MYSQL_BIND*, id_image_type&);

    static bool
    init (image_type&,
          const object_type&,
          mysql::statement_kind);

    static void
    init (object_type&,
          const image_type&,
          database*);

    static void
    init (id_image_type&, const id_type&);

    typedef mysql::object_statements<object_type> statements_type;

    typedef mysql::query_base query_base_type;

    static const std::size_t column_count = 4UL;
    static const std::size_t id_column_count = 1UL;
    static const std::size_t inverse_column_count = 0UL;
    static const std::size_t readonly_column_count = 0UL;
    static const std::size_t managed_optimistic_column_count = 0UL;

    static const std::size_t separate_load_column_count = 0UL;
    static const std::size_t separate_update_column_count = 0UL;

    static const bool versioned = false;

    static const char persist_statement[];
    static const char find_statement[];
    static const char update_statement[];
    static const char erase_statement[];
    static const char query_statement[];
    static const char erase_query_statement[];

    static const char table_name[];

    static void
    persist (database&, object_type&);

    static pointer_type
    find (database&, const id_type&);

    static bool
    find (database&, const id_type&, object_type&);

    static bool
    reload (database&, object_type&);

    static void
    update (database&, const object_type&);

    static void
    erase (database&, const id_type&);

    static void
    erase (database&, const object_type&);

    static result<object_type>
    query (database&, const query_base_type&);

    static unsigned long long
    erase_query (database&, const query_base_type&);

    public:
    static bool
    find_ (statements_type&,
           const id_type*);

    static void
    load_ (statements_type&,
           object_type&,
           bool reload);
  };

  template <>
  class access::object_traits_impl< ::Student, id_common >:
    public access::object_traits_impl< ::Student, id_mysql >
  {
  };

  // Class
  //
  template <typename A>
  struct query_columns< ::Class, id_mysql, A >
  {
    // class_id
    //
    typedef
    mysql::query_column<
      mysql::value_traits<
        long unsigned int,
        mysql::id_ulonglong >::query_type,
      mysql::id_ulonglong >
    class_id_type_;

    static const class_id_type_ class_id;

    // class_name
    //
    typedef
    mysql::query_column<
      mysql::value_traits<
        ::std::string,
        mysql::id_string >::query_type,
      mysql::id_string >
    class_name_type_;

    static const class_name_type_ class_name;
  };

  template <typename A>
  const typename query_columns< ::Class, id_mysql, A >::class_id_type_
  query_columns< ::Class, id_mysql, A >::
  class_id (A::table_name, "`class_id`", 0);

  template <typename A>
  const typename query_columns< ::Class, id_mysql, A >::class_name_type_
  query_columns< ::Class, id_mysql, A >::
  class_name (A::table_name, "`class_name`", 0);

  template <typename A>
  struct pointer_query_columns< ::Class, id_mysql, A >:
    query_columns< ::Class, id_mysql, A >
  {
  };

  template <>
  class access::object_traits_impl< ::Class, id_mysql >:
    public access::object_traits< ::Class >
  {
    public:
    struct id_image_type
    {
      unsigned long long id_value;
      my_bool id_null;

      std::size_t version;
    };

    struct image_type
    {
      // _class_id
      //
      unsigned long long _class_id_value;
      my_bool _class_id_null;

      // _class_name
      //
      details::buffer _class_name_value;
      unsigned long _class_name_size;
      my_bool _class_name_null;

      std::size_t version;
    };

    struct extra_statement_cache_type;

    using object_traits<object_type>::id;

    static id_type
    id (const id_image_type&);

    static id_type
    id (const image_type&);

    static bool
    grow (image_type&,
          my_bool*);

    static void
    bind (MYSQL_BIND*,
          image_type&,
          mysql::statement_kind);

    static void
    bind (MYSQL_BIND*, id_image_type&);

    static bool
    init (image_type&,
          const object_type&,
          mysql::statement_kind);

    static void
    init (object_type&,
          const image_type&,
          database*);

    static void
    init (id_image_type&, const id_type&);

    typedef mysql::object_statements<object_type> statements_type;

    typedef mysql::query_base query_base_type;

    static const std::size_t column_count = 2UL;
    static const std::size_t id_column_count = 1UL;
    static const std::size_t inverse_column_count = 0UL;
    static const std::size_t readonly_column_count = 0UL;
    static const std::size_t managed_optimistic_column_count = 0UL;

    static const std::size_t separate_load_column_count = 0UL;
    static const std::size_t separate_update_column_count = 0UL;

    static const bool versioned = false;

    static const char persist_statement[];
    static const char find_statement[];
    static const char update_statement[];
    static const char erase_statement[];
    static const char query_statement[];
    static const char erase_query_statement[];

    static const char table_name[];

    static void
    persist (database&, object_type&);

    static pointer_type
    find (database&, const id_type&);

    static bool
    find (database&, const id_type&, object_type&);

    static bool
    reload (database&, object_type&);

    static void
    update (database&, const object_type&);

    static void
    erase (database&, const id_type&);

    static void
    erase (database&, const object_type&);

    static result<object_type>
    query (database&, const query_base_type&);

    static unsigned long long
    erase_query (database&, const query_base_type&);

    public:
    static bool
    find_ (statements_type&,
           const id_type*);

    static void
    load_ (statements_type&,
           object_type&,
           bool reload);
  };

  template <>
  class access::object_traits_impl< ::Class, id_common >:
    public access::object_traits_impl< ::Class, id_mysql >
  {
  };

  // class_student_view
  //
  template <>
  class access::view_traits_impl< ::class_student_view, id_mysql >:
    public access::view_traits< ::class_student_view >
  {
    public:
    struct image_type
    {
      // _stu_id
      //
      unsigned long long _stu_id_value;
      my_bool _stu_id_null;

      // _name
      //
      details::buffer _name_value;
      unsigned long _name_size;
      my_bool _name_null;

      // _age
      //
      unsigned short _age_value;
      my_bool _age_null;

      // _class_name
      //
      details::buffer _class_name_value;
      unsigned long _class_name_size;
      my_bool _class_name_null;

      std::size_t version;
    };

    typedef mysql::view_statements<view_type> statements_type;

    struct Class_tag;

    typedef mysql::query_base query_base_type;
    struct query_columns;

    static const bool versioned = false;

    static bool
    grow (image_type&,
          my_bool*);

    static void
    bind (MYSQL_BIND*,
          image_type&);

    static void
    init (view_type&,
          const image_type&,
          database*);

    static const std::size_t column_count = 4UL;

    static query_base_type
    query_statement (const query_base_type&);

    static result<view_type>
    query (database&, const query_base_type&);
  };

  template <>
  class access::view_traits_impl< ::class_student_view, id_common >:
    public access::view_traits_impl< ::class_student_view, id_mysql >
  {
  };

  // Student
  //
  // Class
  //
  // class_student_view
  //
  struct access::view_traits_impl< ::class_student_view, id_mysql >::query_columns
  {
    // Student
    //
    typedef
    odb::pointer_query_columns<
      ::Student,
      id_mysql,
      odb::access::object_traits_impl< ::Student, id_mysql > >
    Student;

    // Class
    //
    typedef
    odb::pointer_query_columns<
      ::Class,
      id_mysql,
      odb::access::object_traits_impl< ::Class, id_mysql > >
    Class;
  };
}

#include "student-odb.ixx"

#include <odb/post.hxx>

#endif // STUDENT_ODB_HXX
