import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser, UserRole, SubscriptionTier, Language } from '@auragen/shared';

export interface UserDocument extends Omit<IUser, 'id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateReferralCode(): string;
  resetDailyCredits(): void;
  hasCredits(type: 'imageGeneration' | 'voiceSynthesis' | 'videoMerge', amount?: number): boolean;
  deductCredits(type: 'imageGeneration' | 'voiceSynthesis' | 'videoMerge', amount?: number): void;
  addCredits(type: 'imageGeneration' | 'voiceSynthesis' | 'videoMerge', amount: number): void;
}

const UserSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  language: {
    type: String,
    enum: Object.values(Language),
    default: Language.ENGLISH
  },
  subscriptionTier: {
    type: String,
    enum: Object.values(SubscriptionTier),
    default: SubscriptionTier.FREE
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  credits: {
    imageGeneration: {
      type: Number,
      default: 5,
      min: 0
    },
    voiceSynthesis: {
      type: Number,
      default: 3,
      min: 0
    },
    videoMerge: {
      type: Number,
      default: 1,
      min: 0
    }
  },
  usageStats: {
    totalImagesGenerated: {
      type: Number,
      default: 0,
      min: 0
    },
    totalVoicesGenerated: {
      type: Number,
      default: 0,
      min: 0
    },
    totalVideosCreated: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      profileVisible: {
        type: Boolean,
        default: true
      },
      contentVisible: {
        type: Boolean,
        default: true
      },
      analyticsEnabled: {
        type: Boolean,
        default: true
      }
    }
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  referredBy: {
    type: String,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ referralCode: 1 });
UserSchema.index({ subscriptionTier: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLoginAt: -1 });

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function(this: UserDocument) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(this: UserDocument, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to generate referral code
UserSchema.pre('save', function(this: UserDocument, next) {
  if (!this.referralCode && this.isNew) {
    this.referralCode = this.generateReferralCode();
  }
  next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(this: UserDocument, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate referral code
UserSchema.methods.generateReferralCode = function(this: UserDocument): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Instance method to reset daily credits
UserSchema.methods.resetDailyCredits = function(this: UserDocument): void {
  if (this.subscriptionTier === SubscriptionTier.FREE) {
    this.credits.imageGeneration = 5;
    this.credits.voiceSynthesis = 3;
    this.credits.videoMerge = 1;
  }
  // Premium and above have unlimited credits (-1)
};

// Instance method to check if user has credits
UserSchema.methods.hasCredits = function(
  this: UserDocument, 
  type: 'imageGeneration' | 'voiceSynthesis' | 'videoMerge', 
  amount: number = 1
): boolean {
  if (this.subscriptionTier !== SubscriptionTier.FREE) return true;
  return this.credits[type] >= amount;
};

// Instance method to deduct credits
UserSchema.methods.deductCredits = function(
  this: UserDocument, 
  type: 'imageGeneration' | 'voiceSynthesis' | 'videoMerge', 
  amount: number = 1
): void {
  if (this.subscriptionTier === SubscriptionTier.FREE) {
    this.credits[type] = Math.max(0, this.credits[type] - amount);
  }
};

// Instance method to add credits
UserSchema.methods.addCredits = function(
  this: UserDocument, 
  type: 'imageGeneration' | 'voiceSynthesis' | 'videoMerge', 
  amount: number
): void {
  if (this.subscriptionTier === SubscriptionTier.FREE) {
    this.credits[type] += amount;
  }
};

// Static method to find by email or username
UserSchema.statics.findByEmailOrUsername = function(identifier: string) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

export const User = mongoose.model<UserDocument>('User', UserSchema);