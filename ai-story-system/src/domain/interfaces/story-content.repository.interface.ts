import { StoryContent } from '../entities/story-content.entity';
import { StoryChoice } from '../entities/story-choice.entity';

export interface CreateStoryContentData {
  storyId: string;
  textContent: string;
  sequence: number;
  imageUrl?: string;
  audioUrl?: string;
  hasChoices?: boolean;
  choices?: StoryChoice[];
}

export interface UpdateStoryContentData {
  textContent?: string;
  imageUrl?: string;
  audioUrl?: string;
  hasChoices?: boolean;
  choices?: StoryChoice[];
}

export interface IStoryContentRepository {
  /**
   * Creates new story content
   */
  create(data: CreateStoryContentData): Promise<StoryContent>;

  /**
   * Finds content by ID
   */
  findById(id: string): Promise<StoryContent | null>;

  /**
   * Finds all content for a story
   */
  findByStory(storyId: string): Promise<StoryContent[]>;

  /**
   * Finds content by story ordered by sequence
   */
  findByStoryOrdered(storyId: string): Promise<StoryContent[]>;

  /**
   * Updates story content
   */
  update(id: string, data: UpdateStoryContentData): Promise<StoryContent | null>;

  /**
   * Deletes story content
   */
  delete(id: string): Promise<boolean>;

  /**
   * Finds content by sequence number
   */
  findBySequence(storyId: string, sequence: number): Promise<StoryContent | null>;

  /**
   * Gets the latest content for a story
   */
  findLatest(storyId: string): Promise<StoryContent | null>;

  /**
   * Gets the first content for a story
   */
  findFirst(storyId: string): Promise<StoryContent | null>;

  /**
   * Finds content with choices
   */
  findWithChoices(storyId: string): Promise<StoryContent[]>;

  /**
   * Finds content without choices
   */
  findWithoutChoices(storyId: string): Promise<StoryContent[]>;

  /**
   * Counts content for a story
   */
  countByStory(storyId: string): Promise<number>;

  /**
   * Finds content with multimedia (image or audio)
   */
  findMultimedia(storyId: string): Promise<StoryContent[]>;

  /**
   * Finds content by text search
   */
  searchByText(storyId: string, searchTerm: string): Promise<StoryContent[]>;

  /**
   * Gets content statistics for a story
   */
  getContentStatistics(storyId: string): Promise<{
    totalContent: number;
    contentWithChoices: number;
    contentWithImages: number;
    contentWithAudio: number;
    averageWordCount: number;
    totalWordCount: number;
  }>;

  /**
   * Reorders content sequences
   */
  reorderSequences(storyId: string, contentIds: string[]): Promise<boolean>;

  /**
   * Finds content that comes after a specific sequence
   */
  findAfterSequence(storyId: string, sequence: number): Promise<StoryContent[]>;

  /**
   * Finds content that comes before a specific sequence
   */
  findBeforeSequence(storyId: string, sequence: number): Promise<StoryContent[]>;

  /**
   * Gets the next sequence number for a story
   */
  getNextSequence(storyId: string): Promise<number>;

  /**
   * Checks if content exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Bulk creates content
   */
  bulkCreate(data: CreateStoryContentData[]): Promise<StoryContent[]>;

  /**
   * Bulk updates content
   */
  bulkUpdate(updates: Array<{ id: string; data: UpdateStoryContentData }>): Promise<number>;

  /**
   * Bulk deletes content
   */
  bulkDelete(ids: string[]): Promise<number>;

  /**
   * Finds orphaned content (content without a valid story)
   */
  findOrphaned(): Promise<StoryContent[]>;

  /**
   * Cleans up orphaned content
   */
  cleanupOrphaned(): Promise<number>;
}
