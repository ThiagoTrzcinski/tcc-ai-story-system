import { injectable } from 'tsyringe';
import { IAIProvider } from '../../../domain/interfaces/ai-provider.interface';
import { AIProvider } from '../../../domain/value-objects/ai-provider.value-object';

declare const setTimeout: (callback: () => void, ms: number) => NodeJS.Timeout;

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
   * Predefined story segments for progressive narrative
   */
  private readonly mockStorySegments = [
    {
      content: `Once upon a time, in a distant kingdom called Eldoria, magic flowed through snow-covered mountains and enchanted forests. Young Princess Lyra discovered an ancient scroll in her library, revealing the existence of a lost artifact known as the Crystal of Harmony. This crystal had the power to restore balance between the magical kingdoms that had been at war for decades.

Determined to bring peace to her people, Lyra decided to embark on a dangerous journey to find the crystal. She knew she couldn't do this alone, so she gathered a group of loyal companions: Kael, a skilled elven warrior with the sword; Mira, a mage who specialized in protection spells; and Thorin, a dwarf who knew the secrets of the ancient mountains.`,
      hasChoices: true,
      choices: [
        {
          text: 'Depart immediately for the Dark Forest',
          description: 'Follow the first clue from the scroll without delay',
          type: 'action',
        },
        {
          text: 'Gather more information in the library',
          description:
            'Research more about the Crystal of Harmony before departing',
          type: 'exploration',
        },
        {
          text: "Consult the kingdom's oracle",
          description: 'Seek mystical guidance before beginning the journey',
          type: 'dialogue',
        },
        {
          text: 'Train with the companions',
          description: 'Spend time preparing and strengthening the team',
          type: 'action',
        },
      ],
    },
    {
      content: `The first clue from the scroll led the group to the Dark Forest, a place where few ventured and even fewer returned. The trees whispered ancient secrets, and mystical creatures watched every movement of the group. As they advanced deeper into the forest, they found ruins of a lost civilization, where magical symbols glowed faintly on moss-covered stones.

Mira examined the symbols carefully, recognizing some as being from the ancient elven language. "These symbols speak of a trial," she murmured. "Only those pure of heart may proceed." Suddenly, the ground began to shake, and an ethereal voice echoed through the ruins: "Who dares disturb the rest of the ancients?"`,
      hasChoices: true,
      choices: [
        {
          text: 'Lyra steps forward and speaks',
          description:
            'The princess presents herself and explains her noble mission',
          type: 'dialogue',
        },
        {
          text: 'Prepare for battle',
          description: 'Kael and the group prepare to defend themselves',
          type: 'action',
        },
        {
          text: 'Mira casts a protection spell',
          description: 'The mage creates a magical barrier around the group',
          type: 'action',
        },
        {
          text: 'Thorin examines the ruins',
          description: 'The dwarf searches for clues about the trial',
          type: 'exploration',
        },
      ],
    },
    {
      content: `Lyra stepped forward with courage, her voice firm but respectful. "We are seekers of peace," she declared. "We search for the Crystal of Harmony to end the war that has plagued our lands." The ethereal voice fell silent for a moment, and then the ruins began to glow with an intense blue light.

"Your heart is pure, young princess," the voice responded. "But the path to the crystal is fraught with trials. You must prove not only your courage but also your wisdom and compassion." A portal of light opened before them, revealing a path that seemed to lead to another dimension.`,
      hasChoices: true,
      choices: [
        {
          text: 'Enter the portal immediately',
          description: 'Accept the challenge without hesitation',
          type: 'action',
        },
        {
          text: 'Ask about the trials',
          description: 'Seek more information before proceeding',
          type: 'dialogue',
        },
        {
          text: 'Discuss with the group',
          description: 'Consult the companions before making a decision',
          type: 'dialogue',
        },
        {
          text: 'Prepare supplies',
          description: 'Organize equipment before entering the portal',
          type: 'exploration',
        },
      ],
    },
    {
      content: `The group crossed the portal and found themselves in a realm of pure magic, where reality seemed to bend to the will of thought. They faced three trials: the Trial of Courage, where they had to face their deepest fears; the Trial of Wisdom, where they solved ancient riddles; and the Trial of Compassion, where they had to choose between personal gain and the greater good.

With each trial overcome, the group grew stronger and more united. Finally, they reached the chamber where the Crystal of Harmony rested, glowing with a soft, welcoming light. But as Lyra approached to take the crystal, a dark figure emerged from the shadows.

"So, you've made it this far," said the figure, revealing himself to be the Dark Sorcerer Malachar, the one who had started the war between the kingdoms. "But the crystal will be mine, and with it, I will rule all the lands!"`,
      hasChoices: true,
      choices: [
        {
          text: 'Challenge Malachar to a duel',
          description: 'Kael steps forward to face the sorcerer',
          type: 'action',
        },
        {
          text: 'Try to reason with him',
          description: 'Lyra attempts to appeal to any good left in Malachar',
          type: 'dialogue',
        },
        {
          text: 'Use the power of the crystal',
          description: "Attempt to channel the crystal's energy",
          type: 'action',
        },
        {
          text: 'Work together as a team',
          description: "Combine everyone's abilities for a coordinated attack",
          type: 'action',
        },
      ],
    },
    {
      content: `The final battle was epic. Malachar wielded dark magic with devastating power, but the group fought with courage and determination. Lyra realized that the true power of the Crystal of Harmony wasn't in combat, but in unity and peace.

Instead of using the crystal as a weapon, she channeled its energy to show Malachar visions of what the world could be: kingdoms living in harmony, children playing without fear, and families reunited. The dark sorcerer, touched by these visions, began to remember who he was before darkness consumed him.

With tears in his eyes, Malachar renounced his dark powers and asked for forgiveness. The Crystal of Harmony glowed brighter than ever, and its light spread across all the lands, healing old wounds and bringing peace to the warring kingdoms.

And so, the legend of Princess Lyra and the Crystal of Harmony was told for generations, reminding everyone that even in the darkest hours, hope and unity can overcome any adversity.`,
      hasChoices: false,
      choices: [],
    },
  ];

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
   * Generate text using mocked responses
   */
  async generateText(
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    },
  ): Promise<string> {
    await this.simulateDelay();

    // Return different responses based on prompt content
    if (
      prompt.toLowerCase().includes('choice') ||
      prompt.toLowerCase().includes('escolha')
    ) {
      return JSON.stringify(this.mockResponses.choices);
    }

    if (
      prompt.toLowerCase().includes('continue') ||
      prompt.toLowerCase().includes('continuar')
    ) {
      return (
        this.mockResponses.storyContent +
        '\n\nThe story continues with new exciting developments...'
      );
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
      quality?: 'standard' | 'hd';
      style?: string;
    },
  ): Promise<string> {
    await this.simulateDelay();

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
    },
  ): Promise<string> {
    await this.simulateDelay();

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
   * Moderate content (mock moderation logic)
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
      await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), this.mockConfig.responseDelay),
      );
    }
  }

  /**
   * Get provider configuration
   */
  getConfig(): {
    name: AIProvider;
    model: string;
    type: string;
    description: string;
    capabilities: string[];
    costPerToken: number;
  } {
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
