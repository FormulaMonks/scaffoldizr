$docsLocation = Split-Path -Parent $PSScriptRoot
$version = if ($env:STCTZR_VERSION) { $env:STCTZR_VERSION } else { "{{structurizrVersion}}" }

Write-Host "Exporting workspace: $docsLocation (structurizr:${version})"

docker run --rm -v "${docsLocation}:/usr/local/structurizr" "structurizr/structurizr:${version}" export -w /usr/local/structurizr/workspace.dsl -format json
