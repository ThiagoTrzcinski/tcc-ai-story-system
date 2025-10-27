# AI-Powered Interactive Story Generation System

A comprehensive AI-powered interactive story generation microservice built with TypeScript, Express.js, and PostgreSQL, following Domain-Driven Design (DDD) and Clean Architecture principles. This system enables users to create, manage, and experience interactive stories with AI-generated content, choices, and multimedia elements.

## Features

### Core Story Management

- **Interactive Story Creation**: Create branching narratives with user choices
- **AI Content Generation**: Generate text, images, and audio using multiple AI providers
- **Multi-Provider AI Support**: OpenAI, Anthropic, Google, Stability AI, ElevenLabs, and more
- **Story Progression**: Dynamic story progression based on user choices
- **Content Types**: Support for text, image, audio, and combined content
- **Choice Management**: Various choice types (narrative, dialogue, action, moral, etc.)

### AI Integration

- **Text Generation**: Story content generation using GPT-4, Claude, Gemini
- **Image Generation**: Visual content using Stable Diffusion, DALL-E, Midjourney
- **Audio Generation**: Voice narration using ElevenLabs text-to-speech
- **Provider Orchestration**: Intelligent routing and fallback between AI providers
- **Cost Tracking**: Monitor and optimize AI usage costs
- **Content Moderation**: Automated content safety and appropriateness checks

### Story Features

- **Multiple Genres**: Fantasy, Sci-Fi, Mystery, Romance, Horror, Adventure, and more
- **Branching Narratives**: Complex story trees with multiple paths and endings
- **User Progress Tracking**: Save and resume story progress
- **Story Statistics**: Reading time estimation, choice analytics
- **Story Publishing**: Share completed stories with others
- **Export/Import**: Story data portability

### Technical Features

- **RESTful API**: Comprehensive REST API with Swagger documentation
- **Real-time Updates**: WebSocket support for live story updates
- **Database Migrations**: Automated database schema management
- **Comprehensive Testing**: Unit tests, integration tests, and E2E tests
- **Configuration Management**: Flexible AI provider configuration
- **Error Handling**: Robust error handling and recovery mechanisms

## Architecture

This project follows Clean Architecture and Domain-Driven Design principles:

```
src/
├── domain/              # Business logic and entities
│   ├── entities/        # Story, StoryContent, StoryChoice entities
│   ├── repositories/    # Repository interfaces
│   ├── services/        # Domain services (Story, AI Orchestration)
│   └── value-objects/   # Status, Genre, ContentType, ChoiceType, AIProvider
├── application/         # Application services and use cases
│   └── services/        # StoryService, AIOrchestrationService, etc.
├── infrastructure/      # External concerns
│   ├── repositories/    # Database implementations
│   └── services/        # AI provider implementations
├── presentation/        # Controllers and HTTP layer
│   └── controllers/     # StoryController, AIOrchestrationController
├── entities/           # TypeORM database entities
├── config/             # Configuration management
└── tests/              # Comprehensive test suite
```

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **AI Providers**: OpenAI, Anthropic, Google, Stability AI, ElevenLabs
- **Authentication**: JWT-based authentication
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with comprehensive coverage
- **Dependency Injection**: TSyringe
- **File Storage**: Cloud storage integration for generated media
- **Real-time**: WebSocket support for live updates

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- AI Provider API Keys (OpenAI, Anthropic, etc.)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ai-story-system
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration including AI provider keys
```

4. Run database migrations:

```bash
npm run migration:run
```

5. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000` and the Swagger documentation at `http://localhost:3000/api-docs`.

## Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=ai_story_system

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_ENABLED=true

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=4000
ANTHROPIC_TEMPERATURE=0.7
ANTHROPIC_ENABLED=true

# Google AI Configuration
GOOGLE_API_KEY=your_google_api_key
GOOGLE_MODEL=gemini-pro
GOOGLE_ENABLED=true

# Stability AI Configuration
STABILITY_API_KEY=your_stability_api_key
STABILITY_MODEL=stable-diffusion-xl-1024-v1-0
STABILITY_ENABLED=true

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_MODEL=eleven_multilingual_v2
ELEVENLABS_DEFAULT_VOICE_ID=pNInz6obpgDQGcFmaJgB
ELEVENLABS_ENABLED=true

# AI Global Settings
DEFAULT_AI_PROVIDER=openai
AI_ENABLE_FALLBACK=true
AI_MAX_RETRIES=3
AI_TIMEOUT_MS=30000
AI_ENABLE_CACHING=true
AI_ENABLE_MODERATION=true
AI_ENABLE_COST_TRACKING=true

# File Storage (for generated images/audio)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## API Documentation

The API is fully documented using Swagger/OpenAPI. Once the server is running, you can access the interactive documentation at:

```
http://localhost:3000/api-docs
```

### Main Endpoints

#### Story Management

- **Stories**: `/api/stories` - Create, read, update, delete stories
- **Story Actions**: `/api/stories/{id}/start`, `/api/stories/{id}/complete`
- **Story Content**: `/api/stories/{id}/content` - Manage story content
- **Story Choices**: `/api/stories/{id}/choices` - Manage story choices

#### AI Content Generation

- **Text Generation**: `/api/ai/generate/text` - Generate story text
- **Image Generation**: `/api/ai/generate/image` - Generate story images
- **Audio Generation**: `/api/ai/generate/audio` - Generate story audio
- **Combined Content**: `/api/ai/generate/combined` - Generate multimedia content
- **Choice Generation**: `/api/ai/generate/choices` - Generate story choices

#### AI Provider Management

- **Provider Status**: `/api/ai/providers/status` - Check provider availability
- **Provider Config**: `/api/ai/providers/{provider}/config` - Manage configurations
- **Cost Estimation**: `/api/ai/estimate-cost` - Estimate generation costs

## Story Creation Workflow

1. **Create Story**: Define title, genre, description, and initial prompt
2. **Generate Opening**: Use AI to generate the opening content
3. **Add Choices**: Create or generate choices for user interaction
4. **User Progression**: Users make choices to progress through the story
5. **Dynamic Content**: Generate new content based on user choices
6. **Story Completion**: Reach story endings based on user path

## AI Provider Integration

The system supports multiple AI providers with intelligent orchestration:

### Text Generation Providers

- **OpenAI GPT-4**: High-quality creative writing
- **Anthropic Claude**: Excellent for nuanced storytelling
- **Google Gemini**: Cost-effective option with good quality

### Image Generation Providers

- **Stability AI**: Open-source Stable Diffusion models
- **DALL-E**: OpenAI's image generation
- **Midjourney**: High-quality artistic images

### Audio Generation Providers

- **ElevenLabs**: High-quality text-to-speech with multiple voices

## Testing

Run the test suite:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage

# Test specific components
npm run test -- --testPathPattern=story
npm run test -- --testPathPattern=ai-orchestration
```

## Database Schema

The system uses PostgreSQL with the following main tables:

- **stories**: Main story entities with metadata
- **story_content**: Individual content pieces (text, image, audio)
- **story_choices**: User choice options with branching logic

Key features:

- UUID primary keys for stories and content
- JSONB columns for flexible metadata storage
- Enum types for status, genre, content types
- Foreign key relationships with cascade deletes
- Indexes for performance optimization

## Development

### Adding New AI Providers

1. Create provider service in `src/infrastructure/services/ai-providers/`
2. Implement the provider interface methods
3. Add provider configuration in `src/config/ai-providers.ts`
4. Update the AI orchestration service to include the new provider
5. Add comprehensive tests for the new provider

### Adding New Story Features

1. Define domain entities in `src/domain/entities/`
2. Create repository interfaces in `src/domain/repositories/`
3. Implement repositories in `src/infrastructure/repositories/`
4. Create application services in `src/application/services/`
5. Add controllers in `src/presentation/controllers/`
6. Write comprehensive tests for all layers

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t ai-story-system .
docker run -p 3000:3000 ai-story-system
```

### Production

1. Build the application:

```bash
npm run build
```

2. Run database migrations:

```bash
npm run migration:run
```

3. Start the production server:

```bash
npm start
```

## Monitoring and Analytics

The system includes comprehensive monitoring:

- **AI Usage Tracking**: Monitor token usage and costs across providers
- **Story Analytics**: Track user engagement and story completion rates
- **Performance Metrics**: API response times and error rates
- **Provider Health**: Monitor AI provider availability and performance

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Update documentation as needed
6. Commit your changes: `git commit -am 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
