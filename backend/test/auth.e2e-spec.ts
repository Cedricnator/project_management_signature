import * as request from 'supertest';

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';

describe('Auth E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
    app = moduleRef.createNestApplication();
  });
  it('/Post /auth/login', async () => {
    return request(app.getHttpServer()).get('/auth/login').expect(404);
  });
  afterAll(async () => {
    await app.close();
  });
});
