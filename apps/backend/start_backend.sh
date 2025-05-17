#!/bin/bash

echo "🔁 Loading environment variables from .env..."

# Ensure the script runs from the root directory
cd "$(dirname "$0")"

# Export env vars from .env manually (in case python-dotenv fails silently)
export $(grep -v '^#' .env | xargs)

echo "🚀 Starting backend server..."
python3 backend_server.py
