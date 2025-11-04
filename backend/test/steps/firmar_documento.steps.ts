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
import { SignDocument } from '../../src/signature/entities/account-document.entity';
import { UserRole } from '../../src/common/enum/user-role.enum';
import { DocumentStatus } from '../../src/files/enum/document-status.enum';
import { SignatureModule } from '../../src/signature/signature.module';
import { FilesModule } from '../../src/files/files.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';

let app: INestApplication;
let request: any;
let signRepository: Repository<SignDocument>;
let userRepository: Repository<User>;
let fileRepository: Repository<File>;
let statusRepository: Repository<DocumentStatusType>;
let historyRepository: Repository<DocumentHistory>;
let supervisorToken: string;
let userToken: string;
let documentId: string;
let statusPendingId: string;
let statusApprovedId: string;

// Hook global: prepara app con DB real
Before({ tags: '@signature' }, async function () {
  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 31000,
        username: 'postgres',
        password: 'postgres',
        database: 'signature_project',
        entities: [
          SignDocument,
          User,
          File,
          DocumentStatusType,
          DocumentHistory,
        ],
        synchronize: true,
        dropSchema: true,
        logging: false,
      }),
      SignatureModule,
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

  signRepository = testingModule.get<Repository<SignDocument>>(
    getRepositoryToken(SignDocument),
  );
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
  await signRepository.createQueryBuilder().delete().execute();
  await historyRepository.createQueryBuilder().delete().execute();
  await fileRepository.createQueryBuilder().delete().execute();
  await userRepository.createQueryBuilder().delete().execute();
  await statusRepository.createQueryBuilder().delete().execute();

  // Crear estados
  const pendingStatus = await statusRepository.save({
    id: DocumentStatus.PENDING_REVIEW,
    status: 'Pending Review',
  });
  const approvedStatus = await statusRepository.save({
    id: DocumentStatus.APPROVED,
    status: 'Approved',
  });
  statusPendingId = pendingStatus.id;
  statusApprovedId = approvedStatus.id;

  // Crear usuarios
  const supervisor = await userRepository.save({
    firstName: 'Supervisor',
    lastName: 'Test',
    email: 'supervisor@test.com',
    password: await bcrypt.hash('supervisor123', 10),
    isActive: true,
    role: UserRole.SUPERVISOR,
  });
  const normalUser = await userRepository.save({
    firstName: 'Normal',
    lastName: 'User',
    email: 'user@test.com',
    password: await bcrypt.hash('user123', 10),
    isActive: true,
    role: UserRole.USER,
  });

  // Obtener tokens
  const supervisorLogin = await request.post('/auth/login').send({
    email: 'supervisor@test.com',
    password: 'supervisor123',
  });
  supervisorToken = supervisorLogin.body.token;

  const userLogin = await request.post('/auth/login').send({
    email: 'user@test.com',
    password: 'user123',
  });
  userToken = userLogin.body.token;

  this.userToken = `Bearer ${userToken}`;
  this.supervisorToken = `Bearer ${supervisorToken}`;
  this.authHeader = this.supervisorToken;

  // Crear documento
  const fileBuffer = Buffer.from('Test file content');
  const fileHash = createHash('sha256').update(fileBuffer).digest('hex');
  const document = await fileRepository.save({
    name: 'Test Document',
    description: 'Document for testing',
    currentStatusId: statusPendingId,
    filePath: '/uploads/test.pdf',
    fileSize: fileBuffer.length,
    mimetype: 'application/pdf',
    originalFilename: 'test.pdf',
    filename: 'test-document.pdf',
    fileHash: fileHash,
    fileBuffer: fileBuffer,
    uploadedBy: normalUser.id,
  });
  documentId = document.id;

  // Crear historial
  await historyRepository.save({
    documentId: documentId,
    statusId: statusPendingId,
    changedBy: normalUser.id,
    comment: 'Document uploaded',
  });
});

After(async function () {
  if (app) await app.close();
});

Given('existe un documento pendiente de revisión', function () {
  assert.ok(documentId, 'Documento no creado');
});

Given('que ya firmé el documento anteriormente', async function () {
  // Firmar el documento primero
  await request
    .post('/signature')
    .set('Authorization', `Bearer ${supervisorToken}`)
    .send({
      documentId: documentId,
      comment: 'Previous signature',
    });
});

When(
  'envío una petición de firma con comentario {string}',
  async function (comment: string) {
    const req = request
      .post('/signature')
      .set('Authorization', this.authHeader || '')
      .send({
        documentId: documentId,
        comment: comment,
      });

    this.response = await req;
  },
);

When('envío una petición de firma nuevamente', async function () {
  const req = request
    .post('/signature')
    .set('Authorization', this.authHeader || '')
    .send({
      documentId: documentId,
      comment: 'Duplicate signature',
    });

  this.response = await req;
});

When('envío una petición de firma', async function () {
  const req = request
    .post('/signature')
    .set('Authorization', this.authHeader || '')
    .send({
      documentId: documentId,
      comment: 'Signature attempt',
    });

  this.response = await req;
});

When(
  'envío una petición de firma para un documento que no existe',
  async function () {
    const req = request
      .post('/signature')
      .set('Authorization', this.authHeader || '')
      .send({
        documentId: '123e4567-e89b-12d3-a456-426614174000', // valid UUID that doesn't exist
        comment: 'Signature for non-existent',
      });

    this.response = await req;
  },
);

Then('la firma debe ser registrada en la base de datos', async function () {
  const signature = await signRepository.findOne({
    where: {
      documentId: documentId,
    },
  });
  assert.ok(signature, 'Firma no encontrada en BD');
  assert.ok(signature.signatureHash, 'signatureHash no presente');
});

Then(
  'el estado del documento debe cambiar a {string}',
  async function (expectedStatus: string) {
    const document = await fileRepository.findOne({
      where: { id: documentId },
    });
    assert.ok(document, 'Documento no encontrado');
    if (expectedStatus === 'Approved') {
      assert.strictEqual(
        document.currentStatusId,
        statusApprovedId,
        'Estado no cambió a Approved',
      );
    }
  },
);

Then('no debe crearse una nueva firma', async function () {
  const count = await signRepository.count({
    where: { documentId: documentId },
  });
  assert.strictEqual(count, 1, 'Se creó más de una firma');
});
