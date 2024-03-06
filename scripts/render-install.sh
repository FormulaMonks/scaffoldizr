#!/usr/bin/env bash
set -euxo pipefail

SCFZ_VERSION=$SCFZ_VERSION;

envsubst '$SCFZ_VERSION' <"$BASE_DIR/pkg/standalone/install.envsubst"