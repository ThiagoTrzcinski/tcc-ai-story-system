import { injectable } from 'tsyringe';
import { Between, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import dataSource from '../../data-source';
import { StoryChoice } from '../../domain/entities/story-choice.entity';
import {
  CreateStoryChoiceData,
  IStoryChoiceRepository,
  UpdateStoryChoiceData,
} from '../../domain/interfaces/story-choice.repository.interface';
import { ChoiceType } from '../../domain/value-objects/choice-type.value-object';
import { StoryChoiceEntity } from '../../entities/story-choice.entity';

@injectable()
export class StoryChoiceRepository implements IStoryChoiceRepository {
  private repository: Repository<StoryChoiceEntity>;

  constructor() {
    this.repository = dataSource.getRepository(StoryChoiceEntity);
  }

  async create(data: CreateStoryChoiceData): Promise<StoryChoice> {
    try {
      const choiceEntity = this.repository.create({
        id: uuidv4(),
        storyId: data.storyId,
        parentContentId: data.parentContentId,
        text: data.text,
        description: data.description || '',
        type: data.type,
        sequence: data.sequence,
        isAvailable: data.isAvailable ?? true,
        isSelected: false,
        nextContentId: data.nextContentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedEntity = await this.repository.save(choiceEntity);
      return this.mapEntityToDomain(savedEntity);
    } catch (error) {
      console.error('Error creating story choice:', error);
      throw new Error('Failed to create story choice');
    }
  }

  async findById(id: string): Promise<StoryChoice | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id },
      });

      return entity ? this.mapEntityToDomain(entity) : null;
    } catch (error) {
      console.error('Error finding story choice by ID:', error);
      throw new Error('Failed to find story choice');
    }
  }

  async findByStoryId(storyId: string): Promise<StoryChoice[]> {
    try {
      const entities = await this.repository.find({
        where: { storyId },
        order: { sequence: 'ASC' },
      });

      return entities.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding story choices by story ID:', error);
      throw new Error('Failed to find story choices');
    }
  }

  async findByContentId(contentId: string): Promise<StoryChoice[]> {
    try {
      const entities = await this.repository.find({
        where: { parentContentId: contentId },
        order: { sequence: 'ASC' },
      });

      return entities.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding story choices by content ID:', error);
      throw new Error('Failed to find story choices');
    }
  }

  async update(
    id: string,
    data: UpdateStoryChoiceData,
  ): Promise<StoryChoice | null> {
    try {
      await this.repository.update(
        { id },
        {
          ...data,
          updatedAt: new Date(),
        },
      );

      return await this.findById(id);
    } catch (error) {
      console.error('Error updating story choice:', error);
      throw new Error('Failed to update story choice');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete({ id });
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      console.error('Error deleting story choice:', error);
      return false;
    }
  }

  async markAsSelected(id: string): Promise<StoryChoice | null> {
    try {
      await this.repository.update(
        { id },
        {
          isSelected: true,
          selectedAt: new Date(),
          updatedAt: new Date(),
        },
      );
      return this.findById(id);
    } catch (error) {
      console.error('Error marking choice as selected:', error);
      return null;
    }
  }

  async markAsAvailable(id: string, available: boolean): Promise<boolean> {
    try {
      const result = await this.repository.update(
        { id },
        {
          isAvailable: available,
          updatedAt: new Date(),
        },
      );
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      console.error('Error updating choice availability:', error);
      return false;
    }
  }

  async getNextSequence(
    storyId: string,
    parentContentId?: string,
  ): Promise<number> {
    try {
      const queryBuilder = this.repository
        .createQueryBuilder('choice')
        .select('MAX(choice.sequence)', 'maxSequence')
        .where('choice.storyId = :storyId', { storyId });

      if (parentContentId) {
        queryBuilder.andWhere('choice.parentContentId = :parentContentId', {
          parentContentId,
        });
      }

      const result = await queryBuilder.getRawOne();
      return (result?.maxSequence || 0) + 1;
    } catch (error) {
      console.error('Error getting next sequence:', error);
      return 1;
    }
  }

  async deleteByStoryId(storyId: string): Promise<boolean> {
    try {
      const result = await this.repository.delete({ storyId });
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      console.error('Error deleting story choices by story ID:', error);
      return false;
    }
  }

  async deleteByContentId(contentId: string): Promise<boolean> {
    try {
      const result = await this.repository.delete({
        parentContentId: contentId,
      });
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      console.error('Error deleting story choices by content ID:', error);
      return false;
    }
  }

  private mapEntityToDomain(entity: StoryChoiceEntity): StoryChoice {
    return new StoryChoice(
      entity.id,
      entity.storyId,
      entity.parentContentId,
      entity.text,
      entity.description || '',
      entity.type,
      entity.sequence,
      entity.createdAt,
      entity.isAvailable,
      entity.isSelected,
      entity.selectedAt,
    );
  }

  // Missing interface methods - adding simplified implementations
  async findByStory(storyId: string): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { storyId },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding choices by story:', error);
      return [];
    }
  }

  async findByContent(contentId: string): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { parentContentId: contentId },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding choices by content:', error);
      return [];
    }
  }

  async findAvailableByContent(contentId: string): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { parentContentId: contentId, isAvailable: true },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding available choices by content:', error);
      return [];
    }
  }

  async findUnselected(storyId: string): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { storyId, isSelected: false },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding unselected choices:', error);
      return [];
    }
  }

  async findSelected(storyId: string): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { storyId, isSelected: true },
        order: { selectedAt: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding selected choices:', error);
      return [];
    }
  }

  async findByType(storyId: string, type: ChoiceType): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { storyId, type },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding choices by type:', error);
      return [];
    }
  }

  async countByStory(storyId: string): Promise<number> {
    try {
      return await this.repository.count({ where: { storyId } });
    } catch (error) {
      console.error('Error counting choices by story:', error);
      return 0;
    }
  }

  async countByContent(contentId: string): Promise<number> {
    try {
      return await this.repository.count({
        where: { parentContentId: contentId },
      });
    } catch (error) {
      console.error('Error counting choices by content:', error);
      return 0;
    }
  }

  async countSelected(storyId: string): Promise<number> {
    try {
      return await this.repository.count({
        where: { storyId, isSelected: true },
      });
    } catch (error) {
      console.error('Error counting selected choices:', error);
      return 0;
    }
  }

  async countAvailable(storyId: string): Promise<number> {
    try {
      return await this.repository.count({
        where: { storyId, isAvailable: true },
      });
    } catch (error) {
      console.error('Error counting available choices:', error);
      return 0;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      console.error('Error checking choice existence:', error);
      return false;
    }
  }

  async deleteByStory(storyId: string): Promise<boolean> {
    try {
      const result = await this.repository.delete({ storyId });
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      console.error('Error deleting choices by story:', error);
      return false;
    }
  }

  async deleteByContent(contentId: string): Promise<boolean> {
    try {
      const result = await this.repository.delete({
        parentContentId: contentId,
      });
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      console.error('Error deleting choices by content:', error);
      return false;
    }
  }

  async bulkCreate(data: CreateStoryChoiceData[]): Promise<StoryChoice[]> {
    try {
      const entities = data.map((item) =>
        this.repository.create({
          id: uuidv4(),
          storyId: item.storyId,
          parentContentId: item.parentContentId,
          text: item.text,
          description: item.description || '',
          type: item.type,
          sequence: item.sequence,
          isAvailable: item.isAvailable ?? true,
          isSelected: false,
          nextContentId: item.nextContentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const savedEntities = await this.repository.save(entities);
      return savedEntities.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error bulk creating choices:', error);
      throw new Error('Failed to bulk create choices');
    }
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: UpdateStoryChoiceData }>,
  ): Promise<number> {
    try {
      let updatedCount = 0;
      for (const update of updates) {
        const result = await this.repository.update(update.id, {
          ...update.data,
          updatedAt: new Date(),
        });
        updatedCount += result.affected || 0;
      }
      return updatedCount;
    } catch (error) {
      console.error('Error bulk updating choices:', error);
      return 0;
    }
  }

  async bulkDelete(ids: string[]): Promise<number> {
    try {
      const result = await this.repository.delete(ids);
      return result.affected || 0;
    } catch (error) {
      console.error('Error bulk deleting choices:', error);
      return 0;
    }
  }

  async reorderChoices(
    contentId: string,
    choiceIds: string[],
  ): Promise<boolean> {
    try {
      for (let i = 0; i < choiceIds.length; i++) {
        await this.repository.update(
          { id: choiceIds[i], parentContentId: contentId },
          { sequence: i + 1, updatedAt: new Date() },
        );
      }
      return true;
    } catch (error) {
      console.error('Error reordering choices:', error);
      return false;
    }
  }

  async findByDateRange(
    storyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: {
          storyId,
          createdAt: Between(startDate, endDate),
        },
        order: { createdAt: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding choices by date range:', error);
      return [];
    }
  }

  async getChoiceStatistics(storyId: string): Promise<{
    totalChoices: number;
    selectedChoices: number;
    availableChoices: number;
    choicesByType: Record<ChoiceType, number>;
    averageChoicesPerContent: number;
  }> {
    try {
      const totalChoices = await this.countByStory(storyId);
      const selectedChoices = await this.countSelected(storyId);
      const availableChoices = await this.countAvailable(storyId);

      // Get choices by type
      const choices = await this.findByStory(storyId);
      const choicesByType: Record<ChoiceType, number> = {} as Record<
        ChoiceType,
        number
      >;
      for (const choice of choices) {
        choicesByType[choice.type] = (choicesByType[choice.type] || 0) + 1;
      }

      // Calculate average choices per content
      const contentIds = new Set(
        choices.map((choice) => choice.parentContentId),
      );
      const averageChoicesPerContent =
        contentIds.size > 0 ? totalChoices / contentIds.size : 0;

      return {
        totalChoices,
        selectedChoices,
        availableChoices,
        choicesByType,
        averageChoicesPerContent,
      };
    } catch (error) {
      console.error('Error getting choice statistics:', error);
      return {
        totalChoices: 0,
        selectedChoices: 0,
        availableChoices: 0,
        choicesByType: {} as Record<ChoiceType, number>,
        averageChoicesPerContent: 0,
      };
    }
  }

  // Additional missing interface methods
  async markAsUnselected(id: string): Promise<StoryChoice | null> {
    try {
      await this.repository.update(
        { id },
        {
          isSelected: false,
          selectedAt: undefined,
          updatedAt: new Date(),
        },
      );
      return this.findById(id);
    } catch (error) {
      console.error('Error marking choice as unselected:', error);
      return null;
    }
  }

  async makeAvailable(id: string): Promise<StoryChoice | null> {
    try {
      await this.repository.update(
        { id },
        {
          isAvailable: true,
          updatedAt: new Date(),
        },
      );
      return this.findById(id);
    } catch (error) {
      console.error('Error making choice available:', error);
      return null;
    }
  }

  async makeUnavailable(id: string): Promise<StoryChoice | null> {
    try {
      await this.repository.update(
        { id },
        {
          isAvailable: false,
          updatedAt: new Date(),
        },
      );
      return this.findById(id);
    } catch (error) {
      console.error('Error making choice unavailable:', error);
      return null;
    }
  }

  async findBySequenceRange(
    contentId: string,
    minSequence: number,
    maxSequence: number,
  ): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: {
          parentContentId: contentId,
          sequence: Between(minSequence, maxSequence),
        },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding choices by sequence range:', error);
      return [];
    }
  }

  async findByAvailability(
    storyId: string,
    isAvailable: boolean,
  ): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { storyId, isAvailable },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding choices by availability:', error);
      return [];
    }
  }

  async findBySelection(
    storyId: string,
    isSelected: boolean,
  ): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { storyId, isSelected },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding choices by selection:', error);
      return [];
    }
  }

  async countByType(storyId: string, type: ChoiceType): Promise<number> {
    try {
      return await this.repository.count({ where: { storyId, type } });
    } catch (error) {
      console.error('Error counting choices by type:', error);
      return 0;
    }
  }

  async findOrphaned(): Promise<StoryChoice[]> {
    try {
      // Find choices that don't have a valid parent content
      const choices = await this.repository
        .createQueryBuilder('choice')
        .leftJoin(
          'story_content',
          'content',
          'content.id = choice.parentContentId',
        )
        .where('content.id IS NULL')
        .getMany();

      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding orphaned choices:', error);
      return [];
    }
  }

  async cleanupOrphaned(): Promise<number> {
    try {
      const result = await this.repository
        .createQueryBuilder('choice')
        .delete()
        .where('parentContentId NOT IN (SELECT id FROM story_content)')
        .execute();

      return result.affected || 0;
    } catch (error) {
      console.error('Error cleaning up orphaned choices:', error);
      return 0;
    }
  }

  async findPaginated(
    storyId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    choices: StoryChoice[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const [choices, total] = await this.repository.findAndCount({
        where: { storyId },
        order: { sequence: 'ASC' },
        skip: offset,
        take: limit,
      });

      return {
        choices: choices.map((entity) => this.mapEntityToDomain(entity)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error finding paginated choices:', error);
      return {
        choices: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  // Additional missing interface methods
  async reorderSequences(
    contentId: string,
    choiceIds: string[],
  ): Promise<boolean> {
    return this.reorderChoices(contentId, choiceIds);
  }

  async findLeadingToContent(nextContentId: string): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { nextContentId },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding choices leading to content:', error);
      return [];
    }
  }

  async searchByText(
    storyId: string,
    searchTerm: string,
  ): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository
        .createQueryBuilder('choice')
        .where('choice.storyId = :storyId', { storyId })
        .andWhere('choice.text ILIKE :searchTerm', {
          searchTerm: `%${searchTerm}%`,
        })
        .orderBy('choice.sequence', 'ASC')
        .getMany();

      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error searching choices by text:', error);
      return [];
    }
  }

  async getPopularChoiceTypes(
    storyId: string,
    limit: number = 5,
  ): Promise<
    Array<{
      type: ChoiceType;
      count: number;
      percentage: number;
    }>
  > {
    try {
      const totalChoices = await this.countByStory(storyId);
      if (totalChoices === 0) return [];

      const choices = await this.findByStory(storyId);
      const typeCounts: Record<string, number> = {};

      for (const choice of choices) {
        const typeKey = choice.type.toString();
        typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
      }

      const sortedTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({
          type: type as ChoiceType,
          count,
          percentage: Math.round((count / totalChoices) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return sortedTypes;
    } catch (error) {
      console.error('Error getting popular choice types:', error);
      return [];
    }
  }

  async getChoiceHistory(storyId: string): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { storyId, isSelected: true },
        order: { selectedAt: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error getting choice history:', error);
      return [];
    }
  }

  async getChoicesByContentRange(
    storyId: string,
    startContentId: string,
    endContentId: string,
  ): Promise<StoryChoice[]> {
    try {
      // This is a simplified implementation - in a real scenario you'd need to
      // determine the content sequence range and find choices within that range
      const choices = await this.repository.find({
        where: { storyId },
        order: { sequence: 'ASC' },
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error getting choices by content range:', error);
      return [];
    }
  }

  async findRecentlySelected(
    storyId: string,
    limit: number = 10,
  ): Promise<StoryChoice[]> {
    try {
      const choices = await this.repository.find({
        where: { storyId, isSelected: true },
        order: { selectedAt: 'DESC' },
        take: limit,
      });
      return choices.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding recently selected choices:', error);
      return [];
    }
  }

  async getSelectionPatterns(storyId: string): Promise<{
    mostSelectedChoices: StoryChoice[];
    leastSelectedChoices: StoryChoice[];
    selectionRate: number;
  }> {
    try {
      const allChoices = await this.findByStory(storyId);
      const selectedChoices = await this.findSelected(storyId);

      if (allChoices.length === 0) {
        return {
          mostSelectedChoices: [],
          leastSelectedChoices: [],
          selectionRate: 0,
        };
      }

      // Calculate selection rate
      const selectionRate = selectedChoices.length / allChoices.length;

      // Get most selected choices (top 5)
      const mostSelectedChoices = selectedChoices.slice(0, 5);

      // Get least selected choices (unselected choices, top 5)
      const unselectedChoices = await this.findUnselected(storyId);
      const leastSelectedChoices = unselectedChoices.slice(0, 5);

      return {
        mostSelectedChoices,
        leastSelectedChoices,
        selectionRate,
      };
    } catch (error) {
      console.error('Error getting selection patterns:', error);
      return {
        mostSelectedChoices: [],
        leastSelectedChoices: [],
        selectionRate: 0,
      };
    }
  }
}
