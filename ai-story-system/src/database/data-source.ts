import '../bootstrap';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entities';
import { migrations } from './migrations';
import { env } from 'process';

export default new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT || '5432'),
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  migrationsTableName: 'migrations',
  entities,
  migrations,
  subscribers: [],
  ssl: false,
});
