import { inject, injectable } from 'tsyringe';
import { StoryChoice } from '../../domain/entities/story-choice.entity';
import { IStoryChoiceRepository } from '../../domain/interfaces/story-choice.repository.interface';
import { IStoryContentRepository } from '../../domain/interfaces/story-content.repository.interface';
import { IStoryRepository } from '../../domain/interfaces/story.repository.interface';
import { ChoiceType } from '../../domain/value-objects/choice-type.value-object';

export interface CreateChoiceRequest {
  storyId: string;
  parentContentId: string;
  text: string;
  description?: string;
  type: ChoiceType;
  sequence: number;
  nextContentId?: string;
}

export interface UpdateChoiceRequest {
  text?: string;
  type?: ChoiceType;
  sequence?: number;
  nextContentId?: string;
  isAvailable?: boolean;
  isSelected?: boolean;
}

export interface IStoryChoiceService {
  createChoice(data: CreateChoiceRequest, userId: number): Promise<StoryChoice>;
  getChoiceById(choiceId: string, userId: number): Promise<StoryChoice | null>;
  updateChoice(
    choiceId: string,
    data: UpdateChoiceRequest,
    userId: number,
  ): Promise<StoryChoice | null>;
  deleteChoice(choiceId: string, userId: number): Promise<boolean>;
  getContentChoices(contentId: string, userId: number): Promise<StoryChoice[]>;
  selectChoice(choiceId: string, userId: number): Promise<StoryChoice | null>;
  markAsSelected(choiceId: string): Promise<StoryChoice | null>;
}

@injectable()
export class StoryChoiceService implements IStoryChoiceService {
  constructor(
    @inject('IStoryChoiceRepository')
    private choiceRepository: IStoryChoiceRepository,
    @inject('IStoryRepository') private storyRepository: IStoryRepository,
    @inject('IStoryContentRepository')
    private contentRepository: IStoryContentRepository,
  ) {}

  async createChoice(
    data: CreateChoiceRequest,
    userId: number,
  ): Promise<StoryChoice> {
    try {
      // Verify user owns the story
      const story = await this.storyRepository.findByIdWithUserAccess(
        data.storyId,
        userId,
      );
      if (!story) {
        throw new Error('Story not found or access denied');
      }

      // Verify the parent content exists
      const content = await this.contentRepository.findById(
        data.parentContentId,
      );
      if (!content || content.storyId !== data.storyId) {
        throw new Error(
          'Parent content not found or does not belong to this story',
        );
      }

      // Create the choice
      const choice = await this.choiceRepository.create({
        storyId: data.storyId,
        parentContentId: data.parentContentId,
        text: data.text,
        description: data.description,
        type: data.type,
        sequence: data.sequence,
      });

      return choice;
    } catch (error) {
      console.error('Error creating choice:', error);
      throw new Error(
        `Failed to create choice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getChoiceById(
    choiceId: string,
    userId: number,
  ): Promise<StoryChoice | null> {
    try {
      const choice = await this.choiceRepository.findById(choiceId);
      if (!choice) {
        return null;
      }

      // Verify user owns the story
      const story = await this.storyRepository.findByIdWithUserAccess(
        choice.storyId,
        userId,
      );
      if (!story) {
        throw new Error('Access denied');
      }

      return choice;
    } catch (error) {
      console.error('Error fetching choice:', error);
      throw new Error(
        `Failed to fetch choice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateChoice(
    choiceId: string,
    data: UpdateChoiceRequest,
    userId: number,
  ): Promise<StoryChoice | null> {
    try {
      // Verify user owns the choice
      const existingChoice = await this.getChoiceById(choiceId, userId);
      if (!existingChoice) {
        throw new Error('Choice not found or access denied');
      }

      // Update the choice
      return await this.choiceRepository.update(choiceId, data);
    } catch (error) {
      console.error('Error updating choice:', error);
      throw new Error(
        `Failed to update choice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteChoice(choiceId: string, userId: number): Promise<boolean> {
    try {
      // Verify user owns the choice
      const existingChoice = await this.getChoiceById(choiceId, userId);
      if (!existingChoice) {
        throw new Error('Choice not found or access denied');
      }

      return await this.choiceRepository.delete(choiceId);
    } catch (error) {
      console.error('Error deleting choice:', error);
      return false;
    }
  }

  async getContentChoices(
    contentId: string,
    userId: number,
  ): Promise<StoryChoice[]> {
    try {
      // Verify the content exists and user has access
      const content = await this.contentRepository.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Verify user owns the story
      const story = await this.storyRepository.findByIdWithUserAccess(
        content.storyId,
        userId,
      );
      if (!story) {
        throw new Error('Access denied');
      }

      return await this.choiceRepository.findByContent(contentId);
    } catch (error) {
      console.error('Error fetching content choices:', error);
      throw new Error(
        `Failed to fetch content choices: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async selectChoice(
    choiceId: string,
    userId: number,
  ): Promise<StoryChoice | null> {
    try {
      // Verify user owns the choice
      const choice = await this.getChoiceById(choiceId, userId);
      if (!choice) {
        throw new Error('Choice not found or access denied');
      }

      // Mark the choice as selected
      return await this.choiceRepository.markAsSelected(choiceId);
    } catch (error) {
      console.error('Error selecting choice:', error);
      throw new Error(
        `Failed to select choice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async markAsSelected(choiceId: string): Promise<StoryChoice | null> {
    try {
      return await this.choiceRepository.markAsSelected(choiceId);
    } catch (error) {
      console.error('Error marking choice as selected:', error);
      throw new Error(
        `Failed to mark choice as selected: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
