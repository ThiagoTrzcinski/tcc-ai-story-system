import { StoryChoice } from '../entities/story-choice.entity';
import { StoryContent } from '../entities/story-content.entity';
import { Story } from '../entities/story.entity';
import { StoryGenre } from '../value-objects/story-genre.value-object';
import { StoryStatus } from '../value-objects/story-status.value-object';
import {
  PaginatedStoryResult,
  StorySearchCriteria,
  StorySettings,
  StoryStatistics,
} from './story.repository.interface';

export interface CreateStoryRequest {
  title: string;
  description: string;
  genre: StoryGenre;
  initialPrompt: string;
  settings?: StorySettings;
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
  genre?: StoryGenre;
  status?: StoryStatus;
  currentContentId?: string;
  totalChoicesMade?: number;
  estimatedReadingTime?: number;
  settings?: StorySettings;
}

export interface StoryProgressData {
  storyId: string;
  currentContentId?: string;
  choicesMade: number;
  progressPercentage: number;
  estimatedTimeRemaining: number;
  lastAccessedAt: Date;
}

export interface StoryGenerationRequest {
  storyId: string;
  prompt: string;
  continueFromContentId?: string;
  generateChoices?: boolean;
  choiceCount?: number;
  includeImage?: boolean;
  includeAudio?: boolean;
  settings?: StorySettings;
}

export interface StoryGenerationResult {
  success: boolean;
  content?: StoryContent;
  choices?: StoryChoice[];
  error?: string;
  generationTime?: number;
  tokensUsed?: number;
}

// StorySearchCriteria is imported from story.repository.interface

// PaginatedStoryResult is imported from story.repository.interface

// StoryStatistics is imported from story.repository.interface

export interface IStoryService {
  /**
   * Creates a new story
   */
  createStory(data: CreateStoryRequest, userId: number): Promise<Story>;

  /**
   * Gets a story by ID with user access validation
   */
  getStoryById(storyId: string, userId: number): Promise<Story | null>;

  /**
   * Updates a story
   */
  updateStory(
    storyId: string,
    data: UpdateStoryRequest,
    userId: number,
  ): Promise<Story | null>;

  /**
   * Deletes a story
   */
  deleteStory(storyId: string, userId: number): Promise<boolean>;

  /**
   * Gets all stories for a user
   */
  getUserStories(
    userId: number,
    page?: number,
    limit?: number,
  ): Promise<PaginatedStoryResult>;

  /**
   * Searches stories with criteria
   */
  searchStories(
    criteria: StorySearchCriteria,
    page?: number,
    limit?: number,
  ): Promise<PaginatedStoryResult>;

  /**
   * Unpublishes a story
   */
  unpublishStory(storyId: string, userId: number): Promise<Story | null>;

  /**
   * Completes a story
   */
  completeStory(storyId: string, userId: number): Promise<Story | null>;

  /**
   * Makes a choice in a story
   */
  makeChoice(
    storyId: string,
    choiceId: string,
    userId: number,
  ): Promise<Story | null>;

  /**
   * Continues a story with AI generation
   */
  continueStory(
    request: StoryGenerationRequest,
    userId: number,
  ): Promise<StoryGenerationResult>;

  /**
   * Gets complete story details including progress and statistics
   */
  getStoryDetails(
    storyId: string,
    userId: number,
  ): Promise<{
    story: Story;
    progress: StoryProgressData;
    statistics: StoryStatistics;
    content: any[];
    choices: any[];
  } | null>;

  /**
   * Validates story data
   */
  validateStoryData(data: CreateStoryRequest | UpdateStoryRequest): {
    isValid: boolean;
    errors: string[];
  };

  /**
   * Archives a story
   */
  archiveStory(storyId: string, userId: number): Promise<Story | null>;

  /**
   * Restores an archived story
   */
  restoreStory(storyId: string, userId: number): Promise<Story | null>;
}
