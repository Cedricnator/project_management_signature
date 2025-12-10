import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as assert from 'assert';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';
import { File } from '../../src/files/entities/file.entity';
import { DocumentStatusType } from '../../src/files/entities/document_status_type.entity';
import { DocumentHistory } from '../../src/files/entities/document_history.entity';
import { AuthModule } from '../../src/auth/auth.module';
import { FilesModule } from '../../src/files/files.module';
import { UsersModule } from '../../src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { UserRole } from '../../src/common/enum/user-role.enum';
import { DocumentStatus } from '../../src/files/enum/document-status.enum';
import * as bcrypt from 'bcryptjs';

let app: INestApplication;
let userRepository: Repository<User>;
let fileRepository: Repository<File>;
let statusRepository: Repository<DocumentStatusType>;
let historyRepository: Repository<DocumentHistory>;
let userId: string;

Before({ tags: '@documentos' }, async function () {
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
      FilesModule,
      UsersModule,
      ConfigModule.forRoot(),
    ],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();

  this.app = app;
  this.request = request(app.getHttpServer());

  userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
  fileRepository = moduleRef.get<Repository<File>>(getRepositoryToken(File));
  statusRepository = moduleRef.get<Repository<DocumentStatusType>>(
    getRepositoryToken(DocumentStatusType),
  );
  historyRepository = moduleRef.get<Repository<DocumentHistory>>(
    getRepositoryToken(DocumentHistory),
  );

  // Clean DB
  await historyRepository.createQueryBuilder().delete().execute();
  await fileRepository.createQueryBuilder().delete().execute();
  await userRepository.createQueryBuilder().delete().execute();
  await statusRepository.createQueryBuilder().delete().execute();

  // Setup Statuses
  await statusRepository.save([
    { id: '01974b23-bc2f-7e5f-a9d0-73a5774d2778', status: 'Por validar' },
    { id: '01974b23-d84d-7319-95b3-02322c982216', status: 'Aprovado' },
    { id: '01974b23-e943-7308-8185-1556429b9ff1', status: 'Rechazado' },
    { id: '01974b24-093b-7014-aa21-9f964b822156', status: 'Eliminado' },
  ]);

  // Setup User
  const password = await bcrypt.hash('password123', 10);
  const user = await userRepository.save({
    firstName: 'Normal',
    lastName: 'User',
    email: 'user@test.com',
    password,
    role: UserRole.USER,
    isActive: true,
  });
  userId = user.id;

  // Login to get token
  const loginResponse = await this.request
    .post('/auth/login')
    .send({ email: 'user@test.com', password: 'password123' });

  if (!loginResponse.body.token) {
    console.error('Login failed in Before hook:', loginResponse.body);
    throw new Error('Login failed');
  }

  this.userToken = `Bearer ${loginResponse.body.token}`;
});

After({ tags: '@documentos' }, async function () {
  if (app) await app.close();
});

// Removed conflicting steps

Given('existen documentos almacenados en la base de datos', async function () {
  await fileRepository.save([
    {
      name: 'Planilla de Sueldos',
      description: 'Planilla mensual',
      currentStatusId: DocumentStatus.PENDING_REVIEW,
      filePath: '/uploads/planilla.pdf',
      fileSize: 1024,
      mimetype: 'application/pdf',
      originalFilename: 'planilla.pdf',
      filename: 'planilla.pdf',
      fileHash: 'hash1',
      fileBuffer: Buffer.from('test'),
      uploadedBy: userId,
    },
    {
      name: 'Informe Anual',
      description: 'Informe de gestión',
      currentStatusId: DocumentStatus.APPROVED,
      filePath: '/uploads/informe.pdf',
      fileSize: 2048,
      mimetype: 'application/pdf',
      originalFilename: 'informe.pdf',
      filename: 'informe.pdf',
      fileHash: 'hash2',
      fileBuffer: Buffer.from('test'),
      uploadedBy: userId,
    },
  ]);
});

When('envío una petición para listar documentos', async function () {
  this.response = await this.request
    .get('/files')
    .set('Authorization', this.authHeader || '');
});

When(
  'envío una petición para buscar documentos con el término {string}',
  async function (term: string) {
    this.response = await this.request
      .get(`/files?search=${term}`)
      .set('Authorization', this.authHeader || '');
  },
);

When('envío una petición para listar documentos sin token', async function () {
  this.response = await this.request.get('/files');
});

Then('la respuesta debe contener una lista de archivos', function () {
  assert.ok(Array.isArray(this.response.body));
  assert.ok(this.response.body.length > 0);
});

Then(
  'cada elemento de la lista debe incluir "name", "status" y "uploadedBy"',
  function () {
    this.response.body.forEach((file: any) => {
      assert.ok(file.name, 'File should have a name');
      assert.ok(
        file.currentStatus || file.status || file.currentStatusId,
        'File should have a status',
      );
      assert.ok(
        file.uploadBy || file.uploadedBy,
        'File should have an uploader',
      );
    });
  },
);

Then(
  'los documentos listados deben contener {string} en su nombre',
  function (term: string) {
    this.response.body.forEach((file: any) => {
      assert.ok(file.name.includes(term));
    });
  },
);
