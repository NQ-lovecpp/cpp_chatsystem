CFLAGS = -I/usr/include/mysql -I../../../odb/ -I../../../common -I./ 
OBJS = friend_apply-odb.o  relation-odb.o chat_session_member-odb.o chat_session-odb.o
.PHONY : main
main : main.cc friend_apply-odb.cxx  relation-odb.cxx chat_session_member-odb.cxx chat_session-odb.cxx
	g++ -std=c++17 $^ -o $@   -lodb-mysql $(CFLAGS) -lodb -lodb-boost -lfmt -lspdlog -lgflags

%.o : %.cxx
	g++ -std=c++17 -c $^ -o $@ $(CFLAGS)