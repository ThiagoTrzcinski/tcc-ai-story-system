import { StoryGenre } from '../value-objects/story-genre.value-object';
import { StoryStatus } from '../value-objects/story-status.value-object';
import { StoryChoice } from './story-choice.entity';
import { StoryContent } from './story-content.entity';

export interface StorySettings {
  AIModel: string;
  generateImage?: boolean;
  generateAudio?: boolean;
}

export class Story {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly genre: StoryGenre,
    public readonly userId: number,
    public readonly status: StoryStatus,
    public readonly prompts: string[],
    public readonly settings: StorySettings,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly content: StoryContent[] = [],
    public readonly choices: StoryChoice[] = [],
    public readonly currentContentId?: string,
    public readonly totalChoicesMade?: number,
    public readonly estimatedReadingTime?: number,
    public readonly deletedAt?: Date,
  ) {}

  /**
   * Creates a new story with initial content
   */
  static create(
    id: string,
    title: string,
    description: string,
    genre: StoryGenre,
    userId: number,
    initialPrompt: string,
    settings?: StorySettings,
  ): Story {
    return new Story(
      id,
      title,
      description,
      genre,
      userId,
      StoryStatus.DRAFT,
      [initialPrompt],
      settings || { AIModel: 'mocked' }, // Default to mocked
      new Date(),
      new Date(),
      [],
      [],
      undefined,
      0,
      undefined,
      undefined, // deletedAt
    );
  }

  /**
   * Adds new content to the story
   */
  addContent(content: StoryContent): Story {
    const updatedContent = [...this.content, content];

    return new Story(
      this.id,
      this.title,
      this.description,
      this.genre,
      this.userId,
      this.status,
      this.prompts,
      this.settings,
      this.createdAt,
      new Date(),
      updatedContent,
      this.choices,
      content.id,
      this.totalChoicesMade,
      this.calculateEstimatedReadingTime(updatedContent),
      this.deletedAt,
    );
  }

  /**
   * Adds a choice to the current content
   */
  addChoice(choice: StoryChoice): Story {
    const updatedChoices = [...this.choices, choice];

    return new Story(
      this.id,
      this.title,
      this.description,
      this.genre,
      this.userId,
      this.status,
      this.prompts,
      this.settings,
      this.createdAt,
      new Date(),
      this.content,
      updatedChoices,
      this.currentContentId,
      this.totalChoicesMade,
      this.estimatedReadingTime,
      this.deletedAt,
    );
  }

  /**
   * Makes a choice and updates the story state
   */
  makeChoice(choiceId: string): Story {
    const choice = this.choices.find((c) => c.id === choiceId);
    if (!choice) {
      throw new Error(`Choice with id ${choiceId} not found`);
    }

    if (!choice.isAvailable) {
      throw new Error(`Choice ${choiceId} is not available`);
    }

    if (choice.isSelected) {
      throw new Error('Choice is already selected');
    }

    // Select the choice and update the choices array
    const selectedChoice = choice.select();
    const updatedChoices = this.choices.map((c) =>
      c.id === choiceId ? selectedChoice : c,
    );

    return new Story(
      this.id,
      this.title,
      this.description,
      this.genre,
      this.userId,
      this.status,
      this.prompts,
      this.settings,
      this.createdAt,
      new Date(),
      this.content,
      updatedChoices,
      this.currentContentId,
      (this.totalChoicesMade || 0) + 1,
      this.estimatedReadingTime,
      this.deletedAt,
    );
  }

  /**
   * Marks the story as completed
   */
  complete(): Story {
    return new Story(
      this.id,
      this.title,
      this.description,
      this.genre,
      this.userId,
      StoryStatus.COMPLETED,
      this.prompts,
      this.settings,
      this.createdAt,
      new Date(),
      this.content,
      this.choices,
      this.currentContentId,
      this.totalChoicesMade,
      this.estimatedReadingTime,
      this.deletedAt,
    );
  }

  /**
   * Publishes the story
   */
  publish(): Story {
    if (this.content.length === 0) {
      throw new Error('Cannot publish story without content');
    }

    return new Story(
      this.id,
      this.title,
      this.description,
      this.genre,
      this.userId,
      StoryStatus.PUBLISHED,
      this.prompts,
      this.settings,
      this.createdAt,
      new Date(),
      this.content,
      this.choices,
      this.currentContentId,
      this.totalChoicesMade,
      this.estimatedReadingTime,
      this.deletedAt,
    );
  }

  /**
   * Gets the current content being read
   */
  getCurrentContent(): StoryContent | null {
    if (!this.currentContentId) {
      return this.content.length > 0 ? this.content[0] : null;
    }
    return this.content.find((c) => c.id === this.currentContentId) || null;
  }

  /**
   * Gets available choices for the current content
   */
  getAvailableChoices(): StoryChoice[] {
    const currentContent = this.getCurrentContent();
    if (!currentContent) return [];

    return this.choices.filter(
      (choice) =>
        choice.parentContentId === currentContent.id && choice.isAvailable,
    );
  }

  /**
   * Calculates estimated reading time based on content
   */
  private calculateEstimatedReadingTime(content: StoryContent[]): number {
    const wordsPerMinute = 200; // Average reading speed
    const totalWords = content.reduce((total, item) => {
      return total + (item.textContent?.split(' ').length || 0);
    }, 0);

    return Math.ceil(totalWords / wordsPerMinute);
  }

  /**
   * Checks if the story can be published
   */
  get canBePublished(): boolean {
    return this.content.length > 0 && this.status !== StoryStatus.PUBLISHED;
  }

  /**
   * Gets the story progress as a percentage
   */
  get progressPercentage(): number {
    if (this.status === StoryStatus.COMPLETED) return 100;
    if (this.content.length === 0) return 0;

    // Simple progress calculation based on choices made
    const maxChoices = Math.max(10, this.choices.length); // Assume minimum 10 choices for a complete story
    return Math.min(100, ((this.totalChoicesMade || 0) / maxChoices) * 100);
  }

  /**
   * Checks if the story is active (can be continued)
   */
  get isActive(): boolean {
    return this.status === StoryStatus.IN_PROGRESS;
  }

  /**
   * Adds a new prompt to the story's prompt history
   */
  addPrompt(prompt: string): Story {
    const updatedPrompts = [...this.prompts, prompt];

    return new Story(
      this.id,
      this.title,
      this.description,
      this.genre,
      this.userId,
      this.status,
      updatedPrompts,
      this.settings,
      this.createdAt,
      new Date(),
      this.content,
      this.choices,
      this.currentContentId,
      this.totalChoicesMade,
      this.estimatedReadingTime,
      this.deletedAt,
    );
  }

  /**
   * Soft delete the story
   */
  softDelete(): Story {
    return new Story(
      this.id,
      this.title,
      this.description,
      this.genre,
      this.userId,
      this.status,
      this.prompts,
      this.settings,
      this.createdAt,
      new Date(),
      this.content,
      this.choices,
      this.currentContentId,
      this.totalChoicesMade,
      this.estimatedReadingTime,
      new Date(), // Set deleted timestamp
    );
  }

  /**
   * Restore a soft deleted story
   */
  restore(): Story {
    return new Story(
      this.id,
      this.title,
      this.description,
      this.genre,
      this.userId,
      this.status,
      this.prompts,
      this.settings,
      this.createdAt,
      new Date(),
      this.content,
      this.choices,
      this.currentContentId,
      this.totalChoicesMade,
      this.estimatedReadingTime,
      undefined, // Clear deleted timestamp
    );
  }

  /**
   * Check if the story is soft deleted
   */
  get isDeleted(): boolean {
    return this.deletedAt !== undefined;
  }

  /**
   * Updates the story settings
   */
  updateSettings(settings: StorySettings): Story {
    return new Story(
      this.id,
      this.title,
      this.description,
      this.genre,
      this.userId,
      this.status,
      this.prompts,
      settings,
      this.createdAt,
      new Date(),
      this.content,
      this.choices,
      this.currentContentId,
      this.totalChoicesMade,
      this.estimatedReadingTime,
      this.deletedAt,
    );
  }

  /**
   * Gets the AI provider based on the model name
   */
  get aiProvider(): string {
    const model = this.settings.AIModel.toLowerCase();

    if (model.includes('gpt') || model.includes('openai')) {
      return 'openai';
    }
    if (model.includes('gemini') || model.includes('google')) {
      return 'google';
    }
    if (model.includes('claude') || model.includes('anthropic')) {
      return 'anthropic';
    }
    if (model.includes('test') || model.includes('mock')) {
      return 'mocked';
    }

    // Default to openai if can't determine
    return 'openai';
  }
}
