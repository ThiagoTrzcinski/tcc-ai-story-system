import app from './app';
import dataSource from './data-source';

/**
 * Initialize database and start the server
 */
async function startServer() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger documentation: http://localhost:${PORT}/api-docs`);
    });

    console.log('🤖 AI Story Generation System activated');

    return { server };
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('Graceful Shutdown');

  try {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    console.log('Shutdown concluded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  try {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    console.log('Application terminated');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
startServer();
