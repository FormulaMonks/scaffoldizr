#!/usr/bin/env bash
set -euxo pipefail

SCFZ_VERSION="$(git describe --tags)"

# Update package.json with new version
tmp_pkg=$(mktemp)
jq --indent 4 --arg version "${SCFZ_VERSION/v/}" '.version = $version' ./package.json > "$tmp_pkg" && mv "$tmp_pkg" ./package.json