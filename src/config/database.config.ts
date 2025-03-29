import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

const databaseConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity.js'],
  migrations: [
    join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')
  ],
  autoLoadEntities: true,
  synchronize: false,
  migrationsTableName: 'migrations_typeorm',
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true'
};

export default registerAs('database', () => databaseConfig);
export const connectionSource = new DataSource(databaseConfig as DataSourceOptions); 