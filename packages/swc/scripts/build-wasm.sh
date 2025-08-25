#!/bin/bash

# SWC build script to run inside Docker container
set -e

# Display versions
cargo -V
rustup -V

# Setup WASM target
rustup target add wasm32-wasip1

# Build WASM
cargo build --target wasm32-wasip1 --release

echo "WASM build completed successfully"