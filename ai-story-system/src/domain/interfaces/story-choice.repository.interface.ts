import { StoryChoice } from '../entities/story-choice.entity';
import { ChoiceType } from '../value-objects/choice-type.value-object';

export interface CreateStoryChoiceData {
  storyId: string;
  parentContentId: string;
  text: string;
  description?: string;
  type: ChoiceType;
  sequence: number;
  isAvailable?: boolean;
  nextContentId?: string;
}

export interface UpdateStoryChoiceData {
  text?: string;
  type?: ChoiceType;
  sequence?: number;
  isAvailable?: boolean;
  isSelected?: boolean;
  selectedAt?: Date;
}

export interface IStoryChoiceRepository {
  /**
   * Creates a new story choice
   */
  create(data: CreateStoryChoiceData): Promise<StoryChoice>;

  /**
   * Finds choice by ID
   */
  findById(id: string): Promise<StoryChoice | null>;

  /**
   * Finds all choices for a story
   */
  findByStory(storyId: string): Promise<StoryChoice[]>;

  /**
   * Finds choices for specific content
   */
  findByContent(contentId: string): Promise<StoryChoice[]>;

  /**
   * Finds available choices for content
   */
  findAvailableByContent(contentId: string): Promise<StoryChoice[]>;

  /**
   * Updates a choice
   */
  update(id: string, data: UpdateStoryChoiceData): Promise<StoryChoice | null>;

  /**
   * Deletes a choice
   */
  delete(id: string): Promise<boolean>;

  /**
   * Finds choices by type
   */
  findByType(storyId: string, type: ChoiceType): Promise<StoryChoice[]>;

  /**
   * Finds selected choices for a story
   */
  findSelected(storyId: string): Promise<StoryChoice[]>;

  /**
   * Finds unselected choices for a story
   */
  findUnselected(storyId: string): Promise<StoryChoice[]>;

  /**
   * Marks a choice as selected
   */
  markAsSelected(id: string): Promise<StoryChoice | null>;

  /**
   * Marks a choice as unselected
   */
  markAsUnselected(id: string): Promise<StoryChoice | null>;

  /**
   * Makes a choice available
   */
  makeAvailable(id: string): Promise<StoryChoice | null>;

  /**
   * Makes a choice unavailable
   */
  makeUnavailable(id: string): Promise<StoryChoice | null>;

  /**
   * Counts choices for a story
   */
  countByStory(storyId: string): Promise<number>;

  /**
   * Counts choices for content
   */
  countByContent(contentId: string): Promise<number>;

  /**
   * Counts selected choices for a story
   */
  countSelected(storyId: string): Promise<number>;

  /**
   * Gets choice statistics for a story
   */
  getChoiceStatistics(storyId: string): Promise<{
    totalChoices: number;
    selectedChoices: number;
    availableChoices: number;
    choicesByType: Record<ChoiceType, number>;
    averageChoicesPerContent: number;
  }>;

  /**
   * Finds choices by sequence range
   */
  findBySequenceRange(
    contentId: string,
    minSequence: number,
    maxSequence: number,
  ): Promise<StoryChoice[]>;

  /**
   * Reorders choice sequences
   */
  reorderSequences(contentId: string, choiceIds: string[]): Promise<boolean>;

  /**
   * Gets the next sequence number for content
   */
  getNextSequence(contentId: string): Promise<number>;

  /**
   * Finds choices that lead to specific content
   */
  findLeadingToContent(contentId: string): Promise<StoryChoice[]>;

  /**
   * Checks if choice exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Bulk creates choices
   */
  bulkCreate(data: CreateStoryChoiceData[]): Promise<StoryChoice[]>;

  /**
   * Bulk updates choices
   */
  bulkUpdate(
    updates: Array<{ id: string; data: UpdateStoryChoiceData }>,
  ): Promise<number>;

  /**
   * Bulk deletes choices
   */
  bulkDelete(ids: string[]): Promise<number>;

  /**
   * Finds orphaned choices (choices without valid content)
   */
  findOrphaned(): Promise<StoryChoice[]>;

  /**
   * Cleans up orphaned choices
   */
  cleanupOrphaned(): Promise<number>;

  /**
   * Finds choices by text search
   */
  searchByText(storyId: string, searchTerm: string): Promise<StoryChoice[]>;

  /**
   * Gets popular choice types
   */
  getPopularChoiceTypes(
    storyId?: string,
  ): Promise<Array<{ type: ChoiceType; count: number }>>;

  /**
   * Finds recently selected choices
   */
  findRecentlySelected(
    storyId?: string,
    limit?: number,
  ): Promise<StoryChoice[]>;

  /**
   * Gets choice selection patterns
   */
  getSelectionPatterns(storyId: string): Promise<{
    mostSelectedChoices: StoryChoice[];
    leastSelectedChoices: StoryChoice[];
    selectionRate: number;
  }>;
}
