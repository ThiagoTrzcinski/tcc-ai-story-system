import 'express-async-errors';
import 'reflect-metadata';
import './bootstrap';
import './infra/container/controllers';
import './infra/container/infrastructure';
import './infra/container/repository';
import './infra/container/services';

import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { isTestEnvironment } from './bootstrap';
import { swaggerSpec } from './config/swagger';
import { apiRoutes } from './infra/http/routes';
import {
  errorHandler,
  notFoundHandler,
} from './presentation/middleware/error-handler.middleware';

export function createApplication() {
  const app = (express as any)();

  app.use(
    cors({
      credentials: true,
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3666',
        process.env.CORS_ORIGIN || 'http://localhost:3000',
      ].filter((origin): origin is string => Boolean(origin)),
    }),
  );

  const jsonLimit = isTestEnvironment ? '100mb' : '10mb';
  app.use((express as any).json({ limit: jsonLimit }));

  app.use((express as any).urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== 'production') {
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'AI Story Generation API Documentation',
        swaggerOptions: {
          url: '/api-docs/swagger.json',
          tryItOutEnabled: true,
        },
      }),
    );

    // Serve the raw swagger spec as JSON
    app.get('/api-docs/swagger.json', (req: any, res: any) => {
      // Dynamically set the server URL based on the current request
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}/api`;

      const dynamicSpec = {
        ...swaggerSpec,
        servers: [
          {
            url: baseUrl,
            description: 'Current server',
          },
          {
            url: 'http://localhost:3000/api',
            description: 'Default development server',
          },
          {
            url: 'http://localhost:3666/api',
            description: 'Alternative development server',
          },
        ],
      };

      res.json(dynamicSpec);
    });
  }

  // Health check endpoint (no auth required)
  app.get('/api/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'AI Story Generation System',
      environment: process.env.NODE_ENV || 'development',
      aiProviders: {
        openai: process.env.OPENAI_ENABLED === 'true',
        anthropic: process.env.ANTHROPIC_ENABLED === 'true',
        google: process.env.GOOGLE_ENABLED === 'true',
        stability: process.env.STABILITY_ENABLED === 'true',
        elevenlabs: process.env.ELEVENLABS_ENABLED === 'true',
      },
    });
  });

  apiRoutes.forEach((route) => {
    route.use(app, route.path);
  });

  // 404 handler for unknown routes
  app.use(notFoundHandler);

  // Global error handling middleware
  app.use(errorHandler);

  return app;
}

// Export configured application
const app = createApplication();

export default app;
