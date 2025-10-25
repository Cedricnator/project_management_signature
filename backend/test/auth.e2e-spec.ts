import * as request from 'supertest';
import { Server } from 'http';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserRole } from '../src/common/enum/user-role.enum';
import * as bcrypt from 'bcryptjs';

describe('Auth Integration Test', () => {
  let app: INestApplication;
  let httpServer: Server;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 31000,
          username: 'postgres',
          password: 'postgres',
          database: 'signature_project',
          entities: [User],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        AuthModule,
        await ConfigModule.forRoot(),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Server;
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    // seed de un usuario admin
    await userRepository.save({
      firstName: 'Admin',
      lastName: 'admin last name',
      email: 'admin@test.com',
      password: await bcrypt.hash('admin123', 10),
      isActive: true,
      role: UserRole.ADMIN,
    });
  });

  it('IT-1 should login admin and return the access token', async () => {
    const response = await request(httpServer)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: 'admin@test.com',
        password: 'admin123',
      });
    const body = response.body as { token: string };
    const token_admin = body.token;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(token_admin).toBeDefined();
  });

  it('IT-2 should fail to login if credentials are wrong', async () => {
    const response = await request(httpServer)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: 'admin@test.com',
        password: 'wrongpassword',
      });
    const body = response.body as { message: string };
    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
    expect(body).toBe('Invalid password');
    expect(body).not.toHaveProperty('token');
  });

  afterAll(async () => {
    await app.close();
  });
});
