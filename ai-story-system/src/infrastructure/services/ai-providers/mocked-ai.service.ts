import { injectable } from 'tsyringe';
import { IAIProvider } from '../../../domain/interfaces/ai-provider.interface';
import { AIProvider } from '../../../domain/value-objects/ai-provider.value-object';

/**
 * Mocked AI Service for testing purposes
 * Returns deterministic, hard-coded responses to ensure reproducible tests
 */
@injectable()
export class MockedAIService implements IAIProvider {
  /**
   * Mock configuration for the service
   */
  private readonly mockConfig = {
    defaultModel: 'test-model-v1',
    responseDelay: 0, // No delay for tests
    costPerToken: 0.001, // Mock cost
  };

  /**
   * Predefined mock story segments for consistent testing
   */
  private readonly mockStorySegments = [
    {
      content: `Era uma vez, em um reino distante chamado Eldoria, onde a magia fluía através das montanhas cobertas de neve e florestas encantadas. A jovem princesa Lyra descobriu um antigo pergaminho em sua biblioteca, revelando a existência de um artefato perdido conhecido como o Cristal da Harmonia. Este cristal tinha o poder de restaurar o equilíbrio entre os reinos mágicos que estavam em guerra há décadas.

Determinada a trazer paz para seu povo, Lyra decidiu embarcar em uma jornada perigosa para encontrar o cristal. Ela sabia que não poderia fazer isso sozinha, então reuniu um grupo de companheiros leais: Kael, um guerreiro élfico habilidoso com a espada; Mira, uma maga especialista em feitiços de proteção; e Thorin, um anão conhecedor dos segredos das montanhas antigas.`,
      hasChoices: true,
      choices: [
        {
          text: 'Partir imediatamente para a Floresta Sombria',
          description: 'Seguir a primeira pista do pergaminho sem demora',
          type: 'action',
        },
        {
          text: 'Reunir mais informações na biblioteca',
          description:
            'Pesquisar mais sobre o Cristal da Harmonia antes de partir',
          type: 'exploration',
        },
        {
          text: 'Recrutar mais companheiros',
          description: 'Buscar outros heróis para fortalecer o grupo',
          type: 'relationship',
        },
        {
          text: 'Consultar o conselho real',
          description: 'Pedir orientação aos sábios do reino',
          type: 'dialogue',
        },
      ],
    },
    {
      content: `A primeira pista do pergaminho levou o grupo à Floresta Sombria, um lugar onde poucos se aventuravam e ainda menos retornavam. As árvores sussurravam segredos antigos, e criaturas místicas observavam cada movimento do grupo. Conforme avançavam mais profundamente na floresta, encontraram ruínas de uma civilização perdida, onde símbolos mágicos brilhavam fracamente nas pedras cobertas de musgo.

Mira examinou os símbolos com cuidado, reconhecendo alguns como sendo da antiga linguagem élfica. "Estes símbolos falam de uma prova", ela murmurou. "Apenas aqueles puros de coração podem prosseguir." Suddenly, o chão começou a tremer, e uma voz etérea ecoou pelas ruínas: "Quem ousa perturbar o descanso dos antigos?"`,
      hasChoices: true,
      choices: [
        {
          text: 'Explorar as ruínas antigas',
          description:
            'Investigar os símbolos mágicos e buscar pistas sobre o cristal',
          type: 'exploration',
        },
        {
          text: 'Responder à voz misteriosa',
          description: 'Tentar se comunicar com a entidade que falou',
          type: 'dialogue',
        },
        {
          text: 'Recuar e procurar outro caminho',
          description: 'Evitar o confronto e buscar uma rota alternativa',
          type: 'strategic',
        },
        {
          text: 'Preparar-se para o combate',
          description: 'Assumir uma postura defensiva e se preparar para lutar',
          type: 'action',
        },
      ],
    },
    {
      content: `Uma figura espectral emergiu das ruínas - um antigo guardião élfico que protegia os segredos da floresta há milênios. Seus olhos brilhavam com sabedoria ancestral enquanto observava o grupo. "Vejo que buscam o Cristal da Harmonia", disse ele com uma voz que ecoava como vento entre as folhas. "Muitos vieram antes de vocês, mas poucos provaram ser dignos."

O guardião apontou para três caminhos que se abriram magicamente diante deles. "Cada caminho testará uma virtude diferente. O Caminho da Coragem os levará através do Vale dos Dragões Adormecidos. O Caminho da Sabedoria passa pela Biblioteca Flutuante dos Magos Antigos. E o Caminho da Compaixão atravessa a Vila dos Espíritos Perdidos, onde almas atormentadas buscam paz."`,
      hasChoices: true,
      choices: [
        {
          text: 'Escolher o Caminho da Coragem',
          description: 'Enfrentar os dragões adormecidos no vale perigoso',
          type: 'action',
        },
        {
          text: 'Escolher o Caminho da Sabedoria',
          description: 'Buscar conhecimento na biblioteca mágica flutuante',
          type: 'exploration',
        },
        {
          text: 'Escolher o Caminho da Compaixão',
          description: 'Ajudar as almas perdidas a encontrar paz',
          type: 'moral',
        },
        {
          text: 'Pedir para dividir o grupo',
          description: 'Sugerir que cada membro tome um caminho diferente',
          type: 'strategic',
        },
      ],
    },
    {
      content: `Após superar as provações do caminho escolhido, o grupo finalmente chegou ao Santuário do Cristal da Harmonia. O local era de uma beleza indescritível - cristais de todas as cores do arco-íris cresciam das paredes, criando uma sinfonia de luz e som que tocava a alma. No centro do santuário, suspenso no ar por magia antiga, estava o Cristal da Harmonia, pulsando com uma energia que parecia conectar todos os seres vivos.

Mas eles não estavam sozinhos. Sombras começaram a se materializar ao redor do santuário - os Guardiões das Trevas, antigos inimigos da harmonia que buscavam destruir o cristal para sempre. A batalha final estava prestes a começar, e o destino de todos os reinos mágicos dependia das escolhas que fariam nos próximos momentos.`,
      hasChoices: true,
      choices: [
        {
          text: 'Atacar os Guardiões das Trevas',
          description: 'Partir para o combate direto contra os inimigos',
          type: 'action',
        },
        {
          text: 'Tentar purificar as sombras',
          description: 'Usar a magia do cristal para converter os inimigos',
          type: 'skill_check',
        },
        {
          text: 'Proteger o cristal',
          description: 'Formar uma barreira defensiva ao redor do artefato',
          type: 'strategic',
        },
        {
          text: 'Negociar com os Guardiões',
          description: 'Tentar encontrar uma solução pacífica',
          type: 'dialogue',
        },
      ],
    },
    {
      content: `Com o poder do Cristal da Harmonia finalmente em suas mãos, Lyra sentiu uma energia calorosa fluir através de seu ser. O cristal não apenas restaurou o equilíbrio entre os reinos, mas também revelou uma verdade profunda - a verdadeira harmonia não vinha de um artefato mágico, mas da união e compreensão entre todos os povos.

Os Guardiões das Trevas, tocados pela luz do cristal, revelaram-se como antigos protetores que haviam sido corrompidos pela desesperança. Com a harmonia restaurada, eles recuperaram sua forma original e se juntaram à celebração. Os reinos que estiveram em guerra por décadas finalmente encontraram a paz, e Lyra retornou para casa não apenas como uma princesa, mas como uma verdadeira líder que havia aprendido que a maior magia de todas era a capacidade de unir corações e mentes.

E assim, a lenda da Princesa Lyra e o Cristal da Harmonia foi contada por gerações, lembrando a todos que mesmo nas horas mais sombrias, a esperança e a união podem superar qualquer adversidade.`,
      hasChoices: false,
      choices: [],
    },
  ];

  private storyProgressMap = new Map<string, number>(); // storyId -> currentSegmentIndex

  /**
   * Legacy mock responses for backward compatibility
   */
  private readonly mockResponses = {
    storyContent: this.mockStorySegments[0].content,
    imageUrl: 'https://example.com/mock-story-image.jpg',
    audioUrl: 'https://example.com/mock-story-audio.mp3',
    choices: this.mockStorySegments[0].choices,
  };

  /**
   * Gets the provider type
   */
  getProvider(): AIProvider {
    return AIProvider.MOCKED;
  }

  /**
   * Get current story segment for a story
   */
  private getCurrentSegment(
    storyId: string,
  ): (typeof this.mockStorySegments)[0] {
    const currentIndex = this.storyProgressMap.get(storyId) || 0;
    const segmentIndex = Math.min(
      currentIndex,
      this.mockStorySegments.length - 1,
    );
    return this.mockStorySegments[segmentIndex];
  }

  /**
   * Advance story to next segment
   */
  private advanceStory(storyId: string): void {
    const currentIndex = this.storyProgressMap.get(storyId) || 0;
    const nextIndex = Math.min(
      currentIndex + 1,
      this.mockStorySegments.length - 1,
    );
    this.storyProgressMap.set(storyId, nextIndex);
  }

  /**
   * Reset story progress
   */
  public resetStoryProgress(storyId: string): void {
    this.storyProgressMap.set(storyId, 0);
  }

  /**
   * Get segment based on content count (more reliable than Map)
   */
  private getSegmentByContentCount(
    contentCount: number,
  ): (typeof this.mockStorySegments)[0] {
    const segmentIndex = Math.min(
      contentCount,
      this.mockStorySegments.length - 1,
    );
    return this.mockStorySegments[segmentIndex];
  }

  /**
   * Get mocked image URL for a specific segment
   */
  private getSegmentImageUrl(segmentIndex: number): string {
    const imageUrls = [
      'https://mocked-cdn.example.com/fantasy-kingdom-eldoria.png',
      'https://mocked-cdn.example.com/dark-forest-ruins.png',
      'https://mocked-cdn.example.com/elven-guardian-spirit.png',
      'https://mocked-cdn.example.com/crystal-sanctuary.png',
      'https://mocked-cdn.example.com/harmony-crystal-ending.png',
    ];
    return imageUrls[Math.min(segmentIndex, imageUrls.length - 1)];
  }

  /**
   * Get mocked audio URL for a specific segment
   */
  private getSegmentAudioUrl(segmentIndex: number): string {
    const audioUrls = [
      'https://mocked-cdn.example.com/narration-kingdom-intro.mp3',
      'https://mocked-cdn.example.com/narration-forest-mystery.mp3',
      'https://mocked-cdn.example.com/narration-guardian-wisdom.mp3',
      'https://mocked-cdn.example.com/narration-final-battle.mp3',
      'https://mocked-cdn.example.com/narration-peaceful-ending.mp3',
    ];
    return audioUrls[Math.min(segmentIndex, audioUrls.length - 1)];
  }

  /**
   * Generate text using mocked responses with story progression
   */
  async generateText(
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
      storyId?: string;
      currentContentCount?: number;
    },
  ): Promise<string> {
    // Simulate async operation
    await this.simulateDelay();

    const storyId = options?.storyId;
    const currentContentCount = options?.currentContentCount || 0;

    // Return different responses based on prompt content
    if (
      prompt.toLowerCase().includes('choice') ||
      prompt.toLowerCase().includes('escolha')
    ) {
      if (storyId) {
        const segment = this.getSegmentByContentCount(currentContentCount);
        return JSON.stringify(segment.choices);
      }
      return JSON.stringify(this.mockResponses.choices);
    }

    if (
      prompt.toLowerCase().includes('continue') ||
      prompt.toLowerCase().includes('continuar') ||
      prompt.toLowerCase().includes('generate content') ||
      prompt.toLowerCase().includes('gerar conteúdo') ||
      prompt.toLowerCase().includes('adventure') ||
      prompt.toLowerCase().includes('aventura')
    ) {
      if (storyId) {
        // Use the current content count to determine which segment to return
        const segment = this.getSegmentByContentCount(currentContentCount);
        return segment.content;
      }
      return `${this.mockResponses.storyContent} A história continua com novos desenvolvimentos emocionantes...`;
    }

    // Default story content - first segment
    if (storyId) {
      const segment = this.getSegmentByContentCount(currentContentCount);
      return segment.content;
    }
    return this.mockResponses.storyContent;
  }

  /**
   * Generate image using mocked URL
   */
  async generateImage(
    prompt: string,
    options?: {
      size?: 'small' | 'medium' | 'large';
      style?: string;
      quality?: 'standard' | 'hd';
      model?: string;
      storyId?: string;
      currentContentCount?: number;
    },
  ): Promise<string> {
    await this.simulateDelay();

    // If we have story context, return segment-specific image
    if (options?.storyId && options?.currentContentCount !== undefined) {
      const segmentIndex = Math.min(
        options.currentContentCount,
        this.mockStorySegments.length - 1,
      );
      return this.getSegmentImageUrl(segmentIndex);
    }

    // Return different mock images based on prompt
    if (
      prompt.toLowerCase().includes('forest') ||
      prompt.toLowerCase().includes('floresta')
    ) {
      return 'https://example.com/mock-forest-image.jpg';
    }

    if (
      prompt.toLowerCase().includes('character') ||
      prompt.toLowerCase().includes('personagem')
    ) {
      return 'https://example.com/mock-character-image.jpg';
    }

    return this.mockResponses.imageUrl;
  }

  /**
   * Generate audio using mocked URL
   */
  async generateAudio(
    prompt: string,
    options?: {
      voice?: string;
      speed?: number;
      format?: 'mp3' | 'wav' | 'ogg';
      model?: string;
      storyId?: string;
      currentContentCount?: number;
    },
  ): Promise<string> {
    await this.simulateDelay();

    // If we have story context, return segment-specific audio
    if (options?.storyId && options?.currentContentCount !== undefined) {
      const segmentIndex = Math.min(
        options.currentContentCount,
        this.mockStorySegments.length - 1,
      );
      return this.getSegmentAudioUrl(segmentIndex);
    }

    // Return different mock audio based on text
    const normalizedPrompt = prompt
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (
      normalizedPrompt.includes('dramatic') ||
      normalizedPrompt.includes('dramatico')
    ) {
      return 'https://example.com/mock-dramatic-audio.mp3';
    }

    if (
      prompt.toLowerCase().includes('calm') ||
      prompt.toLowerCase().includes('calmo')
    ) {
      return 'https://example.com/mock-calm-audio.mp3';
    }

    return this.mockResponses.audioUrl;
  }

  /**
   * Check if the service is available (always true for mock)
   */
  async isAvailable(): Promise<boolean> {
    await this.simulateDelay();
    return true;
  }

  /**
   * Get available models (mock models)
   */
  async getModels(): Promise<string[]> {
    await this.simulateDelay();
    return [
      'test-model-v1',
      'test-model-v2',
      'mock-gpt-4',
      'mock-gemini',
      'mock-claude',
    ];
  }

  /**
   * Estimate cost (always returns mock cost)
   */
  async estimateCost(
    inputTokens: number,
    outputTokens: number,
    model?: string,
  ): Promise<number> {
    await this.simulateDelay();
    return (inputTokens + outputTokens) * this.mockConfig.costPerToken;
  }

  /**
   * Moderate content (always returns safe for mock)
   */
  async moderateContent(content: string): Promise<{
    flagged: boolean;
    categories: string[];
    confidence: number;
  }> {
    await this.simulateDelay();

    // Mock some content moderation logic
    const flagged =
      content.toLowerCase().includes('inappropriate') ||
      content.toLowerCase().includes('harmful');

    return {
      flagged,
      categories: flagged ? ['mock-violation'] : [],
      confidence: flagged ? 0.95 : 0.05,
    };
  }

  /**
   * Simulate async delay for more realistic testing
   */
  private async simulateDelay(): Promise<void> {
    if (this.mockConfig.responseDelay > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.mockConfig.responseDelay),
      );
    }
  }

  /**
   * Get provider configuration
   */
  getConfig(): Record<string, any> {
    return {
      name: AIProvider.MOCKED,
      model: this.mockConfig.defaultModel,
      type: 'mock',
      description: 'Mocked AI provider for testing purposes',
      capabilities: ['text', 'image', 'audio', 'choices'],
      costPerToken: this.mockConfig.costPerToken,
    };
  }
}
