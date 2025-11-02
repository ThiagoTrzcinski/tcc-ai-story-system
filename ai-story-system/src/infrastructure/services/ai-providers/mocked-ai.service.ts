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
      content: `Once upon a time, in a distant kingdom called Eldoria, magic flowed through snow-covered mountains and enchanted forests. Young Princess Lyra discovered an ancient scroll in her library, revealing the existence of a lost artifact known as the Crystal of Harmony. This crystal had the power to restore balance between the magical kingdoms that had been at war for decades.

Determined to bring peace to her people, Lyra decided to embark on a dangerous journey to find the crystal. She knew she couldn't do this alone, so she gathered a group of loyal companions: Kael, a skilled elven warrior with the sword; Mira, a mage who specialized in protection spells; and Thorin, a dwarf who knew the secrets of the ancient mountains.`,
      hasChoices: true,
      choices: [
        {
          text: 'Leave immediately for the Dark Forest',
          description: 'Follow the first clue from the scroll without delay',
          type: 'action',
        },
        {
          text: 'Gather more information in the library',
          description:
            'Research more about the Crystal of Harmony before leaving',
          type: 'exploration',
        },
        {
          text: 'Recruit more companions',
          description: 'Seek other heroes to strengthen the group',
          type: 'relationship',
        },
        {
          text: 'Consult the royal council',
          description: 'Ask for guidance from the wise ones of the kingdom',
          type: 'dialogue',
        },
      ],
    },
    {
      content: `The first clue from the scroll led the group to the Dark Forest, a place where few ventured and even fewer returned. The trees whispered ancient secrets, and mystical creatures watched every movement of the group. As they advanced deeper into the forest, they found ruins of a lost civilization, where magical symbols glowed faintly on moss-covered stones.

Mira examined the symbols carefully, recognizing some as being from the ancient elven language. "These symbols speak of a trial," she murmured. "Only those pure of heart may proceed." Suddenly, the ground began to shake, and an ethereal voice echoed through the ruins: "Who dares disturb the rest of the ancients?"`,
      hasChoices: true,
      choices: [
        {
          text: 'Explore the ancient ruins',
          description:
            'Investigate the magical symbols and search for clues about the crystal',
          type: 'exploration',
        },
        {
          text: 'Answer the mysterious voice',
          description: 'Try to communicate with the entity that spoke',
          type: 'dialogue',
        },
        {
          text: 'Retreat and look for another path',
          description: 'Avoid confrontation and seek an alternative route',
          type: 'strategic',
        },
        {
          text: 'Prepare for combat',
          description: 'Take a defensive stance and prepare to fight',
          type: 'action',
        },
      ],
    },
    {
      content: `A spectral figure emerged from the ruins - an ancient elven guardian who had protected the secrets of the forest for millennia. His eyes glowed with ancestral wisdom as he observed the group. "I see that you seek the Crystal of Harmony," he said with a voice that echoed like wind through the leaves. "Many have come before you, but few have proven worthy."

The guardian pointed to three paths that magically opened before them. "Each path will test a different virtue. The Path of Courage will take you through the Valley of Sleeping Dragons. The Path of Wisdom passes through the Floating Library of the Ancient Mages. And the Path of Compassion crosses the Village of Lost Spirits, where tormented souls seek peace."`,
      hasChoices: true,
      choices: [
        {
          text: 'Choose the Path of Courage',
          description: 'Face the sleeping dragons in the dangerous valley',
          type: 'action',
        },
        {
          text: 'Choose the Path of Wisdom',
          description: 'Seek knowledge in the floating magical library',
          type: 'exploration',
        },
        {
          text: 'Choose the Path of Compassion',
          description: 'Help the lost souls find peace',
          type: 'moral',
        },
        {
          text: 'Ask to split the group',
          description: 'Suggest that each member takes a different path',
          type: 'strategic',
        },
      ],
    },
    {
      content: `After overcoming the trials of the chosen path, the group finally reached the Sanctuary of the Crystal of Harmony. The place was of indescribable beauty - crystals of all the colors of the rainbow grew from the walls, creating a symphony of light and sound that touched the soul. In the center of the sanctuary, suspended in the air by ancient magic, was the Crystal of Harmony, pulsing with an energy that seemed to connect all living beings.

But they were not alone. Shadows began to materialize around the sanctuary - the Guardians of Darkness, ancient enemies of harmony who sought to destroy the crystal forever. The final battle was about to begin, and the fate of all magical kingdoms depended on the choices they would make in the next moments.`,
      hasChoices: true,
      choices: [
        {
          text: 'Attack the Guardians of Darkness',
          description: 'Engage in direct combat against the enemies',
          type: 'action',
        },
        {
          text: 'Try to purify the shadows',
          description: "Use the crystal's magic to convert the enemies",
          type: 'skill_check',
        },
        {
          text: 'Protect the crystal',
          description: 'Form a defensive barrier around the artifact',
          type: 'strategic',
        },
        {
          text: 'Negotiate with the Guardians',
          description: 'Try to find a peaceful solution',
          type: 'dialogue',
        },
      ],
    },
    {
      content: `With the power of the Crystal of Harmony finally in her hands, Lyra felt a warm energy flow through her being. The crystal not only restored balance between the kingdoms, but also revealed a profound truth - true harmony did not come from a magical artifact, but from the union and understanding between all peoples.

The Guardians of Darkness, touched by the light of the crystal, revealed themselves as ancient protectors who had been corrupted by despair. With harmony restored, they recovered their original form and joined the celebration. The kingdoms that had been at war for decades finally found peace, and Lyra returned home not just as a princess, but as a true leader who had learned that the greatest magic of all was the ability to unite hearts and minds.

And so, the legend of Princess Lyra and the Crystal of Harmony was told for generations, reminding everyone that even in the darkest hours, hope and unity can overcome any adversity.`,
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
      prompt.toLowerCase().includes('option')
    ) {
      if (storyId) {
        const segment = this.getSegmentByContentCount(currentContentCount);
        return JSON.stringify(segment.choices);
      }
      return JSON.stringify(this.mockResponses.choices);
    }

    if (
      prompt.toLowerCase().includes('continue') ||
      prompt.toLowerCase().includes('next') ||
      prompt.toLowerCase().includes('generate content') ||
      prompt.toLowerCase().includes('create story') ||
      prompt.toLowerCase().includes('adventure') ||
      prompt.toLowerCase().includes('narrative')
    ) {
      if (storyId) {
        // Use the current content count to determine which segment to return
        const segment = this.getSegmentByContentCount(currentContentCount);
        return segment.content;
      }
      return `${this.mockResponses.storyContent} The story continues with exciting new developments...`;
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
      prompt.toLowerCase().includes('person')
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
      normalizedPrompt.includes('intense')
    ) {
      return 'https://example.com/mock-dramatic-audio.mp3';
    }

    if (
      prompt.toLowerCase().includes('calm') ||
      prompt.toLowerCase().includes('peaceful')
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
