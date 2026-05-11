#!/bin/bash

docs_location=$(cd "$(dirname "${0}")" && cd .. && pwd)
port=${1:-8080}
version="${STCTZR_VERSION:-}"
if [ -z "$version" ]; then version="2026.03.06"; fi

# Check if workspace.dsl file exists
if [ ! -e "${docs_location}/workspace.dsl" ]; then
    echo "ERROR: workspace.dsl file not found in \"${docs_location}\" folder.";
    exit 1;
fi

docs_basename=$(basename "${docs_location}")
sanitized_docs_basename=$(printf '%s' "${docs_basename}" | sed 's/[^A-Za-z0-9_.-]/-/g')
container_name="structurizr-${sanitized_docs_basename}-${port}"

cleanup() {
    echo "Stopping container ${container_name}..."
    docker stop "${container_name}" 2>/dev/null
}

trap cleanup SIGTERM SIGINT

echo "Running workspace: ${docs_location} on port ${port}"

docker run --rm --name "${container_name}" -p "${port}":8080 -v "${docs_location}:/usr/local/structurizr" "structurizr/structurizr:${version}" local &
wait $!
