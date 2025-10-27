import { AIOrchestrationService } from '../../../application/services/ai-orchestration.service';
import {
  AudioGenerationRequest,
  ImageGenerationRequest,
  TextGenerationRequest,
} from '../../../domain/interfaces/ai-orchestration.service.interface';
import { AIProvider } from '../../../domain/value-objects/ai-provider.value-object';
import { ChoiceType } from '../../../domain/value-objects/choice-type.value-object';

describe('AIOrchestrationService', () => {
  let service: AIOrchestrationService;

  beforeEach(() => {
    service = new AIOrchestrationService();

    // Enable providers for testing
    jest
      .spyOn(service, 'getProviderConfig')
      .mockImplementation(async (provider) => ({
        provider,
        model: 'test',
        maxTokens: 1000,
        temperature: 0.7,
        isEnabled: true,
        rateLimitPerMinute: 60,
        apiKey: '',
        baseUrl: '',
        costPer1kTokens: { input: 0.01, output: 0.02 },
      }));

    // Mock provider-specific generation methods
    jest
      .spyOn(service as any, 'generateWithMocked')
      .mockImplementation(async (request: any, config: any) => {
        return {
          success: true,
          content: `Mocked AI generated content for: ${request.prompt}`,
          generationTime: 100,
          tokensUsed: 50,
          provider: AIProvider.MOCKED,
          model: config.model,
        };
      });

    // Mock image generation with Mocked provider
    jest
      .spyOn(service as any, 'generateImageWithMocked')
      .mockImplementation(async (request: any, config: any) => {
        return {
          success: true,
          imageUrl: `https://mock-image.com/generated-${Date.now()}.jpg`,
          generationTime: 200,
          provider: AIProvider.MOCKED,
          model: config.model,
        };
      });

    // Mock audio generation with Mocked provider
    jest
      .spyOn(service as any, 'generateAudioWithMocked')
      .mockImplementation(async (request: any, config: any) => {
        return {
          success: true,
          audioUrl: `https://mock-audio.com/generated-${Date.now()}.mp3`,
          generationTime: 300,
          provider: AIProvider.MOCKED,
          model: config.model,
        };
      });
  });

  describe('generateText', () => {
    it('should generate text using Mocked provider', async () => {
      const request: TextGenerationRequest = {
        prompt: 'Write a story about a brave knight',
        provider: AIProvider.MOCKED,
        maxTokens: 500,
        temperature: 0.7,
        storyId: 'test-story-id',
        userId: 123,
      };

      const result = await service.generateText(request);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Mocked AI generated content');
      expect(result.provider).toBe(AIProvider.MOCKED);
    });
  });

  describe('generateImage', () => {
    it('should generate image using Mocked provider', async () => {
      const request: ImageGenerationRequest = {
        prompt: 'A beautiful landscape',
        provider: AIProvider.MOCKED,
        storyId: 'test-story-id',
        userId: 123,
      };

      const result = await service.generateImage(request);

      expect(result.success).toBe(true);
      expect(result.imageUrl).toContain('https://mock-image.com/generated-');
      expect(result.provider).toBe(AIProvider.MOCKED);
    });
  });

  describe('generateAudio', () => {
    it('should generate audio using Mocked provider', async () => {
      const request: AudioGenerationRequest = {
        prompt: 'A dramatic narration',
        provider: AIProvider.MOCKED,
        voice: 'narrator',
        storyId: 'test-story-id',
        userId: 123,
      };

      const result = await service.generateAudio(request);

      expect(result.success).toBe(true);
      expect(result.audioUrl).toContain('https://mock-audio.com/generated-');
      expect(result.provider).toBe(AIProvider.MOCKED);
    });
  });

  describe('getBestProvider', () => {
    it('should return Mocked for text generation', async () => {
      const provider = await service.getBestProvider('text');
      expect(provider).toBe(AIProvider.MOCKED);
    });

    it('should return null for image generation', async () => {
      const provider = await service.getBestProvider('image');
      expect(provider).toBe(null);
    });

    it('should return null for audio generation', async () => {
      const provider = await service.getBestProvider('audio');
      expect(provider).toBe(null);
    });
  });

  describe('checkProviderStatus', () => {
    it('should return provider status', async () => {
      const status = await service.checkProviderStatus(AIProvider.MOCKED);

      expect(status.provider).toBe(AIProvider.MOCKED);
      expect(status.isAvailable).toBe(true);
      expect(typeof status.responseTime).toBe('number');
    });
  });

  describe('testProvider', () => {
    it('should test provider successfully', async () => {
      const result = await service.testProvider(AIProvider.MOCKED);

      expect(result.success).toBe(true);
      expect(typeof result.responseTime).toBe('number');
    });
  });

  describe('generateChoices', () => {
    it('should generate story choices', async () => {
      const request = {
        prompt: 'Generate choices for the story',
        provider: AIProvider.MOCKED,
        currentContent: 'The hero stands at a crossroads...',
        choiceCount: 3,
        choiceTypes: [ChoiceType.ACTION, ChoiceType.DIALOGUE],
        storyId: 'test-story-id',
        userId: 123,
      };

      const choices = await service.generateChoices(request);

      expect(Array.isArray(choices)).toBe(true);
      expect(choices.length).toBeGreaterThan(0);
      expect(choices[0]).toHaveProperty('text');
      expect(choices[0]).toHaveProperty('type');
    });
  });
});
