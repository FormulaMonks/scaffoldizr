$docsLocation = Split-Path -Parent $PSScriptRoot

Write-Host "Updating workspace: $docsLocation"
$version = if ($env:STCTZR_VERSION) { $env:STCTZR_VERSION } else { "{{structurizrVersion}}" }

if (-not (Test-Path "$docsLocation\workspace.dsl")) {
    Write-Error "ERROR: workspace.dsl file not found in `"$docsLocation`" folder."
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
    if ($parts.Length -lt 2) {
        Write-Error "ERROR: Malformed .env-arch entry: `"$($_)`". Expected KEY=VALUE format."
        exit 1
    }
    [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim().Trim('"'), 'Process')
}

$passphraseArg = @()
if ($env:STCTZR_PASSPHRASE) {
    $passphraseArg = @("-passphrase", $env:STCTZR_PASSPHRASE)
}

docker run --rm -v "${docsLocation}:/usr/local/structurizr" "structurizr/structurizr:${version}" push `
    -url $env:STCTZR_URL `
    -id $env:STCTZR_WORKSPACE_ID `
    -key $env:STCTZR_WORKSPACE_KEY `
    -w /usr/local/structurizr/workspace.json `
    -merge false `
    @passphraseArg
