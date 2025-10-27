import { container, inject, injectable } from 'tsyringe';
import { StoryGenerationRequestDto } from '../../domain/dtos/story.dto';
import { StoryChoice } from '../../domain/entities/story-choice.entity';
import { Story } from '../../domain/entities/story.entity';
import {
  ExternalServiceError,
  ForbiddenError,
  ValidationError,
} from '../../domain/errors';
import { IAIOrchestrationService } from '../../domain/interfaces/ai-orchestration.service.interface';
import { IStoryChoiceRepository } from '../../domain/interfaces/story-choice.repository.interface';
import { IStoryContentRepository } from '../../domain/interfaces/story-content.repository.interface';
import {
  IStoryRepository,
  PaginatedStoryResult,
  StoryStatistics,
} from '../../domain/interfaces/story.repository.interface';
import {
  CreateStoryRequest,
  IStoryService,
  StoryGenerationResult,
  StoryProgressData,
  UpdateStoryRequest,
} from '../../domain/interfaces/story.service.interface';
import { ChoiceType } from '../../domain/value-objects/choice-type.value-object';
import { StoryStatus } from '../../domain/value-objects/story-status.value-object';

@injectable()
export class StoryService implements IStoryService {
  constructor(
    @inject('IStoryRepository') private storyRepository: IStoryRepository,
    @inject('IStoryContentRepository')
    private contentRepository: IStoryContentRepository,
    @inject('IStoryChoiceRepository')
    private choiceRepository: IStoryChoiceRepository,
    @inject('IAIOrchestrationService')
    private aiService: IAIOrchestrationService,
  ) {}

  async createStory(data: CreateStoryRequest, userId: number): Promise<Story> {
    // Validação usando erros customizados
    const validation = this.validateStoryData(data);
    if (!validation.isValid) {
      throw new ValidationError(
        'Invalid story data',
        { errors: validation.errors },
        { userId, operation: 'create_story' },
      );
    }

    try {
      // Create the story
      const story = await this.storyRepository.create({
        title: data.title,
        description: data.description,
        genre: data.genre,
        userId,
        prompts: data.initialPrompt ? [data.initialPrompt] : [],
        settings: data.settings,
      });

      return story;
    } catch (error) {
      // Transformar erros de banco em erros de domínio
      if (error instanceof Error) {
        if (
          error.message.includes('duplicate') ||
          error.message.includes('unique')
        ) {
          throw new ValidationError(
            'A story with this title already exists',
            { title: data.title },
            { userId, operation: 'create_story' },
          );
        }

        if (
          error.message.includes('database') ||
          error.message.includes('connection')
        ) {
          throw ExternalServiceError.database('create_story', error.message, {
            userId,
            operation: 'create_story',
          });
        }
      }

      // Re-lançar erro original se não conseguir categorizar
      throw error;
    }
  }

  async getStoryById(storyId: string, userId: number): Promise<Story | null> {
    try {
      const story = await this.storyRepository.findByIdWithUserAccess(
        storyId,
        userId,
      );

      // Se não encontrou a história, pode ser que não existe ou o usuário não tem acesso
      if (!story) {
        // Verificar se a história existe para outro usuário
        const storyExists = await this.storyRepository.findById(storyId);
        if (storyExists) {
          // História existe mas usuário não tem acesso
          throw ForbiddenError.storyAccess(storyId, userId, {
            storyId,
            userId,
            operation: 'get_story',
          });
        }
        // História não existe
        return null;
      }

      return story;
    } catch (error) {
      // Se já é um erro de domínio, re-lançar
      if (error instanceof ForbiddenError) {
        throw error;
      }

      // Transformar outros erros
      if (error instanceof Error) {
        if (
          error.message.includes('database') ||
          error.message.includes('connection')
        ) {
          throw ExternalServiceError.database('get_story', error.message, {
            storyId,
            userId,
            operation: 'get_story',
          });
        }
      }

      throw error;
    }
  }

  async updateStory(
    storyId: string,
    data: UpdateStoryRequest,
    userId: number,
  ): Promise<Story | null> {
    try {
      // Validate update data
      const validation = this.validateStoryData(data);
      if (!validation.isValid) {
        throw new ValidationError(
          'Invalid story update data',
          { errors: validation.errors },
          { storyId, userId, operation: 'update_story' },
        );
      }

      // Verify user owns the story
      const existingStory = await this.storyRepository.findByIdWithUserAccess(
        storyId,
        userId,
      );
      if (!existingStory) {
        // Check if story exists for another user
        const storyExists = await this.storyRepository.findById(storyId);
        if (storyExists) {
          throw ForbiddenError.storyAccess(storyId, userId, {
            storyId,
            userId,
            operation: 'update_story',
          });
        }
        // Story doesn't exist at all
        return null;
      }

      // Update the story
      return await this.storyRepository.update(storyId, data);
    } catch (error) {
      // Re-throw domain errors
      if (error instanceof ValidationError || error instanceof ForbiddenError) {
        throw error;
      }

      // Transform other errors
      if (error instanceof Error) {
        if (
          error.message.includes('database') ||
          error.message.includes('connection')
        ) {
          throw ExternalServiceError.database('update_story', error.message, {
            storyId,
            userId,
            operation: 'update_story',
          });
        }
      }

      throw error;
    }
  }

  async deleteStory(storyId: string, userId: number): Promise<boolean> {
    try {
      // Verify user owns the story
      const existingStory = await this.storyRepository.findByIdWithUserAccess(
        storyId,
        userId,
      );
      if (!existingStory) {
        // Check if story exists for another user
        const storyExists = await this.storyRepository.findById(storyId);
        if (storyExists) {
          throw ForbiddenError.storyAccess(storyId, userId, {
            storyId,
            userId,
            operation: 'delete_story',
          });
        }
        // Story doesn't exist, consider it already deleted
        return true;
      }

      return await this.storyRepository.delete(storyId);
    } catch (error) {
      // Re-throw domain errors
      if (error instanceof ForbiddenError) {
        throw error;
      }

      // Transform other errors
      if (error instanceof Error) {
        if (
          error.message.includes('database') ||
          error.message.includes('connection')
        ) {
          throw ExternalServiceError.database('delete_story', error.message, {
            storyId,
            userId,
            operation: 'delete_story',
          });
        }
      }

      // For unknown errors, return false instead of throwing
      console.error('Error deleting story:', error);
      return false;
    }
  }

  async getUserStories(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedStoryResult> {
    try {
      return await this.storyRepository.findByUser(userId, page, limit);
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw new Error(
        `Failed to fetch user stories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async searchStories(
    criteria: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedStoryResult> {
    try {
      return await this.storyRepository.search(criteria, page, limit);
    } catch (error) {
      console.error('Error searching stories:', error);
      throw new Error(
        `Failed to search stories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async unpublishStory(storyId: string, userId: number): Promise<Story | null> {
    try {
      return await this.updateStory(
        storyId,
        { status: StoryStatus.DRAFT },
        userId,
      );
    } catch (error) {
      console.error('Error unpublishing story:', error);
      throw new Error(
        `Failed to unpublish story: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async completeStory(storyId: string, userId: number): Promise<Story | null> {
    try {
      return await this.updateStory(
        storyId,
        { status: StoryStatus.COMPLETED },
        userId,
      );
    } catch (error) {
      console.error('Error completing story:', error);
      throw new Error(
        `Failed to complete story: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  validateStoryData(data: CreateStoryRequest | UpdateStoryRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('title' in data && data.title) {
      if (data.title.length < 3) {
        errors.push('Title must be at least 3 characters long');
      }
      if (data.title.length > 200) {
        errors.push('Title must be less than 200 characters');
      }
    }

    if ('description' in data && data.description) {
      if (data.description.length < 10) {
        errors.push('Description must be at least 10 characters long');
      }
      if (data.description.length > 1000) {
        errors.push('Description must be less than 1000 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async makeChoice(
    storyId: string,
    choiceId: string,
    userId: number,
  ): Promise<Story | null> {
    try {
      // First, get the story to verify access
      const story = await this.storyRepository.findById(storyId);
      if (!story) {
        throw new Error('Story not found');
      }

      // Verify user access
      const hasAccess = await this.storyRepository.isOwnedByUser(
        storyId,
        userId,
      );
      if (!hasAccess) {
        throw new Error('Access denied');
      }

      // Make the choice using the story entity method (validates choice exists)
      const updatedStory = story.makeChoice(choiceId);

      // Mark the choice as selected in the database
      await this.choiceRepository.markAsSelected(choiceId);

      // Update the story in the repository
      return await this.storyRepository.update(storyId, {
        totalChoicesMade: updatedStory.totalChoicesMade,
      });
    } catch (error) {
      console.error('Error making choice:', error);
      throw new Error(
        `Failed to make choice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async continueStory(
    request: StoryGenerationRequestDto,
    userId: number,
  ): Promise<StoryGenerationResult> {
    try {
      const { storyId, continueFromContentId } = request;

      // Verify user owns the story
      const story = await this.storyRepository.findByIdWithUserAccess(
        storyId,
        userId,
      );
      if (!story) {
        throw ForbiddenError.storyAccess(storyId, userId, {
          storyId,
          userId,
          operation: 'continue_story',
        });
      }

      // Check if story is in a valid state to continue
      if (story.status === StoryStatus.COMPLETED) {
        throw new ValidationError(
          'Cannot continue a completed story',
          { currentStatus: story.status },
          { storyId, userId, operation: 'continue_story' },
        );
      }

      if (story.status === StoryStatus.ARCHIVED) {
        throw new ValidationError(
          'Cannot continue an archived story',
          { currentStatus: story.status },
          { storyId, userId, operation: 'continue_story' },
        );
      }

      // Get current content count to determine next segment
      const existingContent = await this.contentRepository.findByStory(storyId);
      const currentContentCount = existingContent.length;

      // Check if story has reached maximum segments (5 for MockedAI)
      const maxSegments = 5;
      if (currentContentCount >= maxSegments) {
        // Story is complete - update status
        await this.storyRepository.update(storyId, {
          status: StoryStatus.COMPLETED,
        });

        return {
          success: false,
          error: 'Story has reached its conclusion',
        };
      }

      // If continueFromContentId is provided, validate it's a selected choice
      if (continueFromContentId) {
        const choice = await this.choiceRepository.findById(
          continueFromContentId,
        );
        if (!choice) {
          throw new ValidationError(
            'Invalid choice reference for continuation',
            { choiceId: continueFromContentId },
            { storyId, userId, operation: 'continue_story' },
          );
        }

        if (!choice.isSelected) {
          throw new ValidationError(
            'Cannot continue from unselected choice',
            { choiceId: continueFromContentId, isSelected: choice.isSelected },
            { storyId, userId, operation: 'continue_story' },
          );
        }

        if (choice.storyId !== storyId) {
          throw new ValidationError(
            'Choice does not belong to this story',
            { choiceId: continueFromContentId, choiceStoryId: choice.storyId },
            { storyId, userId, operation: 'continue_story' },
          );
        }
      }

      // Generate next content using AI
      const aiService = container.resolve('IAIOrchestrationService') as any;
      const nextSequence = currentContentCount + 1;

      const generationResult = await aiService.generateText({
        prompt:
          request.prompt || 'Continue the story based on the previous choice',
        storyId,
        userId,
        provider: story.settings?.AIModel || 'mocked',
        genre: story.genre,
        parentContentId: continueFromContentId,
        currentContentCount: currentContentCount,
      });

      if (!generationResult.success) {
        throw ExternalServiceError.aiProvider(
          'continue_story',
          generationResult.error || 'Failed to generate content',
          { storyId, userId, operation: 'continue_story' },
        );
      }

      // Save the new content
      const savedContent = await this.contentRepository.create({
        storyId,
        textContent: generationResult.content || '',
        sequence: nextSequence,
        hasChoices: nextSequence < maxSegments, // Only add choices if not the last segment
      });

      // Generate choices for the new content (if not the last segment)
      let choices: StoryChoice[] = [];
      if (nextSequence < maxSegments) {
        try {
          const choicesResult = await aiService.generateText({
            prompt: `Generate 4 choices for this story content: ${savedContent.textContent}`,
            storyId,
            userId,
            provider: story.settings?.AIModel || 'mocked',
            genre: story.genre,
            parentContentId: savedContent.id,
            currentContentCount: nextSequence,
          });

          if (choicesResult.success && choicesResult.content) {
            // Parse choices from AI response
            let choicesData: any[] = [];
            try {
              const parsedChoices = JSON.parse(choicesResult.content);
              choicesData = Array.isArray(parsedChoices) ? parsedChoices : [];
            } catch (parseError) {
              console.warn('Failed to parse AI choices, using fallback');
              choicesData = [];
            }

            // Create and save choices (ensure exactly 4)
            for (let i = 0; i < Math.min(choicesData.length, 4); i++) {
              const choiceData = choicesData[i];
              const savedChoice = await this.choiceRepository.create({
                storyId,
                parentContentId: savedContent.id,
                text: choiceData.text || `Choice ${i + 1}`,
                description:
                  choiceData.description || `Description for choice ${i + 1}`,
                type: choiceData.type || ChoiceType.ACTION,
                sequence: i + 1,
              });
              choices.push(savedChoice);
            }

            // Fill remaining choices if needed
            while (choices.length < 4) {
              const savedChoice = await this.choiceRepository.create({
                storyId,
                parentContentId: savedContent.id,
                text: `Continue the adventure ${choices.length + 1}`,
                description: `A path forward in the story`,
                type: ChoiceType.ACTION,
                sequence: choices.length + 1,
              });
              choices.push(savedChoice);
            }
          }
        } catch (error) {
          console.warn(
            'Choice generation failed, continuing without choices:',
            error,
          );
        }
      }

      // Update story status if this was the last segment
      if (nextSequence >= maxSegments) {
        await this.storyRepository.update(storyId, {
          status: StoryStatus.COMPLETED,
        });
      }

      return {
        success: true,
        content: savedContent,
        choices: choices,
        generationTime: Date.now(),
      };
    } catch (error) {
      // Re-throw domain errors
      if (
        error instanceof ForbiddenError ||
        error instanceof ValidationError ||
        error instanceof ExternalServiceError
      ) {
        throw error;
      }

      // Transform other errors
      if (error instanceof Error) {
        if (
          error.message.includes('database') ||
          error.message.includes('connection')
        ) {
          throw ExternalServiceError.database('continue_story', error.message, {
            storyId: request.storyId,
            userId,
            operation: 'continue_story',
          });
        }
      }

      throw error;
    }
  }

  async getStoryDetails(
    storyId: string,
    userId: number,
  ): Promise<{
    story: Story;
    progress: StoryProgressData;
    statistics: StoryStatistics;
    content: any[];
    choices: any[];
  } | null> {
    try {
      // Verify user owns the story
      const story = await this.storyRepository.findByIdWithUserAccess(
        storyId,
        userId,
      );
      if (!story) {
        throw ForbiddenError.storyAccess(storyId, userId, {
          storyId,
          userId,
          operation: 'get_story_details',
        });
      }

      // Get all content for this story
      const content = await this.contentRepository.findByStory(storyId);

      // Get all choices for this story
      const choices = await this.choiceRepository.findByStory(storyId);

      // Calculate progress
      const maxSegments = 5; // MockedAI has 5 segments
      const currentContentCount = content.length;
      const progressPercentage = Math.min(
        (currentContentCount / maxSegments) * 100,
        100,
      );
      const choicesMade = choices.filter((choice) => choice.isSelected).length;

      const progress: StoryProgressData = {
        storyId,
        currentContentId:
          content.length > 0 ? content[content.length - 1].id : undefined,
        choicesMade,
        progressPercentage,
        estimatedTimeRemaining: Math.max(
          0,
          (maxSegments - currentContentCount) * 2,
        ), // 2 minutes per segment
        lastAccessedAt: new Date(),
      };

      // Calculate statistics
      const statistics: StoryStatistics = {
        totalStories: 1, // This specific story
        completedStories: story.status === StoryStatus.COMPLETED ? 1 : 0,
        publishedStories: story.status === StoryStatus.PUBLISHED ? 1 : 0,
        averageChoicesPerStory: choicesMade,
        averageReadingTime: currentContentCount * 3, // 3 minutes per content segment
        popularGenres: [{ genre: story.genre, count: 1 }],
        recentActivity: [{ date: new Date(), count: 1 }],
      };

      return {
        story,
        progress,
        statistics,
        content: content.map((c) => ({
          id: c.id,
          textContent: c.textContent,
          sequence: c.sequence,
          hasChoices: c.hasChoices,
          imageUrl: c.imageUrl,
          audioUrl: c.audioUrl,
          createdAt: c.createdAt,
        })),
        choices: choices.map((ch) => ({
          id: ch.id,
          parentContentId: ch.parentContentId,
          text: ch.text,
          description: ch.description,
          type: ch.type,
          sequence: ch.sequence,
          isAvailable: ch.isAvailable,
          isSelected: ch.isSelected,
          selectedAt: ch.selectedAt,
        })),
      };
    } catch (error) {
      // Re-throw domain errors
      if (error instanceof ForbiddenError) {
        throw error;
      }

      // Transform other errors
      if (error instanceof Error) {
        if (
          error.message.includes('database') ||
          error.message.includes('connection')
        ) {
          throw ExternalServiceError.database(
            'get_story_details',
            error.message,
            {
              storyId,
              userId,
              operation: 'get_story_details',
            },
          );
        }
      }

      throw error;
    }
  }

  async archiveStory(storyId: string, userId: number): Promise<Story | null> {
    try {
      // Verify user owns the story
      const existingStory = await this.storyRepository.findByIdWithUserAccess(
        storyId,
        userId,
      );
      if (!existingStory) {
        throw ForbiddenError.storyAccess(storyId, userId, {
          storyId,
          userId,
          operation: 'archive_story',
        });
      }

      // Check if story can be archived (must be COMPLETED or PUBLISHED)
      if (
        existingStory.status !== StoryStatus.COMPLETED &&
        existingStory.status !== StoryStatus.PUBLISHED
      ) {
        throw new ValidationError(
          'Only completed or published stories can be archived',
          { currentStatus: existingStory.status },
          { storyId, userId, operation: 'archive_story' },
        );
      }

      // Archive the story
      return await this.storyRepository.update(storyId, {
        status: StoryStatus.ARCHIVED,
      });
    } catch (error) {
      // Re-throw domain errors
      if (error instanceof ForbiddenError || error instanceof ValidationError) {
        throw error;
      }

      // Transform other errors
      if (error instanceof Error) {
        if (
          error.message.includes('database') ||
          error.message.includes('connection')
        ) {
          throw ExternalServiceError.database('archive_story', error.message, {
            storyId,
            userId,
            operation: 'archive_story',
          });
        }
      }

      throw error;
    }
  }

  async restoreStory(storyId: string, userId: number): Promise<Story | null> {
    try {
      // Verify user owns the story
      const existingStory = await this.storyRepository.findByIdWithUserAccess(
        storyId,
        userId,
      );
      if (!existingStory) {
        throw ForbiddenError.storyAccess(storyId, userId, {
          storyId,
          userId,
          operation: 'restore_story',
        });
      }

      // Check if story can be restored (must be ARCHIVED)
      if (existingStory.status !== StoryStatus.ARCHIVED) {
        throw new ValidationError(
          'Only archived stories can be restored',
          { currentStatus: existingStory.status },
          { storyId, userId, operation: 'restore_story' },
        );
      }

      // Restore the story to its previous status (default to COMPLETED)
      // In a more sophisticated implementation, we could store the previous status
      return await this.storyRepository.update(storyId, {
        status: StoryStatus.COMPLETED,
      });
    } catch (error) {
      // Re-throw domain errors
      if (error instanceof ForbiddenError || error instanceof ValidationError) {
        throw error;
      }

      // Transform other errors
      if (error instanceof Error) {
        if (
          error.message.includes('database') ||
          error.message.includes('connection')
        ) {
          throw ExternalServiceError.database('restore_story', error.message, {
            storyId,
            userId,
            operation: 'restore_story',
          });
        }
      }

      throw error;
    }
  }
}
