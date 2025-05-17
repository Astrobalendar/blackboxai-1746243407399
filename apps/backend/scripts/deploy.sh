#!/bin/bash

# Set script directory
SCRIPT_DIR=$(dirname "$0")

# Deploy Firebase functions
echo "Deploying Firebase functions..."
firebase deploy --only functions

# Wait for deployment to complete
sleep 30

# Run cleanup script
echo "Cleaning up build images..."
if [ -f "$SCRIPT_DIR/cleanup_builds.sh" ]; then
    "$SCRIPT_DIR/cleanup_builds.sh"
else
    echo "Warning: Cleanup script not found. Skipping cleanup."
fi

# Verify cleanup
echo "Verifying cleanup..."
if gcloud auth list --filter="status:ACTIVE" > /dev/null 2>&1; then
    gcloud container images list --repository=gcr.io/astrobalendar-2025-7505d | grep gcf
    if [ $? -eq 0 ]; then
        echo "Warning: Some build images remain. Manual cleanup may be needed."
    else
        echo "All build images have been successfully cleaned up."
    fi
else
    echo "Warning: Not authenticated with Google Cloud. Cannot verify cleanup."
fi

echo "Deployment and cleanup complete!"
