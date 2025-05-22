/* eslint-env node */

module.exports = {
  env: {
    browser: true, // for document, window, navigator, etc.
    node: true,    // for require, process, Buffer, etc.
    es2021: true,  // for latest JS globals
  },
  globals: {
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    fetch: 'readonly',
    process: 'readonly',
    Buffer: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    console: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    File: 'readonly',
    Blob: 'readonly',
    FormData: 'readonly',
    KeyboardEvent: 'readonly',
    MouseEvent: 'readonly',
    Event: 'readonly',
    TouchEvent: 'readonly',
    EventTarget: 'readonly',
    customElements: 'readonly',

  },
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: './tsconfig.eslint.json',
  },
  plugins: ['@typescript-eslint', 'react', 'jest', 'cypress'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
    'plugin:cypress/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  overrides: [
    // React/TSX/JSX files (browser + React env, parser, no-undef off)
    {
      files: ["**/*.tsx", "**/*.jsx"],
      env: { browser: true, es2021: true },
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module"
      },
      rules: {
        "no-undef": "off"
      }
    },
    // Node scripts and config files
    {
      files: [
        "scripts/**/*.{js,ts}",
        "electron/**/*.{js,ts}",
        "*.config.js",
        "*.config.ts",
        "vite.config.ts",
        "mongo-init.js"
      ],
      env: { node: true },
      rules: {
        "no-undef": "off"
      }
    },
    // Jest test files
    {
      files: [
        "**/*.test.{js,ts,tsx}",
        "**/*.spec.{js,ts,tsx}",
        "tests/**/*.{js,ts,tsx}"
      ],
      env: { jest: true, node: true, browser: true },
      rules: {
        "no-undef": "off"
      }
    },
    // Cypress test files
    {
      files: [
        "cypress/**/*.{js,ts,tsx}",
        "**/*.cy.{js,ts,tsx}"
      ],
      env: { "cypress/globals": true, browser: true, node: true },
      rules: {
        "no-undef": "off"
      }
    },
    // TypeScript declaration files
    {
      files: ["*.d.ts"],
      rules: { "no-undef": "off" },
    },
  ],
};
