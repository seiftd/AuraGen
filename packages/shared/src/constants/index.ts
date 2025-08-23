export const APP_CONFIG = {
  NAME: 'AuraGen AI',
  VERSION: '1.0.0',
  DESCRIPTION: 'All-in-One Content Creation Suite',
  SUPPORT_EMAIL: 'support@auragen.ai',
  WEBSITE: 'https://auragen.ai'
};

export const SUBSCRIPTION_LIMITS = {
  FREE: {
    imageGeneration: 5,
    voiceSynthesis: 3,
    videoMerge: 1,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxDuration: 60 // seconds
  },
  PREMIUM: {
    imageGeneration: -1, // unlimited
    voiceSynthesis: -1,
    videoMerge: -1,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 300 // 5 minutes
  },
  PRO: {
    imageGeneration: -1,
    voiceSynthesis: -1,
    videoMerge: -1,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    maxDuration: 600, // 10 minutes
    commercialLicense: true,
    advancedFeatures: true
  },
  ENTERPRISE: {
    imageGeneration: -1,
    voiceSynthesis: -1,
    videoMerge: -1,
    maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
    maxDuration: 1800, // 30 minutes
    commercialLicense: true,
    advancedFeatures: true,
    prioritySupport: true,
    customBranding: true
  }
};

export const PRICING = {
  PREMIUM: {
    monthly: 10,
    yearly: 100,
    currency: 'USD'
  },
  PRO: {
    monthly: 20,
    yearly: 200,
    currency: 'USD'
  },
  ENTERPRISE: {
    monthly: 50,
    yearly: 500,
    currency: 'USD'
  }
};

export const CREDIT_COSTS = {
  imageGeneration: 1,
  voiceSynthesis: 1,
  videoMerge: 2,
  extraResolution: 1, // for high-res images
  extraDuration: 1 // per minute for long audio/video
};

export const CREDIT_PACKS = [
  { credits: 10, price: 5 },
  { credits: 25, price: 10 },
  { credits: 50, price: 18 },
  { credits: 100, price: 35 },
  { credits: 250, price: 80 },
  { credits: 500, price: 150 }
];

export const FILE_LIMITS = {
  IMAGE: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxDimensions: { width: 2048, height: 2048 }
  },
  AUDIO: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedFormats: ['mp3', 'wav', 'ogg', 'm4a'],
    maxDuration: 1800 // 30 minutes
  },
  VIDEO: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedFormats: ['mp4', 'mov', 'avi'],
    maxDuration: 1800, // 30 minutes
    maxResolution: { width: 1920, height: 1080 }
  }
};

export const AI_MODELS = {
  IMAGE_GENERATION: [
    {
      id: 'stable-diffusion-xl',
      name: 'Stable Diffusion XL',
      description: 'High-quality image generation',
      provider: 'stability-ai',
      maxResolution: { width: 1024, height: 1024 }
    },
    {
      id: 'midjourney-v6',
      name: 'Midjourney V6',
      description: 'Artistic image generation',
      provider: 'midjourney',
      maxResolution: { width: 2048, height: 2048 }
    },
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      description: 'Creative image generation',
      provider: 'openai',
      maxResolution: { width: 1024, height: 1024 }
    }
  ],
  VOICE_SYNTHESIS: [
    {
      id: 'elevenlabs-multilingual',
      name: 'ElevenLabs Multilingual',
      description: 'High-quality multilingual voice synthesis',
      provider: 'elevenlabs',
      languages: ['en', 'ar', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'ja', 'ko']
    },
    {
      id: 'google-wavenet',
      name: 'Google WaveNet',
      description: 'Natural sounding voices',
      provider: 'google',
      languages: ['en', 'ar', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'ja', 'ko']
    },
    {
      id: 'amazon-polly',
      name: 'Amazon Polly',
      description: 'Lifelike speech synthesis',
      provider: 'amazon',
      languages: ['en', 'ar', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'ja', 'ko']
    }
  ]
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true }
];

export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  API_REQUESTS: { max: 100, window: 60 * 1000 }, // 100 requests per minute
  FILE_UPLOADS: { max: 10, window: 60 * 1000 }, // 10 uploads per minute
  CONTENT_GENERATION: { max: 20, window: 60 * 1000 } // 20 generations per minute
};

export const SOCIAL_FEATURES = {
  MAX_TAGS: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TITLE_LENGTH: 100,
  TRENDING_THRESHOLD: 100, // minimum views/likes for trending
  FEATURED_THRESHOLD: 500 // minimum engagement for featured content
};

export const NOTIFICATION_TYPES = {
  CONTENT_READY: 'content_ready',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  CREDITS_LOW: 'credits_low',
  NEW_FOLLOWER: 'new_follower',
  CONTENT_LIKED: 'content_liked',
  CONTENT_SHARED: 'content_shared',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SECURITY_ALERT: 'security_alert'
};

export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  CREDITS_INSUFFICIENT: 'CREDITS_INSUFFICIENT',
  
  // Content
  CONTENT_NOT_FOUND: 'CONTENT_NOT_FOUND',
  CONTENT_PROCESSING: 'CONTENT_PROCESSING',
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',
  
  // System
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
};

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};