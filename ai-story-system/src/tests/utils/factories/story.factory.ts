import { v4 as uuidv4 } from 'uuid';
import { StoryChoice } from '../../../domain/entities/story-choice.entity';
import { StoryContent } from '../../../domain/entities/story-content.entity';
import { Story, StorySettings } from '../../../domain/entities/story.entity';
import { StoryGenre } from '../../../domain/value-objects/story-genre.value-object';
import { StoryStatus } from '../../../domain/value-objects/story-status.value-object';

export interface CreateTestStoryOptions {
  id?: string;
  title?: string;
  description?: string;
  genre?: StoryGenre;
  userId?: number;
  status?: StoryStatus;
  prompts?: string[];
  settings?: StorySettings;
  createdAt?: Date;
  updatedAt?: Date;
  content?: StoryContent[];
  choices?: StoryChoice[];
  currentContentId?: string;
  totalChoicesMade?: number;
  estimatedReadingTime?: number;
}

/**
 * Creates a test Story entity with sensible defaults
 */
export function createTestStory(options: CreateTestStoryOptions = {}): Story {
  const now = new Date();

  return new Story(
    options.id ?? uuidv4(),
    options.title ?? 'Test Story',
    options.description ?? 'A test story description',
    options.genre ?? StoryGenre.FANTASY,
    options.userId ?? 1,
    options.status ?? StoryStatus.DRAFT,
    options.prompts ?? ['Once upon a time...'],
    options.settings ?? { AIModel: 'sonar-pro' },
    options.createdAt ?? now,
    options.updatedAt ?? now,
    options.content ?? [],
    options.choices ?? [],
    options.currentContentId,
    options.totalChoicesMade ?? 0,
    options.estimatedReadingTime,
  );
}

/**
 * Creates a draft story with minimal content
 */
export function createDraftStory(
  overrides: Partial<CreateTestStoryOptions> = {},
): Story {
  return createTestStory({
    status: StoryStatus.DRAFT,
    title: 'Draft Story',
    prompts: ['This is a draft story prompt'],
    ...overrides,
  });
}

/**
 * Creates an active story with some content
 */
export function createActiveStory(
  overrides: Partial<CreateTestStoryOptions> = {},
): Story {
  return createTestStory({
    status: StoryStatus.IN_PROGRESS,
    title: 'Active Story',
    prompts: ['This is an active story prompt', 'Continue the adventure...'],
    totalChoicesMade: 3,
    estimatedReadingTime: 15,
    ...overrides,
  });
}

/**
 * Creates a completed story
 */
export function createCompletedStory(
  overrides: Partial<CreateTestStoryOptions> = {},
): Story {
  return createTestStory({
    status: StoryStatus.COMPLETED,
    title: 'Completed Story',
    prompts: ['This story has been completed', 'The end was satisfying'],
    totalChoicesMade: 10,
    estimatedReadingTime: 45,
    ...overrides,
  });
}

/**
 * Creates a story with specific genre
 */
export function createStoryWithGenre(
  genre: StoryGenre,
  overrides: Partial<CreateTestStoryOptions> = {},
): Story {
  const genreNames = {
    [StoryGenre.FANTASY]: 'Fantasy Adventure',
    [StoryGenre.SCIENCE_FICTION]: 'Sci-Fi Epic',
    [StoryGenre.MYSTERY]: 'Mystery Novel',
    [StoryGenre.THRILLER]: 'Thrilling Tale',
    [StoryGenre.ROMANCE]: 'Love Story',
    [StoryGenre.HORROR]: 'Horror Story',
    [StoryGenre.ADVENTURE]: 'Adventure Quest',
    [StoryGenre.DRAMA]: 'Dramatic Story',
    [StoryGenre.COMEDY]: 'Comedy Story',
    [StoryGenre.HISTORICAL]: 'Historical Fiction',
    [StoryGenre.WESTERN]: 'Western Tale',
    [StoryGenre.CRIME]: 'Crime Story',
    [StoryGenre.SUPERNATURAL]: 'Supernatural Story',
    [StoryGenre.DYSTOPIAN]: 'Dystopian Future',
    [StoryGenre.STEAMPUNK]: 'Steampunk Adventure',
    [StoryGenre.CYBERPUNK]: 'Cyberpunk Story',
    [StoryGenre.URBAN_FANTASY]: 'Urban Fantasy',
    [StoryGenre.SLICE_OF_LIFE]: 'Slice of Life',
    [StoryGenre.COMING_OF_AGE]: 'Coming of Age',
    [StoryGenre.CUSTOM]: 'Custom Story',
  };

  return createTestStory({
    genre,
    title: genreNames[genre] || 'Test Story',
    ...overrides,
  });
}

/**
 * Creates a story with multiple prompts
 */
export function createStoryWithPrompts(
  prompts: string[],
  overrides: Partial<CreateTestStoryOptions> = {},
): Story {
  return createTestStory({
    prompts,
    title: 'Multi-Prompt Story',
    ...overrides,
  });
}

/**
 * Creates a story for a specific user
 */
export function createUserStory(
  userId: number,
  overrides: Partial<CreateTestStoryOptions> = {},
): Story {
  return createTestStory({
    userId,
    title: `User ${userId} Story`,
    ...overrides,
  });
}
