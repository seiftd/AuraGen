import nodemailer from 'nodemailer';
import config from '@/config';
import { logger } from '@/utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: config.EMAIL.SMTP_HOST,
      port: config.EMAIL.SMTP_PORT,
      secure: config.EMAIL.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: config.EMAIL.SMTP_USER,
        pass: config.EMAIL.SMTP_PASS,
      },
    });
  }

  // Send email verification
  public async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${config.APP_URL}/verify-email?token=${token}`;
      
      const mailOptions = {
        from: `"${config.EMAIL.FROM_NAME}" <${config.EMAIL.FROM_EMAIL}>`,
        to: email,
        subject: 'Verify Your AuraGen AI Account',
        html: this.generateVerificationEmailTemplate(verificationUrl),
        text: `Please verify your email by clicking the following link: ${verificationUrl}`
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send password reset email
  public async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${config.APP_URL}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: `"${config.EMAIL.FROM_NAME}" <${config.EMAIL.FROM_EMAIL}>`,
        to: email,
        subject: 'Reset Your AuraGen AI Password',
        html: this.generatePasswordResetEmailTemplate(resetUrl),
        text: `Reset your password by clicking the following link: ${resetUrl}`
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Send welcome email
  public async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${config.EMAIL.FROM_NAME}" <${config.EMAIL.FROM_EMAIL}>`,
        to: email,
        subject: 'Welcome to AuraGen AI!',
        html: this.generateWelcomeEmailTemplate(firstName),
        text: `Welcome to AuraGen AI, ${firstName}! Start creating amazing content with AI.`
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      // Don't throw error for welcome emails as they're not critical
    }
  }

  // Send subscription notification
  public async sendSubscriptionNotification(email: string, type: 'upgrade' | 'downgrade' | 'cancelled', plan: string): Promise<void> {
    try {
      const subject = type === 'upgrade' ? 'Subscription Upgraded!' : 
                     type === 'downgrade' ? 'Subscription Changed' : 
                     'Subscription Cancelled';

      const mailOptions = {
        from: `"${config.EMAIL.FROM_NAME}" <${config.EMAIL.FROM_EMAIL}>`,
        to: email,
        subject: `AuraGen AI - ${subject}`,
        html: this.generateSubscriptionEmailTemplate(type, plan),
        text: `Your AuraGen AI subscription has been ${type}d to ${plan}.`
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Subscription notification sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send subscription notification:', error);
      // Don't throw error for notifications as they're not critical
    }
  }

  // Email verification template
  private generateVerificationEmailTemplate(verificationUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - AuraGen AI</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AuraGen AI!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered content creation journey starts here</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
            <p>Thank you for joining AuraGen AI! To complete your registration and start creating amazing content, please verify your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                    Verify Email Address
                </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                If you didn't create an account with AuraGen AI, you can safely ignore this email.
            </p>
            
            <p style="font-size: 14px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #6366f1; word-break: break-all;">${verificationUrl}</a>
            </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280;">
            <p style="margin: 0;">AuraGen AI - Empowering creators with AI</p>
            <p style="margin: 5px 0 0 0;">Questions? Contact us at support@auragen.ai</p>
        </div>
    </body>
    </html>`;
  }

  // Password reset email template
  private generatePasswordResetEmailTemplate(resetUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - AuraGen AI</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Secure your AuraGen AI account</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
            <p>You requested a password reset for your AuraGen AI account. Click the button below to set a new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                    Reset Password
                </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="font-size: 14px; color: #6b7280;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="font-size: 14px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #ef4444; word-break: break-all;">${resetUrl}</a>
            </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280;">
            <p style="margin: 0;">AuraGen AI - Empowering creators with AI</p>
            <p style="margin: 5px 0 0 0;">Questions? Contact us at support@auragen.ai</p>
        </div>
    </body>
    </html>`;
  }

  // Welcome email template
  private generateWelcomeEmailTemplate(firstName: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AuraGen AI</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome, ${firstName}!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your creative journey begins now</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; margin-top: 0;">You're All Set!</h2>
            <p>Welcome to AuraGen AI! We're excited to help you create amazing content with the power of artificial intelligence.</p>
            
            <div style="margin: 30px 0;">
                <h3 style="color: #1f2937; margin-bottom: 15px;">What you can do:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                        🎨 <strong>Generate Images</strong> - Turn your ideas into stunning visuals
                    </li>
                    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                        🎙️ <strong>Create Voices</strong> - Convert text to lifelike speech
                    </li>
                    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                        🎬 <strong>Make Videos</strong> - Combine images and audio into professional videos
                    </li>
                    <li style="margin-bottom: 10px; padding-left: 25px; position: relative;">
                        🌟 <strong>Share & Discover</strong> - Join our creative community
                    </li>
                </ul>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="color: #0369a1; margin-top: 0;">Your Free Credits:</h4>
                <p style="margin-bottom: 0; color: #0c4a6e;">
                    • 5 Image Generations<br>
                    • 3 Voice Syntheses<br>
                    • 1 Video Creation
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${config.APP_URL}/dashboard" 
                   style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                    Start Creating
                </a>
            </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280;">
            <p style="margin: 0;">AuraGen AI - Empowering creators with AI</p>
            <p style="margin: 5px 0 0 0;">Need help? Check our guides or contact support@auragen.ai</p>
        </div>
    </body>
    </html>`;
  }

  // Subscription email template
  private generateSubscriptionEmailTemplate(type: 'upgrade' | 'downgrade' | 'cancelled', plan: string): string {
    const color = type === 'upgrade' ? '#10b981' : type === 'downgrade' ? '#f59e0b' : '#ef4444';
    const title = type === 'upgrade' ? 'Subscription Upgraded!' : 
                  type === 'downgrade' ? 'Subscription Updated' : 
                  'Subscription Cancelled';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - AuraGen AI</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${color}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${title}</h1>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; margin-top: 0;">Your subscription has been ${type}d</h2>
            <p>Your AuraGen AI subscription has been updated to the <strong>${plan}</strong> plan.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${config.APP_URL}/dashboard" 
                   style="background: ${color}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                    View Dashboard
                </a>
            </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280;">
            <p style="margin: 0;">AuraGen AI - Empowering creators with AI</p>
            <p style="margin: 5px 0 0 0;">Questions? Contact us at support@auragen.ai</p>
        </div>
    </body>
    </html>`;
  }

  // Test email connection
  public async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();