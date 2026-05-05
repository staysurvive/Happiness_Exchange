#!/bin/sh
set -eu

for _ in $(seq 1 60); do
    if alembic upgrade head; then
        exec uvicorn app.main:app --host 0.0.0.0 --port 8000
    fi
    sleep 2
done

echo "database did not become ready in time" >&2
exit 1
