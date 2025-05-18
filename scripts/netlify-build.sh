#!/bin/bash

# Exit on error and print commands as they are executed
set -ex

echo "=== Starting Netlify Build ==="

# Navigate to the project root
cd "$(dirname "$0")/.."

# Install Python dependencies
echo "=== Installing Python dependencies ==="
python -m pip install --upgrade pip
pip install -r apps/backend/requirements.txt

# Navigate to frontend and install Node.js dependencies
echo "=== Installing Node.js dependencies ==="
cd apps/frontend
npm install

# Build the frontend application
echo "=== Building frontend application ==="
npm run build

# Return to project root
cd ../..

echo "=== Build completed successfully! ==="
