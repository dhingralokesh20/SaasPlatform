#!/bin/bash

echo "=================================="
echo "Stopping Worksphere Platform"
echo "=================================="

ROOT_DIR="$(pwd)"

# Stop Frontend
echo "Stopping Frontend..."
cd ui || exit
docker compose down
cd "$ROOT_DIR" || exit

# Stop Workspace
echo "Stopping Workspace..."
cd workspace || exit
docker compose down
cd "$ROOT_DIR" || exit

# Stop Identity
echo "Stopping Identity..."
cd identity || exit
docker compose down
cd "$ROOT_DIR" || exit

# Stop Infra
echo "Stopping Infra..."
cd infra || exit
docker compose down
cd "$ROOT_DIR" || exit

echo "Closing service terminals..."

# Close PowerShell windows opened for services
taskkill //F //IM powershell.exe >/dev/null 2>&1

echo "=================================="
echo "All Services Stopped"
echo "=================================="

docker ps