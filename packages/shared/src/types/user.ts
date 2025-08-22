import { z } from 'zod';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum Language {
  ENGLISH = 'en',
  ARABIC = 'ar'
}

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  avatar: z.string().url().optional(),
  role: z.nativeEnum(UserRole),
  language: z.nativeEnum(Language),
  subscriptionTier: z.nativeEnum(SubscriptionTier),
  subscriptionExpiry: z.date().optional(),
  credits: z.object({
    imageGeneration: z.number().min(0),
    voiceSynthesis: z.number().min(0),
    videoMerge: z.number().min(0)
  }),
  usageStats: z.object({
    totalImagesGenerated: z.number().min(0),
    totalVoicesGenerated: z.number().min(0),
    totalVideosCreated: z.number().min(0),
    lastActiveDate: z.date()
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      marketing: z.boolean()
    }),
    privacy: z.object({
      profileVisible: z.boolean(),
      contentVisible: z.boolean(),
      analyticsEnabled: z.boolean()
    })
  }),
  referralCode: z.string().optional(),
  referredBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean()
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  usageStats: true,
  credits: true,
  referralCode: true
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  createdAt: true,
  email: true
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;