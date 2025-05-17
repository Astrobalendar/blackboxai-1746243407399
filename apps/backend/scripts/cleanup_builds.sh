#!/bin/bash

# Set project ID
PROJECT_ID="astrobalendar-2025-7505d"

# Get active account
echo "Getting active Google Cloud account..."
ACTIVE_ACCOUNT=$(gcloud auth list --filter="status:ACTIVE" --format="value(account)")

if [ -z "$ACTIVE_ACCOUNT" ]; then
    echo "No active account found. Please run 'gcloud auth login' first."
    exit 1
fi

echo "Using active account: $ACTIVE_ACCOUNT"

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project "$PROJECT_ID" --quiet

# Delete old build images
echo "Deleting old build images from Google Cloud Registry..."
IMAGES=$(gcloud container images list --repository=gcr.io/"$PROJECT_ID" --format="value(name)")

if [ -n "$IMAGES" ]; then
    for IMAGE in $IMAGES; do
        echo "Deleting image: $IMAGE"
        gcloud container images delete "$IMAGE" --force-delete-tags --quiet
    done
else
    echo "No build images found to delete."
fi

echo "Build cleanup completed!"
