require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  cors: {
    allowedOrigins: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://192.168.1.13:5173'
    ]
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    logFile: 'logs/combined.log',
    errorFile: 'logs/error.log'
  }
};

// Validate required environment variables
const requiredEnvVars = [];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

module.exports = config;
