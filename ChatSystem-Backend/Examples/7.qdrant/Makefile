all: qdrant_test

qdrant_test: qdrant_test.cc qdrant_basic.hpp
	g++ -g -std=c++17 -o $@ qdrant_test.cc -lgflags -ljsoncpp -lspdlog -lcpr -lcurl -lpthread

.PHONY: clean
clean:
	rm -f qdrant_test
