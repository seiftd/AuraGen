import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  API_VERSION: process.env.API_VERSION || 'v1',
  APP_NAME: process.env.APP_NAME || 'AuraGen AI Backend',
  APP_URL: process.env.APP_URL || 'http://localhost:3001',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/auragen-ai',
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/auragen-ai-test',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here',

  // Email
  EMAIL: {
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@auragen.ai',
    FROM_NAME: process.env.FROM_NAME || 'AuraGen AI',
  },

  // AWS S3
  AWS: {
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION: process.env.AWS_REGION || 'us-east-1',
    S3_BUCKET: process.env.S3_BUCKET || 'auragen-ai-storage',
    CLOUDFRONT_DOMAIN: process.env.CLOUDFRONT_DOMAIN,
  },

  // Payment Processing
  STRIPE: {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },

  // AI Services
  AI: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STABILITY_AI_API_KEY: process.env.STABILITY_AI_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
    AMAZON_POLLY_ACCESS_KEY: process.env.AMAZON_POLLY_ACCESS_KEY,
    AMAZON_POLLY_SECRET_KEY: process.env.AMAZON_POLLY_SECRET_KEY,
  },

  // Social Media APIs
  SOCIAL: {
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN,
    TWITTER_API_KEY: process.env.TWITTER_API_KEY,
    TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
    TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY,
    TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET,
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
    UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads/',
  },

  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
  ALLOWED_HOSTS: process.env.ALLOWED_HOSTS?.split(',') || ['localhost', '127.0.0.1'],

  // Analytics
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
  },

  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,

  // Development
  SEED_DATABASE: process.env.SEED_DATABASE === 'true',
  ENABLE_SWAGGER: process.env.ENABLE_SWAGGER !== 'false',
  ENABLE_PLAYGROUND: process.env.ENABLE_PLAYGROUND !== 'false',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log',
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGODB_URI',
];

if (config.NODE_ENV === 'production') {
  requiredEnvVars.push(
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'STRIPE_SECRET_KEY',
    'SMTP_USER',
    'SMTP_PASS'
  );
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default config;