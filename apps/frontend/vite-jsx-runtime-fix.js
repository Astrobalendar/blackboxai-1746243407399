import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/**
 * Vite plugin to fix React 18 JSX runtime issues
 */
export default function reactJsxRuntimeFix() {
  return {
    name: 'vite-plugin-react-jsx-runtime-fix',
    config(config) {
      // Make sure we have the resolve.alias object
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};

      // Add aliases for React JSX runtime
      config.resolve.alias = {
        ...config.resolve.alias,
        'react/jsx-runtime.js': require.resolve('react/jsx-runtime'),
        'react/jsx-dev-runtime.js': require.resolve('react/jsx-dev-runtime'),
      };

      return config;
    },
  };
}
