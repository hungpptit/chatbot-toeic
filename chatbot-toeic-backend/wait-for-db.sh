#!/bin/sh

set -e

host="$1"
port="$2"
shift 2

max_attempts=90
attempt=1

echo "⏳ Waiting for SQL Server at $host:$port..."

while ! nc -z "$host" "$port"; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "❌ SQL Server không khởi động sau $max_attempts lần chờ. Thoát."
    exit 1
  fi
  echo "⌛ Still waiting ($attempt/$max_attempts)..."
  attempt=$((attempt + 1))
  sleep 2
done

echo "✅ SQL Server is up! Starting backend..."
exec "$@"
