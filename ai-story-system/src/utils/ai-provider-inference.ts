import { AIProvider } from '../domain/value-objects/ai-provider.value-object';

/**
 * Infers the AI provider based on the model name
 * @param modelName The AI model name
 * @returns The corresponding AI provider
 */
export function inferProviderFromModel(modelName: string): AIProvider {
  const model = modelName.toLowerCase();

  // Test/Mock models
  if (model.includes('test') || model.includes('mock')) {
    return AIProvider.MOCKED;
  }

  // Default to Mocked for testing
  return AIProvider.MOCKED;
}

/**
 * Gets the default model for a given provider
 * @param provider The AI provider
 * @returns The default model name for that provider
 */
export function getDefaultModelForProvider(provider: AIProvider): string {
  switch (provider) {
    case AIProvider.MOCKED:
      return 'test';
    default:
      return 'sonar-pro';
  }
}

/**
 * Validates if a model name is supported by the inferred provider
 * @param modelName The model name to validate
 * @returns True if the model is supported, false otherwise
 */
export function isModelSupported(modelName: string): boolean {
  const supportedModels = [
    // Test/Mock models
    'test',
    'mock',
    'test-model-v1',
    'test-model-v2',
    'mock-gpt-4',
    'mock-gemini',
  ];

  return supportedModels.includes(modelName.toLowerCase());
}

/**
 * Gets available models for a specific provider
 * @param provider The AI provider
 * @returns Array of available model names
 */
export function getAvailableModelsForProvider(provider: AIProvider): string[] {
  switch (provider) {
    case AIProvider.MOCKED:
      return [
        'test',
        'mock',
        'test-model-v1',
        'test-model-v2',
        'mock-gpt-4',
        'mock-gemini',
      ];
    default:
      return ['test'];
  }
}
