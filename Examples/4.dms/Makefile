all:dms
dms:testdms.cpp
	g++ -o $@ $^ -std=c++17 -lalibabacloud-sdk-core -lgflags

.PHONY:clean
clean:
	rm -f dms