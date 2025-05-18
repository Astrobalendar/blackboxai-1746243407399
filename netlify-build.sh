#!/bin/bash

# Exit on error
set -e

# Navigate to frontend directory
cd apps/frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Build the Next.js application
echo "Building frontend application..."
npm run build

# Exit with success
echo "Frontend build completed successfully!"
