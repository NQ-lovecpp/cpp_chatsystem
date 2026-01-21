#!/bin/bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 host1:port1,host2:port2,... <command> [args...]"
  exit 1
fi

targets=$1
shift

for target in ${targets//,/ }; do
  host="${target%%:*}"
  port="${target##*:}"
  until nc -z "$host" "$port"; do
    echo "waiting for $host:$port..."
    sleep 1
  done
done

exec "$@"
