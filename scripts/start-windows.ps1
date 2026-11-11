$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$repo = (Get-Location).Path
$py = Join-Path $repo 'backend\.venv\Scripts\python.exe'
if (-not (Test-Path $py)) { throw 'First run scripts/setup-windows.ps1' }
docker compose up -d db
if ($LASTEXITCODE -ne 0) { throw 'Database did not start. Open Docker Desktop.' }
Set-Location (Join-Path $repo 'backend')
Write-Host 'Open http://127.0.0.1:8000 in your browser. Ctrl+C stops Django.' -ForegroundColor Cyan
& $py manage.py runserver
