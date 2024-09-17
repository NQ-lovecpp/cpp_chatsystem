# Compiler and flags
ODB_COMPILER = odb
CXX_STANDARD = --std c++17
DATABASE = -d mysql
OPTIONS = --generate-query --generate-schema --profile boost/date-time
OUTPUT_DIR = odb_builds

# Find all .hxx files in the current directory
SRC_FILES = $(wildcard *.hxx)

# Create the output directory if it doesn't exist
$(OUTPUT_DIR):
	mkdir -p $(OUTPUT_DIR)

# Rule to generate ODB files (excluding the source .hxx file from being moved)
%.cxx %.hxx %.ixx %.sql: %.hxx | $(OUTPUT_DIR)
	$(ODB_COMPILER) $(DATABASE) $(CXX_STANDARD) $(OPTIONS) $<

# Move generated files (excluding the source .hxx file) to the output directory
move_files:
	mv user-odb.cxx user-odb.hxx user-odb.ixx user.sql $(OUTPUT_DIR)/ 2>/dev/null || true

# Target to generate ODB files for all .hxx files and move them
generate: $(SRC_FILES:%.hxx=%.cxx) move_files

.PHONY: clean
clean:
	rm -rf $(OUTPUT_DIR)
