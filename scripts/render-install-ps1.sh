#!/usr/bin/env bash
set -euxo pipefail

BASE_DIR="${BASE_DIR:-$(pwd)}"
SCFZ_VERSION="${SCFZ_VERSION:?SCFZ_VERSION must be set}"

envsubst '$SCFZ_VERSION' <"$BASE_DIR/pkg/standalone/install.ps1.envsubst"
