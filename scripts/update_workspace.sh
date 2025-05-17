#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Remove TypeScript cache files
find . -name "*.tsbuildinfo" -delete
find . -name "node_modules/.cache" -type d -exec rm -rf {} +

# Remove old build files
rm -rf /mnt/new_volume/astrobalendar/src

# Install dependencies in frontend
npm install --prefix /mnt/new_volume/astrobalendar/apps/frontend

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
cat > /mnt/new_volume/astrobalendar/apps/frontend/.vscode/launch.json << 'EOL'
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "Launch Chrome against localhost",
            "url": "http://localhost:5173",
            "webRoot": "${workspaceFolder}/src"
        }
    ]
}
EOL

# Add workspace file
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

# Make script executable
chmod +x /mnt/new_volume/astrobalendar/scripts/update_workspace.sh
