import { AIProvider } from '../../../domain/value-objects/ai-provider.value-object';
import { MockedAIService } from '../../../infrastructure/services/ai-providers/mocked-ai.service';

describe('MockedAIService', () => {
  let service: MockedAIService;

  beforeEach(() => {
    service = new MockedAIService();
  });

  describe('getProvider', () => {
    it('should return MOCKED provider type', () => {
      expect(service.getProvider()).toBe(AIProvider.MOCKED);
    });
  });

  describe('generateText', () => {
    it('should return deterministic story content by default', async () => {
      const result = await service.generateText('Tell me a story');

      expect(result).toContain(
        'Era uma vez, em um reino distante chamado Eldoria',
      );
      expect(result).toContain('Cristal da Harmonia');
      expect(result).toContain('princesa Lyra');
    });

    it('should return choices JSON when prompt contains "choice"', async () => {
      const result = await service.generateText(
        'Generate choices for the story',
      );

      const choices = JSON.parse(result);
      expect(choices).toHaveLength(4);
      expect(choices[0]).toEqual({
        text: 'Partir imediatamente para a Floresta Sombria',
        description: 'Seguir a primeira pista do pergaminho sem demora',
        type: 'action',
      });
    });

    it('should return choices JSON when prompt contains "escolha"', async () => {
      const result = await service.generateText(
        'Gere escolhas para a história',
      );

      const choices = JSON.parse(result);
      expect(choices).toHaveLength(4);
      expect(choices[1]).toEqual({
        text: 'Reunir mais informações na biblioteca',
        description:
          'Pesquisar mais sobre o Cristal da Harmonia antes de partir',
        type: 'exploration',
      });
    });

    it('should return continuation text when prompt contains "continue"', async () => {
      const result = await service.generateText('Continue the story');

      expect(result).toContain(
        'Era uma vez, em um reino distante chamado Eldoria',
      );
      expect(result).toContain(
        'A história continua com novos desenvolvimentos emocionantes...',
      );
    });

    it('should return continuation text when prompt contains "continuar"', async () => {
      const result = await service.generateText('Continuar a história');

      expect(result).toContain(
        'Era uma vez, em um reino distante chamado Eldoria',
      );
      expect(result).toContain(
        'A história continua com novos desenvolvimentos emocionantes...',
      );
    });

    it('should accept options parameter without affecting output', async () => {
      const result = await service.generateText('Tell me a story', {
        maxTokens: 1000,
        temperature: 0.5,
        model: 'test-model',
      });

      expect(result).toContain(
        'Era uma vez, em um reino distante chamado Eldoria',
      );
      expect(result).toContain('Cristal da Harmonia');
      expect(result).toContain('princesa Lyra');
    });
  });

  describe('generateImage', () => {
    it('should return default mock image URL', async () => {
      const result = await service.generateImage('A beautiful landscape');

      expect(result).toBe('https://example.com/mock-story-image.jpg');
    });

    it('should return forest image URL when prompt contains "forest"', async () => {
      const result = await service.generateImage('A magical forest scene');

      expect(result).toBe('https://example.com/mock-forest-image.jpg');
    });

    it('should return forest image URL when prompt contains "floresta"', async () => {
      const result = await service.generateImage('Uma floresta mágica');

      expect(result).toBe('https://example.com/mock-forest-image.jpg');
    });

    it('should return character image URL when prompt contains "character"', async () => {
      const result = await service.generateImage('A brave character');

      expect(result).toBe('https://example.com/mock-character-image.jpg');
    });

    it('should return character image URL when prompt contains "personagem"', async () => {
      const result = await service.generateImage('Um personagem corajoso');

      expect(result).toBe('https://example.com/mock-character-image.jpg');
    });

    it('should accept options parameter without affecting output', async () => {
      const result = await service.generateImage('A landscape', {
        size: 'large',
        quality: 'hd',
        style: 'realistic',
      });

      expect(result).toBe('https://example.com/mock-story-image.jpg');
    });
  });

  describe('generateAudio', () => {
    it('should return default mock audio URL', async () => {
      const result = await service.generateAudio('Read this text aloud');

      expect(result).toBe('https://example.com/mock-story-audio.mp3');
    });

    it('should return dramatic audio URL when prompt contains "dramatic"', async () => {
      const result = await service.generateAudio('This is a dramatic scene');

      expect(result).toBe('https://example.com/mock-dramatic-audio.mp3');
    });

    it('should return dramatic audio URL when prompt contains "dramático"', async () => {
      const result = await service.generateAudio('Esta é uma cena dramática');

      expect(result).toBe('https://example.com/mock-dramatic-audio.mp3');
    });

    it('should return calm audio URL when prompt contains "calm"', async () => {
      const result = await service.generateAudio('This is a calm narration');

      expect(result).toBe('https://example.com/mock-calm-audio.mp3');
    });

    it('should return calm audio URL when prompt contains "calmo"', async () => {
      const result = await service.generateAudio('Esta é uma narração calma');

      expect(result).toBe('https://example.com/mock-calm-audio.mp3');
    });

    it('should accept options parameter without affecting output', async () => {
      const result = await service.generateAudio('Read this text', {
        voice: 'female',
        speed: 1.2,
        format: 'mp3',
      });

      expect(result).toBe('https://example.com/mock-story-audio.mp3');
    });
  });

  describe('isAvailable', () => {
    it('should always return true', async () => {
      const result = await service.isAvailable();

      expect(result).toBe(true);
    });
  });

  describe('getModels', () => {
    it('should return list of mock models', async () => {
      const result = await service.getModels();

      expect(result).toEqual([
        'test-model-v1',
        'test-model-v2',
        'mock-gpt-4',
        'mock-gemini',
        'mock-claude',
      ]);
    });
  });

  describe('estimateCost', () => {
    it('should return calculated mock cost', async () => {
      const result = await service.estimateCost(100, 50);

      expect(result).toBe(0.15); // (100 + 50) * 0.001
    });

    it('should accept model parameter without affecting calculation', async () => {
      const result = await service.estimateCost(200, 100, 'test-model');

      expect(result).toBe(0.3); // (200 + 100) * 0.001
    });
  });

  describe('moderateContent', () => {
    it('should return safe content for normal text', async () => {
      const result = await service.moderateContent(
        'This is a normal story text',
      );

      expect(result).toEqual({
        flagged: false,
        categories: [],
        confidence: 0.05,
      });
    });

    it('should flag inappropriate content', async () => {
      const result = await service.moderateContent(
        'This contains inappropriate content',
      );

      expect(result).toEqual({
        flagged: true,
        categories: ['mock-violation'],
        confidence: 0.95,
      });
    });

    it('should flag harmful content', async () => {
      const result = await service.moderateContent(
        'This contains harmful material',
      );

      expect(result).toEqual({
        flagged: true,
        categories: ['mock-violation'],
        confidence: 0.95,
      });
    });
  });

  describe('getConfig', () => {
    it('should return provider configuration', () => {
      const result = service.getConfig();

      expect(result).toEqual({
        name: AIProvider.MOCKED,
        model: 'test-model-v1',
        type: 'mock',
        description: 'Mocked AI provider for testing purposes',
        capabilities: ['text', 'image', 'audio', 'choices'],
        costPerToken: 0.001,
      });
    });
  });
});
