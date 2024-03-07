#!/bin/bash

docs_location=$(cd "$(dirname "${0}")" && cd .. && pwd)
port=${1:-8080}
echo "Running workspace: ${docs_location} on port ${port}"

docker run -t --rm -p "${port}":8080 -v "${docs_location}:/usr/local/structurizr" structurizr/lite