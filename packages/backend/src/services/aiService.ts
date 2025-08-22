import axios from 'axios';
import config from '@/config';
import { logger } from '@/utils/logger';
import { ApiError } from '@/middleware/errorHandler';
import { HttpStatus } from '@auragen/shared';
import type { ImageStyle, VoiceGender, VoiceEmotion } from '@auragen/shared';

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  style: ImageStyle;
  width: number;
  height: number;
  steps?: number;
  seed?: number;
  guidanceScale?: number;
}

export interface VoiceSynthesisRequest {
  text: string;
  language: string;
  voiceId: string;
  emotion: VoiceEmotion;
  speed: number;
  pitch: number;
  volume: number;
}

export interface ImageGenerationResult {
  imageUrl: string;
  seed: number;
  processingTime: number;
  model: string;
}

export interface VoiceSynthesisResult {
  audioUrl: string;
  duration: number;
  processingTime: number;
  model: string;
}

export class AIService {
  // Generate image using Stability AI
  public async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      logger.info('Starting image generation with Stability AI');

      if (!config.AI.STABILITY_AI_API_KEY) {
        throw new ApiError('Stability AI API key not configured', HttpStatus.INTERNAL_SERVER_ERROR, 'AI_SERVICE_UNAVAILABLE');
      }

      const startTime = Date.now();

      // Map our styles to Stability AI styles
      const stylePresets: Record<ImageStyle, string> = {
        realistic: 'photographic',
        artistic: 'digital-art',
        cartoon: 'comic-book',
        abstract: 'fantasy-art',
        photographic: 'photographic',
        digital_art: 'digital-art'
      };

      const payload = {
        text_prompts: [
          {
            text: request.prompt,
            weight: 1
          }
        ],
        cfg_scale: request.guidanceScale || 7,
        height: request.height,
        width: request.width,
        steps: request.steps || 30,
        samples: 1,
        style_preset: stylePresets[request.style] || 'photographic'
      };

      if (request.negativePrompt) {
        payload.text_prompts.push({
          text: request.negativePrompt,
          weight: -1
        });
      }

      if (request.seed) {
        (payload as any).seed = request.seed;
      }

      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${config.AI.STABILITY_AI_API_KEY}`,
          },
          timeout: 60000, // 60 seconds timeout
        }
      );

      if (!response.data.artifacts || response.data.artifacts.length === 0) {
        throw new ApiError('No image generated', HttpStatus.INTERNAL_SERVER_ERROR, 'AI_GENERATION_FAILED');
      }

      const artifact = response.data.artifacts[0];
      const processingTime = Date.now() - startTime;

      // In a real implementation, you would:
      // 1. Decode the base64 image
      // 2. Upload it to your storage service (AWS S3)
      // 3. Return the public URL
      
      // For now, we'll simulate this
      const imageUrl = `https://your-storage.com/images/${Date.now()}.png`;

      logger.info(`Image generation completed in ${processingTime}ms`);

      return {
        imageUrl,
        seed: artifact.seed || request.seed || Math.floor(Math.random() * 1000000),
        processingTime,
        model: 'stable-diffusion-xl-1024-v1-0'
      };

    } catch (error) {
      logger.error('Image generation failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new ApiError('Invalid image generation parameters', HttpStatus.BAD_REQUEST, 'INVALID_PARAMETERS');
        }
        if (error.response?.status === 402) {
          throw new ApiError('AI service quota exceeded', HttpStatus.PAYMENT_REQUIRED, 'QUOTA_EXCEEDED');
        }
        if (error.response?.status === 429) {
          throw new ApiError('AI service rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED');
        }
      }

      throw new ApiError('Image generation service unavailable', HttpStatus.INTERNAL_SERVER_ERROR, 'AI_SERVICE_UNAVAILABLE');
    }
  }

  // Generate voice using ElevenLabs
  public async synthesizeVoice(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResult> {
    try {
      logger.info('Starting voice synthesis with ElevenLabs');

      if (!config.AI.ELEVENLABS_API_KEY) {
        throw new ApiError('ElevenLabs API key not configured', HttpStatus.INTERNAL_SERVER_ERROR, 'AI_SERVICE_UNAVAILABLE');
      }

      const startTime = Date.now();

      const payload = {
        text: request.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: this.mapEmotionToStyle(request.emotion),
          use_speaker_boost: true
        }
      };

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${request.voiceId}`,
        payload,
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': config.AI.ELEVENLABS_API_KEY,
          },
          responseType: 'arraybuffer',
          timeout: 60000, // 60 seconds timeout
        }
      );

      const processingTime = Date.now() - startTime;

      // In a real implementation, you would:
      // 1. Save the audio buffer to your storage service (AWS S3)
      // 2. Return the public URL
      // 3. Calculate actual duration from audio metadata
      
      // For now, we'll simulate this
      const audioUrl = `https://your-storage.com/audio/${Date.now()}.mp3`;
      const estimatedDuration = Math.ceil(request.text.length / 10); // Rough estimation

      logger.info(`Voice synthesis completed in ${processingTime}ms`);

      return {
        audioUrl,
        duration: estimatedDuration,
        processingTime,
        model: 'eleven_multilingual_v2'
      };

    } catch (error) {
      logger.error('Voice synthesis failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new ApiError('Invalid voice synthesis parameters', HttpStatus.BAD_REQUEST, 'INVALID_PARAMETERS');
        }
        if (error.response?.status === 401) {
          throw new ApiError('Invalid ElevenLabs API key', HttpStatus.INTERNAL_SERVER_ERROR, 'INVALID_API_KEY');
        }
        if (error.response?.status === 402) {
          throw new ApiError('AI service quota exceeded', HttpStatus.PAYMENT_REQUIRED, 'QUOTA_EXCEEDED');
        }
        if (error.response?.status === 429) {
          throw new ApiError('AI service rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED');
        }
      }

      throw new ApiError('Voice synthesis service unavailable', HttpStatus.INTERNAL_SERVER_ERROR, 'AI_SERVICE_UNAVAILABLE');
    }
  }

  // Get available voices for a language
  public async getAvailableVoices(language: string = 'en'): Promise<Array<{
    id: string;
    name: string;
    gender: VoiceGender;
    accent?: string;
    description?: string;
  }>> {
    try {
      if (!config.AI.ELEVENLABS_API_KEY) {
        // Return mock data if API key not available
        return this.getMockVoices(language);
      }

      const response = await axios.get(
        'https://api.elevenlabs.io/v1/voices',
        {
          headers: {
            'xi-api-key': config.AI.ELEVENLABS_API_KEY,
          },
          timeout: 10000,
        }
      );

      const voices = response.data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        gender: this.inferGenderFromName(voice.name),
        accent: voice.labels?.accent,
        description: voice.description
      }));

      return voices.filter((voice: any) => 
        !language || voice.accent?.toLowerCase().includes(language.toLowerCase())
      );

    } catch (error) {
      logger.error('Failed to fetch voices:', error);
      // Return mock data as fallback
      return this.getMockVoices(language);
    }
  }

  // Helper method to map emotion to ElevenLabs style
  private mapEmotionToStyle(emotion: VoiceEmotion): number {
    const emotionMap: Record<VoiceEmotion, number> = {
      neutral: 0.5,
      happy: 0.8,
      sad: 0.2,
      excited: 0.9,
      calm: 0.3,
      angry: 0.7,
      professional: 0.4
    };

    return emotionMap[emotion] || 0.5;
  }

  // Helper method to infer gender from voice name
  private inferGenderFromName(name: string): VoiceGender {
    const maleNames = ['adam', 'antoni', 'arnold', 'bill', 'callum', 'charlie', 'daniel', 'ethan', 'fin', 'harry', 'james', 'jeremy', 'josh', 'liam', 'matilda', 'michael', 'sam', 'thomas', 'will'];
    const femaleNames = ['alice', 'aria', 'bella', 'charlotte', 'domi', 'dorothy', 'elli', 'emily', 'freya', 'giovanni', 'grace', 'jenna', 'mimi', 'natasha', 'nicole', 'rachel', 'sarah', 'serena'];
    
    const lowerName = name.toLowerCase();
    
    if (maleNames.some(male => lowerName.includes(male))) {
      return VoiceGender.MALE;
    }
    if (femaleNames.some(female => lowerName.includes(female))) {
      return VoiceGender.FEMALE;
    }
    
    return VoiceGender.NEUTRAL;
  }

  // Mock voices for development/fallback
  private getMockVoices(language: string): Array<{
    id: string;
    name: string;
    gender: VoiceGender;
    accent?: string;
    description?: string;
  }> {
    const mockVoices = [
      {
        id: 'mock_voice_1',
        name: 'Sarah',
        gender: VoiceGender.FEMALE,
        accent: 'American',
        description: 'A warm, friendly female voice'
      },
      {
        id: 'mock_voice_2',
        name: 'James',
        gender: VoiceGender.MALE,
        accent: 'British',
        description: 'A professional male voice with British accent'
      },
      {
        id: 'mock_voice_3',
        name: 'Aria',
        gender: VoiceGender.FEMALE,
        accent: 'American',
        description: 'A young, energetic female voice'
      }
    ];

    if (language === 'ar') {
      return [
        {
          id: 'mock_voice_ar_1',
          name: 'Fatima',
          gender: VoiceGender.FEMALE,
          accent: 'Arabic',
          description: 'A clear Arabic female voice'
        },
        {
          id: 'mock_voice_ar_2',
          name: 'Omar',
          gender: VoiceGender.MALE,
          accent: 'Arabic',
          description: 'A professional Arabic male voice'
        }
      ];
    }

    return mockVoices;
  }

  // Test AI service connections
  public async testConnections(): Promise<{
    stabilityAI: boolean;
    elevenLabs: boolean;
    openAI: boolean;
  }> {
    const results = {
      stabilityAI: false,
      elevenLabs: false,
      openAI: false
    };

    // Test Stability AI
    try {
      if (config.AI.STABILITY_AI_API_KEY) {
        await axios.get('https://api.stability.ai/v1/user/account', {
          headers: { 'Authorization': `Bearer ${config.AI.STABILITY_AI_API_KEY}` },
          timeout: 5000
        });
        results.stabilityAI = true;
      }
    } catch (error) {
      logger.warn('Stability AI connection test failed:', error);
    }

    // Test ElevenLabs
    try {
      if (config.AI.ELEVENLABS_API_KEY) {
        await axios.get('https://api.elevenlabs.io/v1/user', {
          headers: { 'xi-api-key': config.AI.ELEVENLABS_API_KEY },
          timeout: 5000
        });
        results.elevenLabs = true;
      }
    } catch (error) {
      logger.warn('ElevenLabs connection test failed:', error);
    }

    // Test OpenAI
    try {
      if (config.AI.OPENAI_API_KEY) {
        await axios.get('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${config.AI.OPENAI_API_KEY}` },
          timeout: 5000
        });
        results.openAI = true;
      }
    } catch (error) {
      logger.warn('OpenAI connection test failed:', error);
    }

    return results;
  }
}

export const aiService = new AIService();