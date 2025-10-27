import { AIProvider } from '../value-objects/ai-provider.value-object';
import { ChoiceType } from '../value-objects/choice-type.value-object';

export interface AIGenerationRequestDto {
  prompt: string;
  context?: string;
  storyId: string;
  userId: number;
  parentContentId?: string;
  genre?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface TextGenerationRequestDto extends AIGenerationRequestDto {
  provider: AIProvider;
  includeChoices?: boolean;
  choiceCount?: number;
  choiceTypes?: ChoiceType[];
}

export interface ImageGenerationRequestDto extends AIGenerationRequestDto {
  provider: AIProvider;
  style?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  quality?: 'standard' | 'hd';
  size?: 'small' | 'medium' | 'large';
}

export interface AudioGenerationRequestDto extends AIGenerationRequestDto {
  provider: AIProvider;
  voice?: string;
  speed?: number;
  pitch?: number;
  format?: 'mp3' | 'wav' | 'ogg';
  quality?: 'standard' | 'high';
}

export interface AIGenerationResultDto {
  success: boolean;
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
  choices?: Array<{
    text: string;
    type: ChoiceType;
  }>;
  metadata?: Record<string, any>;
  generationTime: number;
  tokensUsed?: number;
  cost?: number;
  error?: string;
  provider: AIProvider;
  model?: string;
}

export interface AIProviderConfigDto {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  isEnabled: boolean;
  rateLimitPerMinute?: number;
  costPerToken?: number;
  metadata?: Record<string, any>;
}

export interface AIProviderStatusDto {
  provider: AIProvider;
  isAvailable: boolean;
  responseTime: number;
  errorRate: number;
  lastChecked: Date;
  currentLoad: number;
  rateLimitRemaining?: number;
}

export interface AIUsageMetricsDto {
  provider: AIProvider;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  averageTokensPerRequest: number;
  requestsByType: Record<string, number>;
  dailyUsage: Array<{ date: Date; requests: number; tokens: number; cost: number }>;
}

export interface GenerateChoicesRequestDto {
  storyId: string;
  currentContent: string;
  choiceCount: number;
  choiceTypes?: ChoiceType[];
  provider: AIProvider;
  genre?: string;
  tone?: string;
}

export interface GenerateChoicesResultDto {
  choices: Array<{
    text: string;
    type: ChoiceType;
  }>;
  generationTime: number;
  tokensUsed?: number;
  cost?: number;
  provider: AIProvider;
}

export interface ProviderTestRequestDto {
  provider: AIProvider;
}

export interface ProviderTestResultDto {
  success: boolean;
  responseTime: number;
  error?: string;
}

export interface CostEstimationRequestDto {
  provider: AIProvider;
  inputTokens: number;
  outputTokens: number;
}

export interface CostEstimationResultDto {
  estimatedCost: number;
  provider: AIProvider;
  breakdown: {
    inputCost: number;
    outputCost: number;
    totalTokens: number;
  };
}

export interface ContentModerationRequestDto {
  content: string;
}

export interface ContentModerationResultDto {
  flagged: boolean;
  categories: string[];
  confidence: number;
}

export interface OptimizePromptRequestDto {
  prompt: string;
  type: 'text' | 'image' | 'audio';
  genre?: string;
}

export interface OptimizePromptResultDto {
  optimizedPrompt: string;
  improvements: string[];
  confidence: number;
}

export interface ValidateRequestDto {
  request: AIGenerationRequestDto;
  type: 'text' | 'image' | 'audio';
}

export interface ValidateRequestResultDto {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QueueStatusDto {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
}

export interface CombinedGenerationRequestDto {
  textRequest: TextGenerationRequestDto;
  imageRequest?: ImageGenerationRequestDto;
  audioRequest?: AudioGenerationRequestDto;
}

export interface CombinedGenerationResultDto extends AIGenerationResultDto {
  textContent?: string;
  imageUrl?: string;
  audioUrl?: string;
  breakdown: {
    textGeneration?: AIGenerationResultDto;
    imageGeneration?: AIGenerationResultDto;
    audioGeneration?: AIGenerationResultDto;
  };
}
