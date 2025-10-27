import { container } from 'tsyringe';
import { AIOrchestrationController } from '../../../presentation/controllers/ai-orchestration.controller';
import { StoryController } from '../../../presentation/controllers/story.controller';
import { UserController } from '../../../presentation/controllers/user.controller';
import { Application } from '../../../types/express-types';

export interface RouteConfig {
  path: string;
  use: (app: Application, basePath: string) => void;
}

export const storyRoutes: RouteConfig = {
  path: '/api/stories',
  use: (app: Application, basePath: string) => {
    const storyController = container.resolve(StoryController);
    app.use(basePath, storyController.router);
  },
};

export const aiRoutes: RouteConfig = {
  path: '/api/ai',
  use: (app: Application, basePath: string) => {
    const aiController = container.resolve(AIOrchestrationController);
    app.use(basePath, aiController.router);
  },
};

export const userRoutes: RouteConfig = {
  path: '/api/users',
  use: (app: Application, basePath: string) => {
    const userController = container.resolve(UserController);
    app.use(basePath, userController.router);
  },
};

export const apiRoutes: RouteConfig[] = [storyRoutes, aiRoutes, userRoutes];
