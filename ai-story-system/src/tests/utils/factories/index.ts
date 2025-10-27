// Story Factory exports
export {
  createTestStory,
  createDraftStory,
  createActiveStory,
  createCompletedStory,
  createStoryWithGenre,
  createStoryWithPrompts,
  createUserStory,
  type CreateTestStoryOptions,
} from './story.factory';

// StoryContent Factory exports
export {
  createTestStoryContent,
  createTextContent,
  createContentWithImage,
  createContentWithAudio,
  createMultimediaContent,
  createContentWithChoices,
  createOpeningContent,
  createChapterContent,
  createEndingContent,
  createContentSequence,
  createSequencedContent,
  type CreateTestStoryContentOptions,
} from './story-content.factory';

// StoryChoice Factory exports
export {
  createTestStoryChoice,
  createNarrativeChoice,
  createActionChoice,
  createDialogueChoice,
  createMoralChoice,
  createStrategicChoice,
  createSelectedChoice,
  createUnavailableChoice,
  createChoicesForContent,
  createMixedChoices,
  createChoiceSequence,
  createChoicesWithAvailability,
  type CreateTestStoryChoiceOptions,
} from './story-choice.factory';
