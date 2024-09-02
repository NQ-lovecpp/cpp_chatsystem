all: put get
put: put.cc
	g++ -std=c++17 $^ -o $@ -lpthread -letcd-cpp-api -lcpprest
get: get.cc
	g++ -std=c++17 $^ -o $@ -lpthread -letcd-cpp-api -lcpprest

.PHONY:clean
clean:
	rm -f put get