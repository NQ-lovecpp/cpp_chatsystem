all:discovery registry
discovery:discovery.cc
	g++ -std=c++17 -o $@ $^ -lgflags -letcd-cpp-api -lcpprest -lpthread
registry:registry.cc
	g++ -std=c++17 -o $@ $^ -lgflags -letcd-cpp-api -lcpprest -lpthread

.PHONY:clean
clean:
	rm -f discovery registry