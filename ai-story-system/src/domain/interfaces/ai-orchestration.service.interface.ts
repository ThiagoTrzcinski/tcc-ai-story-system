import { AIProvider } from '../value-objects/ai-provider.value-object';
import { ChoiceType } from '../value-objects/choice-type.value-object';

export interface AIGenerationRequest {
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

export interface TextGenerationRequest extends AIGenerationRequest {
  provider: AIProvider;
  includeChoices?: boolean;
  choiceCount?: number;
  choiceTypes?: ChoiceType[];
  currentContentCount?: number;
}

export interface ImageGenerationRequest extends AIGenerationRequest {
  provider: AIProvider;
  style?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  quality?: 'standard' | 'hd';
  size?: 'small' | 'medium' | 'large';
}

export interface AudioGenerationRequest extends AIGenerationRequest {
  provider: AIProvider;
  voice?: string;
  speed?: number;
  pitch?: number;
  format?: 'mp3' | 'wav' | 'ogg';
  quality?: 'standard' | 'high';
}

export interface AIGenerationResult {
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

export interface AIProviderConfig {
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

export interface AIProviderStatus {
  provider: AIProvider;
  isAvailable: boolean;
  responseTime: number;
  errorRate: number;
  lastChecked: Date;
  currentLoad: number;
  rateLimitRemaining?: number;
}

export interface AIUsageMetrics {
  provider: AIProvider;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  averageTokensPerRequest: number;
  requestsByType: Record<string, number>;
  dailyUsage: Array<{
    date: Date;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export interface IAIOrchestrationService {
  /**
   * Generates text content using AI
   */
  generateText(request: TextGenerationRequest): Promise<AIGenerationResult>;

  /**
   * Generates image content using AI
   */
  generateImage(request: ImageGenerationRequest): Promise<AIGenerationResult>;

  /**
   * Generates audio content using AI
   */
  generateAudio(request: AudioGenerationRequest): Promise<AIGenerationResult>;

  /**
   * Generates combined content (text + image + audio)
   */
  generateCombinedContent(
    textRequest: TextGenerationRequest,
    imageRequest?: ImageGenerationRequest,
    audioRequest?: AudioGenerationRequest,
  ): Promise<AIGenerationResult>;

  /**
   * Generates story choices using AI
   */
  generateChoices(
    request: TextGenerationRequest & {
      currentContent: string;
      choiceCount: number;
      choiceTypes?: ChoiceType[];
    },
  ): Promise<
    Array<{
      text: string;
      type: ChoiceType;
    }>
  >;

  /**
   * Gets the best available provider for a request type
   */
  getBestProvider(
    type: 'text' | 'image' | 'audio',
    requirements?: {
      maxResponseTime?: number;
      minQuality?: number;
      maxCost?: number;
    },
  ): Promise<AIProvider | null>;

  /**
   * Checks provider availability and status
   */
  checkProviderStatus(provider: AIProvider): Promise<AIProviderStatus>;

  /**
   * Gets provider configuration
   */
  getProviderConfig(provider: AIProvider): Promise<AIProviderConfig | null>;

  /**
   * Tests a provider configuration
   */
  testProvider(provider: AIProvider): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }>;

  /**
   * Estimates cost for a generation request
   */
  estimateCost(request: {
    provider: AIProvider;
    inputTokens: number;
    outputTokens: number;
  }): Promise<number>;

  /**
   * Gets available models for a provider
   */
  getAvailableModels(provider: AIProvider): Promise<string[]>;

  /**
   * Validates a generation request
   */
  validateRequest(
    request: AIGenerationRequest,
    type: 'text' | 'image' | 'audio',
  ): { isValid: boolean; errors: string[] };

  /**
   * Gets content moderation results
   */
  moderateContent(content: string): Promise<{
    flagged: boolean;
    categories: string[];
    confidence: number;
  }>;
}
