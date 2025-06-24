import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';

const config = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '31000', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'signature_project',
  entities: ['dist/**/*.entity{.ts,.js}'],
  timezone: 'America/Santiago',
  migrationsRun: false,
  synchronize: false,

  extra: {
    max: 8,          // Máximo 20 conexiones en el pool
    min: 3,           // Mínimo 3 conexiones siempre activas
    acquire: 30000,   // 30s timeout para obtener conexión
    idle: 15000,      // 15s antes de cerrar conexión inactiva
    evict: 1000,      // Revisar conexiones muertas cada 1s
  },

  connectionTimeoutMillis: 3000,    // 3s timeout de conexión
  idleTimeoutMillis: 90000,         // 90s timeout de inactividad
  maxQueryExecutionTime: 8000,      // Log queries > 8s
};

export default registerAs('postgres.datasource', () => config);
export const dataSource = new DataSource(config as DataSourceOptions);
