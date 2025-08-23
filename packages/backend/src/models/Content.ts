import mongoose, { Schema, Document } from 'mongoose';
import { 
  ContentType, 
  ContentStatus, 
  ImageStyle, 
  VoiceGender, 
  VoiceEmotion,
  ImageGeneration as IImageGeneration,
  VoiceSynthesis as IVoiceSynthesis,
  VideoCreation as IVideoCreation
} from '@auragen/shared';

export interface ContentDocument extends Document {
  userId: string;
  type: ContentType;
  title: string;
  description?: string;
  status: ContentStatus;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  duration?: number;
  metadata: Record<string, any>;
  tags: string[];
  isPublic: boolean;
  isTemplate: boolean;
  likes: number;
  downloads: number;
  views: number;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  incrementViews(): Promise<ContentDocument>;
  incrementLikes(): Promise<ContentDocument>;
  incrementDownloads(): Promise<ContentDocument>;
}

// Base Content Schema
const ContentSchema = new Schema<ContentDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(ContentType),
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(ContentStatus),
    default: ContentStatus.PENDING,
    index: true
  },
  fileUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'File URL must be a valid HTTP/HTTPS URL'
    }
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Thumbnail URL must be a valid HTTP/HTTPS URL'
    }
  },
  fileSize: {
    type: Number,
    min: 0
  },
  duration: {
    type: Number,
    min: 0
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 10;
      },
      message: 'Maximum 10 tags allowed'
    }
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  isTemplate: {
    type: Boolean,
    default: false,
    index: true
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  processingStartedAt: {
    type: Date
  },
  processingCompletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  discriminatorKey: 'type',
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
ContentSchema.index({ userId: 1, type: 1 });
ContentSchema.index({ isPublic: 1, status: 1 });
ContentSchema.index({ createdAt: -1 });
ContentSchema.index({ likes: -1 });
ContentSchema.index({ views: -1 });
ContentSchema.index({ tags: 1 });

// Virtual for processing time
ContentSchema.virtual('processingTime').get(function() {
  if (this.processingStartedAt && this.processingCompletedAt) {
    return this.processingCompletedAt.getTime() - this.processingStartedAt.getTime();
  }
  return null;
});

// Instance methods
ContentSchema.methods.incrementViews = async function(): Promise<ContentDocument> {
  this.views += 1;
  return this.save();
};

ContentSchema.methods.incrementLikes = async function(): Promise<ContentDocument> {
  this.likes += 1;
  return this.save();
};

ContentSchema.methods.incrementDownloads = async function(): Promise<ContentDocument> {
  this.downloads += 1;
  return this.save();
};

// Create base model
export const Content = mongoose.model<ContentDocument>('Content', ContentSchema);

// Image Generation Schema
export interface ImageGenerationDocument extends ContentDocument, Omit<IImageGeneration, 'id'> {}

const ImageGenerationSchema = new Schema({
  prompt: {
    type: String,
    required: true,
    maxlength: 1000
  },
  negativePrompt: {
    type: String,
    maxlength: 500
  },
  style: {
    type: String,
    enum: Object.values(ImageStyle),
    required: true
  },
  dimensions: {
    width: {
      type: Number,
      required: true,
      min: 256,
      max: 2048
    },
    height: {
      type: Number,
      required: true,
      min: 256,
      max: 2048
    }
  },
  seed: {
    type: Number
  },
  steps: {
    type: Number,
    min: 1,
    max: 100
  },
  guidanceScale: {
    type: Number,
    min: 1,
    max: 20
  },
  model: {
    type: String,
    required: true
  }
});

export const ImageGeneration = Content.discriminator<ImageGenerationDocument>('image', ImageGenerationSchema);

// Voice Synthesis Schema
export interface VoiceSynthesisDocument extends ContentDocument, Omit<IVoiceSynthesis, 'id'> {}

const VoiceSynthesisSchema = new Schema({
  text: {
    type: String,
    required: true,
    maxlength: 5000
  },
  language: {
    type: String,
    required: true
  },
  voice: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      enum: Object.values(VoiceGender),
      required: true
    },
    accent: {
      type: String
    }
  },
  emotion: {
    type: String,
    enum: Object.values(VoiceEmotion),
    default: VoiceEmotion.NEUTRAL
  },
  speed: {
    type: Number,
    min: 0.5,
    max: 2.0,
    default: 1.0
  },
  pitch: {
    type: Number,
    min: -20,
    max: 20,
    default: 0
  },
  volume: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  pauseDuration: {
    type: Number,
    min: 0,
    max: 5
  },
  ssmlEnabled: {
    type: Boolean,
    default: false
  }
});

export const VoiceSynthesis = Content.discriminator<VoiceSynthesisDocument>('voice', VoiceSynthesisSchema);

// Video Creation Schema
export interface VideoCreationDocument extends ContentDocument, Omit<IVideoCreation, 'id'> {}

const VideoCreationSchema = new Schema({
  imageId: {
    type: String,
    required: true
  },
  voiceId: {
    type: String,
    required: true
  },
  timeline: [{
    type: {
      type: String,
      enum: ['image', 'voice', 'text', 'transition'],
      required: true
    },
    startTime: {
      type: Number,
      required: true,
      min: 0
    },
    endTime: {
      type: Number,
      required: true,
      min: 0
    },
    content: Schema.Types.Mixed,
    effects: [String]
  }],
  resolution: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  frameRate: {
    type: Number,
    min: 24,
    max: 60,
    default: 30
  },
  format: {
    type: String,
    enum: ['mp4', 'mov', 'avi'],
    default: 'mp4'
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'ultra'],
    default: 'high'
  }
});

export const VideoCreation = Content.discriminator<VideoCreationDocument>('video', VideoCreationSchema);

// Static methods for Content model
ContentSchema.statics.findByUser = function(userId: string, options: any = {}) {
  return this.find({ userId, ...options }).sort({ createdAt: -1 });
};

ContentSchema.statics.findPublic = function(options: any = {}) {
  return this.find({ isPublic: true, status: ContentStatus.COMPLETED, ...options }).sort({ createdAt: -1 });
};

ContentSchema.statics.findTrending = function(limit: number = 20) {
  return this.find({ 
    isPublic: true, 
    status: ContentStatus.COMPLETED,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
  })
  .sort({ likes: -1, views: -1 })
  .limit(limit);
};

ContentSchema.statics.findByTag = function(tag: string, options: any = {}) {
  return this.find({ 
    tags: { $in: [tag] }, 
    isPublic: true, 
    status: ContentStatus.COMPLETED,
    ...options 
  }).sort({ createdAt: -1 });
};

// Export all models
export { Content as default, ImageGeneration, VoiceSynthesis, VideoCreation };