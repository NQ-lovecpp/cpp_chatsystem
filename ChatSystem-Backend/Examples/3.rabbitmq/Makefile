all:publisher consumer
publisher: publisher.cc
	g++ -g -o $@ $^ -std=c++17 -lamqpcpp -lev -lpthread -ldl -lgflags
consumer: consumer.cc
	g++ -g -o $@ $^ -std=c++17 -lamqpcpp -lev -lpthread -ldl -lgflags

.PHONY:clean
clean:
	rm -f publisher consumer