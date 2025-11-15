import 'reflect-metadata';
import dataSource from '../data-source';
import '../infra/container/infrastructure';
import '../infra/container/repository';
import '../infra/container/services';

const initializeTestDatabase = async () => {
  if (!process.env.DB_NAME?.includes('test')) {
    throw new Error(`Database name MUST contain 'test' in test environment. `);
  }

  const testDataSource = await dataSource.initialize();

  await testDataSource.runMigrations();

  if (process.env.DB_NAME) {
    try {
      await testDataSource.query(
        `ALTER DATABASE ${process.env.DB_NAME} SET TIMEZONE TO 'America/Sao_Paulo';`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn('Could not set database timezone:', errorMessage);
    }
  }

  return testDataSource;
};

const cleanDatabase = async () => {
  if (dataSource.isInitialized) {
    try {
      const entities = dataSource.entityMetadatas;
      if (entities.length > 0) {
        const tableNames = entities
          .map((entity) => `"${entity.tableName}"`)
          .join(', ');

        await dataSource.query(
          `TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`,
        );
      }
    } catch (error) {
      console.warn('Warning during database cleanup:', error);
    }
  }
};

// Jest lifecycle hooks
beforeAll(async () => {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString?.() || '';
    if (
      message.includes('Error during final cleanup') ||
      message.includes('Unhandled Promise Rejection') ||
      message.includes('Uncaught Exception')
    ) {
      originalConsoleError(...args);
    }
  };

  await initializeTestDatabase();
  await cleanDatabase();
}, 60000);

beforeEach(async () => {
  await cleanDatabase();
}, 30000);

afterEach(async () => {
  await cleanDatabase();
}, 30000);

afterAll(async () => {
  try {
    if (dataSource.isInitialized) {
      await cleanDatabase();
      if (process.env.JEST_WORKER_ID === undefined) {
        await dataSource.destroy();
        console.log('Test database connection closed');
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error during final cleanup:', errorMessage);
  }
}, 30000);

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
