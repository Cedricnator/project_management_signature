import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';

const config = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'signature_project',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrationsRun: false,
  synchronize: false,
};

export default registerAs('postgres.datasource', () => config);
export const dataSource = new DataSource(config as DataSourceOptions);
