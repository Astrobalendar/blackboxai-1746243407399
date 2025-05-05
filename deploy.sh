#!/bin/bash

# Netlify Deployment Script

# Change to frontend directory
cd apps/frontend || exit

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Deploying to Netlify..."

# Netlify deployment configuration
NETLIFY_SITE_ID=""  # Add your Netlify site ID here
NETLIFY_ACCESS_TOKEN=""  # Add your Netlify access token here

# Deploy using Netlify API
curl -X POST https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys \
  -H "Authorization: Bearer $NETLIFY_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"directory": "dist", "message": "Production deployment"}'

echo "Deployment complete!"
echo "Frontend URL: https://astrobalendar.netlify.app"
