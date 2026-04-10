$docsLocation = Split-Path -Parent $PSScriptRoot
$port = if ($args[0]) { $args[0] } else { 8080 }

if (-not (Test-Path "$docsLocation\workspace.json")) {
    Write-Error "ERROR: workspace.json file not found in `"$docsLocation`" folder."
    exit 1
}

$docsFolderName = Split-Path -Leaf $docsLocation
$safeDocsFolderName = ($docsFolderName.ToLowerInvariant() -replace '[^a-z0-9_.-]', '-').Trim('-.')
if (-not $safeDocsFolderName) { $safeDocsFolderName = "workspace" }
$containerName = "structurizr-$safeDocsFolderName-$port"

function Stop-Container {
    Write-Host "Stopping container $containerName..."
    docker stop $containerName 2>$null
}

Write-Host "Running workspace: $docsLocation on port $port"

try {
    docker run -t --rm --name $containerName -p "${port}:8080" -v "${docsLocation}:/usr/local/structurizr" structurizr/structurizr local
} finally {
    Stop-Container
}
