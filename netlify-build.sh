#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting frontend build process..."

# Navigate to frontend directory
cd apps/frontend

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install --no-optional

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"

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
