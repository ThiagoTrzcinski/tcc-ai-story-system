import { InitialAIStorySchema1756600000000 } from './1756600000000-InitialAIStorySchema';
import { CreateUsersTable1756700000000 } from './1756700000000-CreateUsersTable';
import { AddSoftDeleteColumns1756800000000 } from './1756800000000-AddSoftDeleteColumns';
import { AddDescriptionToStoryChoices1756900000000 } from './1756900000000-AddDescriptionToStoryChoices';
import { AddSettingsToStory1756910000000 } from './1756910000000-AddSettingsToStory';
import { AddUpdatedAtToStoryContent1756920000000 } from './1756920000000-AddUpdatedAtToStoryContent';

export const migrations = [
  InitialAIStorySchema1756600000000,
  CreateUsersTable1756700000000,
  AddSoftDeleteColumns1756800000000,
  AddDescriptionToStoryChoices1756900000000,
  AddSettingsToStory1756910000000,
  AddUpdatedAtToStoryContent1756920000000,
];
