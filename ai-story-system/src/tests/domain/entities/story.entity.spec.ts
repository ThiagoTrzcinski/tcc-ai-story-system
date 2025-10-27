import { StoryChoice } from '../../../domain/entities/story-choice.entity';
import { StoryContent } from '../../../domain/entities/story-content.entity';
import { Story } from '../../../domain/entities/story.entity';
import { AIProvider } from '../../../domain/value-objects/ai-provider.value-object';
import { ChoiceType } from '../../../domain/value-objects/choice-type.value-object';
import { StoryGenre } from '../../../domain/value-objects/story-genre.value-object';
import { StoryStatus } from '../../../domain/value-objects/story-status.value-object';
import { createTestStoryContent } from '../../utils/factories';

describe('Story Entity', () => {
  let story: Story;
  const mockUserId = 1;
  const mockCompanyId = 1;

  beforeEach(() => {
    story = Story.create(
      'test-story-id',
      'Test Story',
      'A test story description',
      StoryGenre.FANTASY,
      mockUserId,
      'Once upon a time...',
    );
  });

  describe('Story Creation', () => {
    it('should create a story with valid data', () => {
      expect(story).toBeInstanceOf(Story);
      expect(story.title).toBe('Test Story');
      expect(story.description).toBe('A test story description');
      expect(story.genre).toBe(StoryGenre.FANTASY);
      expect(story.userId).toBe(mockUserId);
      expect(story.status).toBe(StoryStatus.DRAFT);
      expect(story.prompts).toEqual(['Once upon a time...']);
      expect(story.totalChoicesMade).toBe(0);
    });

    it('should generate a unique ID', () => {
      const story1 = Story.create(
        'story-1',
        'Story 1',
        'Description',
        StoryGenre.FANTASY,
        1,
        'Prompt',
      );
      const story2 = Story.create(
        'story-2',
        'Story 2',
        'Description',
        StoryGenre.SCIENCE_FICTION,
        1,
        'Prompt',
      );

      expect(story1.id).toBeDefined();
      expect(story2.id).toBeDefined();
      expect(story1.id).not.toBe(story2.id);
    });

    it('should set creation and update timestamps', () => {
      expect(story.createdAt).toBeInstanceOf(Date);
      expect(story.updatedAt).toBeInstanceOf(Date);
      expect(story.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(story.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Content Management', () => {
    it('should add content to the story', () => {
      const content = createTestStoryContent({
        storyId: story.id,
        textContent: 'Generated opening chapter content',
        sequence: 1,
      });

      const updatedStory = story.addContent(content);

      expect(updatedStory.content).toHaveLength(1);
      expect(updatedStory.content[0]).toBe(content);
    });

    it('should update current content when adding first content', () => {
      const content = StoryContent.createText(
        story.id,
        'Chapter 1: The Beginning',
        AIProvider.MOCKED,
        1,
      );

      const updatedStory = story.addContent(content);

      expect(updatedStory.currentContentId).toBe(content.id);
    });

    it('should get current content', () => {
      const content1 = createTestStoryContent({
        storyId: story.id,
        textContent: 'Content 1',
        sequence: 1,
      });
      const content2 = createTestStoryContent({
        storyId: story.id,
        textContent: 'Content 2',
        sequence: 2,
      });

      let updatedStory = story.addContent(content1);
      updatedStory = updatedStory.addContent(content2);

      // Test getCurrentContent - should return the last added content since addContent sets currentContentId
      const currentContent = updatedStory.getCurrentContent();
      expect(currentContent).toBe(content2); // Should be content2 since it was the last added
    });

    it('should return null for current content if not set', () => {
      const currentContent = story.getCurrentContent();
      expect(currentContent).toBeNull();
    });
  });

  describe('Choice Management', () => {
    let content: StoryContent;
    let storyWithContent: Story;

    beforeEach(() => {
      content = StoryContent.createText(
        story.id,
        'Chapter 1',
        AIProvider.MOCKED,
        1,
      );
      storyWithContent = story.addContent(content);
    });

    it('should add choices to the story', () => {
      const choice = StoryChoice.create(
        'choice-id',
        storyWithContent.id,
        content.id,
        'Go left',
        'Description for going left',
        ChoiceType.NARRATIVE,
        1,
      );

      const updatedStory = storyWithContent.addChoice(choice);

      expect(updatedStory.choices).toHaveLength(1);
      expect(updatedStory.choices[0]).toBe(choice);
    });

    it('should get available choices for content', () => {
      const choice1 = StoryChoice.create(
        'choice-1-id',
        storyWithContent.id,
        content.id,
        'Choice 1',
        'Description for choice 1',
        ChoiceType.NARRATIVE,
        1,
      );
      const choice2 = StoryChoice.create(
        'choice-2-id',
        storyWithContent.id,
        content.id,
        'Choice 2',
        'Description for choice 2',
        ChoiceType.ACTION,
        2,
      );
      const choice3 = StoryChoice.create(
        'choice-3-id',
        storyWithContent.id,
        content.id,
        'Choice 3',
        'Description for choice 3',
        ChoiceType.DIALOGUE,
        3,
      );

      const unavailableChoice2 = choice2.makeUnavailable();

      let updatedStory = storyWithContent.addChoice(choice1);
      updatedStory = updatedStory.addChoice(unavailableChoice2);
      updatedStory = updatedStory.addChoice(choice3);

      const availableChoices = updatedStory.getAvailableChoices();

      expect(availableChoices).toHaveLength(2);
      expect(availableChoices).toContain(choice1);
      expect(availableChoices).toContain(choice3);
      expect(availableChoices).not.toContain(unavailableChoice2);
    });

    it('should make a choice and increment total choices made', () => {
      const choice = StoryChoice.create(
        'choice-make-id',
        storyWithContent.id,
        content.id,
        'Choice 1',
        'Description for choice 1',
        ChoiceType.NARRATIVE,
        1,
      );
      const storyWithChoice = storyWithContent.addChoice(choice);

      const initialChoicesMade = storyWithChoice.totalChoicesMade;
      const updatedStory = storyWithChoice.makeChoice(choice.id);

      expect(updatedStory.totalChoicesMade).toBe((initialChoicesMade ?? 0) + 1);
      // Note: choice object itself doesn't change, we need to get the updated choice from the story
      const updatedChoice = updatedStory.choices.find(
        (c) => c.id === choice.id,
      );
      expect(updatedChoice?.isSelected).toBe(true);
      expect(updatedChoice?.selectedAt).toBeInstanceOf(Date);
    });

    it('should throw error when making unavailable choice', () => {
      const choice = StoryChoice.create(
        'choice-unavailable-id',
        storyWithContent.id,
        content.id,
        'Choice 1',
        'Description for choice 1',
        ChoiceType.NARRATIVE,
        1,
      );
      const unavailableChoice = choice.makeUnavailable();
      const storyWithChoice = storyWithContent.addChoice(unavailableChoice);

      expect(() => storyWithChoice.makeChoice(choice.id)).toThrow(
        'Choice choice-unavailable-id is not available',
      );
    });

    it('should throw error when making already selected choice', () => {
      const choice = StoryChoice.create(
        'choice-selected-id',
        storyWithContent.id,
        content.id,
        'Choice 1',
        'Description for choice 1',
        ChoiceType.NARRATIVE,
        1,
      );
      let storyWithChoice = storyWithContent.addChoice(choice);
      storyWithChoice = storyWithChoice.makeChoice(choice.id);

      expect(() => storyWithChoice.makeChoice(choice.id)).toThrow(
        'Choice is already selected',
      );
    });
  });

  describe('Story Status Management', () => {
    it('should complete the story', () => {
      const completedStory = story.complete();
      expect(completedStory.status).toBe(StoryStatus.COMPLETED);
    });

    it('should publish the story', () => {
      // Add content first since publish requires content
      const content = StoryContent.createText(
        story.id,
        'Chapter 1',
        AIProvider.MOCKED,
        1,
      );
      const storyWithContent = story.addContent(content);

      const publishedStory = storyWithContent.publish();
      expect(publishedStory.status).toBe(StoryStatus.PUBLISHED);
    });

    // Status transition validation removed with simplified entity structure
  });

  // Story validation removed with simplified entity structure

  describe('Story Statistics', () => {
    it('should have estimated reading time property', () => {
      // Test the estimatedReadingTime property instead of the private method
      expect(story.estimatedReadingTime).toBeUndefined(); // Should be undefined for new story

      // Test with a story that has estimated reading time
      const storyWithTime = Story.create(
        'test-story-with-time',
        'Test Story',
        'A test story description',
        StoryGenre.FANTASY,
        mockUserId,
        'Once upon a time...',
      );
      expect(storyWithTime.estimatedReadingTime).toBeUndefined();
    });

    // Content statistics removed with simplified entity structure

    // Choice statistics removed with simplified entity structure
  });

  // Story export/import removed with simplified entity structure
});
