#!/bin/bash

echo "=================================="
echo "Starting Worksphere Platform"
echo "=================================="

# Windows path of current folder (important because spaces exist)
ROOT_WIN="$(pwd -W)"

# Ensure Docker network exists
echo "Checking Docker network..."
docker network inspect worksphere-net >/dev/null 2>&1 || docker network create worksphere-net

# Start Infra
echo "Starting Infra Services..."
cd infra || exit 1
docker compose up -d
cd .. || exit 1

# Wait PostgreSQL
echo "Waiting for PostgreSQL..."
until docker exec worksphere-postgres pg_isready -U postgres >/dev/null 2>&1
do
  sleep 2
done

# Wait Redis
echo "Waiting for Redis..."
until docker exec worksphere-redis redis-cli ping >/dev/null 2>&1
do
  sleep 2
done

echo "Infra Ready."
echo "Launching Services..."

# Identity
cmd.exe /c start "Identity" powershell.exe -NoExit -Command "cd \"$ROOT_WIN\\identity\"; docker compose up"

# Workspace
cmd.exe /c start "Workspace" powershell.exe -NoExit -Command "cd \"$ROOT_WIN\\workspace\"; docker compose up"

# Frontend
cmd.exe /c start "Frontend" powershell.exe -NoExit -Command "cd \"$ROOT_WIN\\ui\"; docker compose up"

echo "=================================="
echo "All Services Started"
echo "=================================="

docker ps