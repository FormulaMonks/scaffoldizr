#!/bin/bash

docs_location=$(cd "$(dirname "${0}")" && cd .. && pwd)
echo "Updating workspace: ${docs_location}"

if [ ! -e "${docs_location}/.env-arch" ]; then
    echo "ERROR: .env-arch file not found in \"${docs_location}\" folder.";
    exit 1;
fi

source "${docs_location}/.env-arch" && structurizr-cli push -url "$STCTZR_URL" -id "$STCTZR_WORKSPACE_ID" -key "$STCTZR_WORKSPACE_KEY" -secret "$STCTZR_WORKSPACE_SECRET" -w "${docs_location}/workspace.json" -merge false%