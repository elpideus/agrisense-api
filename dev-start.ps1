<#
.SYNOPSIS
    Agrisense local dev stack launcher.

.DESCRIPTION
    Creates the required Docker network (if it doesn't exist) and starts the
    full Agrisense stack via docker compose.

.PARAMETER Build
    Force a rebuild of the API Docker image before starting.

.PARAMETER Down
    Tear down the stack instead of starting it.

.EXAMPLE
    .\dev-start.ps1
    .\dev-start.ps1 -Build
    .\dev-start.ps1 -Down
#>
[CmdletBinding()]
param (
    [switch]$Build,
    [switch]$Down
)

$ErrorActionPreference = 'Stop'

# ── Colour helpers ────────────────────────────────────────────────────────────
function Write-Info { param($Msg) Write-Host "[agrisense]    " -ForegroundColor Cyan   -NoNewline; Write-Host $Msg }
function Write-Success { param($Msg) Write-Host "[agrisense] OK " -ForegroundColor Green  -NoNewline; Write-Host $Msg }
function Write-Warn { param($Msg) Write-Host "[agrisense] !! " -ForegroundColor Yellow -NoNewline; Write-Host $Msg }
function Write-Err { param($Msg) Write-Host "[agrisense] XX " -ForegroundColor Red    -NoNewline; Write-Host $Msg }

# ── Resolve repo root ─────────────────────────────────────────────────────────
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $RepoRoot

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        Agrisense Dev Stack Launcher      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Pre-flight: check Docker is running ───────────────────────────────────────
try {
    docker info | Out-Null
}
catch {
    Write-Err "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}
Write-Success "Docker is running."

# ── Tear-down mode ────────────────────────────────────────────────────────────
if ($Down) {
    Write-Info "Tearing down the stack..."
    docker compose down
    Write-Success "Stack stopped."
    exit 0
}

# ── Load DOCKER_NETWORK_NAME from .env (fallback: agrisense_internal) ─────────
$NetworkName = "agrisense_internal"
$EnvFile = Join-Path $RepoRoot ".env"
if (Test-Path $EnvFile) {
    $Parsed = Select-String -Path $EnvFile -Pattern '^DOCKER_NETWORK_NAME=(.+)$' |
    Select-Object -First 1 |
    ForEach-Object { $_.Matches.Groups[1].Value.Trim('"').Trim("'") }
    if ($Parsed) { $NetworkName = $Parsed }
}
Write-Info "Docker network: $NetworkName"

# ── Ensure external network exists ────────────────────────────────────────────
docker network inspect $NetworkName 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Success "Network '$NetworkName' already exists."
}
else {
    Write-Info "Creating Docker network '$NetworkName'..."
    docker network create $NetworkName | Out-Null
    Write-Success "Network '$NetworkName' created."
}

# ── Start the stack ───────────────────────────────────────────────────────────
if ($Build) {
    Write-Info "Building API image and starting stack..."
    docker compose up -d --build
}
else {
    Write-Info "Starting stack (use -Build to force image rebuild)..."
    docker compose up -d
}

Write-Host ""
Write-Success "Stack is up!"
Write-Host ""

# ── Print useful URLs from .env ───────────────────────────────────────────────
$Port = "3143"
$SupabaseUrl = "http://localhost:8000"
if (Test-Path $EnvFile) {
    $PortLine = Select-String -Path $EnvFile -Pattern '^PORT=(.+)$' | Select-Object -First 1
    $SbUrlLine = Select-String -Path $EnvFile -Pattern '^SUPABASE_PUBLIC_URL=(.+)$' | Select-Object -First 1
    if ($PortLine) { $Port = $PortLine.Matches.Groups[1].Value.Trim('"').Trim("'") }
    if ($SbUrlLine) { $SupabaseUrl = $SbUrlLine.Matches.Groups[1].Value.Trim('"').Trim("'") }
}

Write-Host "  Agrisense API   " -NoNewline -ForegroundColor White
Write-Host "-> http://localhost:$Port" -ForegroundColor Green
Write-Host "  Supabase Studio " -NoNewline -ForegroundColor White
Write-Host "-> $SupabaseUrl" -ForegroundColor Green
Write-Host ""
Write-Host "  Tip: " -NoNewline -ForegroundColor Cyan
Write-Host "Run 'docker compose logs -f api' to follow API logs."
Write-Host "  Tip: " -NoNewline -ForegroundColor Cyan
Write-Host "Run '.\dev-start.ps1 -Down' to stop the stack."
Write-Host ""
