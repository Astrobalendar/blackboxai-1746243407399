#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Print what commands are being run
echo "Starting AstroBalendar workspace setup..."

# Remove old files and cache
find . -name "*.tsbuildinfo" -delete
find . -name "node_modules/.cache" -type d -exec rm -rf {} +
rm -rf /mnt/new_volume/astrobalendar/src

# Install dependencies
echo "Installing dependencies..."
npm install --prefix /mnt/new_volume/astrobalendar/apps/frontend

# Set up workspace
echo "Setting up workspace..."

# Create workspace settings
mkdir -p /mnt/new_volume/astrobalendar/apps/frontend/.vscode
cat > /mnt/new_volume/astrobalendar/apps/frontend/.vscode/settings.json << 'EOL'
{
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.check.workspaceVersion": true,
    "typescript.tsserver.log": "normal",
    "typescript.tsserver.maxTsServerMemory": 4096,
    "typescript.tsserver.watchOptions": {
        "watchFile": "useFsEvents",
        "watchDirectory": "useFsEvents",
        "fallbackPollingWatchType": "dynamicPriority"
    },
    "files.exclude": {
        "**/.git": true,
        "**/.svn": true,
        "**/.hg": true,
        "**/CVS": true,
        "**/.DS_Store": true,
        "**/node_modules": true,
        "**/dist": true,
        "**/.cache": true
    }
}
EOL

# Create workspace file
cat > /mnt/new_volume/astrobalendar/apps/frontend/astrobalendar.code-workspace << 'EOL'
{
    "folders": [
        {
            "path": "."
        }
    ],
    "settings": {
        "typescript.tsdk": "node_modules/typescript/lib",
        "typescript.check.workspaceVersion": true,
        "typescript.tsserver.log": "normal",
        "typescript.tsserver.maxTsServerMemory": 4096,
        "typescript.tsserver.watchOptions": {
            "watchFile": "useFsEvents",
            "watchDirectory": "useFsEvents",
            "fallbackPollingWatchType": "dynamicPriority"
        }
    }
}
EOL

# Start VS Code
echo "Starting VS Code..."
code /mnt/new_volume/astrobalendar/apps/frontend/astrobalendar.code-workspace

# Wait a moment for VS Code to start
sleep 2

# Start development server
echo "Starting development server..."
cd /mnt/new_volume/astrobalendar/apps/frontend && npm run dev
