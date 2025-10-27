/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test file patterns - similar to Vitest's include
  testMatch: ['**/*.spec.ts'],

  // Root directory
  rootDir: './',

  // Setup files - similar to Vitest's setupFiles
  setupFiles: ['reflect-metadata'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup-unit.ts'],

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

  // Performance optimizations similar to Vitest
  maxWorkers: '50%', // Use 50% of available cores

  // Timeouts similar to Vitest
  testTimeout: 10000,

  // Cache configuration - similar to Vitest's cache dir
  cacheDirectory: 'node_modules/.jest',

  // Coverage configuration (optional)
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/bootstrap.ts',
    '!src/database/migrations/**',
    '!src/types/**',
  ],

  // Clear mocks between tests for better isolation
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Error handling
  errorOnDeprecated: true,

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
