const request = require('supertest');
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../src/common/enum/user-role.enum';
import { randomUUID } from 'crypto';

interface LoginResponse {
  token: string;
}

interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

describe('Users Integration Test', () => {
  let app: INestApplication;
  let httpServer: Server;
  let userRepository: Repository<User>;

  let supervisorToken: string;
  let supervisorId: string;

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
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
          dropSchema: false,
          logging: false,
        }),
        AuthModule,
        UsersModule,
        ConfigModule.forRoot(),
      ],
    }).compile();

    app = testingModule.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Server;

    userRepository = testingModule.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  beforeEach(async () => {
    // Limpiar tabla de usuarios
    await userRepository.createQueryBuilder().delete().execute();

    // Crear usuario supervisor con UUID explícito
    const supervisorUuid = randomUUID();
    const supervisor = await userRepository.save({
      id: supervisorUuid,
      firstName: 'Supervisor',
      lastName: 'Test',
      email: 'supervisor@test.com',
      password: await bcrypt.hash('supervisor123', 10),
      isActive: true,
      role: UserRole.SUPERVISOR,
    });
    supervisorId = supervisor.id;

    // Obtener token
    const supervisorLogin = await request(httpServer).post('/auth/login').send({
      email: 'supervisor@test.com',
      password: 'supervisor123',
    });
    supervisorToken = (supervisorLogin.body as LoginResponse).token;
  });

  it('IT-8 should fail to create user with duplicate email', async () => {
    const userCountBefore = await userRepository.count();

    // Intentar crear usuario con email duplicado
    const createUserResponse = await request(httpServer)
      .post('/users')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        firstName: 'Usuario',
        lastName: 'Duplicado',
        email: 'supervisor@test.com', // Email ya existe
        password: 'password123',
        role: UserRole.USER,
      });

    // Verificar que la petición fue rechazada correctamente
    expect([400, 403, 409]).toContain(createUserResponse.status);
    expect(createUserResponse.request).toBeDefined();
    expect(createUserResponse.request.method).toBe('POST');
    expect(createUserResponse.request.url).toContain('/users');

    const errorBody = createUserResponse.body as ErrorResponse;
    expect(errorBody.message).toBeDefined();

    // Verificar que NO se creó un nuevo usuario en la BD
    const userCountAfter = await userRepository.count();
    expect(userCountAfter).toBe(userCountBefore);

    // Verificar que no existe un usuario duplicado
    const duplicateUsers = await userRepository.find({
      where: { email: 'supervisor@test.com' },
    });
    expect(duplicateUsers.length).toBe(1); // Solo debe existir el original
  });

  afterAll(async () => {
    // Limpiar tabla de usuarios antes de cerrar
    await userRepository.createQueryBuilder().delete().execute();
    await app.close();
  });
});
