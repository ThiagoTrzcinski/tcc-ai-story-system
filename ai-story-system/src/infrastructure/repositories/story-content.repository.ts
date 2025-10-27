import { injectable } from 'tsyringe';
import { Repository, Between, Not, Like, MoreThan, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { StoryContent } from '../../domain/entities/story-content.entity';
import {
  IStoryContentRepository,
  CreateStoryContentData,
  UpdateStoryContentData,
} from '../../domain/interfaces/story-content.repository.interface';
import { StoryContentEntity } from '../../entities/story-content.entity';
import dataSource from '../../data-source';

@injectable()
export class StoryContentRepository implements IStoryContentRepository {
  private repository: Repository<StoryContentEntity>;

  constructor() {
    this.repository = dataSource.getRepository(StoryContentEntity);
  }

  async create(data: CreateStoryContentData): Promise<StoryContent> {
    try {
      const contentEntity = this.repository.create({
        id: uuidv4(),
        storyId: data.storyId,
        textContent: data.textContent,
        sequence: data.sequence,
        imageUrl: data.imageUrl,
        audioUrl: data.audioUrl,
        hasChoices: data.hasChoices || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedEntity = await this.repository.save(contentEntity);
      return this.mapEntityToDomain(savedEntity);
    } catch (error) {
      console.error('Error creating story content:', error);
      throw new Error('Failed to create story content');
    }
  }

  async findById(id: string): Promise<StoryContent | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id },
      });

      return entity ? this.mapEntityToDomain(entity) : null;
    } catch (error) {
      console.error('Error finding story content by ID:', error);
      throw new Error('Failed to find story content');
    }
  }

  async findByStoryId(storyId: string): Promise<StoryContent[]> {
    try {
      const entities = await this.repository.find({
        where: { storyId },
        order: { sequence: 'ASC' },
      });

      return entities.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding story content by story ID:', error);
      throw new Error('Failed to find story content');
    }
  }

  async update(
    id: string,
    data: UpdateStoryContentData,
  ): Promise<StoryContent | null> {
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
      console.error('Error updating story content:', error);
      throw new Error('Failed to update story content');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete({ id });
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      console.error('Error deleting story content:', error);
      return false;
    }
  }

  async reorderContent(
    storyId: string,
    contentIds: string[],
  ): Promise<boolean> {
    try {
      for (let i = 0; i < contentIds.length; i++) {
        await this.repository.update(
          { id: contentIds[i], storyId },
          { sequence: i + 1, updatedAt: new Date() },
        );
      }
      return true;
    } catch (error) {
      console.error('Error reordering content:', error);
      return false;
    }
  }

  async count(storyId: string): Promise<number> {
    try {
      return await this.repository.count({ where: { storyId } });
    } catch (error) {
      console.error('Error counting story content:', error);
      return 0;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      console.error('Error checking if story content exists:', error);
      return false;
    }
  }

  async deleteByStoryId(storyId: string): Promise<boolean> {
    try {
      const result = await this.repository.delete({ storyId });
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      console.error('Error deleting story content by story ID:', error);
      return false;
    }
  }

  // Additional missing interface methods
  async countByStory(storyId: string): Promise<number> {
    return this.count(storyId);
  }

  async findMultimedia(storyId: string): Promise<StoryContent[]> {
    try {
      const contents = await this.repository
        .createQueryBuilder('content')
        .where('content.storyId = :storyId', { storyId })
        .andWhere(
          '(content.imageUrl IS NOT NULL OR content.audioUrl IS NOT NULL)',
        )
        .orderBy('content.sequence', 'ASC')
        .getMany();
      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding multimedia content:', error);
      return [];
    }
  }

  async searchByText(
    storyId: string,
    searchTerm: string,
  ): Promise<StoryContent[]> {
    try {
      const contents = await this.repository.find({
        where: {
          storyId,
          textContent: Like(`%${searchTerm}%`),
        },
        order: { sequence: 'ASC' },
      });
      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error searching content by text:', error);
      return [];
    }
  }

  async reorderSequences(
    storyId: string,
    contentIds: string[],
  ): Promise<boolean> {
    return this.reorderContent(storyId, contentIds);
  }

  async findAfterSequence(
    storyId: string,
    sequence: number,
  ): Promise<StoryContent[]> {
    try {
      const contents = await this.repository.find({
        where: {
          storyId,
          sequence: MoreThan(sequence),
        },
        order: { sequence: 'ASC' },
      });
      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding content after sequence:', error);
      return [];
    }
  }

  async findBeforeSequence(
    storyId: string,
    sequence: number,
  ): Promise<StoryContent[]> {
    try {
      const contents = await this.repository.find({
        where: {
          storyId,
          sequence: LessThan(sequence),
        },
        order: { sequence: 'ASC' },
      });
      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding content before sequence:', error);
      return [];
    }
  }

  async findBySequenceRange(
    storyId: string,
    startSequence: number,
    endSequence: number,
  ): Promise<StoryContent[]> {
    try {
      const contents = await this.repository.find({
        where: {
          storyId,
          sequence: Between(startSequence, endSequence),
        },
        order: { sequence: 'ASC' },
      });
      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding content by sequence range:', error);
      return [];
    }
  }

  async getWordCount(storyId: string): Promise<number> {
    try {
      const contents = await this.repository.find({
        where: { storyId },
        select: ['textContent'],
      });

      let totalWords = 0;
      for (const content of contents) {
        if (content.textContent) {
          totalWords += content.textContent.split(/\s+/).length;
        }
      }

      return totalWords;
    } catch (error) {
      console.error('Error getting word count:', error);
      return 0;
    }
  }

  async findPaginated(
    storyId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    content: StoryContent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const [contents, total] = await this.repository.findAndCount({
        where: { storyId },
        order: { sequence: 'ASC' },
        skip: offset,
        take: limit,
      });

      return {
        content: contents.map((entity) => this.mapEntityToDomain(entity)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error finding paginated content:', error);
      return {
        content: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  // Missing interface methods - adding simplified implementations
  async findByStory(storyId: string): Promise<StoryContent[]> {
    try {
      const contents = await this.repository.find({
        where: { storyId },
        order: { sequence: 'ASC' },
      });
      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding content by story:', error);
      return [];
    }
  }

  async findByStoryOrdered(storyId: string): Promise<StoryContent[]> {
    return this.findByStory(storyId);
  }

  async findBySequence(
    storyId: string,
    sequence: number,
  ): Promise<StoryContent | null> {
    try {
      const content = await this.repository.findOne({
        where: { storyId, sequence },
      });
      return content ? this.mapEntityToDomain(content) : null;
    } catch (error) {
      console.error('Error finding content by sequence:', error);
      return null;
    }
  }

  async findLatest(storyId: string): Promise<StoryContent | null> {
    try {
      const content = await this.repository.findOne({
        where: { storyId },
        order: { sequence: 'DESC' },
      });
      return content ? this.mapEntityToDomain(content) : null;
    } catch (error) {
      console.error('Error finding latest content:', error);
      return null;
    }
  }

  async findFirst(storyId: string): Promise<StoryContent | null> {
    try {
      const content = await this.repository.findOne({
        where: { storyId },
        order: { sequence: 'ASC' },
      });
      return content ? this.mapEntityToDomain(content) : null;
    } catch (error) {
      console.error('Error finding first content:', error);
      return null;
    }
  }

  async findWithChoices(storyId: string): Promise<StoryContent[]> {
    try {
      const contents = await this.repository.find({
        where: { storyId, hasChoices: true },
        order: { sequence: 'ASC' },
      });
      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding content with choices:', error);
      return [];
    }
  }

  async findWithoutChoices(storyId: string): Promise<StoryContent[]> {
    try {
      const contents = await this.repository.find({
        where: { storyId, hasChoices: false },
        order: { sequence: 'ASC' },
      });
      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding content without choices:', error);
      return [];
    }
  }

  async bulkDelete(ids: string[]): Promise<number> {
    try {
      const result = await this.repository.delete(ids);
      return result.affected || 0;
    } catch (error) {
      console.error('Error bulk deleting content:', error);
      return 0;
    }
  }

  async findByDateRange(
    storyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StoryContent[]> {
    try {
      const contents = await this.repository.find({
        where: {
          storyId,
          createdAt: Between(startDate, endDate),
        },
        order: { sequence: 'ASC' },
      });
      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding content by date range:', error);
      return [];
    }
  }

  async getContentStatistics(storyId: string): Promise<{
    totalContent: number;
    contentWithChoices: number;
    contentWithImages: number;
    contentWithAudio: number;
    averageWordCount: number;
    totalWordCount: number;
  }> {
    try {
      const totalContent = await this.count(storyId);
      const contentWithChoices = await this.repository.count({
        where: { storyId, hasChoices: true },
      });
      const contentWithImages = await this.repository
        .createQueryBuilder('content')
        .where('content.storyId = :storyId', { storyId })
        .andWhere('content.imageUrl IS NOT NULL')
        .getCount();
      const contentWithAudio = await this.repository
        .createQueryBuilder('content')
        .where('content.storyId = :storyId', { storyId })
        .andWhere('content.audioUrl IS NOT NULL')
        .getCount();
      const totalWordCount = await this.getWordCount(storyId);
      const averageWordCount =
        totalContent > 0 ? Math.round(totalWordCount / totalContent) : 0;

      return {
        totalContent,
        contentWithChoices,
        contentWithImages,
        contentWithAudio,
        averageWordCount,
        totalWordCount,
      };
    } catch (error) {
      console.error('Error getting content statistics:', error);
      return {
        totalContent: 0,
        contentWithChoices: 0,
        contentWithImages: 0,
        contentWithAudio: 0,
        averageWordCount: 0,
        totalWordCount: 0,
      };
    }
  }

  private mapEntityToDomain(entity: StoryContentEntity): StoryContent {
    return new StoryContent(
      entity.id,
      entity.storyId,
      entity.textContent,
      entity.sequence,
      entity.createdAt,
      entity.imageUrl,
      entity.audioUrl,
      entity.hasChoices,
    );
  }

  async getNextSequence(storyId: string): Promise<number> {
    try {
      const result = await this.repository
        .createQueryBuilder('content')
        .select('MAX(content.sequence)', 'maxSequence')
        .where('content.storyId = :storyId', { storyId })
        .getRawOne();

      return (result?.maxSequence || 0) + 1;
    } catch (error) {
      console.error('Error getting next sequence:', error);
      return 1;
    }
  }

  // Additional missing interface methods
  async bulkCreate(data: CreateStoryContentData[]): Promise<StoryContent[]> {
    try {
      const entities = data.map((item) =>
        this.repository.create({
          id: uuidv4(),
          storyId: item.storyId,
          textContent: item.textContent,
          sequence: item.sequence,
          imageUrl: item.imageUrl,
          audioUrl: item.audioUrl,
          hasChoices: item.hasChoices || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const savedEntities = await this.repository.save(entities);
      return savedEntities.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error bulk creating content:', error);
      throw new Error('Failed to bulk create content');
    }
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: UpdateStoryContentData }>,
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
      console.error('Error bulk updating content:', error);
      return 0;
    }
  }

  async findOrphaned(): Promise<StoryContent[]> {
    try {
      // Find content that doesn't have a valid story
      const contents = await this.repository
        .createQueryBuilder('content')
        .leftJoin('stories', 'story', 'story.id = content.storyId')
        .where('story.id IS NULL')
        .getMany();

      return contents.map((entity) => this.mapEntityToDomain(entity));
    } catch (error) {
      console.error('Error finding orphaned content:', error);
      return [];
    }
  }

  async cleanupOrphaned(): Promise<number> {
    try {
      const result = await this.repository
        .createQueryBuilder('content')
        .delete()
        .where('storyId NOT IN (SELECT id FROM stories)')
        .execute();

      return result.affected || 0;
    } catch (error) {
      console.error('Error cleaning up orphaned content:', error);
      return 0;
    }
  }
}
