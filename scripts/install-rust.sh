#!/bin/bash

# Exit on error and print commands as they are executed
set -ex

echo "=== Installing Rust and Cargo ==="

# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Add Cargo to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Verify installations
echo "Rust version:" && rustc --version
echo "Cargo version:" && cargo --version
echo "Rust installation completed successfully!"
