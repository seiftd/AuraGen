import { Router } from 'express';
import AuthController from '@/controllers/authController';
import { authenticate, optionalAuth } from '@/middleware/auth';

const router = Router();

// Public routes
router.post('/register', AuthController.validateRegister, AuthController.register);
router.post('/login', AuthController.validateLogin, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/forgot-password', AuthController.validateForgotPassword, AuthController.forgotPassword);
router.post('/reset-password', AuthController.validateResetPassword, AuthController.resetPassword);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerificationEmail);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/change-password', authenticate, AuthController.validateChangePassword, AuthController.changePassword);

// Optional auth route (can be called with or without token)
router.get('/check', optionalAuth, AuthController.checkAuth);

export default router;