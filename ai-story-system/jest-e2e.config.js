/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test file patterns for E2E tests
  testMatch: ['**/*.e2e.spec.ts'],

  // Root directory
  rootDir: './',

  // Setup files for E2E tests
  setupFiles: ['reflect-metadata'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup-e2e.ts'],

  // TypeScript transformation
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },

  // File extensions to process
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Performance optimizations for E2E (slower but more thorough)
  maxWorkers: 1, // E2E tests should run sequentially to avoid database conflicts

  // Longer timeouts for E2E tests
  testTimeout: 30000, // 30 segundos

  // Cache configuration
  cacheDirectory: 'node_modules/.jest-e2e',

  // Performance optimizations
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,

  // Verbose output for E2E tests
  verbose: true,

  // Force exit after tests complete (useful for E2E tests with persistent connections)
  forceExit: true,

  // Detect handles that prevent Jest from exiting
  detectOpenHandles: false,

  // Error handling
  errorOnDeprecated: true,

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
