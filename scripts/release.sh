#!/usr/bin/env bash
set -euxo pipefail

RELEASE_DIR="dist/releases"
SCFZ_VERSION="$(git tag --list | tail -n 1)"

export RELEASE_DIR SCFZ_VERSION

rm -rf "${RELEASE_DIR:?}/$SCFZ_VERSION"
mkdir -p "$RELEASE_DIR/$SCFZ_VERSION"
mkdir -p "dist/bin"
touch "dist/bin/scfz"

find dist -name 'tarball-*' -exec sh -c '
    target=${1#dist/tarball-}
    cp "dist/tarball-$target/"*.txt "$RELEASE_DIR/$SCFZ_VERSION"
  ' sh {} \;

platforms=(
  linux-x64
  linux-arm64
  linux-armv6
  linux-armv7
  macos-x64
  macos-arm64
)
for platform in "${platforms[@]}"; do
  cp "$RELEASE_DIR/$SCFZ_VERSION/scfz-$platform.txt" "$RELEASE_DIR/$SCFZ_VERSION/scfz-$SCFZ_VERSION-$platform.txt"
  cp "$RELEASE_DIR/$SCFZ_VERSION/scfz-$SCFZ_VERSION-$platform.txt" "$RELEASE_DIR/scfz-latest-$platform.txt"
  tar -xvzf "$RELEASE_DIR/$SCFZ_VERSION/scfz-$SCFZ_VERSION-$platform.txt"
  cp -v dist/bin/scfz "$RELEASE_DIR/scfz-latest-$platform"
  cp -v dist/bin/scfz "$RELEASE_DIR/$SCFZ_VERSION/scfz-$SCFZ_VERSION-$platform"
done