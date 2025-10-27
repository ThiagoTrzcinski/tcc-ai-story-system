import jwt from 'jsonwebtoken';
import request from 'supertest';
import { container } from 'tsyringe';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { createApplication } from '../../../app';
import dataSource from '../../../data-source';
import { AIProvider } from '../../../domain/value-objects/ai-provider.value-object';
import { ChoiceType } from '../../../domain/value-objects/choice-type.value-object';
import { ContentType } from '../../../domain/value-objects/content-type.value-object';
import { StoryGenre } from '../../../domain/value-objects/story-genre.value-object';
import { StoryStatus } from '../../../domain/value-objects/story-status.value-object';
import { StoryChoiceEntity } from '../../../entities/story-choice.entity';
import { StoryContentEntity } from '../../../entities/story-content.entity';
import { StoryEntity } from '../../../entities/story.entity';
import { UserEntity } from '../../../entities/user.entity';

describe('Story Controller E2E', () => {
  let app: any;
  let testDataSource: DataSource;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Initialize test app and database
    // Register DataSource in the container for testing
    testDataSource = dataSource;
    container.registerInstance('DataSource', testDataSource);

    // Initialize the Express app with full application setup
    app = createApplication();

    // Initialize and synchronize the database
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }
    await testDataSource.synchronize(true); // Drop and recreate tables

    // Create test user
    const userEntity = await testDataSource.getRepository(UserEntity).save({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: '$2b$12$hashedpassword', // Mock hashed password
      isActive: true,
    });
    userId = userEntity.id;

    // Create a valid JWT token for testing
    const jwtPayload = {
      id: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
    };
    authToken = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET || 'your-secret-key',
    );
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Clean up database before each test
    // Use raw SQL to truncate tables with CASCADE to handle foreign keys
    await testDataSource.query(
      'TRUNCATE TABLE story_choices, story_content, stories, users RESTART IDENTITY CASCADE',
    );

    // Recreate test user for each test
    const userEntity = await testDataSource.getRepository(UserEntity).save({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: '$2b$12$hashedpassword', // Mock hashed password
      isActive: true,
    });
    userId = userEntity.id;
  });

  describe('POST /api/stories', () => {
    it('should create a new story successfully', async () => {
      const storyData = {
        title: 'Test Fantasy Story',
        description: 'A magical adventure in a mystical realm',
        genre: StoryGenre.FANTASY,
        initialPrompt: 'In a land far away, where magic flows like rivers...',
      };

      const response = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(storyData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: storyData.title,
        description: storyData.description,
        genre: storyData.genre,
        status: StoryStatus.DRAFT,
        userId,
        totalChoicesMade: 0,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid story data', async () => {
      const invalidData = {
        title: '', // Empty title
        genre: 'invalid-genre',
        initialPrompt: 'Short', // Too short
      };

      const response = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const storyData = {
        title: 'Test Story',
        genre: StoryGenre.FANTASY,
        initialPrompt: 'Once upon a time...',
      };

      await request(app).post('/api/stories').send(storyData).expect(401);
    });
  });

  describe('GET /api/stories/:storyId', () => {
    let story: StoryEntity;

    beforeEach(async () => {
      story = await testDataSource.getRepository(StoryEntity).save({
        id: uuidv4(),
        title: 'Test Story',
        description: 'Test Description',
        genre: StoryGenre.SCIENCE_FICTION,
        userId,
        status: StoryStatus.DRAFT,
        prompts: ['In the year 2150...'],
        createdAt: new Date(),
        updatedAt: new Date(),
        content: [],
        choices: [],
        currentContentId: undefined,
        totalChoicesMade: 0,
        estimatedReadingTime: 5,
      });
    });

    it('should get story by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/stories/${story.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: story.id,
        title: story.title,
        description: story.description,
        genre: story.genre,
        status: story.status,
        userId: story.userId,
      });
    });

    it('should return 404 for non-existent story', async () => {
      await request(app)
        .get(`/api/stories/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 403 for story from different company', async () => {
      // Create a user for the "other company"
      const otherUser = await testDataSource.getRepository(UserEntity).save({
        name: 'Other User',
        email: 'other@example.com',
        passwordHash: '$2b$12$hashedpassword',
        isActive: true,
      });

      const otherCompanyStory = await testDataSource
        .getRepository(StoryEntity)
        .save({
          id: uuidv4(),
          title: 'Other Company Story',
          description: 'A story from another company',
          genre: StoryGenre.MYSTERY,
          userId: otherUser.id, // Different user
          status: StoryStatus.DRAFT,
          prompts: ['A mystery unfolds...'],
          createdAt: new Date(),
          updatedAt: new Date(),
          content: [],
          choices: [],
          currentContentId: undefined,
          totalChoicesMade: 0,
          estimatedReadingTime: 5,
        });

      await request(app)
        .get(`/api/stories/${otherCompanyStory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403); // Should return forbidden for story from different user
    });
  });

  describe('PUT /api/stories/:storyId', () => {
    let story: StoryEntity;

    beforeEach(async () => {
      story = await testDataSource.getRepository(StoryEntity).save({
        id: uuidv4(),
        title: 'Original Title',
        description: 'Original Description',
        genre: StoryGenre.HORROR,
        userId,
        status: StoryStatus.DRAFT,
        prompts: ['It was a dark and stormy night...'],
        createdAt: new Date(),
        updatedAt: new Date(),
        content: [],
        choices: [],
        currentContentId: undefined,
        totalChoicesMade: 0,
        estimatedReadingTime: 5,
      });
    });

    it('should update story successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        genre: StoryGenre.THRILLER,
      };

      const response = await request(app)
        .put(`/api/stories/${story.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: story.id,
        title: updateData.title,
        description: updateData.description,
        genre: updateData.genre,
      });

      // Verify in database
      const updatedStory = await dataSource.getRepository(StoryEntity).findOne({
        where: { id: story.id },
      });
      expect(updatedStory?.title).toBe(updateData.title);
    });

    it('should return 404 for non-existent story', async () => {
      await request(app)
        .put(`/api/stories/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/stories/:storyId', () => {
    let story: StoryEntity;

    beforeEach(async () => {
      story = await testDataSource.getRepository(StoryEntity).save({
        id: uuidv4(),
        title: 'Story to Delete',
        description: 'A story to be deleted',
        genre: StoryGenre.ADVENTURE,
        userId,
        status: StoryStatus.DRAFT,
        prompts: ['The adventure begins...'],
        createdAt: new Date(),
        updatedAt: new Date(),
        content: [],
        choices: [],
        currentContentId: undefined,
        totalChoicesMade: 0,
        estimatedReadingTime: 5,
      });
    });

    it('should delete story successfully', async () => {
      await request(app)
        .delete(`/api/stories/${story.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify story is marked as deleted
      const deletedStory = await dataSource.getRepository(StoryEntity).findOne({
        where: { id: story.id },
      });
      expect(deletedStory?.status).toBe(StoryStatus.DELETED);
    });

    it('should return 200 for non-existent story (idempotent)', async () => {
      await request(app)
        .delete(`/api/stories/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('GET /api/stories', () => {
    beforeEach(async () => {
      // Create multiple test stories
      const stories = [
        {
          id: uuidv4(),
          title: 'Fantasy Story',
          description: 'A fantasy adventure',
          genre: StoryGenre.FANTASY,
          userId,
          status: StoryStatus.PUBLISHED,
          prompts: ['Fantasy prompt'],
          createdAt: new Date(),
          updatedAt: new Date(),
          content: [],
          choices: [],
          currentContentId: undefined,
          totalChoicesMade: 5,
          estimatedReadingTime: 10,
        },
        {
          id: uuidv4(),
          title: 'Sci-Fi Story',
          description: 'A science fiction tale',
          genre: StoryGenre.SCIENCE_FICTION,
          userId,
          status: StoryStatus.IN_PROGRESS,
          prompts: ['Sci-fi prompt'],
          createdAt: new Date(),
          updatedAt: new Date(),
          content: [],
          choices: [],
          currentContentId: undefined,
          totalChoicesMade: 3,
          estimatedReadingTime: 8,
        },
        {
          id: uuidv4(),
          title: 'Mystery Story',
          description: 'A mysterious investigation',
          genre: StoryGenre.MYSTERY,
          userId,
          status: StoryStatus.DRAFT,
          prompts: ['Mystery prompt'],
          createdAt: new Date(),
          updatedAt: new Date(),
          content: [],
          choices: [],
          currentContentId: undefined,
          totalChoicesMade: 0,
          estimatedReadingTime: 5,
        },
      ];

      await testDataSource.getRepository(StoryEntity).save(stories);
    });

    it('should get paginated stories', async () => {
      const response = await request(app)
        .get('/api/stories?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.stories).toHaveLength(2);
      expect(response.body.total).toBe(3);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(2);
      expect(response.body.hasNextPage).toBe(true);
      expect(response.body.hasPreviousPage).toBe(false);
    });

    it('should filter stories by status', async () => {
      const response = await request(app)
        .get(`/api/stories?status=${StoryStatus.PUBLISHED}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.stories).toHaveLength(1);
      expect(response.body.stories[0].status).toBe(StoryStatus.PUBLISHED);
    });

    it('should filter stories by genre', async () => {
      const response = await request(app)
        .get(`/api/stories?genre=${StoryGenre.FANTASY}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.stories).toHaveLength(1);
      expect(response.body.stories[0].genre).toBe(StoryGenre.FANTASY);
    });
  });

  describe('Story Actions', () => {
    let story: StoryEntity;
    let content: StoryContentEntity;
    let choice: StoryChoiceEntity;

    beforeEach(async () => {
      story = await testDataSource.getRepository(StoryEntity).save({
        id: uuidv4(),
        title: 'Action Test Story',
        description: 'A test story for actions',
        genre: StoryGenre.ADVENTURE,
        userId,
        status: StoryStatus.DRAFT,
        prompts: ['Your adventure begins...'],
        createdAt: new Date(),
        updatedAt: new Date(),
        content: [],
        choices: [],
        currentContentId: undefined,
        totalChoicesMade: 0,
        estimatedReadingTime: 5,
      });

      content = await testDataSource.getRepository(StoryContentEntity).save({
        id: uuidv4(),
        storyId: story.id,
        type: ContentType.TEXT,
        textContent: 'You stand at a crossroads.',
        aiProvider: AIProvider.MOCKED,
        sequence: 1,
        isGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      });

      choice = await testDataSource.getRepository(StoryChoiceEntity).save({
        id: uuidv4(),
        storyId: story.id,
        parentContentId: content.id,
        text: 'Go left',
        description: 'Take the left path through the forest',
        type: ChoiceType.NARRATIVE,
        sequence: 1,
        isAvailable: true,
        isSelected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      });
    });

    it('should start a story', async () => {
      await request(app)
        .post(`/api/stories/${story.id}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const updatedStory = await dataSource.getRepository(StoryEntity).findOne({
        where: { id: story.id },
      });
      expect(updatedStory?.status).toBe(StoryStatus.IN_PROGRESS);
    });

    it('should make a choice', async () => {
      await request(app)
        .post(`/api/stories/${story.id}/choices/${choice.id}/select`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const updatedChoice = await dataSource
        .getRepository(StoryChoiceEntity)
        .findOne({
          where: { id: choice.id },
        });
      expect(updatedChoice?.isSelected).toBe(true);
      expect(updatedChoice?.selectedAt).toBeDefined();

      const updatedStory = await dataSource.getRepository(StoryEntity).findOne({
        where: { id: story.id },
      });
      expect(updatedStory?.totalChoicesMade).toBe(1);
    });

    it('should complete a story', async () => {
      await request(app)
        .post(`/api/stories/${story.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const updatedStory = await dataSource.getRepository(StoryEntity).findOne({
        where: { id: story.id },
      });
      expect(updatedStory?.status).toBe(StoryStatus.COMPLETED);
      expect(updatedStory?.status).toBe(StoryStatus.COMPLETED);
    });
  });

  describe('Complete Story Flow E2E', () => {
    it('should complete the full story flow: create → generate → choose → continue → finalize', async () => {
      // Step 1: Create a new story
      const createResponse = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Complete Flow Test Story',
          description: 'Testing the complete story flow from start to finish',
          genre: StoryGenre.FANTASY,
          initialPrompt:
            'Start an epic fantasy adventure with magic and dragons',
          settings: {
            AIModel: AIProvider.MOCKED,
            includeImages: false,
            includeAudio: false,
          },
        })
        .expect(201);

      const storyId = createResponse.body.id;
      expect(storyId).toBeDefined();
      expect(createResponse.body.status).toBe(StoryStatus.DRAFT);

      // Step 2: Generate first content
      const generateResponse = await request(app)
        .post(`/api/stories/${storyId}/generate-content`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Start an epic fantasy adventure',
        })
        .expect(201);

      expect(generateResponse.body.id).toBeDefined();
      expect(generateResponse.body.textContent).toBeDefined();
      expect(generateResponse.body.choices).toBeDefined();
      expect(generateResponse.body.choices).toHaveLength(4);

      const firstChoiceId = generateResponse.body.choices[0].id;

      // Step 3: Make first choice and continue
      const choice1Response = await request(app)
        .post(`/api/stories/${storyId}/choices/${firstChoiceId}/select`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(choice1Response.body.success).toBe(true);
      expect(choice1Response.body.newContent).toBeDefined();
      expect(choice1Response.body.newChoices).toBeDefined();
      expect(choice1Response.body.newChoices).toHaveLength(4);

      const secondChoiceId = choice1Response.body.newChoices[1].id;

      // Step 4: Make second choice and continue
      const choice2Response = await request(app)
        .post(`/api/stories/${storyId}/choices/${secondChoiceId}/select`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(choice2Response.body.success).toBe(true);
      expect(choice2Response.body.newContent).toBeDefined();
      expect(choice2Response.body.newChoices).toBeDefined();

      const thirdChoiceId = choice2Response.body.newChoices[2].id;

      // Step 5: Make third choice and continue
      const choice3Response = await request(app)
        .post(`/api/stories/${storyId}/choices/${thirdChoiceId}/select`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(choice3Response.body.success).toBe(true);
      expect(choice3Response.body.newContent).toBeDefined();
      expect(choice3Response.body.newChoices).toBeDefined();

      const fourthChoiceId = choice3Response.body.newChoices[0].id;

      // Step 6: Make fourth choice and continue
      const choice4Response = await request(app)
        .post(`/api/stories/${storyId}/choices/${fourthChoiceId}/select`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(choice4Response.body.success).toBe(true);
      expect(choice4Response.body.newContent).toBeDefined();
      // This should be the last segment, so no choices
      expect(choice4Response.body.newChoices).toHaveLength(0);

      // Step 7: Verify story is completed
      const storyDetailsResponse = await request(app)
        .get(`/api/stories/${storyId}/details`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(storyDetailsResponse.body.story.status).toBe(
        StoryStatus.COMPLETED,
      );
      expect(storyDetailsResponse.body.content).toHaveLength(5); // 5 segments
      expect(storyDetailsResponse.body.progress.progressPercentage).toBe(100);
      expect(storyDetailsResponse.body.progress.choicesMade).toBe(4);

      // Step 8: Try to continue completed story (should fail)
      const continueCompletedResponse = await request(app)
        .post(`/api/stories/${storyId}/choices/${fourthChoiceId}/select`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400); // Should return validation error

      expect(continueCompletedResponse.body.message).toContain('completed');

      // Step 9: Verify final story state in database
      const finalStory = await dataSource.getRepository(StoryEntity).findOne({
        where: { id: storyId },
      });
      expect(finalStory?.status).toBe(StoryStatus.COMPLETED);

      const finalContent = await dataSource
        .getRepository(StoryContentEntity)
        .find({
          where: { storyId },
          order: { sequence: 'ASC' },
        });
      expect(finalContent).toHaveLength(5);

      const finalChoices = await dataSource
        .getRepository(StoryChoiceEntity)
        .find({
          where: { storyId, isSelected: true },
        });
      expect(finalChoices).toHaveLength(4);
    });

    it('should get complete story details with progress and statistics', async () => {
      // Create and complete a story first
      const createResponse = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Details Test Story',
          description: 'Testing story details endpoint',
          genre: StoryGenre.ADVENTURE,
          initialPrompt: 'Begin an exciting adventure story with exploration',
          settings: {
            AIModel: AIProvider.MOCKED,
          },
        })
        .expect(201);

      const storyId = createResponse.body.id;

      // Generate some content
      await request(app)
        .post(`/api/stories/${storyId}/generate-content`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ prompt: 'Start adventure' })
        .expect(201);

      // Get story details
      const detailsResponse = await request(app)
        .get(`/api/stories/${storyId}/details`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify response structure
      expect(detailsResponse.body).toHaveProperty('story');
      expect(detailsResponse.body).toHaveProperty('progress');
      expect(detailsResponse.body).toHaveProperty('statistics');
      expect(detailsResponse.body).toHaveProperty('content');
      expect(detailsResponse.body).toHaveProperty('choices');

      // Verify story data
      expect(detailsResponse.body.story.id).toBe(storyId);
      expect(detailsResponse.body.story.title).toBe('Details Test Story');

      // Verify progress data
      expect(detailsResponse.body.progress.storyId).toBe(storyId);
      expect(detailsResponse.body.progress.progressPercentage).toBeGreaterThan(
        0,
      );
      expect(detailsResponse.body.progress.choicesMade).toBeGreaterThanOrEqual(
        0,
      );

      // Verify statistics data
      expect(detailsResponse.body.statistics.totalStories).toBe(1);
      expect(
        detailsResponse.body.statistics.averageReadingTime,
      ).toBeGreaterThan(0);

      // Verify content and choices arrays
      expect(Array.isArray(detailsResponse.body.content)).toBe(true);
      expect(Array.isArray(detailsResponse.body.choices)).toBe(true);
      expect(detailsResponse.body.content.length).toBeGreaterThan(0);
      expect(detailsResponse.body.choices.length).toBeGreaterThan(0);
    });
  });
});
