import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const setupEnvironment = () => {
  const isTestEnvironment =
    process.env.NODE_ENV === 'test' ||
    process.argv.includes('--testNamePattern') ||
    process.argv.some((arg) => arg.includes('jest'));

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = isTestEnvironment ? 'test' : 'development';
  }

  if (isTestEnvironment) {
    const envTestPath = path.resolve('.env.test');
    if (!fs.existsSync(envTestPath)) {
      throw new Error(`.env.test file not found`);
    }

    const envTestResult = dotenv.config({
      path: '.env.test',
      override: true,
    });

    if (envTestResult.error) {
      throw new Error(
        `Failed to load .env.test file: ${envTestResult.error.message}`,
      );
    }
  } else {
    dotenv.config();
  }

  return isTestEnvironment;
};

const configureForEnvironment = (isTestEnvironment: boolean) => {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
  ];

  const missingVars: string[] = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    const envType = isTestEnvironment ? '.env.test' : '.env';
    throw new Error(
      `Missing required environment variables in ${envType}: ${missingVars.join(', ')}. `,
    );
  }

  if (isTestEnvironment) {
    if (!process.env.DB_NAME?.includes('test')) {
      throw new Error(
        `Database name MUST contain 'test' in test environment. `,
      );
    }
  }

  return {
    isTestEnvironment,
    databaseName: process.env.DB_NAME,
    port: process.env.PORT || (isTestEnvironment ? '0' : '3000'),
  };
};

const isTestEnvironment = setupEnvironment();
const config = configureForEnvironment(isTestEnvironment);

export { config, isTestEnvironment };
export default config;
