import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserRole } from '../src/common/enum/user-role.enum';
import * as bcrypt from 'bcryptjs';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let token: string;
  let userRepository: Repository<User>;
  let token_admin: string;

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
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    // 👇 Seed de un usuario admin
    await userRepository.save({
      firstName: 'Admin',
      lastName: 'admin last name',
      email: 'admin@test.com',
      password: await bcrypt.hash('admin123', 10),
      isActive: true,
      role: UserRole.ADMIN,
    });
  });
  it('login admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: 'admin@test.com',
        password: 'admin123',
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    token_admin = response.body.token as string;
  });
  it('/Post /auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        email: 'testfail@test.com',
        password: 'test1234',
        firstName: 'Test',
        lastName: 'User',
      });
    /**
     * {
     *   "id": "2a9460e6-eb57-4b12-882d-a6fbd584be3c",
     *   "email": "test@test.com",
     *   "role": "user"
     * }
     */

    expect(response.status).toBe(401);
  });
  it('PF-03 Gestión de usuarios', async () => {
    //Crear nuevo usuario con rol
    //un usuario con rol admin puede crear un usuario indicando email y contraseña
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token_admin}`)
      .send({
        email: 'test@test.com',
        password: 'test1234',
        firstName: 'Test',
        lastName: 'User',
      });
    /**
     * {
     *   "id": "2a9460e6-eb57-4b12-882d-a6fbd584be3c",
     *   "email": "test@test.com",
     *   "role": "user"
     * }
     */

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('role', 'user');
  });
  it('/Post /auth/login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        password: 'test1234',
        email: 'test@test.com',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    token = response.body.token;
  });
  it('should reject login with wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });
  it('/Get /auth/me', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send();

    /**
     * {
     *         id: 1,
     *         email: 'test@test.com',
     *         role: 'user',
     *         iat: 1749438897,
     *         exp: 1749698097
     *       }
     */
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email', 'test@test.com');
    expect(response.body).toHaveProperty('role', 'user');
  });
  it('PF-03 Gestión de usuarios', async () => {
    //Crear nuevo usuario con rol
    //un usuario con rol admin puede crear un usuario indicando email y contraseña
  });
  afterAll(async () => {
    await app.close();
  });
});
