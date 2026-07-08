#!/usr/bin/env bash
# Run demo stack (Linux / WSL)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Starting demo stack with docker compose..."
if command -v docker >/dev/null 2>&1; then
  docker compose up --build postgres rabbitmq redis backend-spring backend-worker
else
  echo "Docker not found. Please install Docker Desktop or run in WSL where Docker is available."
  exit 1
fi
