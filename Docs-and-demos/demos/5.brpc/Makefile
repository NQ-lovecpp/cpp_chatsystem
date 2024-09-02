all : server client
server : brpc_server.cc main.pb.cc
	g++ -std=c++17 -o $@ $^ -lbrpc -lleveldb -lssl -lcrypto -lprotobuf -ldl -lpthread -lgflags

client : brpc_client.cc main.pb.cc
	g++ -std=c++17 -o $@ $^ -lbrpc -lleveldb -lssl -lcrypto -lprotobuf -ldl -lpthread -lgflags -lgtest

.PHONY:clean
clean:
	rm -f server client