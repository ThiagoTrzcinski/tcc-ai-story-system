export enum AIProvider {
  MOCKED = 'mocked',
}

export enum AIProviderType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  MULTIMODAL = 'multimodal',
}

export class AIProviderVO {
  private constructor(
    private readonly value: AIProvider,
    private readonly type: AIProviderType,
  ) {}

  static create(provider: string, type: string): AIProviderVO {
    if (!Object.values(AIProvider).includes(provider as AIProvider)) {
      throw new Error(`Invalid AI provider: ${provider}`);
    }
    if (!Object.values(AIProviderType).includes(type as AIProviderType)) {
      throw new Error(`Invalid AI provider type: ${type}`);
    }
    return new AIProviderVO(provider as AIProvider, type as AIProviderType);
  }

  // Mocked (for testing)
  static mocked(): AIProviderVO {
    return new AIProviderVO(AIProvider.MOCKED, AIProviderType.MULTIMODAL);
  }

  getValue(): AIProvider {
    return this.value;
  }

  getType(): AIProviderType {
    return this.type;
  }

  toString(): string {
    return this.value;
  }

  equals(other: AIProviderVO): boolean {
    return this.value === other.value && this.type === other.type;
  }

  isTextProvider(): boolean {
    return (
      this.type === AIProviderType.TEXT ||
      this.type === AIProviderType.MULTIMODAL
    );
  }

  isImageProvider(): boolean {
    return (
      this.type === AIProviderType.IMAGE ||
      this.type === AIProviderType.MULTIMODAL
    );
  }

  isAudioProvider(): boolean {
    return (
      this.type === AIProviderType.AUDIO ||
      this.type === AIProviderType.MULTIMODAL
    );
  }

  isMultimodal(): boolean {
    return this.type === AIProviderType.MULTIMODAL;
  }

  isManual(): boolean {
    return false; // No manual provider in current configuration
  }

  isMocked(): boolean {
    return this.value === AIProvider.MOCKED;
  }

  getDisplayName(): string {
    const displayNames: Record<AIProvider, string> = {
      [AIProvider.MOCKED]: 'Mocked AI (Test)',
    };

    return displayNames[this.value];
  }

  getDescription(): string {
    const descriptions: Record<AIProvider, string> = {
      [AIProvider.MOCKED]: 'Mocked AI provider for testing purposes',
    };

    return descriptions[this.value];
  }

  getModels(): string[] {
    const models: Record<AIProvider, string[]> = {
      [AIProvider.MOCKED]: [
        'test',
        'mock',
        'test-model-v1',
        'test-model-v2',
        'mock-gpt-4',
        'mock-gemini',
      ],
    };

    return models[this.value];
  }

  getDefaultModel(): string | null {
    const defaultModels: Record<AIProvider, string | null> = {
      [AIProvider.MOCKED]: 'test',
    };

    return defaultModels[this.value];
  }

  requiresApiKey(): boolean {
    return this.value !== AIProvider.MOCKED;
  }

  supportsStreaming(): boolean {
    const streamingProviders: AIProvider[] = [];

    return streamingProviders.includes(this.value);
  }
}
