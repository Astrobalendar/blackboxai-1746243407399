#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Print what commands are being run
echo "Fixing TypeScript configuration..."

cd /mnt/new_volume/astrobalendar/apps/frontend

# Remove node_modules to ensure clean installation
rm -rf node_modules

# Install all dependencies with --legacy-peer-deps to avoid peer dependency conflicts
npm install --legacy-peer-deps

# Add missing type definitions
npm install --save-dev @types/jest @types/react @types/react-dom @types/node

# Update tsconfig.json
cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "es2020",
    "useDefineForClassFields": true,
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../../shared/*"]
    },
    "typeRoots": ["./node_modules/@types"],
    "types": ["react", "react-dom", "node", "jest"],
    "declaration": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build", "scripts", "jest.config.ts"]
}
EOL

# Create a declaration file for react-toastify if needed
cat > src/types/react-toastify.d.ts << 'EOL'
declare module 'react-toastify' {
  export interface ToastContainerProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    autoClose?: number | false;
    hideProgressBar?: boolean;
    newestOnTop?: boolean;
    closeOnClick?: boolean;
    rtl?: boolean;
    pauseOnFocusLoss?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
    className?: string;
    style?: React.CSSProperties;
    toastStyle?: React.CSSProperties;
  }

  export const ToastContainer: React.FC<ToastContainerProps>;
  export const toast: {
    success: (message: string, options?: any) => void;
    error: (message: string, options?: any) => void;
    info: (message: string, options?: any) => void;
    warning: (message: string, options?: any) => void;
    default: (message: string, options?: any) => void;
  };
}
EOL

# Create a global.d.ts file for global types
cat > src/global.d.ts << 'EOL'
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
EOL

# Clear TypeScript cache
find . -name "*.tsbuildinfo" -delete
find . -name "node_modules/.cache" -type d -exec rm -rf {} +

# Restart VS Code
echo "Restarting VS Code..."
pkill -f "Code" || true
sleep 2
code .
