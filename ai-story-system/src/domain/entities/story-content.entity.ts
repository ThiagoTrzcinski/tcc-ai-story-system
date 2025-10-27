import { StoryChoice } from './story-choice.entity';

export class StoryContent {
  constructor(
    public readonly id: string,
    public readonly storyId: string,
    public readonly textContent: string,
    public readonly sequence: number,
    public readonly createdAt: Date,
    public readonly imageUrl?: string,
    public readonly audioUrl?: string,
    public readonly hasChoices: boolean = false,
    public readonly choices?: StoryChoice[],
  ) {}

  /**
   * Creates a new story content with text only
   */
  static createText(
    id: string,
    storyId: string,
    textContent: string,
    sequence: number,
    hasChoices: boolean = false,
    choices?: StoryChoice[],
  ): StoryContent {
    return new StoryContent(
      id,
      storyId,
      textContent,
      sequence,
      new Date(),
      undefined,
      undefined,
      hasChoices,
      choices,
    );
  }

  /**
   * Creates a new story content with text and image
   */
  static createWithImage(
    id: string,
    storyId: string,
    textContent: string,
    imageUrl: string,
    sequence: number,
    hasChoices: boolean = false,
    choices?: StoryChoice[],
  ): StoryContent {
    return new StoryContent(
      id,
      storyId,
      textContent,
      sequence,
      new Date(),
      imageUrl,
      undefined,
      hasChoices,
      choices,
    );
  }

  /**
   * Creates a new story content with text and audio
   */
  static createWithAudio(
    id: string,
    storyId: string,
    textContent: string,
    audioUrl: string,
    sequence: number,
    hasChoices: boolean = false,
    choices?: StoryChoice[],
  ): StoryContent {
    return new StoryContent(
      id,
      storyId,
      textContent,
      sequence,
      new Date(),
      undefined,
      audioUrl,
      hasChoices,
      choices,
    );
  }

  /**
   * Creates a new story content with text, image, and audio
   */
  static createCombined(
    id: string,
    storyId: string,
    textContent: string,
    sequence: number,
    imageUrl?: string,
    audioUrl?: string,
    hasChoices: boolean = false,
    choices?: StoryChoice[],
  ): StoryContent {
    return new StoryContent(
      id,
      storyId,
      textContent,
      sequence,
      new Date(),
      imageUrl,
      audioUrl,
      hasChoices,
      choices,
    );
  }

  /**
   * Adds choices to the content
   */
  withChoices(choices: StoryChoice[]): StoryContent {
    return new StoryContent(
      this.id,
      this.storyId,
      this.textContent,
      this.sequence,
      this.createdAt,
      this.imageUrl,
      this.audioUrl,
      true,
      choices,
    );
  }

  /**
   * Updates the content with media URLs
   */
  withMediaUrls(imageUrl?: string, audioUrl?: string): StoryContent {
    return new StoryContent(
      this.id,
      this.storyId,
      this.textContent,
      this.sequence,
      this.createdAt,
      imageUrl || this.imageUrl,
      audioUrl || this.audioUrl,
      this.hasChoices,
      this.choices,
    );
  }

  /**
   * Checks if content has visual media
   */
  get hasImage(): boolean {
    return !!this.imageUrl;
  }

  /**
   * Checks if content has audio media
   */
  get hasAudio(): boolean {
    return !!this.audioUrl;
  }

  /**
   * Checks if content is multimedia
   */
  get isMultimedia(): boolean {
    return this.hasImage || this.hasAudio;
  }

  /**
   * Gets the word count of the text content
   */
  get wordCount(): number {
    return this.textContent.split(/\s+/).filter((word) => word.length > 0)
      .length;
  }

  /**
   * Gets estimated reading time for this content
   */
  get estimatedReadingTime(): number {
    const wordsPerMinute = 200;
    return Math.ceil(this.wordCount / wordsPerMinute);
  }

  /**
   * Gets the number of choices available for this content
   */
  get choiceCount(): number {
    return this.choices?.length || 0;
  }
}
