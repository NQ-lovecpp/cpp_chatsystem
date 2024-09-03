all:discovery registry
discovery:discovery.cc main.pb.cc
	g++ -g -std=c++17 -o $@ $^ -lbrpc -lleveldb -lssl -lcrypto -lprotobuf -ldl -lpthread -lgflags -lgtest -letcd-cpp-api -lcpprest
registry:registry.cc main.pb.cc
	g++ -g -std=c++17 -o $@ $^ -lbrpc -lleveldb -lssl -lcrypto -lprotobuf -ldl -lpthread -lgflags -lgtest -letcd-cpp-api -lcpprest

main.pb.cc:main.proto
	protoc --cpp_out=. $^

estest:es_test.cc
	g++ -g -std=c++17 -o $@ $^ -lgflags -ljsoncpp -lspdlog -lelasticlient 

.PHONY:clean
clean:
	rm -f discovery registry