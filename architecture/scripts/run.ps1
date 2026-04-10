$docsLocation = Split-Path -Parent $PSScriptRoot
$port = if ($args[0]) { $args[0] } else { 8080 }

if (-not (Test-Path "$docsLocation\workspace.json")) {
    Write-Error "ERROR: workspace.json file not found in `"$docsLocation`" folder."
    exit 1
}

$containerName = "structurizr-$(Split-Path -Leaf $docsLocation)-$port"

function Stop-Container {
    Write-Host "Stopping container $containerName..."
    docker stop $containerName 2>$null
}

Write-Host "Running workspace: $docsLocation on port $port"

$job = Start-Job -ScriptBlock {
    param($containerName, $port, $docsLocation)
    docker run -t --rm --name $containerName -p "${port}:8080" -v "${docsLocation}:/usr/local/structurizr" structurizr/structurizr local
} -ArgumentList $containerName, $port, $docsLocation

try {
    Wait-Job $job
} finally {
    Stop-Container
    Remove-Job $job -Force 2>$null
}
