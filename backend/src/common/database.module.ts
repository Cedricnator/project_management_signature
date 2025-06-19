// src/common/database/database.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import postgresConfig from './postgres.config';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule.forRoot({
          load: [postgresConfig],
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
            const dbConfig = configService.get<TypeOrmModuleOptions>(
              'postgres.datasource',
            );

            if (!dbConfig) {
              throw new Error('Database configuration not found');
            }

            return dbConfig;
          },
          inject: [ConfigService],
        }),
      ],
    };
  }
}
