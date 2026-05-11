#!/bin/bash

docs_location=$(cd "$(dirname "${0}")" && cd .. && pwd)
echo "Updating workspace: ${docs_location}"
version="${STCTZR_VERSION:-}"
if [ -z "$version" ]; then version="2026.03.06"; fi

if [ ! -e "${docs_location}/workspace.dsl" ]; then
    echo "ERROR: workspace.dsl file not found in \"${docs_location}\" folder.";
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

docker run --rm -v "${docs_location}:/usr/local/structurizr" "structurizr/structurizr:${version}" push -url "$STCTZR_URL" -id "$STCTZR_WORKSPACE_ID" -key "$STCTZR_WORKSPACE_KEY" -w /usr/local/structurizr/workspace.dsl -merge false "${passphrase_args[@]}"
