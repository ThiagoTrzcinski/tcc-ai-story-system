import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Story Generation API',
      version: '1.0.0',
      description:
        'AI-Powered Interactive Story Generation System with multi-provider AI integration',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Development server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'API server (port 3000)',
      },
      {
        url: 'http://localhost:3666/api',
        description: 'API server (port 3666)',
      },
      {
        url: '/api',
        description: 'Current server',
      },
    ],
    tags: [
      {
        name: 'Stories',
        description: 'Interactive story creation, management, and progression',
      },
      {
        name: 'AI Orchestration',
        description:
          'AI provider management and content generation orchestration',
      },
      {
        name: 'Users',
        description: 'User account management and authentication',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
        },
      },
      schemas: {
        Story: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the story',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              description: 'Story title',
              example: 'The Enchanted Forest Adventure',
            },
            description: {
              type: 'string',
              description: 'Story description',
              example: 'A magical journey through an enchanted forest',
            },
            genre: {
              type: 'string',
              enum: [
                'fantasy',
                'science_fiction',
                'mystery',
                'romance',
                'horror',
                'adventure',
                'thriller',
                'comedy',
                'drama',
                'historical',
                'western',
                'crime',
                'supernatural',
                'dystopian',
                'steampunk',
                'cyberpunk',
                'urban_fantasy',
                'slice_of_life',
                'coming_of_age',
                'custom',
              ],
              description: 'Story genre',
              example: 'fantasy',
            },
            status: {
              type: 'string',
              enum: [
                'draft',
                'in_progress',
                'completed',
                'published',
                'archived',
                'deleted',
              ],
              description: 'Story status',
              example: 'in_progress',
            },
            isPublic: {
              type: 'boolean',
              description: 'Whether the story is publicly accessible',
              example: true,
            },
            settings: {
              type: 'object',
              description: 'Story generation settings',
              properties: {
                AIModel: {
                  type: 'string',
                  description: 'AI model to use for story generation',
                  example: 'mock',
                  enum: [
                    'sonar',
                    'sonar-pro',
                    'sonar-deep-research',
                    'sonar-reasoning',
                    'sonar-reasoning-pro',
                    'test',
                    'mock',
                  ],
                },
              },
              required: ['AIModel'],
            },
            metadata: {
              type: 'object',
              description: 'Additional story metadata',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Story creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Story last update date',
            },
          },
        },
        StoryContent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the story content',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            storyId: {
              type: 'string',
              description: 'ID of the parent story',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            type: {
              type: 'string',
              enum: ['TEXT', 'IMAGE', 'AUDIO'],
              description: 'Content type',
              example: 'TEXT',
            },
            content: {
              type: 'string',
              description: 'The actual content (text, image URL, audio URL)',
              example:
                'You find yourself standing at the edge of a mystical forest...',
            },
            sequence: {
              type: 'integer',
              description: 'Order sequence in the story',
              example: 1,
            },
            metadata: {
              type: 'object',
              description: 'Additional content metadata',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Content creation date',
            },
          },
        },
        StoryChoice: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the story choice',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            storyId: {
              type: 'string',
              description: 'ID of the parent story',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            parentContentId: {
              type: 'string',
              description: 'ID of the content this choice belongs to',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            text: {
              type: 'string',
              description: 'Choice text displayed to user',
              example: 'Enter the mysterious cave',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the choice',
              example: 'A dark cave entrance beckons with unknown mysteries',
            },
            type: {
              type: 'string',
              enum: ['NARRATIVE', 'DIALOGUE', 'ACTION', 'EXPLORATION'],
              description: 'Type of choice',
              example: 'ACTION',
            },
            sequence: {
              type: 'integer',
              description: 'Order sequence among choices',
              example: 1,
            },
            isAvailable: {
              type: 'boolean',
              description: 'Whether the choice is available to select',
              example: true,
            },
            isSelected: {
              type: 'boolean',
              description: 'Whether the choice has been selected',
              example: false,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
            },
          },
        },
        CreateStoryRequest: {
          type: 'object',
          required: ['title', 'description', 'genre'],
          properties: {
            title: {
              type: 'string',
              description: 'Story title',
              example: 'The Enchanted Forest Adventure',
            },
            description: {
              type: 'string',
              description: 'Story description',
              example: 'A magical journey through an enchanted forest',
            },
            genre: {
              type: 'string',
              enum: [
                'fantasy',
                'science_fiction',
                'mystery',
                'romance',
                'horror',
                'adventure',
                'thriller',
                'comedy',
                'drama',
                'historical',
                'western',
                'crime',
                'supernatural',
                'dystopian',
                'steampunk',
                'cyberpunk',
                'urban_fantasy',
                'slice_of_life',
                'coming_of_age',
                'custom',
              ],
              description: 'Story genre',
              example: 'fantasy',
            },
            isPublic: {
              type: 'boolean',
              description: 'Whether the story should be publicly accessible',
              example: true,
              default: false,
            },
            settings: {
              type: 'object',
              description: 'Story generation settings',
              properties: {
                AIModel: {
                  type: 'string',
                  description: 'AI model to use for story generation',
                  example: 'mock',
                  enum: [
                    'sonar',
                    'sonar-pro',
                    'sonar-deep-research',
                    'sonar-reasoning',
                    'sonar-reasoning-pro',
                    'test',
                    'mock',
                  ],
                  default: 'mock',
                },
              },
              required: ['AIModel'],
            },
            metadata: {
              type: 'object',
              description: 'Additional story metadata',
              additionalProperties: true,
            },
          },
        },
        GenerateContentRequest: {
          type: 'object',
          required: ['storyId', 'type'],
          properties: {
            storyId: {
              type: 'string',
              description: 'ID of the story to generate content for',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            type: {
              type: 'string',
              enum: ['TEXT', 'IMAGE', 'AUDIO'],
              description: 'Type of content to generate',
              example: 'TEXT',
            },
            prompt: {
              type: 'string',
              description: 'Custom prompt for content generation',
              example: 'Generate a mysterious forest scene',
            },
            previousChoiceId: {
              type: 'string',
              description:
                'ID of the choice that led to this content generation',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            settings: {
              type: 'object',
              description: 'Override settings for this generation',
              properties: {
                AIModel: {
                  type: 'string',
                  description: 'AI model to use for this generation',
                  example: 'mock',
                  enum: [
                    'sonar',
                    'sonar-pro',
                    'sonar-deep-research',
                    'sonar-reasoning',
                    'sonar-reasoning-pro',
                    'test',
                    'mock',
                  ],
                },
              },
            },
          },
        },
        MakeChoiceRequest: {
          type: 'object',
          required: ['choiceId'],
          properties: {
            choiceId: {
              type: 'string',
              description: 'ID of the choice to make',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            generateNext: {
              type: 'boolean',
              description: 'Whether to automatically generate next content',
              example: true,
              default: true,
            },
          },
        },
        AIProviderStatus: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              description: 'AI provider name',
              example: 'openai',
            },
            enabled: {
              type: 'boolean',
              description: 'Whether the provider is enabled',
              example: true,
            },
            available: {
              type: 'boolean',
              description: 'Whether the provider is currently available',
              example: true,
            },
            models: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Available models for this provider',
              example: ['gpt-4', 'gpt-3.5-turbo'],
            },
            lastError: {
              type: 'string',
              description: 'Last error message if any',
              example: null,
            },
          },
        },
        StoryResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the operation was successful',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/Story',
            },
            message: {
              type: 'string',
              description: 'Success or error message',
              example: 'Story created successfully',
            },
          },
        },
        StoryListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the operation was successful',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Story',
              },
              description: 'List of stories',
            },
            meta: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Total number of stories',
                  example: 150,
                },
                page: {
                  type: 'integer',
                  description: 'Current page number',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  description: 'Number of stories per page',
                  example: 20,
                },
                hasNextPage: {
                  type: 'boolean',
                  description: 'Whether there are more pages available',
                  example: true,
                },
              },
            },
          },
        },
        ContentResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the operation was successful',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/StoryContent',
            },
            choices: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/StoryChoice',
              },
              description: 'Available choices for this content',
            },
            message: {
              type: 'string',
              description: 'Success or error message',
              example: 'Content generated successfully',
            },
          },
        },
        AIProvidersResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the operation was successful',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AIProviderStatus',
              },
              description: 'List of AI provider statuses',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/presentation/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
