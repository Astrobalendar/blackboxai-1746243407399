#!/bin/bash

# This script helps set up Firebase Storage for your project

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI is not installed. Installing..."
  npm install -g firebase-tools
fi

# Login to Firebase
firebase login

# Initialize Firebase if not already initialized
if [ ! -f "firebase.json" ]; then
  echo "Initializing Firebase..."
  firebase init
fi

# Get the default storage bucket for the project
echo "Getting storage bucket information..."
PROJECT_ID=$(firebase use)
STORAGE_BUCKET="${PROJECT_ID}.appspot.com"

echo "Using storage bucket: ${STORAGE_BUCKET}"

# Update firebase.json with the storage bucket
jq ".storage[0].bucket = \"${STORAGE_BUCKET}\"" firebase.json > firebase.tmp.json && mv firebase.tmp.json firebase.json

# Deploy storage rules
echo "Deploying storage rules..."
firebase deploy --only storage

echo "Storage setup complete!"
