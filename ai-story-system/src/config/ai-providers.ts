import { AIProvider } from '../domain/value-objects/ai-provider.value-object';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  isEnabled: boolean;
  rateLimitPerMinute?: number;
  costPer1kTokens?: {
    input: number;
    output: number;
  };
  metadata?: Record<string, any>;
}

export interface AIProvidersConfiguration {
  providers: Record<AIProvider, AIProviderConfig>;
  defaultProvider: AIProvider;
  fallbackProviders: AIProvider[];
  globalSettings: {
    enableFallback: boolean;
    maxRetries: number;
    timeoutMs: number;
    enableCaching: boolean;
    cacheExpiryMinutes: number;
    enableModeration: boolean;
    enableCostTracking: boolean;
  };
}

export const getAIProvidersConfig = (): AIProvidersConfiguration => {
  return {
    providers: {
      [AIProvider.MOCKED]: {
        provider: AIProvider.MOCKED,
        apiKey: '',
        model: 'test-model-v1',
        maxTokens: 4000,
        temperature: 0.7,
        isEnabled: true,
        rateLimitPerMinute: 0,
        costPer1kTokens: {
          input: 0.001,
          output: 0.001,
        },
        metadata: {
          description: 'Mocked AI provider for testing purposes',
          supportedModels: [
            'test-model-v1',
            'test-model-v2',
            'mock-gpt-4',
            'mock-gemini',
          ],
          capabilities: ['text', 'image', 'audio', 'choices'],
          deterministic: true,
        },
      },
    },
    defaultProvider:
      (process.env.DEFAULT_AI_PROVIDER as AIProvider) || AIProvider.MOCKED,
    fallbackProviders: [AIProvider.MOCKED],
    globalSettings: {
      enableFallback: process.env.AI_ENABLE_FALLBACK === 'true',
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
      timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '30000'),
      enableCaching: process.env.AI_ENABLE_CACHING === 'true',
      cacheExpiryMinutes: parseInt(process.env.AI_CACHE_EXPIRY_MINUTES || '60'),
      enableModeration: process.env.AI_ENABLE_MODERATION === 'true',
      enableCostTracking: process.env.AI_ENABLE_COST_TRACKING === 'true',
    },
  };
};

export const validateAIProviderConfig = (
  config: AIProviderConfig,
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!config.provider) {
    errors.push('Provider is required');
  }

  if (config.provider !== AIProvider.MOCKED && !config.apiKey) {
    errors.push('API key is required for AI providers');
  }

  if (config.maxTokens && (config.maxTokens < 1 || config.maxTokens > 32000)) {
    errors.push('Max tokens must be between 1 and 32000');
  }

  if (
    config.temperature &&
    (config.temperature < 0 || config.temperature > 2)
  ) {
    errors.push('Temperature must be between 0 and 2');
  }

  if (config.rateLimitPerMinute && config.rateLimitPerMinute < 0) {
    errors.push('Rate limit must be non-negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getEnabledProviders = (): AIProvider[] => {
  const config = getAIProvidersConfig();
  return Object.values(AIProvider).filter(
    (provider) => config.providers[provider]?.isEnabled,
  );
};

export const getProvidersByType = (
  type: 'text' | 'image' | 'audio',
): AIProvider[] => {
  const textProviders = [AIProvider.MOCKED];
  const imageProviders: AIProvider[] = []; // No image providers supported
  const audioProviders: AIProvider[] = []; // No audio providers supported

  switch (type) {
    case 'text':
      return textProviders;
    case 'image':
      return imageProviders;
    case 'audio':
      return audioProviders;
    default:
      return [];
  }
};

export const getBestProviderForType = (
  type: 'text' | 'image' | 'audio',
): AIProvider | null => {
  const config = getAIProvidersConfig();
  const providersForType = getProvidersByType(type);
  const enabledProviders = providersForType.filter(
    (provider) => config.providers[provider]?.isEnabled,
  );

  if (enabledProviders.length === 0) {
    return type === 'text' ? AIProvider.MOCKED : null;
  }

  // Return the first enabled provider (could be enhanced with load balancing)
  return enabledProviders[0];
};
