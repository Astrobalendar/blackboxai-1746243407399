#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Print what commands are being run
echo "Starting complete cleanup and setup..."

# Remove old files and directories
rm -rf /mnt/new_volume/astrobalendar/src
rm -rf /mnt/new_volume/astrobalendar/apps/frontend/node_modules
rm -rf /mnt/new_volume/astrobalendar/apps/frontend/.next
rm -rf /mnt/new_volume/astrobalendar/apps/frontend/dist
rm -rf /mnt/new_volume/astrobalendar/apps/frontend/.vite

# Clean npm cache
npm cache clean --force

# Remove any TypeScript cache
find /mnt/new_volume/astrobalendar -name "*.tsbuildinfo" -delete
find /mnt/new_volume/astrobalendar -name "node_modules/.cache" -type d -exec rm -rf {} +

# Remove any old VS Code settings
echo "Cleaning VS Code workspace..."
rm -rf /mnt/new_volume/astrobalendar/apps/frontend/.vscode

# Install dependencies
echo "Installing fresh dependencies..."
cd /mnt/new_volume/astrobalendar/apps/frontend && npm install

# Set up workspace
echo "Setting up fresh workspace..."

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
echo "Starting fresh VS Code instance..."
# Kill any existing VS Code instances
pkill -f "Code" || true

# Wait a moment before starting new instance
sleep 2

code /mnt/new_volume/astrobalendar/apps/frontend/astrobalendar.code-workspace
