#!/bin/bash

docs_location=$(cd "$(dirname "${0}")" && cd .. && pwd)
echo "Updating workspace: ${docs_location}"

if [ ! -e "${docs_location}/workspace.json" ]; then
    echo "ERROR: workspace.json file not found in \"${docs_location}\" folder.";
    exit 1;
fi

if [ ! -e "${docs_location}/.env-arch" ]; then
    echo "ERROR: .env-arch file not found in \"${docs_location}\" folder.";
    exit 1;
fi

source "${docs_location}/.env-arch"

passphrase_args=()
if [ -n "${STCTZR_PASSPHRASE}" ]; then
    passphrase_args+=(-passphrase "${STCTZR_PASSPHRASE}")
fi

docker run -t --rm -v "${docs_location}:/usr/local/structurizr" structurizr/structurizr push -url "$STCTZR_URL" -id "$STCTZR_WORKSPACE_ID" -key "$STCTZR_WORKSPACE_KEY" -w /usr/local/structurizr/workspace.json -merge false "${passphrase_args[@]}"
