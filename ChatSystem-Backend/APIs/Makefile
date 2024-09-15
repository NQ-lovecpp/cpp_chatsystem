# 定义变量
PROTOC = protoc
PROTO_DIR = ./
BUILD_DIR = api_builds
PROTO_FILES := $(wildcard $(PROTO_DIR)/*.proto)
CPP_FILES := $(PROTO_FILES:$(PROTO_DIR)/%.proto=$(BUILD_DIR)/%.pb.cc)
H_FILES := $(PROTO_FILES:$(PROTO_DIR)/%.proto=$(BUILD_DIR)/%.pb.h)

# 创建api_builds目录
$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

# 规则：编译所有proto文件
all: $(CPP_FILES) $(H_FILES)

# 规则：生成.pb.cc和.pb.h文件，并处理依赖关系
$(BUILD_DIR)/%.pb.cc: $(PROTO_DIR)/%.proto | $(BUILD_DIR)
	$(PROTOC) --cpp_out=$(BUILD_DIR) $<

$(BUILD_DIR)/%.pb.h: $(BUILD_DIR)/%.pb.cc

# 清理生成的文件
clean:
	rm -rf $(BUILD_DIR)
