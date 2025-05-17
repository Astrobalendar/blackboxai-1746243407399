/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable webpack 5
  webpack5: true,
  
  // Enable compiler optimizations
  compiler: {
    styledComponents: true,
  },
  
  webpack: (config) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../../shared')
    };
    return config;
  },
  
  // Add environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_EMAIL_API_KEY: process.env.NEXT_PUBLIC_EMAIL_API_KEY || ''
  },
  
  // TypeScript configuration
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },
  
  // Enable the new Link component behavior
  experimental: {
    newNextLinkBehavior: true,
  },
};

module.exports = nextConfig;
