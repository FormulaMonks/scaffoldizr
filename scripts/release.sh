#!/usr/bin/env bash
set -euxo pipefail

BASE_DIR="$(pwd)"
RELEASE_DIR="dist/releases"
BIN_DIR="dist/bin"
SCFZ_VERSION="$(git describe --tags)"

# Export vars to use inside the render-install.sh template
export BASE_DIR RELEASE_DIR SCFZ_VERSION

rm -rf "${RELEASE_DIR:?}/$SCFZ_VERSION"
rm -rf "${BIN_DIR:?}"
mkdir -p "$RELEASE_DIR/$SCFZ_VERSION"
mkdir -p "$BIN_DIR"

# Find dounloaded tarballs and change directory name/location
find dist -name 'tarball-*' -exec sh -c '
    target=${1#dist/tarball-}
    cp "dist/tarball-$target/"*.tar.gz "$RELEASE_DIR/$SCFZ_VERSION"
  ' sh {} \;

# Compress targets to new tarballs which include the correct folder structure
platforms=(
  linux-x64
  linux-arm64
  macos-x64
  macos-arm64
)
for platform in "${platforms[@]}"; do
  mv "$RELEASE_DIR/$SCFZ_VERSION/scfz-$platform.tar.gz" "$RELEASE_DIR/$SCFZ_VERSION/scfz-$SCFZ_VERSION-$platform.tar.gz"
  cp "$RELEASE_DIR/$SCFZ_VERSION/scfz-$SCFZ_VERSION-$platform.tar.gz" "$RELEASE_DIR/scfz-latest-$platform.tar.gz"
  tar -xvzf "$RELEASE_DIR/$SCFZ_VERSION/scfz-$SCFZ_VERSION-$platform.tar.gz" -C "$BIN_DIR"
  cp -v "dist/bin/$platform/scfz" "$RELEASE_DIR/scfz-latest-$platform"
  cp -v "dist/bin/$platform/scfz" "$RELEASE_DIR/$SCFZ_VERSION/scfz-$SCFZ_VERSION-$platform"
done

# Renders and updates install script to reflect latest version
./scripts/render-install.sh >"$RELEASE_DIR"/install.sh
chmod +x "$RELEASE_DIR"/install.sh

# Update package.json with new version
tmp_pkg=$(mktemp)
jq --indent 4 --arg version "${SCFZ_VERSION/v/}" '.version = $version' ./package.json > "$tmp_pkg" && mv "$tmp_pkg" ./package.json