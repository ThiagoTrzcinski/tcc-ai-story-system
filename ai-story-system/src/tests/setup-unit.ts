import { config } from 'dotenv';
import 'reflect-metadata';

// Configure environment for tests
config({
  path: '.env.test',
  override: true,
});

// Ensure reflect-metadata is available
if (typeof Reflect === 'undefined' || !Reflect.defineMetadata) {
  require('reflect-metadata');
}

// Jest types should now be available globally through tsconfig.test.json

beforeEach(() => {
  jest.clearAllMocks();
});

global.console = {
  ...console,
  // Uncomment to suppress console logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Optional: Set up test database or other resources
beforeAll(async () => {
  console.log('Iniciando testes unitários');
});

afterAll(async () => {
  console.log('Testes unitários concluídos!');
});
