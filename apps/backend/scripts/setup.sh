#!/bin/bash

# Set script directory
SCRIPT_DIR=$(dirname "$0")

# Change to script directory
cd "$SCRIPT_DIR" || exit 1

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup Google Cloud credentials
echo "Setting up Google Cloud credentials..."
gcloud auth application-default login

# Set project
gcloud config set project astrobalendar-2025-7505d

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable \
    cloudfunctions.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    firebaseextensions.googleapis.com

# Create functions directory if it doesn't exist
if [ ! -d "../functions" ]; then
    echo "Creating functions directory..."
    mkdir ../functions
    cp ../index.js ../package.json ../package-lock.json ../.env ../functions/
fi

echo "Setup complete! You can now run deploy.sh"
