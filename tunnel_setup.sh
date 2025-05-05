#!/bin/bash

# Check if localtunnel is installed
if ! command -v lt &> /dev/null; then
    echo "Installing localtunnel..."
    npm install -g localtunnel --unsafe-perm
fi

# Start tunnels
echo "Starting frontend tunnel on port 3000..."
lt --port 3000 &

# Wait a moment for the tunnel to start
sleep 2

echo "\nCurrent Status:"
echo "- Frontend: http://localhost:4173 (mapped to 3000)"
echo "- Backend: http://localhost:8000 (mapped to 3001)"
echo "- MongoDB: http://localhost:27017"
echo "\nPublic URL will be displayed by localtunnel when ready"
echo "Press Ctrl+C to stop the tunnels"

# Keep the script running
wait
