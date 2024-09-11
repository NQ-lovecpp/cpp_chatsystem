#pragma once
#include <tuple>
#include <iostream>
#include <string>
#include <boost/date_time/posix_time/posix_time.hpp>
#include <odb/core.hxx>
#include <odb/nullable.hxx>


#pragma db object
class Student 
{
    friend odb::access;
public:
    Student() {}
    Student(const Student &) {}
    Student(std::string name, 
            unsigned short age, 
            unsigned long class_id)
        :_name(name)
        , _age(age)
        , _class_id(class_id)
    {}

    // 访问成员的接口
    unsigned long GetStuID() {
        return _stu_id;
    }

    std::string GetName() {
        return _name;
    }

    odb::nullable<unsigned short> GetAge() {
        return _age;
    }

    unsigned long GetClassID() {
        return _class_id;
    }

    // 修改成员的接口
    void SetStuID(unsigned long stuid) {
        _stu_id = stuid;
    }

    void SetName(const std::string & newname) {
        _name = newname;
    }

    void SetAge(unsigned short a) {
        _age = a;
    }

    void SetClassID(unsigned long id) {
        _class_id = id;
    }

    ~Student() {}
private:
#pragma db id auto // 主键、自增
    unsigned long _stu_id;
    std::string _name;
    odb::nullable<unsigned short> _age;
#pragma db index // 索引
    unsigned long _class_id;
};

#pragma db object
class Class 
{
    friend odb::access;
public:
    unsigned long GetClassID() {
        return _class_id;
    }

    void SetClassID(unsigned long id) {
        _class_id = id;
    }

    std::string GetClassName() {
        return _class_name;
    }

    void SetClassName(const std::string &name) {
        _class_name = name;
    }

    Class(std::string name) 
        : _class_name(name)
    {}

    Class() {}
    ~Class() {}

private:
#pragma db id auto 
    unsigned long _class_id;
    std::string _class_name;
};


#pragma db view object(Student)\
                object(Class = Class : Student::_class_id == Class::_class_id)\
                query((?))

struct class_student_view {
    #pragma db column(Student::_stu_id)
    unsigned long _stu_id;
    
    #pragma db column(Student::_name)
    std::string _name;

    #pragma db column(Student::_age)
    odb::nullable<unsigned short> _age;

    #pragma db column(Class::_class_name)
    std::string _class_name;

    class_student_view() {}
    ~class_student_view() {}

};


// #pragma db view query("select name from Student " + (?))


// odb -d mysql  --std c++11 --generate-query --generate-schema --profile boost/date-time student.hxx