odb: odb_main.cc person-odb.cxx
	g++ -o $@ $^ -lodb-mysql -lodb -lodb-boost -lboost_system

.PHONY:clean
clean:
	rm -f odb