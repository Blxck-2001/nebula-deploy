# PowerShell script to run demo stack (Windows)
param()
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)
cd ..
Write-Host "Starting demo stack with docker compose..."
if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker compose up --build postgres rabbitmq redis backend-spring backend-worker
} else {
    Write-Error "Docker not found. Install Docker Desktop or run in WSL."
    exit 1
}
