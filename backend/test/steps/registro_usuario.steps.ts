import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { Test } from '@nestjs/testing';
import {
  INestApplication,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as supertest from 'supertest';
import * as assert from 'assert';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../src/users/users.service';
import { AppModule } from '../../src/app.module';

let app: INestApplication;
let request: any;

// Hook global: prepara app y mock por defecto
Before({ tags: '@user' }, async function () {
  const loginEmail = process.env.TEST_ADMIN_EMAIL || 'admin@signature.com';
  const loginPassword = process.env.TEST_ADMIN_PASSWORD || '123456789';

  // mock simple del UsersService para evitar dependencias de TypeORM en el test
  const mockUsersService: Partial<UsersService> = {
    findOneByEmail: async (email: string) => {
      if (email !== loginEmail) return undefined;
      return {
        id: 1,
        email,
        // bcrypt hash de la password de prueba para que bcrypt.compare funcione
        password: bcrypt.hashSync(loginPassword, 10),
        role: 'ADMIN',
      } as any;
    },
    create: async (dto: any) => {
      // simula conflicto cuando el email ya existe
      const existingEmail = 'existing@example.com';
      if (dto.email === existingEmail) {
        throw new ConflictException('Email already exists');
      }
      if (dto.password && dto.password.length < 6) {
        throw new BadRequestException('Password too short');
      }
      return { id: 999, ...dto };
    },
  };

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(UsersService)
    .useValue(mockUsersService)
    .compile();

  app = moduleRef.createNestApplication();
  await app.init();
  request = supertest(app.getHttpServer());
  this.request = request;
  this.payload = {};
  this.response = undefined;
  this.authHeader = undefined;

  // intenta loguear para obtener token real
  try {
    const loginRes = await request
      .post('/auth/login')
      .send({ email: loginEmail, password: loginPassword });

    if (
      loginRes &&
      loginRes.status === 200 &&
      (loginRes.body?.access_token || loginRes.body?.token)
    ) {
      const token = loginRes.body.access_token || loginRes.body.token;
      this.authHeader = `Bearer ${token}`;
      return;
    }
  } catch (err) {
    console.error('login mock fallback:', err);
  }
});

// Tag hook: forzar sin token
Before({ tags: '@sin-token' }, function () {
  this.authHeader = undefined;
});

After(async function () {
  if (app) await app.close();
});

When('el servidor esta disponible', function () {
  assert.ok(request, 'El servidor no está inicializado');
});

When('envío una petición de registro con:', async function (dataTable: any) {
  const data = dataTable.hashes()[0];
  const payload: any = {
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || 'USER',
  };
  this.payload = payload;

  const req = request.post('/auth/register').send(payload);
  if (this.authHeader) req.set('Authorization', this.authHeader);

  this.response = await req;
});

Then('la respuesta debe tener código {int}', function (status: number) {
  assert.ok(this.response, 'No hay respuesta disponible');
  assert.strictEqual(
    this.response.status,
    status,
    `Status esperado ${status}, obtenido ${this.response.status}`,
  );
});

Then(
  'la respuesta debe incluir el email {string}',
  function (expectedEmail: string) {
    const body = this.response.body;
    assert.ok(body, 'Respuesta sin cuerpo');
    assert.strictEqual(
      body.email,
      expectedEmail,
      `Email esperado ${expectedEmail}, obtenido ${body.email}`,
    );
    assert.ok(
      body.id || body.userId,
      'La respuesta no incluye identificador de usuario',
    );
  },
);

Given('que el servidor está disponible', function () {
  assert.ok(this.request, 'El servidor no está disponible');
});

Given('tengo un usuario autenticado como {string}', function (role: string) {
  if (role === 'USER') {
    this.authHeader = this.userToken;
  } else if (role === 'SUPERVISOR') {
    this.authHeader = this.supervisorToken;
  }
  assert.ok(this.authHeader, 'Usuario no autenticado');
});
