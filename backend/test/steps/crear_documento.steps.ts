import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import * as assert from 'assert';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../src/users/entities/user.entity';
import { File } from '../../src/files/entities/file.entity';
import { DocumentStatusType } from '../../src/files/entities/document_status_type.entity';
import { DocumentHistory } from '../../src/files/entities/document_history.entity';
import { UserRole } from '../../src/common/enum/user-role.enum';
import { DocumentStatus } from '../../src/files/enum/document-status.enum';
import { FilesModule } from '../../src/files/files.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { ConfigModule } from '@nestjs/config';

let app: INestApplication;
let request: any;
let userRepository: Repository<User>;
let fileRepository: Repository<File>;
let statusRepository: Repository<DocumentStatusType>;
let historyRepository: Repository<DocumentHistory>;
let userToken: string;
let statusPendingId: string;

// Hook global: prepara app con DB real
Before({ tags: '@document' }, async function () {
  const testingModule: TestingModule = await Test.createTestingModule({
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
      FilesModule,
      AuthModule,
      UsersModule,
      ConfigModule.forRoot(),
    ],
  }).compile();

  app = testingModule.createNestApplication();
  await app.init();
  request = supertest(app.getHttpServer());
  this.request = request;
  this.payload = {};
  this.response = undefined;
  this.authHeader = undefined;

  userRepository = testingModule.get<Repository<User>>(
    getRepositoryToken(User),
  );
  fileRepository = testingModule.get<Repository<File>>(
    getRepositoryToken(File),
  );
  statusRepository = testingModule.get<Repository<DocumentStatusType>>(
    getRepositoryToken(DocumentStatusType),
  );
  historyRepository = testingModule.get<Repository<DocumentHistory>>(
    getRepositoryToken(DocumentHistory),
  );

  // Limpiar tablas
  await fileRepository.createQueryBuilder().delete().execute();
  await historyRepository.createQueryBuilder().delete().execute();
  await userRepository.createQueryBuilder().delete().execute();
  await statusRepository.createQueryBuilder().delete().execute();

  // Crear estados
  const pendingStatus = await statusRepository.save({
    id: DocumentStatus.PENDING_REVIEW,
    status: 'Pending Review',
  });
  statusPendingId = pendingStatus.id;

  // Crear usuario de prueba
  const user = await userRepository.save({
    firstName: 'Test',
    lastName: 'User',
    email: 'user@test.com',
    password: await bcrypt.hash('user123', 10),
    isActive: true,
    role: UserRole.USER,
  });

  // Crear supervisor de prueba
  const supervisor = await userRepository.save({
    firstName: 'Test',
    lastName: 'Supervisor',
    email: 'supervisor@test.com',
    password: await bcrypt.hash('supervisor123', 10),
    isActive: true,
    role: UserRole.SUPERVISOR,
  });

  // Obtener tokens
  const loginRes = await request.post('/auth/login').send({
    email: 'user@test.com',
    password: 'user123',
  });
  userToken = loginRes.body.token;

  const supervisorLoginRes = await request.post('/auth/login').send({
    email: 'supervisor@test.com',
    password: 'supervisor123',
  });
  const supervisorToken = supervisorLoginRes.body.token;

  this.userToken = `Bearer ${userToken}`;
  this.supervisorToken = `Bearer ${supervisorToken}`;
  this.authHeader = this.userToken;
});

// Tag hook: forzar sin token
Before({ tags: '@sin-autenticacion' }, function () {
  this.authHeader = undefined;
});

After(async function () {
  if (app) await app.close();
});

When(
  'envío una petición de subida de documento con:',
  async function (dataTable: any) {
    const data = dataTable.hashes()[0];
    const buffer = Buffer.from('Test file content');

    const req = request
      .post('/files/upload')
      .set('Authorization', this.authHeader || '')
      .field('name', data.name)
      .field('description', data.description)
      .attach('file', buffer, data.filename);

    this.response = await req;
  },
);

When(
  'envío una petición de subida de documento con archivo inválido',
  async function () {
    const req = request
      .post('/files/upload')
      .set('Authorization', this.authHeader || '')
      .field('name', 'Invalid')
      .field('description', 'Invalid file');

    this.response = await req;
  },
);

When('envío una petición de subida de documento sin token', async function () {
  const buffer = Buffer.from('Test file content');
  this.response = await request
    .post('/files/upload')
    .field('name', 'Test Document')
    .field('description', 'Document for testing')
    .attach('file', buffer, 'test.pdf');
});

Then(
  'la respuesta debe incluir el nombre {string}',
  function (expectedName: string) {
    const body = this.response.body;
    assert.ok(body, 'Respuesta sin cuerpo');
    assert.strictEqual(
      body.name,
      expectedName,
      `Nombre esperado ${expectedName}, obtenido ${body.name}`,
    );
  },
);

Then(
  'el documento debe estar en estado {string}',
  async function (expectedStatus: string) {
    const body = this.response.body;
    assert.ok(body, 'Respuesta sin cuerpo');
    assert.ok(body.id, 'No hay ID en la respuesta');
    const document = await fileRepository.findOne({
      where: { id: body.id },
    });
    assert.ok(document, 'Documento no encontrado en BD');
    assert.strictEqual(
      document.currentStatusId,
      statusPendingId,
      'Estado no es Pending Review',
    );
  },
);
