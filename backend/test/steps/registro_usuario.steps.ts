import { Before, After, When, Then } from '@cucumber/cucumber';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import * as assert from 'assert';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../src/users/users.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersService } from '../../src/users/users.service';
import { User } from '../../src/users/entities/user.entity';
import { UserRole } from '../../src/common/enum/user-role.enum';
import { AllExceptionsFilter } from '../../src/common/exceptions.filter';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';

let app: INestApplication;
let request: any;

// Hook global: prepara app y mock por defecto
Before(async function () {
  const loginEmail = process.env.TEST_ADMIN_EMAIL || 'admin@signature.com';
  const loginPassword = process.env.TEST_ADMIN_PASSWORD || '123456789';
  const existingEmail = 'existing@example.com';

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

  const dbHost = process.env.TEST_DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.TEST_DB_PORT || '31000', 10);
  const dbUser = process.env.TEST_DB_USER || 'postgres';
  const dbPassword = process.env.TEST_DB_PASSWORD || 'postgres';
  const dbName = process.env.TEST_DB_NAME || 'signature_project';

  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: dbHost,
        port: dbPort,
        username: dbUser,
        password: dbPassword,
        database: dbName,
        entities: [User],
        synchronize: true,
        dropSchema: true,
        logging: false,
      }),
      UsersModule,
      AuthModule,
    ],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  request = supertest(app.getHttpServer());
  this.request = request;
  this.payload = {};
  this.response = undefined;
  this.authHeader = undefined;

  const usersService = moduleRef.get(UsersService);

  const adminUser: CreateUserDto = {
    email: loginEmail,
    password: loginPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  };

  const existingUser: CreateUserDto = {
    email: existingEmail,
    password: 'Existing123!',
    firstName: 'Existing',
    lastName: 'User',
    role: UserRole.USER,
  };

  await usersService.create(adminUser);
  await usersService.create(existingUser);

  const loginRes = await request
    .post('/auth/login')
    .send({ email: loginEmail, password: loginPassword });

  if (
    loginRes.status === 200 &&
    (loginRes.body?.token || loginRes.body?.access_token)
  ) {
    const token =
      loginRes.body.token ||
      loginRes.body.access_token ||
      loginRes.body.accessToken;
    this.authHeader = `Bearer ${token}`;
    return;
  }

  throw new Error('No fue posible autenticar al administrador de pruebas');
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
  const roleValue =
    typeof data.role === 'string' && data.role.trim().length > 0
      ? data.role.trim().toLowerCase()
      : UserRole.USER;

  const payload: Record<string, unknown> = {
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: roleValue,
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
