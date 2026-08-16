Write-Host "Starting Worksphere..." -ForegroundColor Cyan

# Ensure shared docker network exists
docker network inspect worksphere-net 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating Docker network: worksphere-net" -ForegroundColor Yellow
    docker network create worksphere-net | Out-Null
}

# Start Infra
Write-Host "Starting Infra..." -ForegroundColor Green
Set-Location infra
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Infra failed to start." -ForegroundColor Red
    exit 1
}

Set-Location ..

# Wait for PostgreSQL
Write-Host "Waiting for PostgreSQL..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 2
    docker exec worksphere-postgres pg_isready -U postgres > $null 2>&1
} until ($LASTEXITCODE -eq 0)

# Wait for Redis
Write-Host "Waiting for Redis..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 2
    docker exec worksphere-redis redis-cli ping > $null 2>&1
} until ($LASTEXITCODE -eq 0)

Write-Host "Infra Ready" -ForegroundColor Green

# Root path
$root = $PWD.Path

# Open services in Windows Terminal tabs
$root = $PWD.Path

$root = $PWD.Path
$root = $PWD.Path

Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "Set-Location '$root\identity'; docker compose up"
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "Set-Location '$root\workspace'; docker compose up"
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "Set-Location '$root\ui'; docker compose up"

Write-Host "All services launched in Windows Terminal tabs." -ForegroundColor Cyan