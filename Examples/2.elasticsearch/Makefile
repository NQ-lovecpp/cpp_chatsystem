all:estest
estest:es_test.cc
	g++ -g -std=c++17 -o $@ $^ -lgflags -ljsoncpp -lspdlog -lelasticlient

.PHONY:clean
clean:
	rm -f estest