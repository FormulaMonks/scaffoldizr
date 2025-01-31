#!/bin/sh
set -eu

info() {
    echo "$@" >&2
}

error() {
	echo "$@" >&2
	exit 1
}

get_os() {
	os="$(uname -s)"
	if [ "$os" = Darwin ]; then
		echo "darwin"
	elif [ "$os" = Linux ]; then
		echo "linux"
	else
		# TODO: Add support for Windows to install
		error "unsupported OS: $os"
	fi
}

get_arch() {
	arch="$(uname -m)"
	if [ "$arch" = x86_64 ]; then
		echo "x64"
	elif [ "$arch" = aarch64 ] || [ "$arch" = arm64 ]; then
		echo "arm64"
	else
		error "unsupported architecture: $arch"
	fi
}

download_file() {
	url="$1"
	filename="$(basename "$url")"
	cache_dir="$(mktemp -d)"
	file="$cache_dir/$filename"

	info "Scaffoldizr: installing scfz..."

	if command -v curl >/dev/null 2>&1; then
		curl -#fLo "$file" "$url"
	else
		if command -v wget >/dev/null 2>&1; then
			stderr=$(mktemp)
			wget -O "$file" "$url" >"$stderr" 2>&1 || error "wget failed: $(cat "$stderr")"
		else
			error "scfz standalone install requires curl or wget but neither is installed. Aborting."
		fi
	fi

	echo "$file"
}

install_tool() {
	# download the tarball
	version="0.6.9"
    repo="FormulaMonks/scaffoldizr"
	os="$(get_os)"
	arch="$(get_arch)"
	install_path="${SCFZ_INSTALL_PATH:-$HOME/.local/bin/scfz}"
	install_dir="$(dirname "$install_path")"
	tarball_url="https://github.com/${repo}/releases/download/v${version}/scfz-${version}-${os}-${arch}.tar.gz"

	cache_file=$(download_file "$tarball_url")

    # TODO: Validate checksum
	# cd "$(dirname "$cache_file")" && get_checksum | "$(shasum_bin)" -c >/dev/null

	# extract tarball
	mkdir -p "$install_dir"
	rm -rf "$install_path"
	cd "$(mktemp -d)"
	tar -xzf "$cache_file"
	mv "${os}-${arch}/scfz" "$install_path"
	info "Scaffoldizr: installed successfully to $install_path"
    info "Make sure that \"$install_dir\" is in your \$PATH"
}

install_tool