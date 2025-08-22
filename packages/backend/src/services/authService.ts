import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, UserDocument } from '@/models/User';
import { emailService } from './emailService';
import config from '@/config';
import { logger } from '@/utils/logger';
import { ApiError } from '@/middleware/errorHandler';
import { HttpStatus, ERROR_CODES } from '@auragen/shared';
import type { LoginRequest, RegisterRequest, AuthToken } from '@auragen/shared';

export class AuthService {
  // Generate JWT token
  private generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, config.JWT.SECRET, {
      expiresIn: config.JWT.EXPIRES_IN,
    });
  }

  // Generate refresh token
  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, config.JWT.REFRESH_SECRET, {
      expiresIn: config.JWT.REFRESH_EXPIRES_IN,
    });
  }

  // Generate email verification token
  private generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate password reset token
  private generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Verify JWT token
  public verifyToken(token: string, isRefreshToken = false): { userId: string } {
    try {
      const secret = isRefreshToken ? config.JWT.REFRESH_SECRET : config.JWT.SECRET;
      const decoded = jwt.verify(token, secret) as any;
      return { userId: decoded.userId };
    } catch (error) {
      throw new ApiError('Invalid or expired token', HttpStatus.UNAUTHORIZED, ERROR_CODES.TOKEN_EXPIRED);
    }
  }

  // Register new user
  public async register(userData: RegisterRequest): Promise<{ user: UserDocument; tokens: AuthToken }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        throw new ApiError(
          existingUser.email === userData.email ? 'Email already registered' : 'Username already taken',
          HttpStatus.CONFLICT,
          'DUPLICATE_FIELD'
        );
      }

      // Create new user
      const user = new User({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        language: userData.language || 'en',
        emailVerificationToken: this.generateEmailVerificationToken(),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        referredBy: userData.referralCode
      });

      // Handle referral
      if (userData.referralCode) {
        const referringUser = await User.findOne({ referralCode: userData.referralCode });
        if (referringUser) {
          // Give bonus credits to both users
          referringUser.addCredits('imageGeneration', 2);
          referringUser.addCredits('voiceSynthesis', 2);
          await referringUser.save();

          user.addCredits('imageGeneration', 2);
          user.addCredits('voiceSynthesis', 2);
        }
      }

      await user.save();

      // Send verification email
      await emailService.sendVerificationEmail(user.email, user.emailVerificationToken!);

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      const tokens: AuthToken = {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
        tokenType: 'Bearer'
      };

      logger.info(`New user registered: ${user.email}`);

      return { user, tokens };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  public async login(loginData: LoginRequest): Promise<{ user: UserDocument; tokens: AuthToken }> {
    try {
      // Find user by email or username
      const user = await User.findOne({
        $or: [
          { email: loginData.email },
          { username: loginData.email }
        ]
      }).select('+password +loginAttempts +lockUntil');

      if (!user) {
        throw new ApiError('Invalid credentials', HttpStatus.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new ApiError('Account temporarily locked due to too many failed login attempts', HttpStatus.UNAUTHORIZED, 'ACCOUNT_LOCKED');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new ApiError('Account has been suspended', HttpStatus.UNAUTHORIZED, ERROR_CODES.ACCOUNT_SUSPENDED);
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        }
        
        await user.save();
        throw new ApiError('Invalid credentials', HttpStatus.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
      }

      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLoginAt = new Date();
      user.usageStats.lastActiveDate = new Date();
      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      const tokens: AuthToken = {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
        tokenType: 'Bearer'
      };

      logger.info(`User logged in: ${user.email}`);

      return { user, tokens };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Refresh access token
  public async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      const { userId } = this.verifyToken(refreshToken, true);
      
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        throw new ApiError('User not found or inactive', HttpStatus.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS);
      }

      // Generate new tokens
      const accessToken = this.generateAccessToken(userId);
      const newRefreshToken = this.generateRefreshToken(userId);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
        tokenType: 'Bearer'
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  // Verify email
  public async verifyEmail(token: string): Promise<UserDocument> {
    try {
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new ApiError('Invalid or expired verification token', HttpStatus.BAD_REQUEST, 'INVALID_TOKEN');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      return user;
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  // Request password reset
  public async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not
        return;
      }

      const resetToken = this.generatePasswordResetToken();
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      await emailService.sendPasswordResetEmail(email, resetToken);

      logger.info(`Password reset requested for: ${email}`);
    } catch (error) {
      logger.error('Password reset request error:', error);
      throw error;
    }
  }

  // Reset password
  public async resetPassword(token: string, newPassword: string): Promise<UserDocument> {
    try {
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new ApiError('Invalid or expired reset token', HttpStatus.BAD_REQUEST, 'INVALID_TOKEN');
      }

      user.password = newPassword; // Will be hashed by pre-save middleware
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      logger.info(`Password reset completed for user: ${user.email}`);

      return user;
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }

  // Change password
  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new ApiError('User not found', HttpStatus.NOT_FOUND, ERROR_CODES.INVALID_CREDENTIALS);
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new ApiError('Current password is incorrect', HttpStatus.BAD_REQUEST, ERROR_CODES.INVALID_CREDENTIALS);
      }

      user.password = newPassword; // Will be hashed by pre-save middleware
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);
    } catch (error) {
      logger.error('Password change error:', error);
      throw error;
    }
  }

  // Resend verification email
  public async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError('User not found', HttpStatus.NOT_FOUND, 'USER_NOT_FOUND');
      }

      if (user.isEmailVerified) {
        throw new ApiError('Email is already verified', HttpStatus.BAD_REQUEST, 'EMAIL_ALREADY_VERIFIED');
      }

      const verificationToken = this.generateEmailVerificationToken();
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();

      await emailService.sendVerificationEmail(email, verificationToken);

      logger.info(`Verification email resent to: ${email}`);
    } catch (error) {
      logger.error('Resend verification email error:', error);
      throw error;
    }
  }

  // Get user by ID
  public async getUserById(userId: string): Promise<UserDocument> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError('User not found', HttpStatus.NOT_FOUND, 'USER_NOT_FOUND');
      }
      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();