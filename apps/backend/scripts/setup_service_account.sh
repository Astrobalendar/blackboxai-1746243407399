#!/bin/bash

# Check if service account key exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "Service account key not found. Creating new one..."
    
    # Create service account
    gcloud iam service-accounts create astro-calendar-sa \
        --display-name "Astro Calendar Service Account"
    
    # Get service account email
    SA_EMAIL=$(gcloud iam service-accounts list --filter="display_name:Astro Calendar Service Account" --format="value(email)")
    
    # Grant roles
    gcloud projects add-iam-policy-binding astrobalendar-2025-7505d \
        --member="serviceAccount:$SA_EMAIL" \
        --role="roles/storage.admin"
    
    gcloud projects add-iam-policy-binding astrobalendar-2025-7505d \
        --member="serviceAccount:$SA_EMAIL" \
        --role="roles/container.developer"
    
    # Create key
    gcloud iam service-accounts keys create serviceAccountKey.json \
        --iam-account="$SA_EMAIL"
    
    echo "Service account key created successfully"
else
    echo "Service account key already exists"
fi
