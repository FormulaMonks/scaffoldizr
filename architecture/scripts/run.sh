#!/bin/bash

docs_location=$(cd "$(dirname "${0}")" && cd .. && pwd)
port=${1:-8080}

# Check if workspace.json file exists
if [ ! -e "${docs_location}/workspace.json" ]; then
    echo "ERROR: workspace.json file not found in \"${docs_location}\" folder.";
    exit 1;
fi

container_name="structurizr-$(basename "${docs_location}")-${port}"

cleanup() {
    echo "Stopping container ${container_name}..."
    docker stop "${container_name}" 2>/dev/null
}

trap cleanup SIGTERM SIGINT

echo "Running workspace: ${docs_location} on port ${port}"

docker run -t --rm --name "${container_name}" -p "${port}":8080 -v "${docs_location}:/usr/local/structurizr" structurizr/structurizr local &
wait $!
