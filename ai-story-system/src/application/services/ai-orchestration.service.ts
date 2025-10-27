import { container, injectable } from 'tsyringe';
import {
  AIGenerationResult,
  AIProviderConfig,
  AIProviderStatus,
  AIUsageMetrics,
  AudioGenerationRequest,
  IAIOrchestrationService,
  ImageGenerationRequest,
  TextGenerationRequest,
} from '../../domain/interfaces/ai-orchestration.service.interface';
import { AIProvider } from '../../domain/value-objects/ai-provider.value-object';
import { ChoiceType } from '../../domain/value-objects/choice-type.value-object';

@injectable()
export class AIOrchestrationService implements IAIOrchestrationService {
  private providerConfigs: Map<AIProvider, AIProviderConfig> = new Map();
  private providerStatuses: Map<AIProvider, AIProviderStatus> = new Map();
  private usageMetrics: Map<AIProvider, AIUsageMetrics> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    // Initialize default configurations for providers
    const defaultConfigs: Partial<AIProviderConfig>[] = [
      {
        provider: AIProvider.MOCKED,
        model: 'test',
        maxTokens: 4000,
        temperature: 0.7,
        isEnabled: true,
        rateLimitPerMinute: 0,
      },
    ];

    defaultConfigs.forEach((config) => {
      if (config.provider) {
        this.providerConfigs.set(config.provider, {
          apiKey: '',
          isEnabled: false,
          ...config,
        } as AIProviderConfig);
      }
    });
  }

  async generateText(
    request: TextGenerationRequest,
  ): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      // Validate request
      const validation = this.validateRequest(request, 'text');
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid request: ${validation.errors.join(', ')}`,
          generationTime: Date.now() - startTime,
          provider: request.provider,
        };
      }

      // Check provider availability
      const providerStatus = await this.checkProviderStatus(request.provider);
      if (!providerStatus.isAvailable) {
        return {
          success: false,
          error: 'Provider is not available',
          generationTime: Date.now() - startTime,
          provider: request.provider,
        };
      }

      // Get provider configuration
      const config = await this.getProviderConfig(request.provider);
      if (!config || !config.isEnabled) {
        return {
          success: false,
          error: 'Provider is not configured or enabled',
          generationTime: Date.now() - startTime,
          provider: request.provider,
        };
      }

      // Generate content based on provider
      let result: AIGenerationResult;

      switch (request.provider) {
        case AIProvider.MOCKED:
          result = await this.generateWithMocked(request, config);
          break;
        default:
          result = {
            success: false,
            error: `Provider ${request.provider} not implemented`,
            generationTime: Date.now() - startTime,
            provider: request.provider,
          };
      }

      return result;
    } catch (error) {
      console.error('Error in text generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - startTime,
        provider: request.provider,
      };
    }
  }

  async generateImage(
    request: ImageGenerationRequest,
  ): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      // Validate request
      const validation = this.validateRequest(request, 'image');
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid request: ${validation.errors.join(', ')}`,
          generationTime: Date.now() - startTime,
          provider: request.provider,
        };
      }

      // Check provider availability
      const providerStatus = await this.checkProviderStatus(request.provider);
      if (!providerStatus.isAvailable) {
        return {
          success: false,
          error: 'Provider is not available',
          generationTime: Date.now() - startTime,
          provider: request.provider,
        };
      }

      // Get provider configuration
      const config = await this.getProviderConfig(request.provider);
      if (!config || !config.isEnabled) {
        return {
          success: false,
          error: 'Provider is not configured or enabled',
          generationTime: Date.now() - startTime,
          provider: request.provider,
        };
      }

      // Generate image based on provider
      let result: AIGenerationResult;

      switch (request.provider) {
        case AIProvider.MOCKED:
          result = await this.generateImageWithMocked(request, config);
          break;
        default:
          result = {
            success: false,
            error: `Image generation is not supported for provider: ${request.provider}`,
            generationTime: Date.now() - startTime,
            provider: request.provider,
          };
      }

      return result;
    } catch (error) {
      console.error('Error in image generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - startTime,
        provider: request.provider,
      };
    }
  }

  async generateAudio(
    request: AudioGenerationRequest,
  ): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      // Validate request
      const validation = this.validateRequest(request, 'audio');
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid request: ${validation.errors.join(', ')}`,
          generationTime: Date.now() - startTime,
          provider: request.provider,
        };
      }

      // Check provider availability
      const providerStatus = await this.checkProviderStatus(request.provider);
      if (!providerStatus.isAvailable) {
        return {
          success: false,
          error: 'Provider is not available',
          generationTime: Date.now() - startTime,
          provider: request.provider,
        };
      }

      // Get provider configuration
      const config = await this.getProviderConfig(request.provider);
      if (!config || !config.isEnabled) {
        return {
          success: false,
          error: 'Provider is not configured or enabled',
          generationTime: Date.now() - startTime,
          provider: request.provider,
        };
      }

      // Generate audio based on provider
      let result: AIGenerationResult;

      switch (request.provider) {
        case AIProvider.MOCKED:
          result = await this.generateAudioWithMocked(request, config);
          break;
        default:
          result = {
            success: false,
            error: `Audio generation is not supported for provider: ${request.provider}`,
            generationTime: Date.now() - startTime,
            provider: request.provider,
          };
      }

      return result;
    } catch (error) {
      console.error('Error in audio generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - startTime,
        provider: request.provider,
      };
    }
  }

  async generateCombinedContent(
    textRequest: TextGenerationRequest,
    imageRequest?: ImageGenerationRequest,
    audioRequest?: AudioGenerationRequest,
  ): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      const results: Partial<AIGenerationResult> = {
        success: true,
        generationTime: 0,
        provider: textRequest.provider,
      };

      // Generate text content
      const textResult = await this.generateText(textRequest);
      if (!textResult.success) {
        return textResult;
      }

      results.content = textResult.content;
      results.tokensUsed = textResult.tokensUsed;
      results.generationTime =
        (results.generationTime || 0) + textResult.generationTime;

      // Generate image if requested
      if (imageRequest) {
        const imageResult = await this.generateImage(imageRequest);
        if (imageResult.success) {
          results.imageUrl = imageResult.imageUrl;
        }
        results.generationTime =
          (results.generationTime || 0) + imageResult.generationTime;
      }

      // Generate audio if requested
      if (audioRequest) {
        const audioResult = await this.generateAudio(audioRequest);
        if (audioResult.success) {
          results.audioUrl = audioResult.audioUrl;
        }
        results.generationTime =
          (results.generationTime || 0) + audioResult.generationTime;
      }

      return results as AIGenerationResult;
    } catch (error) {
      console.error('Error in combined content generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - startTime,
        provider: textRequest.provider,
      };
    }
  }

  async generateChoices(
    request: TextGenerationRequest & {
      currentContent: string;
      choiceCount: number;
      choiceTypes?: ChoiceType[];
    },
  ): Promise<
    Array<{
      text: string;
      description: string;
      type: ChoiceType;
      consequences?: string;
    }>
  > {
    try {
      // Validate input - return empty array for invalid content
      if (!request.currentContent || request.currentContent.trim() === '') {
        return [];
      }

      // Create a specialized prompt for choice generation
      const choicePrompt = this.buildChoicePrompt(
        request.currentContent,
        request.choiceCount,
        request.choiceTypes,
        request.genre,
      );

      const choiceRequest: TextGenerationRequest = {
        ...request,
        prompt: choicePrompt,
        maxTokens: 1000,
        temperature: 0.8, // Higher temperature for more creative choices
      };

      const result = await this.generateText(choiceRequest);

      if (!result.success || !result.content) {
        return [];
      }

      // Parse the generated choices - always return exactly 4 choices
      return this.parseGeneratedChoices(result.content, 4);
    } catch (error) {
      console.error('Error generating choices:', error);
      return [];
    }
  }

  private buildChoicePrompt(
    currentContent: string,
    choiceCount: number,
    choiceTypes?: ChoiceType[],
    genre?: string,
  ): string {
    // Always generate exactly 4 choices as per requirements
    const targetChoiceCount = 4;

    let prompt = `Based on the following story content, generate exactly ${targetChoiceCount} meaningful and diverse choices for the reader:\n\n`;
    prompt += `Story Content: ${currentContent}\n\n`;

    if (genre) {
      prompt += `Genre: ${genre}\n\n`;
    }

    if (choiceTypes && choiceTypes.length > 0) {
      prompt += `Preferred choice types: ${choiceTypes.join(', ')}\n\n`;
    }

    prompt += `IMPORTANT: You must provide exactly ${targetChoiceCount} choices. Each choice should represent a different path forward in the story.\n\n`;
    prompt += `Please provide the choices in the following JSON format:\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "text": "Short choice text (max 50 characters)",\n`;
    prompt += `    "description": "Detailed description of what this choice leads to and its implications",\n`;
    prompt += `    "type": "narrative|dialogue|action|exploration",\n`;
    prompt += `    "consequences": "Brief description of potential consequences"\n`;
    prompt += `  }\n`;
    prompt += `]\n\n`;
    prompt += `Requirements:\n`;
    prompt += `- Each choice must be distinct and meaningful\n`;
    prompt += `- Choices should advance the story in different directions\n`;
    prompt += `- Use varied choice types: NARRATIVE, DIALOGUE, ACTION, EXPLORATION\n`;
    prompt += `- Text should be concise but engaging\n`;
    prompt += `- Description should be detailed and immersive\n`;
    prompt += `- Return valid JSON only, no additional text`;

    return prompt;
  }

  private parseGeneratedChoices(
    content: string,
    expectedCount: number,
  ): Array<{
    text: string;
    description: string;
    type: ChoiceType;
    consequences?: string;
  }> {
    try {
      // Always target 4 choices as per requirements
      const targetCount = 4;

      // Try to extract JSON from the content
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return this.generateFallbackChoices();
      }

      const choices = JSON.parse(jsonMatch[0]);

      const parsedChoices = choices
        .slice(0, targetCount)
        .map((choice: any) => ({
          text: choice.text || '',
          description: choice.description || '',
          type: this.parseChoiceType(choice.type),
          consequences: choice.consequences,
        }))
        .filter((choice: any) => choice.text && choice.description);

      // Ensure we always have exactly 4 choices
      while (parsedChoices.length < targetCount) {
        parsedChoices.push(
          this.generateDefaultChoice(parsedChoices.length + 1),
        );
      }

      return parsedChoices.slice(0, targetCount);
    } catch (error) {
      console.error('Error parsing generated choices:', error);
      return this.generateFallbackChoices();
    }
  }

  private parseChoiceType(typeString: string): ChoiceType {
    const typeMap: Record<string, ChoiceType> = {
      narrative: ChoiceType.NARRATIVE,
      dialogue: ChoiceType.DIALOGUE,
      action: ChoiceType.ACTION,
      moral: ChoiceType.MORAL,
      strategic: ChoiceType.STRATEGIC,
      exploration: ChoiceType.EXPLORATION,
      relationship: ChoiceType.RELATIONSHIP,
      skill_check: ChoiceType.SKILL_CHECK,
      inventory: ChoiceType.INVENTORY,
      ending: ChoiceType.ENDING,
    };

    return typeMap[typeString?.toLowerCase()] || ChoiceType.NARRATIVE;
  }

  private generateFallbackChoices(): Array<{
    text: string;
    description: string;
    type: ChoiceType;
    consequences?: string;
  }> {
    return [
      {
        text: 'Continue forward',
        description:
          'Move ahead with the current situation and see what happens next.',
        type: ChoiceType.NARRATIVE,
        consequences: 'The story progresses naturally.',
      },
      {
        text: 'Look around carefully',
        description:
          'Take time to observe your surroundings and gather more information.',
        type: ChoiceType.EXPLORATION,
        consequences: 'You might discover important details.',
      },
      {
        text: 'Take action',
        description:
          'Act decisively based on your current understanding of the situation.',
        type: ChoiceType.ACTION,
        consequences: 'Your actions will have immediate consequences.',
      },
      {
        text: 'Start a conversation',
        description:
          'Engage with someone nearby to learn more about the situation.',
        type: ChoiceType.DIALOGUE,
        consequences: 'You might gain valuable insights or allies.',
      },
    ];
  }

  private generateDefaultChoice(index: number): {
    text: string;
    description: string;
    type: ChoiceType;
    consequences?: string;
  } {
    const defaultChoices = [
      {
        text: 'Continue the story',
        description: 'Move forward with the current narrative thread.',
        type: ChoiceType.NARRATIVE,
      },
      {
        text: 'Explore the area',
        description: 'Take time to investigate your surroundings.',
        type: ChoiceType.EXPLORATION,
      },
      {
        text: 'Take immediate action',
        description: 'Act quickly based on your instincts.',
        type: ChoiceType.ACTION,
      },
      {
        text: 'Engage in dialogue',
        description: 'Speak with someone to gather information.',
        type: ChoiceType.DIALOGUE,
      },
    ];

    const choiceIndex = (index - 1) % defaultChoices.length;
    return {
      ...defaultChoices[choiceIndex],
      consequences: 'This choice will influence the story direction.',
    };
  }

  // Provider-specific implementation methods
  private async generateWithMocked(
    request: TextGenerationRequest,
    config: AIProviderConfig,
  ): Promise<AIGenerationResult> {
    try {
      const startTime = Date.now();

      // Get the mocked AI service from DI container
      const mockedService = container.resolve('MockedAIService') as any;
      if (!mockedService) {
        throw new Error('Mocked AI service not available');
      }

      // Generate content using the mocked service with story context
      const content = await mockedService.generateText(request.prompt, {
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        model: config.model,
        storyId: request.storyId,
        currentContentCount: request.currentContentCount,
      });

      const generationTime = Date.now() - startTime;

      return {
        success: true,
        content,
        generationTime,
        tokensUsed: Math.floor(content.length / 4), // Approximate token count
        provider: AIProvider.MOCKED,
        model: config.model,
      };
    } catch (error) {
      console.error('Error in mocked generation:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error in mocked generation',
        generationTime: 100,
        provider: AIProvider.MOCKED,
        model: config.model,
      };
    }
  }

  /**
   * Generate image with mocked provider
   */
  private async generateImageWithMocked(
    request: ImageGenerationRequest,
    config: AIProviderConfig,
  ): Promise<AIGenerationResult> {
    try {
      const startTime = Date.now();

      const mockedService = container.resolve('MockedAIService') as any;
      if (!mockedService) {
        throw new Error('Mocked AI service not available');
      }

      const imageUrl = await mockedService.generateImage(request.prompt, {
        size: request.size,
        style: request.style,
        quality: request.quality,
        model: config.model,
        storyId: request.storyId,
        currentContentCount: (request as any).currentContentCount,
      });

      const generationTime = Date.now() - startTime;

      return {
        success: true,
        imageUrl,
        generationTime,
        tokensUsed: 0, // No tokens for image generation
        provider: AIProvider.MOCKED,
        model: config.model,
      };
    } catch (error) {
      console.error('Error in mocked image generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - Date.now(),
        provider: AIProvider.MOCKED,
      };
    }
  }

  /**
   * Generate audio with mocked provider
   */
  private async generateAudioWithMocked(
    request: AudioGenerationRequest,
    config: AIProviderConfig,
  ): Promise<AIGenerationResult> {
    try {
      const startTime = Date.now();

      const mockedService = container.resolve('MockedAIService') as any;
      if (!mockedService) {
        throw new Error('Mocked AI service not available');
      }

      const audioUrl = await mockedService.generateAudio(request.prompt, {
        voice: request.voice,
        speed: request.speed,
        format: request.format,
        model: config.model,
        storyId: request.storyId,
        currentContentCount: (request as any).currentContentCount,
      });

      const generationTime = Date.now() - startTime;

      return {
        success: true,
        audioUrl,
        generationTime,
        tokensUsed: 0, // No tokens for audio generation
        provider: AIProvider.MOCKED,
        model: config.model,
      };
    } catch (error) {
      console.error('Error in mocked audio generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - Date.now(),
        provider: AIProvider.MOCKED,
      };
    }
  }

  // Remaining interface methods with placeholder implementations
  async getBestProvider(
    type: 'text' | 'image' | 'audio',
    requirements?: {
      maxResponseTime?: number;
      minQuality?: number;
      maxCost?: number;
    },
  ): Promise<AIProvider | null> {
    // Simple implementation - return first available provider for the type
    const providers = {
      text: [AIProvider.MOCKED],
      image: [], // No image providers supported
      audio: [], // No audio providers supported
    };
    return providers[type]?.[0] || null;
  }
  async checkProviderStatus(provider: AIProvider): Promise<AIProviderStatus> {
    return {
      provider,
      isAvailable: true,
      responseTime: 1000,
      errorRate: 0.01,
      lastChecked: new Date(),
      currentLoad: 0.5,
    };
  }

  async getProviderConfig(
    provider: AIProvider,
  ): Promise<AIProviderConfig | null> {
    return this.providerConfigs.get(provider) || null;
  }
  async testProvider(provider: AIProvider): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();
      // Simple test - just check if provider is configured
      const config = this.providerConfigs.get(provider);
      const responseTime = Date.now() - startTime;

      return {
        success: !!config,
        responseTime,
        error: config ? undefined : `Provider ${provider} not configured`,
      };
    } catch (error) {
      return {
        success: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async estimateCost(request: {
    provider: AIProvider;
    inputTokens: number;
    outputTokens: number;
  }): Promise<number> {
    const config = this.providerConfigs.get(request.provider);
    if (!config) {
      return 0;
    }

    const inputCost = request.inputTokens * (config.costPerToken || 0.001);
    const outputCost = request.outputTokens * (config.costPerToken || 0.001);

    return inputCost + outputCost;
  }
  async getAvailableModels(): Promise<string[]> {
    return [];
  }

  validateRequest(
    request: any,
    type: string,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.prompt || request.prompt.length < 10) {
      errors.push('Prompt must be at least 10 characters long');
    }

    if (request.prompt && request.prompt.length > 5000) {
      errors.push('Prompt must be less than 5000 characters');
    }

    return { isValid: errors.length === 0, errors };
  }

  async retryWithFallback(): Promise<AIGenerationResult> {
    return {
      success: false,
      error: 'Not implemented',
      generationTime: 0,
      provider: AIProvider.MOCKED,
    };
  }
  async cancelGeneration(): Promise<boolean> {
    return true;
  }
  async optimizePrompt(prompt: string): Promise<string> {
    return prompt;
  }
  async moderateContent(content: string): Promise<{
    flagged: boolean;
    categories: string[];
    confidence: number;
  }> {
    // Simple content moderation - check for basic inappropriate content
    const inappropriateWords = ['spam', 'hate', 'violence', 'explicit'];
    const lowerContent = content.toLowerCase();

    const flaggedCategories: string[] = [];
    for (const word of inappropriateWords) {
      if (lowerContent.includes(word)) {
        flaggedCategories.push(word);
      }
    }

    return {
      flagged: flaggedCategories.length > 0,
      categories: flaggedCategories,
      confidence: flaggedCategories.length > 0 ? 0.8 : 0.1,
    };
  }

  async summarizeContent(content: string): Promise<string> {
    return content;
  }
  async enhanceContent(content: string): Promise<string> {
    return content;
  }
}
