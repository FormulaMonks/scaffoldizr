$docsLocation = Split-Path -Parent $PSScriptRoot

Write-Host "Updating workspace: $docsLocation"

if (-not (Test-Path "$docsLocation\workspace.json")) {
    Write-Error "ERROR: workspace.json file not found in `"$docsLocation`" folder."
    exit 1
}

if (-not (Test-Path "$docsLocation\.env-arch")) {
    Write-Error "ERROR: .env-arch file not found in `"$docsLocation`" folder."
    exit 1
}

Get-Content "$docsLocation\.env-arch" | ForEach-Object {
    if ($_ -match '^\s*#') { return }
    if ($_ -match '^\s*$') { return }
    $parts = $_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim().Trim('"'), 'Process')
}

$passphraseArg = @()
if ($env:STCTZR_PASSPHRASE) {
    $passphraseArg = @("-passphrase", $env:STCTZR_PASSPHRASE)
}

docker run -t --rm -v "${docsLocation}:/usr/local/structurizr" structurizr/structurizr push `
    -url $env:STCTZR_URL `
    -id $env:STCTZR_WORKSPACE_ID `
    -key $env:STCTZR_WORKSPACE_KEY `
    -w /usr/local/structurizr/workspace.json `
    -merge false `
    @passphraseArg
