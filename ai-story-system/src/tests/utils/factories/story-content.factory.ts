import { StoryContent } from '../../../domain/entities/story-content.entity';
import { StoryChoice } from '../../../domain/entities/story-choice.entity';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTestStoryContentOptions {
  id?: string;
  storyId?: string;
  textContent?: string;
  sequence?: number;
  createdAt?: Date;
  imageUrl?: string;
  audioUrl?: string;
  hasChoices?: boolean;
  choices?: StoryChoice[];
}

/**
 * Creates a test StoryContent entity with sensible defaults
 */
export function createTestStoryContent(options: CreateTestStoryContentOptions = {}): StoryContent {
  return new StoryContent(
    options.id ?? uuidv4(),
    options.storyId ?? uuidv4(),
    options.textContent ?? 'This is test story content.',
    options.sequence ?? 1,
    options.createdAt ?? new Date(),
    options.imageUrl,
    options.audioUrl,
    options.hasChoices ?? false,
    options.choices,
  );
}

/**
 * Creates text-only content
 */
export function createTextContent(
  textContent: string,
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent {
  return createTestStoryContent({
    textContent,
    hasChoices: false,
    ...overrides,
  });
}

/**
 * Creates content with an image
 */
export function createContentWithImage(
  textContent: string,
  imageUrl: string,
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent {
  return createTestStoryContent({
    textContent,
    imageUrl,
    hasChoices: false,
    ...overrides,
  });
}

/**
 * Creates content with audio
 */
export function createContentWithAudio(
  textContent: string,
  audioUrl: string,
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent {
  return createTestStoryContent({
    textContent,
    audioUrl,
    hasChoices: false,
    ...overrides,
  });
}

/**
 * Creates content with both image and audio
 */
export function createMultimediaContent(
  textContent: string,
  imageUrl: string,
  audioUrl: string,
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent {
  return createTestStoryContent({
    textContent,
    imageUrl,
    audioUrl,
    hasChoices: false,
    ...overrides,
  });
}

/**
 * Creates content with choices
 */
export function createContentWithChoices(
  textContent: string,
  choices: StoryChoice[],
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent {
  return createTestStoryContent({
    textContent,
    hasChoices: true,
    choices,
    ...overrides,
  });
}

/**
 * Creates opening content for a story
 */
export function createOpeningContent(
  storyId: string,
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent {
  return createTestStoryContent({
    storyId,
    textContent: 'Once upon a time, in a land far away...',
    sequence: 1,
    hasChoices: false,
    ...overrides,
  });
}

/**
 * Creates chapter content
 */
export function createChapterContent(
  storyId: string,
  chapterNumber: number,
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent {
  return createTestStoryContent({
    storyId,
    textContent: `Chapter ${chapterNumber}: The adventure continues...`,
    sequence: chapterNumber,
    hasChoices: false,
    ...overrides,
  });
}

/**
 * Creates ending content for a story
 */
export function createEndingContent(
  storyId: string,
  sequence: number,
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent {
  return createTestStoryContent({
    storyId,
    textContent: 'And they lived happily ever after. The End.',
    sequence,
    hasChoices: false,
    ...overrides,
  });
}

/**
 * Creates a sequence of content for a story
 */
export function createContentSequence(
  storyId: string,
  count: number,
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent[] {
  const contents: StoryContent[] = [];
  
  for (let i = 1; i <= count; i++) {
    contents.push(createTestStoryContent({
      storyId,
      textContent: `Content sequence ${i}: The story progresses...`,
      sequence: i,
      ...overrides,
    }));
  }
  
  return contents;
}

/**
 * Creates content with specific sequence number
 */
export function createSequencedContent(
  storyId: string,
  sequence: number,
  textContent?: string,
  overrides: Partial<CreateTestStoryContentOptions> = {}
): StoryContent {
  return createTestStoryContent({
    storyId,
    sequence,
    textContent: textContent ?? `Sequence ${sequence} content`,
    ...overrides,
  });
}
