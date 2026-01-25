#!/bin/bash
set -u

# Configuration
PROJECT_ROOT=$(pwd)
LOG_DIR="${PROJECT_ROOT}/docker_image_data/logs"

mkdir -p "$LOG_DIR"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO] $1${NC}"; }
log_err() { echo -e "${RED}[ERROR] $1${NC}"; }

# Check Build (Basic check)
if [ ! -d "1.Speech_Server/build" ]; then
    log_err "Build directories not found. Please build the project first."
    exit 1
fi

# 1. Start Middleware via Docker
log_info "Starting Middleware (etcd, mysql, redis, es, rabbitmq)..."
docker-compose up -d etcd mysql redis elasticsearch rabbitmq

# 2. Wait for Middleware
wait_for_port() {
    local host=$1
    local port=$2
    local name=$3
    log_info "Waiting for $name ($host:$port)..."
    until nc -z $host $port; do sleep 1
    done
    log_info "$name is ready."
}

wait_for_port 127.0.0.1 2379 "Etcd"
wait_for_port 127.0.0.1 3306 "MySQL"
wait_for_port 127.0.0.1 6379 "Redis"
wait_for_port 127.0.0.1 9200 "Elasticsearch"
wait_for_port 127.0.0.1 5672 "RabbitMQ"

# Common Flags for Local Run (Override Configs to use localhost)
COMMON_FLAGS="-run_mode=true -log_level=1"
DB_FLAGS="-mysql_host=127.0.0.1 -mysql_port=3306 -mysql_user=root -mysql_pswd=Cydia4384! -mysql_db=chen_im"
REDIS_FLAGS="-redis_host=127.0.0.1 -redis_port=6379"
ETCD_FLAGS="-etcd_host=http://127.0.0.1:2379"
ES_FLAGS="-es_host=http://127.0.0.1:9200"
MQ_FLAGS="-amqp_host=127.0.0.1 -amqp_port=5672 -amqp_user=root -amqp_pswd=czhuowen"

# Function to run a test case
run_test() {
    local server_name=$1
    local server_bin=$2
    local server_port=$3
    local client_bin=$4
    local service_flags=$5

    log_info "------------------------------------------------"
    log_info "Testing Component: $server_name"
    log_info "------------------------------------------------"

    # Check binaries
    if [ ! -f "$server_bin" ]; then
        log_err "Server binary not found: $server_bin"
        return 1
    fi

    # Start Server
    log_info "Starting Server: $server_bin"
    # We pass flag overrides. Assuming gflags priority: flags > config file > default.
    $server_bin $service_flags $COMMON_FLAGS > "${LOG_DIR}/${server_name}.log" 2>&1 &
    SERVER_PID=$!
    
    # Wait for Server Port
    log_info "Waiting for server port $server_port..."
    local retries=30
    local ready=0
    while [ $retries -gt 0 ]; do
        if nc -z 127.0.0.1 $server_port; then
            ready=1
            break
        fi
        sleep 1
        ((retries--))
    done

    if [ $ready -eq 0 ]; then
        log_err "Server $server_name failed to start within 30s. Check logs at ${LOG_DIR}/${server_name}.log"
        kill $SERVER_PID || true
        return 1
    fi

    # Run Client
    log_info "Running Client: $client_bin"
    if [ -f "$client_bin" ]; then
        # Clients usually also need at least etcd flag to find the service, 
        # but the service is registered with its ephemeral IP/port? 
        # Wait, if server registers to Etcd, it registers its IP.
        # If running locally, it registers local IP.
        # The client needs to connect to Etcd to discover it.
        $client_bin $ETCD_FLAGS
        CLIENT_RET=$?
    else
         log_err "Client binary not found: $client_bin"
         CLIENT_RET=1
    fi

    # Cleanup
    kill $SERVER_PID || true
    wait $SERVER_PID 2>/dev/null || true

    if [ $CLIENT_RET -eq 0 ]; then
        log_info "TEST PASS: $server_name"
        return 0
    else
        log_err "TEST FAIL: $server_name"
        return 1
    fi
}

# --- Execute Tests ---

# 1. Speech Server
run_test "speech_server" \
    "./1.Speech_Server/build/speech_server" \
    10001 \
    "./1.Speech_Server/build/speech_client" \
    "$ETCD_FLAGS"

# 2. File Server
run_test "file_server" \
    "./2.File_Server/build/file_server" \
    10002 \
    "./2.File_Server/build/file_client" \
    "$ETCD_FLAGS"

# 3. User Server
run_test "user_server" \
    "./3.User_Server/build/user_server" \
    10003 \
    "./3.User_Server/build/user_client" \
    "$ETCD_FLAGS $DB_FLAGS $REDIS_FLAGS $ES_FLAGS"

# 4. Message Transmit Server
run_test "message_transmit_server" \
    "./4.Message_Transmit_Server/build/message_transmit_server" \
    10004 \
    "./4.Message_Transmit_Server/build/transmite_client" \
    "$ETCD_FLAGS $DB_FLAGS $MQ_FLAGS"

# 5. Message Store Server
run_test "message_store_server" \
    "./5.Message_Store_Server/build/message_store_server" \
    10005 \
    "./5.Message_Store_Server/build/message_store_client" \
    "$ETCD_FLAGS $DB_FLAGS $ES_FLAGS $MQ_FLAGS"

# 6. Friend Server
run_test "friend_server" \
    "./6.Friend_Server/build/friend_server" \
    10006 \
    "./6.Friend_Server/build/friend_client" \
    "$ETCD_FLAGS $DB_FLAGS $ES_FLAGS"

log_info "All tests completed."
