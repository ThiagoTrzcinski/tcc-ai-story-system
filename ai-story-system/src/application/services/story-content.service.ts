import { inject, injectable } from 'tsyringe';
import { StoryContent } from '../../domain/entities/story-content.entity';
import { IStoryContentRepository } from '../../domain/interfaces/story-content.repository.interface';
import { IStoryRepository } from '../../domain/interfaces/story.repository.interface';

export interface CreateContentRequest {
  storyId: string;
  textContent: string;
  sequence: number;
  imageUrl?: string;
  audioUrl?: string;
  hasChoices?: boolean;
}

export interface UpdateContentRequest {
  textContent?: string;
  imageUrl?: string;
  audioUrl?: string;
  hasChoices?: boolean;
}

export interface IStoryContentService {
  createContent(
    data: CreateContentRequest,
    userId: number,
  ): Promise<StoryContent>;
  getContentById(
    contentId: string,
    userId: number,
  ): Promise<StoryContent | null>;
  updateContent(
    contentId: string,
    data: UpdateContentRequest,
    userId: number,
  ): Promise<StoryContent | null>;
  deleteContent(contentId: string, userId: number): Promise<boolean>;
  getStoryContent(storyId: string, userId: number): Promise<StoryContent[]>;
  getNextSequence(storyId: string): Promise<number>;
}

@injectable()
export class StoryContentService implements IStoryContentService {
  constructor(
    @inject('IStoryContentRepository')
    private contentRepository: IStoryContentRepository,
    @inject('IStoryRepository') private storyRepository: IStoryRepository,
  ) {}

  async createContent(
    data: CreateContentRequest,
    userId: number,
  ): Promise<StoryContent> {
    try {
      // Verify user owns the story
      const story = await this.storyRepository.findByIdWithUserAccess(
        data.storyId,
        userId,
      );
      if (!story) {
        throw new Error('Story not found or access denied');
      }

      // Create the content
      const content = await this.contentRepository.create({
        storyId: data.storyId,
        textContent: data.textContent,
        sequence: data.sequence,
        imageUrl: data.imageUrl,
        audioUrl: data.audioUrl,
        hasChoices: data.hasChoices || false,
      });

      return content;
    } catch (error) {
      console.error('Error creating content:', error);
      throw new Error(
        `Failed to create content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getContentById(
    contentId: string,
    userId: number,
  ): Promise<StoryContent | null> {
    try {
      const content = await this.contentRepository.findById(contentId);
      if (!content) {
        return null;
      }

      // Verify user owns the story
      const story = await this.storyRepository.findByIdWithUserAccess(
        content.storyId,
        userId,
      );
      if (!story) {
        throw new Error('Access denied');
      }

      return content;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw new Error(
        `Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateContent(
    contentId: string,
    data: UpdateContentRequest,
    userId: number,
  ): Promise<StoryContent | null> {
    try {
      // Verify user owns the content
      const existingContent = await this.getContentById(contentId, userId);
      if (!existingContent) {
        throw new Error('Content not found or access denied');
      }

      // Update the content
      return await this.contentRepository.update(contentId, data);
    } catch (error) {
      console.error('Error updating content:', error);
      throw new Error(
        `Failed to update content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteContent(contentId: string, userId: number): Promise<boolean> {
    try {
      // Verify user owns the content
      const existingContent = await this.getContentById(contentId, userId);
      if (!existingContent) {
        throw new Error('Content not found or access denied');
      }

      return await this.contentRepository.delete(contentId);
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }

  async getStoryContent(
    storyId: string,
    userId: number,
  ): Promise<StoryContent[]> {
    try {
      // Verify user owns the story
      const story = await this.storyRepository.findByIdWithUserAccess(
        storyId,
        userId,
      );
      if (!story) {
        throw new Error('Story not found or access denied');
      }

      return await this.contentRepository.findByStory(storyId);
    } catch (error) {
      console.error('Error fetching story content:', error);
      throw new Error(
        `Failed to fetch story content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getNextSequence(storyId: string): Promise<number> {
    try {
      return await this.contentRepository.getNextSequence(storyId);
    } catch (error) {
      console.error('Error getting next sequence:', error);
      throw new Error(
        `Failed to get next sequence: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
