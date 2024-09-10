all:dms
dms:testdms.cpp
	g++ -o $@ $^ -std=c++17 -lalibabacloud-sdk-core

.PHONY:clean
clean:
	rm -f dms