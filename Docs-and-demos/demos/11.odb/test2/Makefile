odb: main.cc student-odb.cxx
	c++ -o $@ $^ -std=c++17 -lodb-mysql -lodb -lodb-boost -lboost_system -lgflags

.PHONY:clean
clean:
	rm -f odb