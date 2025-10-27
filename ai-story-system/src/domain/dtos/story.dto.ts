import { StoryGenre } from '../value-objects/story-genre.value-object';
import { StoryStatus } from '../value-objects/story-status.value-object';

export interface StorySettingsDto {
  AIModel: string;
  generateImage?: boolean;
  generateAudio?: boolean;
}

export interface CreateStoryDto {
  title: string;
  description: string;
  genre: StoryGenre;
  initialPrompt: string;
  settings?: StorySettingsDto;
}

export interface UpdateStoryDto {
  title?: string;
  description?: string;
  genre?: StoryGenre;
  settings?: StorySettingsDto;
}

export interface StoryResponseDto {
  id: string;
  title: string;
  description: string;
  genre: StoryGenre;
  userId: number;
  status: StoryStatus;
  prompts: string[];
  settings: StorySettingsDto;
  createdAt: Date;
  updatedAt: Date;
  currentContentId?: string;
  totalChoicesMade?: number;
  estimatedReadingTime?: number;
  progressPercentage: number;
  canBePublished: boolean;
  isActive: boolean;
}

export interface StoryListDto {
  id: string;
  title: string;
  description: string;
  genre: StoryGenre;
  status: StoryStatus;
  createdAt: Date;
  updatedAt: Date;
  progressPercentage: number;
  estimatedReadingTime?: number;
}

export interface StoryDetailDto extends StoryResponseDto {
  content: StoryContentDto[];
  choices: StoryChoiceDto[];
}

export interface StoryContentDto {
  id: string;
  storyId: string;
  textContent: string;
  sequence: number;
  createdAt: Date;
  imageUrl?: string;
  audioUrl?: string;
  hasChoices: boolean;
  choiceCount: number;
  wordCount: number;
  estimatedReadingTime: number;
  isMultimedia: boolean;
}

export interface StoryChoiceDto {
  id: string;
  storyId: string;
  parentContentId: string;
  text: string;
  type: string;
  sequence: number;
  createdAt: Date;
  isAvailable: boolean;
  isSelected: boolean;
  selectedAt?: Date;
  displayText: string;
  isSelectable: boolean;
}

export interface StoryProgressDto {
  storyId: string;
  currentContentId?: string;
  choicesMade: number;
  progressPercentage: number;
  estimatedTimeRemaining: number;
  lastAccessedAt: Date;
}

export interface StoryStatisticsDto {
  totalStories: number;
  completedStories: number;
  inProgressStories: number;
  publishedStories: number;
  averageReadingTime: number;
  totalChoicesMade: number;
  popularGenres: Array<{ genre: StoryGenre; count: number }>;
  userEngagement: {
    averageSessionTime: number;
    averageStoriesPerUser: number;
    completionRate: number;
  };
}

export interface PaginatedStoriesDto {
  stories: StoryListDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StorySearchDto {
  title?: string;
  genre?: StoryGenre;
  status?: StoryStatus;
  userId?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  page?: number;
  limit?: number;
}

export interface StoryGenerationRequestDto {
  storyId: string;
  prompt: string;
  continueFromContentId?: string;
  generateChoices?: boolean;
  choiceCount?: number;
  includeImage?: boolean;
  includeAudio?: boolean;
  settings?: StorySettingsDto;
}

export interface StoryGenerationResultDto {
  success: boolean;
  content?: StoryContentDto;
  choices?: StoryChoiceDto[];
  error?: string;
  generationTime?: number;
  tokensUsed?: number;
}

export interface MakeChoiceDto {
  storyId: string;
  choiceId: string;
}

export interface AddContentDto {
  storyId: string;
  textContent: string;
  imageUrl?: string;
  audioUrl?: string;
  hasChoices?: boolean;
}

export interface AddChoicesDto {
  storyId: string;
  contentId: string;
  choices: Array<{
    text: string;
    type: string;
  }>;
}
