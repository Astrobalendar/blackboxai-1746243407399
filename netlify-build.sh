#!/bin/bash

# Exit on error
set -e

# Install Rust and Cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
export PATH="$HOME/.cargo/bin:$PATH"

# Verify installations
rustc --version
cargo --version

# Install Node.js dependencies
cd apps/frontend
npm install

# Build the Next.js application
npm run build

# Exit with success
cd ../..
echo "Build completed successfully!"
