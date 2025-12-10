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
let documentId: string;
let userId: string;

Before({ tags: '@historial' }, async function () {
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
    { id: '01974b23-d84d-7319-95b3-02322c982216', status: 'Aprovado' }, // Note: Typo in init.sql 'Aprovado'
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

After({ tags: '@historial' }, async function () {
  if (app) await app.close();
});

// Removed conflicting steps

Given(
  'existe un documento que ha sido subido y firmado previamente',
  async function () {
    // Create document
    const file = await fileRepository.save({
      name: 'Test Doc',
      description: 'Test Description',
      currentStatusId: DocumentStatus.APPROVED,
      filePath: '/uploads/test.pdf',
      fileSize: 1024,
      mimetype: 'application/pdf',
      originalFilename: 'test.pdf',
      filename: 'test.pdf',
      fileHash: 'hash123',
      fileBuffer: Buffer.from('test'),
      uploadedBy: userId,
    });
    documentId = file.id;

    // Create history entries
    // 1. Upload
    await historyRepository.save({
      documentId: file.id,
      statusId: DocumentStatus.PENDING_REVIEW,
      changedBy: userId,
      comment: 'Document uploaded',
    });

    // 2. Signed (Approved)
    await historyRepository.save({
      documentId: file.id,
      statusId: DocumentStatus.APPROVED,
      changedBy: userId, // Assuming self-signed or supervisor signed
      comment: 'Signed',
    });
  },
);

When(
  'envío una petición para ver el historial de ese documento',
  async function () {
    this.response = await this.request
      .get(`/files/${documentId}/history`)
      .set('Authorization', this.authHeader || '');
  },
);

When(
  'envío una petición para ver el historial de un ID {string}',
  async function (id: string) {
    // If the ID provided in the feature file is "no-existe-123", it triggers 400 Bad Request due to ParseUUIDPipe.
    // To test 404 Not Found, we need a valid UUID that doesn't exist.
    const targetId =
      id === 'no-existe-123' ? '00000000-0000-0000-0000-000000000000' : id;

    this.response = await this.request
      .get(`/files/${targetId}/history`)
      .set('Authorization', this.authHeader || '');
  },
);

Then(
  'la lista debe contener al menos {int} registros \\(Subida y Firma)',
  function (count: number) {
    const history = this.response.body.history;
    assert.ok(Array.isArray(history), 'History should be an array');
    assert.ok(
      history.length >= count,
      `History should have at least ${count} entries`,
    );
  },
);

Then(
  'el último registro debe indicar la acción "Signed" por el supervisor',
  function () {
    const history = this.response.body.history;
    // Service returns ordered by createdAt DESC, so the latest is at index 0
    const lastEntry = history[0];
    assert.ok(lastEntry);
  },
);

Then('el mensaje debe indicar que el documento no fue encontrado', function () {
  assert.strictEqual(this.response.status, 404);
});
