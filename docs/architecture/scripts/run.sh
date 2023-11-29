#!/bin/bash

docs_location=$(cd "$(dirname "${0}")" && cd .. && pwd)
echo "Running workspace: ${docs_location}"

docker run -it --rm -p 8080:8080 -v "${docs_location}:/usr/local/structurizr" structurizr/lite