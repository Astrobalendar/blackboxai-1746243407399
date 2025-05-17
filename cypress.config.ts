import { defineConfig } from 'cypress';
import webpackPreprocessor from '@cypress/webpack-preprocessor';
import { Configuration } from 'webpack';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    // Load custom commands and setup from support files
    supportFile: 'tests/support/e2e.ts',
    // Define where to find test files
    specPattern: 'tests/**/*.test.ts',
    // Include type definitions
    setupNodeEvents(on, config) {
      // Enable TypeScript support for preprocessors
      const webpackConfig: Configuration = {
        resolve: {
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
          // Ensure TypeScript can resolve our custom types
          modules: ['node_modules', '.'],
        },
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              exclude: [/node_modules/],
              use: [
                {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: true,
                    // Point to our tsconfig file
                    configFile: 'tsconfig.json',
                  },
                },
              ],
            },
          ],
        },
      };

      on('file:preprocessor', webpackPreprocessor({ webpackOptions: webpackConfig }));
      
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
  // Enable TypeScript support through webpack configuration
  // Include custom commands and types
  includeShadowDom: true,
  // Enable experimental memory management
  experimentalMemoryManagement: true,
  // Set default command timeout to 10 seconds
  defaultCommandTimeout: 10000,
});
