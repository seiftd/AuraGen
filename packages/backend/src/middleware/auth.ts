import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/authService';
import { User, UserDocument } from '@/models/User';
import { ApiError } from '@/middleware/errorHandler';
import { HttpStatus, ERROR_CODES, UserRole } from '@auragen/shared';
import { logger } from '@/utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Access token required', HttpStatus.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const { userId } = authService.verifyToken(token);
    
    // Get user from database
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError('User not found', HttpStatus.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new ApiError('Account has been suspended', HttpStatus.UNAUTHORIZED, ERROR_CODES.ACCOUNT_SUSPENDED);
    }

    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(error);
  }
};

// Optional authentication middleware (doesn't throw if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const { userId } = authService.verifyToken(token);
        const user = await User.findById(userId);
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next(error);
  }
};

// Role-based authorization middleware
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError('Insufficient permissions', HttpStatus.FORBIDDEN, ERROR_CODES.INSUFFICIENT_PERMISSIONS);
    }

    next();
  };
};

// Email verification middleware
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
  }

  if (!req.user.isEmailVerified) {
    throw new ApiError('Email verification required', HttpStatus.FORBIDDEN, ERROR_CODES.EMAIL_NOT_VERIFIED);
  }

  next();
};

// Subscription tier middleware
export const requireSubscription = (minTier: string) => {
  const tierHierarchy = {
    'free': 0,
    'premium': 1,
    'pro': 2,
    'enterprise': 3
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
    }

    const userTierLevel = tierHierarchy[req.user.subscriptionTier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[minTier as keyof typeof tierHierarchy] || 0;

    if (userTierLevel < requiredTierLevel) {
      throw new ApiError('Subscription upgrade required', HttpStatus.FORBIDDEN, ERROR_CODES.SUBSCRIPTION_REQUIRED);
    }

    next();
  };
};

// Credits middleware - check if user has enough credits
export const requireCredits = (type: 'imageGeneration' | 'voiceSynthesis' | 'videoMerge', amount: number = 1) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
    }

    if (!req.user.hasCredits(type, amount)) {
      throw new ApiError('Insufficient credits', HttpStatus.FORBIDDEN, ERROR_CODES.CREDITS_INSUFFICIENT);
    }

    next();
  };
};

// Rate limiting middleware for specific actions
export const rateLimitByUser = (maxRequests: number, windowMs: number, action: string) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
    }

    const userId = req.user.id;
    const now = Date.now();
    const userKey = `${userId}:${action}`;

    let userRecord = userRequests.get(userKey);
    
    if (!userRecord || now > userRecord.resetTime) {
      userRecord = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    userRecord.count++;
    userRequests.set(userKey, userRecord);

    if (userRecord.count > maxRequests) {
      throw new ApiError(
        `Rate limit exceeded for ${action}. Try again later.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ERROR_CODES.RATE_LIMIT_EXCEEDED
      );
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - userRecord.count).toString(),
      'X-RateLimit-Reset': Math.ceil(userRecord.resetTime / 1000).toString()
    });

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

// Super admin only middleware
export const superAdminOnly = authorize(UserRole.SUPER_ADMIN);

// User or admin middleware (user can access their own resources, admin can access all)
export const userOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
  }

  const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);
  const isOwnResource = req.params.userId === req.user.id || req.params.id === req.user.id;

  if (!isAdmin && !isOwnResource) {
    throw new ApiError('Access denied', HttpStatus.FORBIDDEN, ERROR_CODES.INSUFFICIENT_PERMISSIONS);
  }

  next();
};

// Middleware to update user activity
export const updateActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.user) {
    try {
      // Update last active date without waiting
      req.user.usageStats.lastActiveDate = new Date();
      req.user.save().catch((error) => {
        logger.error('Failed to update user activity:', error);
      });
    } catch (error) {
      // Don't block request if activity update fails
      logger.error('Activity update error:', error);
    }
  }
  next();
};

// Middleware to check if user account is locked
export const checkAccountLock = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.isLocked) {
    throw new ApiError(
      'Account temporarily locked due to multiple failed login attempts',
      HttpStatus.UNAUTHORIZED,
      'ACCOUNT_LOCKED'
    );
  }
  next();
};

// Middleware to validate API key for external integrations
export const validateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      throw new ApiError('API key required', HttpStatus.UNAUTHORIZED, 'API_KEY_REQUIRED');
    }

    // Find user by API key (you would need to add this field to User model)
    const user = await User.findOne({ apiKey, isActive: true });
    
    if (!user) {
      throw new ApiError('Invalid API key', HttpStatus.UNAUTHORIZED, 'INVALID_API_KEY');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('API key validation error:', error);
    next(error);
  }
};

// Composite middleware for common authentication patterns
export const authenticateUser = [authenticate, checkAccountLock, updateActivity];
export const authenticateAdmin = [authenticate, adminOnly, updateActivity];
export const authenticateAndVerifyEmail = [authenticate, requireEmailVerification, updateActivity];

// Export all middleware functions
export {
  authenticate,
  optionalAuth,
  authorize,
  requireEmailVerification,
  requireSubscription,
  requireCredits,
  rateLimitByUser,
  adminOnly,
  superAdminOnly,
  userOrAdmin,
  updateActivity,
  checkAccountLock,
  validateApiKey,
  authenticateUser,
  authenticateAdmin,
  authenticateAndVerifyEmail
};