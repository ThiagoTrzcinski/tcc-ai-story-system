import { Story } from '../entities/story.entity';
import { StoryGenre } from '../value-objects/story-genre.value-object';
import { StoryStatus } from '../value-objects/story-status.value-object';

export interface StorySettings {
  AIModel: string;
  generateImage?: boolean;
  generateAudio?: boolean;
}

export interface CreateStoryData {
  title: string;
  description: string;
  genre: StoryGenre;
  userId: number;
  prompts?: string[];
  settings?: StorySettings;
}

export interface UpdateStoryData {
  title?: string;
  description?: string;
  genre?: StoryGenre;
  status?: StoryStatus;
  currentContentId?: string;
  totalChoicesMade?: number;
  estimatedReadingTime?: number;
  settings?: StorySettings;
}

export interface StorySearchCriteria {
  userId?: number;
  status?: StoryStatus;
  genre?: StoryGenre;
  query?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface PaginatedStoryResult {
  stories: Story[];
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export interface StoryStatistics {
  totalStories: number;
  completedStories: number;
  publishedStories: number;
  averageChoicesPerStory: number;
  averageReadingTime: number;
  popularGenres: Array<{ genre: StoryGenre; count: number }>;
  recentActivity: Array<{ date: Date; count: number }>;
}

export interface IStoryRepository {
  /**
   * Creates a new story
   */
  create(data: CreateStoryData): Promise<Story>;

  /**
   * Finds a story by ID
   */
  findById(id: string): Promise<Story | null>;

  /**
   * Finds a story by ID with user access validation
   */
  findByIdWithUserAccess(id: string, userId: number): Promise<Story | null>;

  /**
   * Updates a story
   */
  update(id: string, data: UpdateStoryData): Promise<Story | null>;

  /**
   * Deletes a story (soft delete)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Permanently deletes a story
   */
  permanentDelete(id: string): Promise<boolean>;

  /**
   * Finds all stories for a user
   */
  findByUser(
    userId: number,
    page?: number,
    limit?: number,
  ): Promise<PaginatedStoryResult>;

  /**
   * Searches stories with criteria
   */
  search(
    criteria: StorySearchCriteria,
    page?: number,
    limit?: number,
  ): Promise<PaginatedStoryResult>;

  /**
   * Finds stories by status
   */
  findByStatus(
    status: StoryStatus,
    userId?: number,
    page?: number,
    limit?: number,
  ): Promise<PaginatedStoryResult>;

  /**
   * Finds stories by genre
   */
  findByGenre(
    genre: StoryGenre,
    userId?: number,
    page?: number,
    limit?: number,
  ): Promise<PaginatedStoryResult>;

  /**
   * Finds published stories
   */
  findPublished(
    page?: number,
    limit?: number,
    genre?: StoryGenre,
  ): Promise<PaginatedStoryResult>;

  /**
   * Finds popular stories
   */
  findPopular(
    limit?: number,
    genre?: StoryGenre,
    timeframe?: 'day' | 'week' | 'month' | 'year',
  ): Promise<Story[]>;

  /**
   * Finds recent stories
   */
  findRecent(limit?: number, userId?: number): Promise<Story[]>;

  /**
   * Counts stories by criteria
   */
  count(criteria?: Partial<StorySearchCriteria>): Promise<number>;

  /**
   * Gets story statistics
   */
  getStatistics(
    userId?: number,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<StoryStatistics>;

  /**
   * Checks if story exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Checks if user owns story
   */
  isOwnedByUser(id: string, userId: number): Promise<boolean>;

  /**
   * Archives a story
   */
  archive(id: string): Promise<boolean>;

  /**
   * Restores an archived story
   */
  restore(id: string): Promise<boolean>;

  /**
   * Finds archived stories
   */
  findArchived(
    userId?: number,
    page?: number,
    limit?: number,
  ): Promise<PaginatedStoryResult>;

  /**
   * Duplicates a story
   */
  duplicate(
    id: string,
    userId: number,
    newTitle?: string,
  ): Promise<Story | null>;

  /**
   * Updates story progress
   */
  updateProgress(
    id: string,
    currentContentId?: string,
    totalChoicesMade?: number,
  ): Promise<boolean>;

  /**
   * Gets stories that need cleanup (old, incomplete, etc.)
   */
  findForCleanup(olderThanDays: number, status?: StoryStatus): Promise<Story[]>;

  /**
   * Bulk updates stories
   */
  bulkUpdate(ids: string[], data: Partial<UpdateStoryData>): Promise<number>;

  /**
   * Bulk deletes stories
   */
  bulkDelete(ids: string[]): Promise<number>;
}
