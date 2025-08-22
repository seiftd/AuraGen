import { z } from 'zod';

export enum ContentType {
  IMAGE = 'image',
  VOICE = 'voice',
  VIDEO = 'video'
}

export enum ContentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELETED = 'deleted'
}

export enum ImageStyle {
  REALISTIC = 'realistic',
  ARTISTIC = 'artistic',
  CARTOON = 'cartoon',
  ABSTRACT = 'abstract',
  PHOTOGRAPHIC = 'photographic',
  DIGITAL_ART = 'digital_art'
}

export enum VoiceGender {
  MALE = 'male',
  FEMALE = 'female',
  NEUTRAL = 'neutral'
}

export enum VoiceEmotion {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  SAD = 'sad',
  EXCITED = 'excited',
  CALM = 'calm',
  ANGRY = 'angry',
  PROFESSIONAL = 'professional'
}

export const BaseContentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.nativeEnum(ContentType),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(ContentStatus),
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  fileSize: z.number().min(0).optional(),
  duration: z.number().min(0).optional(), // for audio/video in seconds
  metadata: z.record(z.any()),
  tags: z.array(z.string()),
  isPublic: z.boolean(),
  isTemplate: z.boolean(),
  likes: z.number().min(0),
  downloads: z.number().min(0),
  views: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  processingStartedAt: z.date().optional(),
  processingCompletedAt: z.date().optional()
});

export const ImageGenerationSchema = BaseContentSchema.extend({
  type: z.literal(ContentType.IMAGE),
  prompt: z.string().min(1).max(1000),
  negativePrompt: z.string().max(500).optional(),
  style: z.nativeEnum(ImageStyle),
  dimensions: z.object({
    width: z.number().min(256).max(2048),
    height: z.number().min(256).max(2048)
  }),
  seed: z.number().optional(),
  steps: z.number().min(1).max(100).optional(),
  guidanceScale: z.number().min(1).max(20).optional(),
  model: z.string()
});

export const VoiceSynthesisSchema = BaseContentSchema.extend({
  type: z.literal(ContentType.VOICE),
  text: z.string().min(1).max(5000),
  language: z.string(),
  voice: z.object({
    id: z.string(),
    name: z.string(),
    gender: z.nativeEnum(VoiceGender),
    accent: z.string().optional()
  }),
  emotion: z.nativeEnum(VoiceEmotion),
  speed: z.number().min(0.5).max(2.0),
  pitch: z.number().min(-20).max(20),
  volume: z.number().min(0).max(100),
  pauseDuration: z.number().min(0).max(5).optional(),
  ssmlEnabled: z.boolean().optional()
});

export const VideoCreationSchema = BaseContentSchema.extend({
  type: z.literal(ContentType.VIDEO),
  imageId: z.string(),
  voiceId: z.string(),
  timeline: z.array(z.object({
    type: z.enum(['image', 'voice', 'text', 'transition']),
    startTime: z.number().min(0),
    endTime: z.number().min(0),
    content: z.any(),
    effects: z.array(z.string()).optional()
  })),
  resolution: z.object({
    width: z.number(),
    height: z.number()
  }),
  frameRate: z.number().min(24).max(60),
  format: z.enum(['mp4', 'mov', 'avi']),
  quality: z.enum(['low', 'medium', 'high', 'ultra'])
});

export type BaseContent = z.infer<typeof BaseContentSchema>;
export type ImageGeneration = z.infer<typeof ImageGenerationSchema>;
export type VoiceSynthesis = z.infer<typeof VoiceSynthesisSchema>;
export type VideoCreation = z.infer<typeof VideoCreationSchema>;

export type Content = ImageGeneration | VoiceSynthesis | VideoCreation;

export const CreateImageGenerationSchema = ImageGenerationSchema.omit({
  id: true,
  status: true,
  fileUrl: true,
  thumbnailUrl: true,
  fileSize: true,
  likes: true,
  downloads: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  processingStartedAt: true,
  processingCompletedAt: true
});

export const CreateVoiceSynthesisSchema = VoiceSynthesisSchema.omit({
  id: true,
  status: true,
  fileUrl: true,
  thumbnailUrl: true,
  fileSize: true,
  duration: true,
  likes: true,
  downloads: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  processingStartedAt: true,
  processingCompletedAt: true
});

export const CreateVideoCreationSchema = VideoCreationSchema.omit({
  id: true,
  status: true,
  fileUrl: true,
  thumbnailUrl: true,
  fileSize: true,
  duration: true,
  likes: true,
  downloads: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  processingStartedAt: true,
  processingCompletedAt: true
});

export type CreateImageGeneration = z.infer<typeof CreateImageGenerationSchema>;
export type CreateVoiceSynthesis = z.infer<typeof CreateVoiceSynthesisSchema>;
export type CreateVideoCreation = z.infer<typeof CreateVideoCreationSchema>;