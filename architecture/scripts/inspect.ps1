$docsLocation = Split-Path -Parent $PSScriptRoot
$version = if ($env:STCTZR_VERSION) { $env:STCTZR_VERSION } else { "2026.03.06" }

Write-Host "Inspecting workspace: $docsLocation (structurizr:${version})"

docker run --rm -v "${docsLocation}:/usr/local/structurizr" "structurizr/structurizr:${version}" inspect -w /usr/local/structurizr/workspace.dsl
