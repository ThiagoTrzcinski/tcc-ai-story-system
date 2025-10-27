import { AIGenerationResultDto } from '../../domain/dtos/ai-generation.dto';
import { IAIProvider } from '../../domain/interfaces/ai-provider.interface';
import { AIProvider } from '../../domain/value-objects/ai-provider.value-object';

export interface MockAIProviderConfig {
  shouldSucceed?: boolean;
  responseTime?: number;
  tokenCount?: number;
  errorMessage?: string;
  customResponse?: Partial<AIGenerationResultDto>;
}

export class MockAIProvider implements IAIProvider {
  private config: MockAIProviderConfig;
  private provider: AIProvider;

  constructor(provider: AIProvider, config: MockAIProviderConfig = {}) {
    this.provider = provider;
    this.config = {
      shouldSucceed: true,
      responseTime: 100,
      tokenCount: 50,
      errorMessage: 'Mock AI provider error',
      ...config,
    };
  }

  getProvider(): AIProvider {
    return this.provider;
  }

  async generateText(
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    },
  ): Promise<string> {
    await this.simulateDelay();

    if (!this.config.shouldSucceed) {
      throw new Error(this.config.errorMessage || 'Mock AI provider error');
    }

    return this.generateMockTextContent(prompt);
  }

  async generateImage(
    prompt: string,
    options?: {
      size?: 'small' | 'medium' | 'large';
      style?: string;
      quality?: 'standard' | 'hd';
      model?: string;
    },
  ): Promise<string> {
    await this.simulateDelay();

    if (!this.config.shouldSucceed) {
      throw new Error(this.config.errorMessage || 'Mock AI provider error');
    }

    return this.generateMockImageUrl(prompt);
  }

  async generateAudio(
    prompt: string,
    options?: {
      voice?: string;
      speed?: number;
      format?: 'mp3' | 'wav' | 'ogg';
      model?: string;
    },
  ): Promise<string> {
    await this.simulateDelay();

    if (!this.config.shouldSucceed) {
      throw new Error(this.config.errorMessage || 'Mock AI provider error');
    }

    return this.generateMockAudioUrl(prompt);
  }

  async isAvailable(): Promise<boolean> {
    return this.config.shouldSucceed ?? true;
  }

  async getModels(): Promise<string[]> {
    const models: Record<string, string[]> = {
      [AIProvider.MOCKED]: [
        'test',
        'mock',
        'test-model-v1',
        'test-model-v2',
        'mock-gpt-4',
        'mock-gemini',
      ],
    };
    return models[this.provider] || ['mock-model'];
  }

  async estimateCost(
    inputTokens: number,
    outputTokens: number,
  ): Promise<number> {
    return (inputTokens + outputTokens) * 0.001; // Mock cost calculation
  }

  async moderateContent(content: string): Promise<{
    flagged: boolean;
    categories: string[];
    confidence: number;
  }> {
    // Simple mock moderation
    const flagged = content.toLowerCase().includes('inappropriate');
    return {
      flagged,
      categories: flagged ? ['inappropriate'] : [],
      confidence: 0.9,
    };
  }

  private async simulateDelay(): Promise<void> {
    if (this.config.responseTime && this.config.responseTime > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.responseTime),
      );
    }
  }

  private generateMockTextContent(prompt: string): string {
    // Check if this is a choice generation request
    if (
      prompt.includes('meaningful choices for the reader') ||
      (prompt.includes('generate') &&
        prompt.includes('choices') &&
        prompt.includes('JSON format'))
    ) {
      return this.generateMockChoicesResponse();
    }

    const responses: Record<string, string> = {
      [AIProvider.MOCKED]: `Mocked AI generated response for: "${prompt}"`,
    };

    return (
      responses[this.provider] || `Mock AI generated response for: "${prompt}"`
    );
  }

  private generateMockChoicesResponse(): string {
    const mockChoices = [
      {
        text: 'Take the left path through the dark forest',
        description: 'A mysterious path that leads deeper into the unknown',
        type: 'exploration',
        consequences:
          'May encounter dangerous creatures but could find hidden treasures',
      },
      {
        text: 'Take the right path toward the village',
        description: 'A safer route that leads to civilization',
        type: 'narrative',
        consequences: 'Safer journey but may miss important discoveries',
      },
      {
        text: 'Set up camp and wait until morning',
        description: 'Rest and gather strength before making a decision',
        type: 'strategic',
        consequences:
          'Gain rest but lose time, and night creatures may find you',
      },
    ];

    return JSON.stringify(mockChoices, null, 2);
  }

  private generateMockImageUrl(prompt: string): string {
    const hash = this.simpleHash(prompt);
    return `https://mock-ai-images.com/${this.provider}/${hash}.jpg`;
  }

  private generateMockAudioUrl(prompt: string): string {
    const hash = this.simpleHash(prompt);
    return `https://mock-ai-audio.com/${this.provider}/${hash}.mp3`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Configuration methods for testing
  setConfig(config: Partial<MockAIProviderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setShouldSucceed(shouldSucceed: boolean): void {
    this.config.shouldSucceed = shouldSucceed;
  }

  setResponseTime(responseTime: number): void {
    this.config.responseTime = responseTime;
  }

  setTokenCount(tokenCount: number): void {
    this.config.tokenCount = tokenCount;
  }

  setErrorMessage(errorMessage: string): void {
    this.config.errorMessage = errorMessage;
  }
}

// Factory functions for creating mock providers
export function createMockAIProvider(
  config?: MockAIProviderConfig,
): MockAIProvider {
  return new MockAIProvider(AIProvider.MOCKED, config);
}

// Helper function to create a failing mock provider
export function createFailingMockProvider(
  provider: AIProvider,
  errorMessage?: string,
): MockAIProvider {
  return new MockAIProvider(provider, {
    shouldSucceed: false,
    errorMessage: errorMessage || `Mock ${provider} provider failure`,
  });
}

// Helper function to create a slow mock provider
export function createSlowMockProvider(
  provider: AIProvider,
  responseTime: number,
): MockAIProvider {
  return new MockAIProvider(provider, {
    responseTime,
  });
}
