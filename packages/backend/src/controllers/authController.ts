import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '@/services/authService';
import { emailService } from '@/services/emailService';
import { ApiResponse, HttpStatus } from '@auragen/shared';
import { logger } from '@/utils/logger';
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest } from '@auragen/shared';

export class AuthController {
  // Validation rules
  public static validateRegister = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
    body('firstName').isLength({ min: 1 }).trim().withMessage('First name is required'),
    body('lastName').isLength({ min: 1 }).trim().withMessage('Last name is required'),
    body('language').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar'),
    body('referralCode').optional().isLength({ min: 6, max: 10 }).withMessage('Invalid referral code format')
  ];

  public static validateLogin = [
    body('email').isLength({ min: 1 }).withMessage('Email or username is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
    body('rememberMe').optional().isBoolean().withMessage('Remember me must be a boolean')
  ];

  public static validateForgotPassword = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
  ];

  public static validateResetPassword = [
    body('token').isLength({ min: 1 }).withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
  ];

  public static validateChangePassword = [
    body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('New password must be at least 8 characters with uppercase, lowercase, number and special character'),
    body('confirmNewPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
  ];

  // Helper method to check validation errors
  private static checkValidationErrors(req: Request): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      throw new Error(errorMessages);
    }
  }

  // Register new user
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthController.checkValidationErrors(req);

      const userData: RegisterRequest = req.body;
      
      logger.info(`Registration attempt for email: ${userData.email}`);

      const { user, tokens } = await authService.register(userData);

      // Send welcome email (non-blocking)
      emailService.sendWelcomeEmail(user.email, user.firstName).catch((error) => {
        logger.error('Failed to send welcome email:', error);
      });

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            role: user.role,
            language: user.language,
            subscriptionTier: user.subscriptionTier,
            isEmailVerified: user.isEmailVerified,
            credits: user.credits,
            referralCode: user.referralCode
          },
          tokens
        }
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Login user
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthController.checkValidationErrors(req);

      const loginData: LoginRequest = req.body;
      
      logger.info(`Login attempt for: ${loginData.email}`);

      const { user, tokens } = await authService.login(loginData);

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            role: user.role,
            language: user.language,
            subscriptionTier: user.subscriptionTier,
            subscriptionExpiry: user.subscriptionExpiry,
            isEmailVerified: user.isEmailVerified,
            credits: user.credits,
            usageStats: user.usageStats,
            lastLoginAt: user.lastLoginAt
          },
          tokens
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  public static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      const tokens = await authService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        data: { tokens }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Logout user (client-side token removal, server can implement token blacklisting)
  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a more sophisticated implementation, you might want to blacklist the token
      // For now, we'll just return success and let the client remove the token

      const response: ApiResponse = {
        success: true,
        data: { message: 'Logged out successfully' }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Verify email
  public static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query as { token: string };

      if (!token) {
        throw new Error('Verification token is required');
      }

      const user = await authService.verifyEmail(token);

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Email verified successfully',
          user: {
            id: user.id,
            email: user.email,
            isEmailVerified: user.isEmailVerified
          }
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Request password reset
  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthController.checkValidationErrors(req);

      const { email }: ForgotPasswordRequest = req.body;

      await authService.requestPasswordReset(email);

      // Always return success for security (don't reveal if email exists)
      const response: ApiResponse = {
        success: true,
        data: {
          message: 'If the email exists in our system, a password reset link has been sent'
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthController.checkValidationErrors(req);

      const { token, password }: ResetPasswordRequest = req.body;

      const user = await authService.resetPassword(token, password);

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Password reset successfully',
          user: {
            id: user.id,
            email: user.email
          }
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Change password (authenticated user)
  public static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      AuthController.checkValidationErrors(req);

      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
      const userId = req.user!.id;

      await authService.changePassword(userId, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Password changed successfully' }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Resend verification email
  public static async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new Error('Email is required');
      }

      await authService.resendVerificationEmail(email);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Verification email sent' }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            role: user.role,
            language: user.language,
            subscriptionTier: user.subscriptionTier,
            subscriptionExpiry: user.subscriptionExpiry,
            isEmailVerified: user.isEmailVerified,
            credits: user.credits,
            usageStats: user.usageStats,
            preferences: user.preferences,
            referralCode: user.referralCode,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
          }
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Check authentication status
  public static async checkAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: ApiResponse = {
        success: true,
        data: {
          isAuthenticated: !!req.user,
          user: req.user ? {
            id: req.user.id,
            email: req.user.email,
            username: req.user.username,
            role: req.user.role,
            subscriptionTier: req.user.subscriptionTier,
            isEmailVerified: req.user.isEmailVerified
          } : null
        }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;