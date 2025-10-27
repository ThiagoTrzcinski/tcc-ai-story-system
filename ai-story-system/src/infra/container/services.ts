import { container } from 'tsyringe';
import { StoryService } from '../../application/services/story.service';
import { AIOrchestrationService } from '../../application/services/ai-orchestration.service';
import { StoryContentService } from '../../application/services/story-content.service';
import { StoryChoiceService } from '../../application/services/story-choice.service';
import { UserService } from '../../application/services/user.service';
import { IStoryService } from '../../domain/services/story.service';
import { IAIOrchestrationService } from '../../domain/interfaces/ai-orchestration.service.interface';
import { IUserService } from '../../domain/interfaces/user.service.interface';

// Register application services
container.register<IStoryService>('IStoryService', StoryService);

container.register<IAIOrchestrationService>(
  'IAIOrchestrationService',
  AIOrchestrationService,
);

container.register<StoryContentService>(
  'StoryContentService',
  StoryContentService,
);

container.register<StoryChoiceService>(
  'StoryChoiceService',
  StoryChoiceService,
);

container.register<IUserService>('IUserService', UserService);
