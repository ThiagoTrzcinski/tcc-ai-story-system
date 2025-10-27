import 'reflect-metadata';
import { DataSource } from 'typeorm';
import './bootstrap';
import { isTestEnvironment } from './bootstrap';
import { entities } from './database/entities';
import { migrations } from './database/migrations';

const createDataSource = () => {
  const config = {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    migrationsTableName: 'migrations',
    entities,
    migrations,
    subscribers: [],
    ssl: false,
    // Test-specific configurations
    ...(isTestEnvironment && {
      logging: false,
      dropSchema: false,
      cache: false,
    }),
  };

  return new DataSource(config);
};

const dataSource = createDataSource();

export default dataSource;
