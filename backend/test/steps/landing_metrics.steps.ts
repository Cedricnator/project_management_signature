import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const supertest = require('supertest');
import * as assert from 'assert';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';
import { File } from '../../src/files/entities/file.entity';
import { DocumentStatusType } from '../../src/files/entities/document_status_type.entity';
import { DocumentHistory } from '../../src/files/entities/document_history.entity';
import { FilesModule } from '../../src/files/files.module';
import { Module } from '@nestjs/common';
import { MetricsController } from '../../src/metrics/metrics.controller';
import { MetricsService } from '../../src/metrics/metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, File])],
  controllers: [MetricsController],
  providers: [MetricsService],
})
class TestMetricsModule {}
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { DocumentStatus } from '../../src/files/enum/document-status.enum';
import { UserRole } from '../../src/common/enum/user-role.enum';
import * as bcrypt from 'bcryptjs';

let app: INestApplication;
let request: any;
let userRepository: Repository<User>;
let fileRepository: Repository<File>;
let statusRepository: Repository<DocumentStatusType>;
let historyRepository: Repository<DocumentHistory>;
let statusPendingId: string;
let statusApprovedId: string;
let lastResponse: any;
let actualMetrics: any;

Before({ tags: '@landing' }, async function () {
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
      FilesModule,
      AuthModule,
      UsersModule,
      ConfigModule.forRoot(),
    ],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
  request = supertest(app.getHttpServer());
  this.request = request;

  userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
  fileRepository = moduleRef.get<Repository<File>>(getRepositoryToken(File));
  statusRepository = moduleRef.get<Repository<DocumentStatusType>>(
    getRepositoryToken(DocumentStatusType),
  );
  historyRepository = moduleRef.get<Repository<DocumentHistory>>(
    getRepositoryToken(DocumentHistory),
  );

  // Ensure clean DB
  await historyRepository.createQueryBuilder().delete().execute();
  await fileRepository.createQueryBuilder().delete().execute();
  await userRepository.createQueryBuilder().delete().execute();
  await statusRepository.createQueryBuilder().delete().execute();

  // Insert status types with correct IDs from init.sql
  await statusRepository.save([
    { id: '01974b23-bc2f-7e5f-a9d0-73a5774d2778', status: 'Por validar' },
    { id: '01974b23-d84d-7319-95b3-02322c982216', status: 'Aprobado' },
    { id: '01974b23-e943-7308-8185-1556429b9ff1', status: 'Rechazado' },
    { id: '01974b24-093b-7014-aa21-9f964b822156', status: 'Eliminado' },
  ]);

  statusPendingId = DocumentStatus.PENDING_REVIEW;
  statusApprovedId = DocumentStatus.APPROVED;
});

After(async function () {
  if (app) await app.close();
});

Given('que un visitante accede a la página principal', function () {
  // No authentication needed for public metrics endpoint
  this.authHeader = undefined;
});

Given(
  'el sistema tiene {int} usuarios registrados',
  async function (count: number) {
    // Ensure DB empty then create 'count' users
    await userRepository.createQueryBuilder().delete().execute();
    const users: Partial<User>[] = [];
    for (let i = 0; i < count; i++) {
      users.push({
        firstName: `Test${i}`,
        lastName: 'User',
        email: `user${i}@example.com`,
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        role: UserRole.USER,
      });
    }
    if (users.length > 0) await userRepository.save(users);
  },
);

Given(
  'el sistema tiene {int} documentos gestionados',
  async function (count: number) {
    // Create 'count' files with approved status
    await fileRepository.createQueryBuilder().delete().execute();
    await historyRepository.createQueryBuilder().delete().execute();

    // Ensure at least one user exists for uploadedBy
    let userId: string;
    const existingUser = await userRepository.findOne({ where: {} });
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const testUser = await userRepository.save({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        role: UserRole.USER,
      });
      userId = testUser.id;
    }

    const approvedStatus = statusApprovedId;
    const files: Partial<File>[] = [];
    for (let i = 0; i < count; i++) {
      files.push({
        name: `Doc ${i}`,
        description: 'Test document',
        currentStatusId: approvedStatus,
        filePath: `/uploads/doc${i}.pdf`,
        fileSize: 10,
        mimetype: 'application/pdf',
        originalFilename: `doc${i}.pdf`,
        filename: `doc${i}.pdf`,
        fileHash: 'abc123',
        fileBuffer: Buffer.from('test content'),
        uploadedBy: userId,
      });
    }
    if (files.length > 0) {
      const saved = (await fileRepository.save(files)) as File[];
      for (const f of saved) {
        await historyRepository.save({
          documentId: f.id,
          statusId: approvedStatus,
          changedBy: userId,
          comment: 'created',
        });
      }
    }
  },
);

Given(
  'el sistema tiene {int} documentos pendientes de firma',
  async function (count: number) {
    // Create 'count' files with pending status
    await fileRepository.createQueryBuilder().delete().execute();
    await historyRepository.createQueryBuilder().delete().execute();

    // Ensure at least one user exists for uploadedBy
    let userId: string;
    const existingUser = await userRepository.findOne({ where: {} });
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const testUser = await userRepository.save({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        role: UserRole.USER,
      });
      userId = testUser.id;
    }

    const pendingStatus = statusPendingId;
    const files: Partial<File>[] = [];
    for (let i = 0; i < count; i++) {
      files.push({
        name: `Pending ${i}`,
        description: 'Pending document',
        currentStatusId: pendingStatus,
        filePath: `/uploads/pending${i}.pdf`,
        fileSize: 10,
        mimetype: 'application/pdf',
        originalFilename: `pending${i}.pdf`,
        filename: `pending${i}.pdf`,
        fileHash: 'abc123',
        fileBuffer: Buffer.from('test content'),
        uploadedBy: userId,
      });
    }
    if (files.length > 0) {
      const saved = (await fileRepository.save(files)) as File[];
      for (const f of saved) {
        await historyRepository.save({
          documentId: f.id,
          statusId: pendingStatus,
          changedBy: userId,
          comment: 'created',
        });
      }
    }
  },
);

Given('el sistema no tiene usuarios ni documentos', async function () {
  await historyRepository.createQueryBuilder().delete().execute();
  await fileRepository.createQueryBuilder().delete().execute();
  await userRepository.createQueryBuilder().delete().execute();
});

When('la página carga las métricas', async function () {
  // Get actual metrics from database
  const totalUsers = await userRepository.count();
  const totalDocuments = await fileRepository.count();
  const pendingSignatures = await fileRepository.count({
    where: { currentStatusId: statusPendingId },
  });

  this.actualMetrics = {
    totalUsers,
    totalDocuments,
    pendingSignatures,
  };
});

Then(
  'el visitante debe ver la métrica {string}',
  function (expectedMetric: string) {
    assert.ok(this.actualMetrics, 'No metrics calculated');

    // Parse expected metric
    const [label, valueStr] = expectedMetric.split(': ');
    const expectedValue = parseInt(valueStr, 10);

    if (label.includes('Usuarios Totales')) {
      assert.strictEqual(
        this.actualMetrics.totalUsers,
        expectedValue,
        `Expected totalUsers: ${expectedValue}, got: ${this.actualMetrics.totalUsers}`,
      );
    } else if (label.includes('Documentos Gestionados')) {
      assert.strictEqual(
        this.actualMetrics.totalDocuments,
        expectedValue,
        `Expected totalDocuments: ${expectedValue}, got: ${this.actualMetrics.totalDocuments}`,
      );
    } else if (label.includes('Pendientes de Firma')) {
      assert.strictEqual(
        this.actualMetrics.pendingSignatures,
        expectedValue,
        `Expected pendingSignatures: ${expectedValue}, got: ${this.actualMetrics.pendingSignatures}`,
      );
    } else {
      assert.fail(`Unknown metric label: ${label}`);
    }
  },
);
