$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$repo = (Get-Location).Path
$backend = Join-Path $repo 'backend'
Write-Host "Setting up project in $repo" -ForegroundColor Cyan

foreach ($cmd in @('git', 'python', 'docker')) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        throw "Missing $cmd. Install it, reopen PowerShell, and run this script again."
    }
}

docker info *> $null
if ($LASTEXITCODE -ne 0) { throw 'Docker Desktop is not running. Start it and rerun this script.' }

if (-not (Test-Path (Join-Path $backend '.venv\Scripts\python.exe'))) {
    python -m venv (Join-Path $backend '.venv')
    if ($LASTEXITCODE -ne 0) { throw 'Failed to create Python virtual environment.' }
}
$py = Join-Path $backend '.venv\Scripts\python.exe'
& $py -m pip install -r (Join-Path $backend 'requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'Python dependencies failed to install.' }

$envPath = Join-Path $backend '.env'
$examplePath = Join-Path $backend '.env.example'
if (-not (Test-Path $envPath)) {
    if (-not (Test-Path $examplePath)) { throw 'Missing backend/.env.example' }
    Copy-Item $examplePath $envPath
    Write-Host 'Created backend/.env from the example.'
}

# Preserve existing values; create a local Django secret only if it is missing or a placeholder.
$lines = [System.Collections.Generic.List[string]]::new()
Get-Content $envPath | ForEach-Object { $lines.Add($_) }
$secretIndex = -1
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*SECRET_KEY\s*=') { $secretIndex = $i; break }
}
$needsSecret = $secretIndex -lt 0
if (-not $needsSecret) {
    $value = ($lines[$secretIndex] -split '=', 2)[1].Trim().Trim('"').Trim("'")
    $needsSecret = ($value -eq '' -or $value -match '(?i)^(change|replace|your|example|placeholder|django-insecure-)')
}
if ($needsSecret) {
    $secret = & $py -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
    if ($LASTEXITCODE -ne 0) { throw 'Could not generate Django secret key.' }
    if ($secretIndex -ge 0) { $lines[$secretIndex] = "SECRET_KEY=$secret" }
    else { $lines.Add("SECRET_KEY=$secret") }
    Set-Content -Path $envPath -Value $lines -Encoding utf8
    Write-Host 'Configured local Django SECRET_KEY.'
}

Set-Location $repo
docker compose up -d db
if ($LASTEXITCODE -ne 0) { throw 'Database failed to start. Check Docker Desktop and port conflicts.' }
Set-Location $backend
& $py manage.py check
if ($LASTEXITCODE -ne 0) { throw 'Django check failed. Check backend/.env values.' }
Write-Host 'Setup complete! Run scripts/start-windows.ps1 to start Django.' -ForegroundColor Green
Write-Host 'Database migrations are intentionally NOT run by this script.'
