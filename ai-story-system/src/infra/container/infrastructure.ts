import { container } from 'tsyringe';
import { MockedAIService } from '../../infrastructure/services/ai-providers/mocked-ai.service';

// Register AI provider services
container.register('MockedAIService', {
  useClass: MockedAIService,
});
