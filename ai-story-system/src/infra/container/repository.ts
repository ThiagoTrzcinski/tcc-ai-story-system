import { container } from 'tsyringe';
import { IStoryRepository } from '../../domain/repositories/story.repository';
import { IStoryContentRepository } from '../../domain/repositories/story-content.repository';
import { IStoryChoiceRepository } from '../../domain/repositories/story-choice.repository';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { StoryRepository } from '../../infrastructure/repositories/story.repository';
import { StoryContentRepository } from '../../infrastructure/repositories/story-content.repository';
import { StoryChoiceRepository } from '../../infrastructure/repositories/story-choice.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

// Register all repository implementations
container.register<IStoryRepository>('IStoryRepository', StoryRepository);

container.register<IStoryContentRepository>(
  'IStoryContentRepository',
  StoryContentRepository,
);

container.register<IStoryChoiceRepository>(
  'IStoryChoiceRepository',
  StoryChoiceRepository,
);

container.register<IUserRepository>('IUserRepository', UserRepository);
