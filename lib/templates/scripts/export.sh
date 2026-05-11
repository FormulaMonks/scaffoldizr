#!/bin/bash

docs_location=$(cd "$(dirname "${0}")" && cd .. && pwd)
version="${STCTZR_VERSION:-}"
if [ -z "$version" ]; then version="{{structurizrVersion}}"; fi

echo "Exporting workspace: ${docs_location} (structurizr:${version})"

docker run --rm -v "${docs_location}:/usr/local/structurizr" "structurizr/structurizr:${version}" export -w /usr/local/structurizr/workspace.dsl -format json