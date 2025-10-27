import { v4 as uuidv4 } from 'uuid';
import { StoryChoice } from '../../../domain/entities/story-choice.entity';
import { ChoiceType } from '../../../domain/value-objects/choice-type.value-object';

export interface CreateTestStoryChoiceOptions {
  id?: string;
  storyId?: string;
  parentContentId?: string;
  text?: string;
  description?: string;
  type?: ChoiceType;
  sequence?: number;
  createdAt?: Date;
  isAvailable?: boolean;
  isSelected?: boolean;
  selectedAt?: Date;
}

/**
 * Creates a test StoryChoice entity with sensible defaults
 */
export function createTestStoryChoice(
  options: CreateTestStoryChoiceOptions = {},
): StoryChoice {
  return new StoryChoice(
    options.id ?? uuidv4(),
    options.storyId ?? uuidv4(),
    options.parentContentId ?? uuidv4(),
    options.text ?? 'This is a test choice.',
    options.description ?? 'This is a test choice description.',
    options.type ?? ChoiceType.NARRATIVE,
    options.sequence ?? 1,
    options.createdAt ?? new Date(),
    options.isAvailable ?? true,
    options.isSelected ?? false,
    options.selectedAt,
  );
}

/**
 * Creates a narrative choice
 */
export function createNarrativeChoice(
  text: string,
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice {
  return createTestStoryChoice({
    text,
    type: ChoiceType.NARRATIVE,
    ...overrides,
  });
}

/**
 * Creates an action choice
 */
export function createActionChoice(
  text: string,
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice {
  return createTestStoryChoice({
    text,
    type: ChoiceType.ACTION,
    ...overrides,
  });
}

/**
 * Creates a dialogue choice
 */
export function createDialogueChoice(
  text: string,
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice {
  return createTestStoryChoice({
    text,
    type: ChoiceType.DIALOGUE,
    ...overrides,
  });
}

/**
 * Creates a moral choice
 */
export function createMoralChoice(
  text: string,
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice {
  return createTestStoryChoice({
    text,
    type: ChoiceType.MORAL,
    ...overrides,
  });
}

/**
 * Creates a strategic choice
 */
export function createStrategicChoice(
  text: string,
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice {
  return createTestStoryChoice({
    text,
    type: ChoiceType.STRATEGIC,
    ...overrides,
  });
}

/**
 * Creates a selected choice
 */
export function createSelectedChoice(
  text: string,
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice {
  const selectedAt = new Date();
  return createTestStoryChoice({
    text,
    isSelected: true,
    selectedAt,
    ...overrides,
  });
}

/**
 * Creates an unavailable choice
 */
export function createUnavailableChoice(
  text: string,
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice {
  return createTestStoryChoice({
    text,
    isAvailable: false,
    ...overrides,
  });
}

/**
 * Creates a set of choices for a content
 */
export function createChoicesForContent(
  storyId: string,
  parentContentId: string,
  choiceTexts: string[],
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice[] {
  return choiceTexts.map((text, index) =>
    createTestStoryChoice({
      storyId,
      parentContentId,
      text,
      sequence: index + 1,
      ...overrides,
    }),
  );
}

/**
 * Creates choices of different types
 */
export function createMixedChoices(
  storyId: string,
  parentContentId: string,
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice[] {
  return [
    createNarrativeChoice('Continue the story', {
      storyId,
      parentContentId,
      sequence: 1,
      ...overrides,
    }),
    createActionChoice('Take action', {
      storyId,
      parentContentId,
      sequence: 2,
      ...overrides,
    }),
    createDialogueChoice('Say something', {
      storyId,
      parentContentId,
      sequence: 3,
      ...overrides,
    }),
  ];
}

/**
 * Creates a sequence of choices with specific types
 */
export function createChoiceSequence(
  storyId: string,
  parentContentId: string,
  types: ChoiceType[],
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice[] {
  return types.map((type, index) => {
    const typeTexts = {
      [ChoiceType.NARRATIVE]: 'Continue the narrative',
      [ChoiceType.ACTION]: 'Take an action',
      [ChoiceType.DIALOGUE]: 'Speak to someone',
      [ChoiceType.MORAL]: 'Make a moral decision',
      [ChoiceType.STRATEGIC]: 'Plan your strategy',
      [ChoiceType.EXPLORATION]: 'Explore the area',
      [ChoiceType.RELATIONSHIP]: 'Build relationships',
      [ChoiceType.SKILL_CHECK]: 'Test your skills',
      [ChoiceType.INVENTORY]: 'Use an item',
      [ChoiceType.ENDING]: 'Choose your ending',
    };

    return createTestStoryChoice({
      storyId,
      parentContentId,
      text: typeTexts[type] || 'Make a choice',
      type,
      sequence: index + 1,
      ...overrides,
    });
  });
}

/**
 * Creates choices with specific availability states
 */
export function createChoicesWithAvailability(
  storyId: string,
  parentContentId: string,
  availabilityStates: boolean[],
  overrides: Partial<CreateTestStoryChoiceOptions> = {},
): StoryChoice[] {
  return availabilityStates.map((isAvailable, index) =>
    createTestStoryChoice({
      storyId,
      parentContentId,
      text: `Choice ${index + 1}`,
      sequence: index + 1,
      isAvailable,
      ...overrides,
    }),
  );
}
