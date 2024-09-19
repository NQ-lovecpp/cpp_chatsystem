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

# Rule to generate ODB files and move them directly to the output directory
$(OUTPUT_DIR)/%: %.hxx | $(OUTPUT_DIR)
	$(ODB_COMPILER) $(DATABASE) $(CXX_STANDARD) $(OPTIONS) $<
	mv $*-odb.cxx $*-odb.hxx $*-odb.ixx $*.sql $(OUTPUT_DIR)/

# Target to generate ODB files for all .hxx files
generate: $(SRC_FILES:%.hxx=$(OUTPUT_DIR)/%)

.PHONY: clean
clean:
	rm -rf $(OUTPUT_DIR)
