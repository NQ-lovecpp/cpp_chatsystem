all:publisher consumer
publisher: publisher.cc
	g++ -o $@ $^ -std=c++17 -lamqpcpp -lev -lpthread -ldl
consumer: consumer.cc
	g++ -o $@ $^ -std=c++17 -lamqpcpp -lev -lpthread -ldl

.PHONY:clean
clean:
	rm -f publisher consumer