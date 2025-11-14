import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { File } from '../src/files/entities/file.entity';
import { DocumentStatusType } from '../src/files/entities/document_status_type.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentStatus } from '../src/files/enum/document-status.enum';
import { UserRole } from '../src/common/enum/user-role.enum';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

describe('Metrics (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let documentRepository: Repository<File>;
  let statusRepository: Repository<DocumentStatusType>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    documentRepository = moduleFixture.get<Repository<File>>(
      getRepositoryToken(File),
    );
    statusRepository = moduleFixture.get<Repository<DocumentStatusType>>(
      getRepositoryToken(DocumentStatusType),
    );

    // Ensure status records exist
    await statusRepository.save([
      { id: '01974b23-bc2f-7e5f-a9d0-73a5774d2778', status: 'Por validar' },
      { id: '01974b23-d84d-7319-95b3-02322c982216', status: 'Aprobado' },
      { id: '01974b23-e943-7308-8185-1556429b9ff1', status: 'Rechazado' },
      { id: '01974b24-093b-7014-aa21-9f964b822156', status: 'Eliminado' },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await documentRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();
  });

  describe('GET /metrics', () => {
    it('should return metrics with 10 users and 10 documents', async () => {
      // Arrange - Crear 10 usuarios
      const users = Array.from({ length: 10 }, (_, i) => ({
        firstName: `User${i}`,
        lastName: 'Test',
        email: `user${i}@test.com`,
        password: 'hashedPassword',
        isActive: true,
        role: UserRole.USER,
      }));
      const savedUsers = await userRepository.save(users);

      // Crear 10 documentos
      const documents = Array.from({ length: 10 }, (_, i) => ({
        name: `Document ${i}`,
        filename: `document${i}.pdf`,
        originalFilename: `Document ${i}.pdf`,
        mimetype: 'application/pdf',
        fileSize: 1024,
        fileHash: `hash${i}`,
        fileBuffer: Buffer.from('test'),
        filePath: `/uploads/document${i}.pdf`,
        currentStatusId: DocumentStatus.APPROVED,
        uploadedBy: savedUsers[0].id,
      }));
      await documentRepository.save(documents as any);

      // Act & Assert
      return request(app.getHttpServer())
        .get('/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            totalUsers: 10,
            totalDocuments: 10,
            pendingSignatures: 0,
          });
        });
    });

    it('should return metrics with 5 pending signatures', async () => {
      // Arrange
      const user = await userRepository.save({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'hashedPassword',
        isActive: true,
        role: UserRole.USER,
      });

      // Crear 10 documentos: 5 pendientes y 5 firmados
      const pendingDocs = Array.from({ length: 5 }, (_, i) => ({
        name: `Pending ${i}`,
        filename: `pending${i}.pdf`,
        originalFilename: `Pending ${i}.pdf`,
        mimetype: 'application/pdf',
        fileSize: 1024,
        fileHash: `hash_pending${i}`,
        fileBuffer: Buffer.from('test'),
        filePath: `/uploads/pending${i}.pdf`,
        currentStatusId: DocumentStatus.PENDING_REVIEW,
        uploadedBy: user.id,
      }));

      const signedDocs = Array.from({ length: 5 }, (_, i) => ({
        name: `Signed ${i}`,
        filename: `signed${i}.pdf`,
        originalFilename: `Signed ${i}.pdf`,
        mimetype: 'application/pdf',
        fileSize: 1024,
        fileHash: `hash_signed${i}`,
        fileBuffer: Buffer.from('test'),
        filePath: `/uploads/signed${i}.pdf`,
        currentStatusId: DocumentStatus.APPROVED,
        uploadedBy: user.id,
      }));

      await documentRepository.save([...pendingDocs, ...signedDocs] as any);

      // Act & Assert
      return request(app.getHttpServer())
        .get('/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            totalUsers: 1,
            totalDocuments: 10,
            pendingSignatures: 5,
          });
        });
    });

    it('should return zeros when system is empty', async () => {
      // No hay datos en la base de datos

      // Act & Assert
      return request(app.getHttpServer())
        .get('/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            totalUsers: 0,
            totalDocuments: 0,
            pendingSignatures: 0,
          });
        });
    });
  });
});
