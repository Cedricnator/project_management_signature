import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';

describe('Auth E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'test',
          password: 'test',
          database: 'test',
          entities: [User],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        AuthModule,
        ConfigModule.forRoot(),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  /*
  it('/Post /auth/login', async () => {
    return request(app.getHttpServer()).post('/auth/login').expect(404);
  });
  
   */
  it('/Post /auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        email: 'test@test.com',
        password: 'test1234',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(response.status).toBe(201);
  });
  afterAll(async () => {
    await app.close();
  });
});
