import { container } from 'tsyringe';
import { StoryController } from '../../presentation/controllers/story.controller';
import { AIOrchestrationController } from '../../presentation/controllers/ai-orchestration.controller';
import { UserController } from '../../presentation/controllers/user.controller';

container.register('StoryController', { useClass: StoryController });
container.register('AIOrchestrationController', {
  useClass: AIOrchestrationController,
});
container.register('UserController', { useClass: UserController });
