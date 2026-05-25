$ErrorActionPreference = "Stop"

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Err {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
    exit 1
}

$version = "0.13.0"
$repo = "FormulaMonks/scaffoldizr"
$installPath = if ($env:SCFZ_INSTALL_PATH) { $env:SCFZ_INSTALL_PATH } else { "$env:USERPROFILE\.local\bin\scfz.exe" }
$installDir = Split-Path -Parent $installPath
$downloadUrl = "https://github.com/$repo/releases/download/v$version/scfz-$version-win-x64.exe"

Write-Info "Scaffoldizr: installing scfz..."

if (-not (Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue)) {
    Write-Err "scfz installer requires Invoke-WebRequest (PowerShell 3+). Aborting."
}

New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Remove-Item -Force -ErrorAction SilentlyContinue -Path $installPath

Invoke-WebRequest -Uri $downloadUrl -OutFile $installPath

Write-Info "Scaffoldizr: installed successfully to $installPath"
Write-Host "Make sure that ""$installDir"" is in your PATH" -ForegroundColor Yellow
