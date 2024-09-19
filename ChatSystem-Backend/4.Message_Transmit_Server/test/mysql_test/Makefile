main : main.cc chat_session_member-odb.cxx user-odb.cxx
	c++ -std=c++17 $^ -o $@ -I../../../odb/ -I./  -lodb-mysql -lodb -lodb-boost -lfmt -lspdlog -lgflags
%.cxx:
	odb -d mysql --std c++11 --generate-query --generate-schema --profile boost/date-time ../../../odb/*.hxx