import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as assert from 'assert';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { UserRole } from '../../src/common/enum/user-role.enum';
import * as bcrypt from 'bcryptjs';
import { File } from '../../src/files/entities/file.entity';
import { DocumentStatusType } from '../../src/files/entities/document_status_type.entity';
import { DocumentHistory } from '../../src/files/entities/document_history.entity';

let app: INestApplication;
let userRepository: Repository<User>;

Before({ tags: '@usuarios' }, async function () {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 31000,
        username: 'postgres',
        password: 'postgres',
        database: 'signature_project',
        entities: [User, File, DocumentStatusType, DocumentHistory],
        synchronize: true,
        dropSchema: true,
        logging: false,
      }),
      AuthModule,
      UsersModule,
      ConfigModule.forRoot(),
    ],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();

  this.app = app;
  this.request = request(app.getHttpServer());

  userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));

  // Clean DB
  await userRepository.createQueryBuilder().delete().execute();
});

After({ tags: '@usuarios' }, async function () {
  if (app) await app.close();
});

// Removed conflicting steps: 'que el servidor está disponible', 'tengo un usuario autenticado como {string}', 'la respuesta debe tener código {int}'

Given('existen usuarios registrados con diferentes roles', async function () {
  const password = await bcrypt.hash('password123', 10);

  await userRepository.save([
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password,
      role: UserRole.ADMIN,
      isActive: true,
    },
    {
      firstName: 'Normal',
      lastName: 'User',
      email: 'user@test.com',
      password,
      role: UserRole.USER,
      isActive: true,
    },
  ]);

  // Login Admin
  const adminLogin = await this.request
    .post('/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' });

  if (!adminLogin.body.token) {
    console.error('Admin Login failed:', adminLogin.body);
    throw new Error('Admin Login failed');
  }
  this.adminToken = `Bearer ${adminLogin.body.token}`;

  // Login User
  const userLogin = await this.request
    .post('/auth/login')
    .send({ email: 'user@test.com', password: 'password123' });

  if (!userLogin.body.token) {
    console.error('User Login failed:', userLogin.body);
    throw new Error('User Login failed');
  }
  this.userToken = `Bearer ${userLogin.body.token}`;
});

When('envío una petición para listar usuarios', async function () {
  this.response = await this.request
    .get('/users')
    .set('Authorization', this.authHeader || '');
});

Then('la respuesta debe ser una lista de objetos de usuario', function () {
  assert.ok(Array.isArray(this.response.body));
  assert.ok(this.response.body.length > 0);
});

Then('cada usuario debe mostrar su "email" y "role"', function () {
  this.response.body.forEach((user: any) => {
    assert.ok(user.email);
    assert.ok(user.role);
  });
});

Then('el mensaje debe indicar falta de permisos de administrador', function () {
  assert.strictEqual(this.response.status, 403);
});
