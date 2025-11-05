const request = require('supertest');
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { AuthModule } from '../src/auth/auth.module';
import { FilesModule } from '../src/files/files.module';
import { UsersModule } from '../src/users/users.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { File } from '../src/files/entities/file.entity';
import { DocumentStatusType } from '../src/files/entities/document_status_type.entity';
import { DocumentHistory } from '../src/files/entities/document_history.entity';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../src/common/enum/user-role.enum';
import { DocumentStatus } from '../src/files/enum/document-status.enum';
import { randomUUID } from 'crypto';

interface LoginResponse {
  token: string;
}

interface DocumentUploadResponse {
  id: string;
  name: string;
  description: string;
  currentStatusId: string;
  filePath: string;
  fileSize: number;
  mimetype: string;
  uploadedBy: string;
}

interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

describe('Files Integration Test', () => {
  let app: INestApplication;
  let httpServer: Server;
  let userRepository: Repository<User>;
  let fileRepository: Repository<File>;
  let statusRepository: Repository<DocumentStatusType>;
  let historyRepository: Repository<DocumentHistory>;

  let supervisorToken: string;
  let supervisorId: string;
  let statusPendingId: string;

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
          entities: [User, File, DocumentStatusType, DocumentHistory],
          synchronize: true,
          dropSchema: false,
          logging: false,
        }),
        AuthModule,
        FilesModule,
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
    fileRepository = testingModule.get<Repository<File>>(
      getRepositoryToken(File),
    );
    statusRepository = testingModule.get<Repository<DocumentStatusType>>(
      getRepositoryToken(DocumentStatusType),
    );
    historyRepository = testingModule.get<Repository<DocumentHistory>>(
      getRepositoryToken(DocumentHistory),
    );
  });

  beforeEach(async () => {
    // Limpiar todas las tablas en el orden correcto (de hijos a padres)
    await historyRepository.createQueryBuilder().delete().execute();
    await fileRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();
    await statusRepository.createQueryBuilder().delete().execute();

    // Crear estados de documento
    const pendingStatus = await statusRepository.save({
      id: DocumentStatus.PENDING_REVIEW,
      status: 'Pending Review',
    });

    statusPendingId = pendingStatus.id;

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

  it('IT-7 should upload document and persist metadata successfully', async () => {
    const startTime = Date.now();
    const documentCountBefore = await fileRepository.count();

    // Simular archivo de prueba
    const fileBuffer = Buffer.from('Test document content for upload');

    const uploadResponse = await request(httpServer)
      .post('/files/upload')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .field('name', 'Nuevo Documento de Prueba')
      .field('description', 'Documento subido mediante prueba de integración')
      .attach('file', fileBuffer, {
        filename: 'test.pdf',
        contentType: 'application/pdf',
      });

    const endTime = Date.now();
    const responseTime = (endTime - startTime) / 1000; // en segundos

    // Verificar la respuesta de la petición
    expect(uploadResponse.status).toBe(201);
    expect(responseTime).toBeLessThanOrEqual(2);
    expect(uploadResponse.request).toBeDefined();
    expect(uploadResponse.request.method).toBe('POST');
    expect(uploadResponse.request.url).toContain('/files/upload');

    const body = uploadResponse.body as DocumentUploadResponse;
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Nuevo Documento de Prueba');
    expect(body.description).toBe(
      'Documento subido mediante prueba de integración',
    );

    // Verificar que se creó el registro en la BD
    const documentCountAfter = await fileRepository.count();
    expect(documentCountAfter).toBe(documentCountBefore + 1);

    const savedDocument = await fileRepository.findOne({
      where: { id: body.id },
    });
    expect(savedDocument).not.toBeNull();
    expect(savedDocument?.name).toBe('Nuevo Documento de Prueba');
    expect(savedDocument?.fileHash).toBeDefined();
    expect(savedDocument?.uploadedBy).toBe(supervisorId);
    expect(savedDocument?.currentStatusId).toBe(statusPendingId);

    // Verificar que se creó el historial del documento
    const history = await historyRepository.findOne({
      where: {
        documentId: body.id,
        statusId: statusPendingId,
      },
    });
    expect(history).not.toBeNull();
  });

  afterAll(async () => {
    // Limpiar en el orden correcto antes de cerrar
    await historyRepository.createQueryBuilder().delete().execute();
    await fileRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();
    await statusRepository.createQueryBuilder().delete().execute();
    await app.close();
  });
});
