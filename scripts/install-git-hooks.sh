#!/bin/env sh

if sh -c ": >/dev/tty" >/dev/null 2>/dev/null; then
    # /dev/tty is available and usable
    echo "Installing Husky hooks"
    bun husky install
else
    # /dev/tty is not available
    echo "Ignoring Husky hook install"
fi