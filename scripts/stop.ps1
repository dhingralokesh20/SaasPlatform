Write-Host "Stopping Worksphere Services..." -ForegroundColor Cyan

# Stop Frontend
Write-Host "Stopping Frontend..." -ForegroundColor Yellow
Set-Location frontend
docker compose down
# Set-Location ..

# Stop Workspace
Write-Host "Stopping Workspace..." -ForegroundColor Yellow
Set-Location workspace
docker compose down
# Set-Location ..

# Stop Identity
Write-Host "Stopping Identity..." -ForegroundColor Yellow
Set-Location identity
docker compose down
# Set-Location ..

# Stop Infra
Write-Host "Stopping Infra..." -ForegroundColor Yellow
Set-Location infra
docker compose down
# Set-Location ..

# Close service terminals opened by start.ps1
Write-Host "Closing service terminals..." -ForegroundColor Yellow

Get-Process WindowsTerminal -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process powershell -ErrorAction SilentlyContinue |
Where-Object { $_.MainWindowTitle -match "Identity|Workspace|Frontend" } |
Stop-Process -Force

Write-Host "All services stopped." -ForegroundColor Green

docker ps