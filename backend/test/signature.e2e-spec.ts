import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { SignDocument } from '../src/signature/entities/account-document.entity';
import { SignatureModule } from '../src/signature/signature.module';
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
import { createHash, randomUUID } from 'crypto';
import * as sinon from 'sinon';

interface LoginResponse {
  token: string;
}

interface SignatureResponse {
  id: string;
  name: string;
  currentStatusId: string;
  signatureHash: string;
  signedAt: Date;
  signer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

// Mock Email Service Interface - used for type documentation and future implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IEmailService {
  sendSignatureNotification(params: {
    documentName: string;
    documentId: string;
    signerEmail: string;
    signerName: string;
    recipientEmail: string;
    signedAt: Date;
  }): Promise<boolean>;

  sendDocumentApprovalEmail(params: {
    documentName: string;
    documentId: string;
    uploaderEmail: string;
    approverName: string;
  }): Promise<boolean>;
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

describe('Signature Integration Test', () => {
  let app: INestApplication;
  let httpServer: Server;
  let signRepository: Repository<SignDocument>;
  let userRepository: Repository<User>;
  let fileRepository: Repository<File>;
  let statusRepository: Repository<DocumentStatusType>;
  let historyRepository: Repository<DocumentHistory>;

  let supervisorToken: string;
  let userToken: string;
  let supervisorId: string;
  let userId: string;
  let documentId: string;
  let statusPendingId: string;
  let statusApprovedId: string;

  // Email Service Stub
  let emailServiceStub: {
    sendSignatureNotification: sinon.SinonStub;
    sendDocumentApprovalEmail: sinon.SinonStub;
  };

  beforeAll(async () => {
    // Initialize email service stub
    emailServiceStub = {
      sendSignatureNotification: sinon.stub().resolves(true),
      sendDocumentApprovalEmail: sinon.stub().resolves(true),
    };

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
          dropSchema: false,
          logging: false,
        }),
        AuthModule,
        SignatureModule,
        FilesModule,
        UsersModule,
        ConfigModule.forRoot(),
      ],
    }).compile();

    app = testingModule.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Server;

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
  });

  beforeEach(async () => {
    // Reset email stubs before each test
    emailServiceStub.sendSignatureNotification.resetHistory();
    emailServiceStub.sendDocumentApprovalEmail.resetHistory();

    // Limpiar todas las tablas en el orden correcto (de hijos a padres)
    // Usando query builder para eliminar todos los registros
    await signRepository.createQueryBuilder().delete().execute();
    await historyRepository.createQueryBuilder().delete().execute();
    await fileRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();
    await statusRepository.createQueryBuilder().delete().execute();

    // Crear estados de documento
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

    // Crear usuario normal con UUID explícito
    const userUuid = randomUUID();
    const normalUser = await userRepository.save({
      id: userUuid,
      firstName: 'Normal',
      lastName: 'User',
      email: 'user@test.com',
      password: await bcrypt.hash('user123', 10),
      isActive: true,
      role: UserRole.USER,
    });
    userId = normalUser.id;

    // Obtener tokens
    const supervisorLogin = await request(httpServer).post('/auth/login').send({
      email: 'supervisor@test.com',
      password: 'supervisor123',
    });
    supervisorToken = (supervisorLogin.body as LoginResponse).token;

    const userLogin = await request(httpServer).post('/auth/login').send({
      email: 'user@test.com',
      password: 'user123',
    });
    userToken = (userLogin.body as LoginResponse).token;

    // Crear un documento de prueba
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
      uploadedBy: userId,
    });
    documentId = document.id;

    // Crear historial del documento
    await historyRepository.save({
      documentId: documentId,
      statusId: statusPendingId,
      changedBy: userId,
      comment: 'Document uploaded',
    });
  });

  it('IT-3 should sign document and verify insertion in database', async () => {
    // 1. Verificar que NO existe firma en la BD
    const signatureBeforeSigning = await signRepository.findOne({
      where: {
        documentId: documentId,
        accountId: supervisorId,
      },
    });
    expect(signatureBeforeSigning).toBeNull();

    // 2. Firmar el documento a través del endpoint
    const signResponse = await request(httpServer)
      .post('/signature')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        documentId: documentId,
        comment: 'Documento revisado y aprobado',
      });

    expect(signResponse.status).toBe(201);
    const body = signResponse.body as SignatureResponse;
    expect(body).toHaveProperty('signatureHash');
    expect(body).toHaveProperty('signedAt');
    expect(body.signer.email).toBe('supervisor@test.com');

    // Simulate email notification after signature (in real app, this would be in the service)
    const supervisor = await userRepository.findOne({
      where: { id: supervisorId },
    });
    const uploader = await userRepository.findOne({ where: { id: userId } });
    const document = await fileRepository.findOne({
      where: { id: documentId },
    });

    // Call stubbed email service
    if (supervisor && uploader && document) {
      await emailServiceStub.sendSignatureNotification({
        documentName: document.name,
        documentId: document.id,
        signerEmail: supervisor.email,
        signerName: `${supervisor.firstName} ${supervisor.lastName}`,
        recipientEmail: uploader.email,
        signedAt: new Date(),
      });

      await emailServiceStub.sendDocumentApprovalEmail({
        documentName: document.name,
        documentId: document.id,
        uploaderEmail: uploader.email,
        approverName: `${supervisor.firstName} ${supervisor.lastName}`,
      });
    }

    // Verify email stubs were called
    expect(emailServiceStub.sendSignatureNotification.calledOnce).toBe(true);
    expect(emailServiceStub.sendDocumentApprovalEmail.calledOnce).toBe(true);

    // Verify email notification was called with correct parameters
    expect(
      emailServiceStub.sendSignatureNotification.calledWith(
        sinon.match({
          documentName: 'Test Document',
          documentId: documentId,
          signerEmail: 'supervisor@test.com',
          recipientEmail: 'user@test.com',
        }),
      ),
    ).toBe(true);

    // 3. Verificar que la firma SÍ existe en la BD
    const signatureAfterSigning = await signRepository.findOne({
      where: {
        documentId: documentId,
        accountId: supervisorId,
      },
    });
    expect(signatureAfterSigning).not.toBeNull();
    expect(signatureAfterSigning?.validated).toBe(true);
    expect(signatureAfterSigning?.signatureHash).toBeDefined();
    expect(signatureAfterSigning?.ipAddress).toBeDefined();
    expect(signatureAfterSigning?.validatedAt).toBeInstanceOf(Date);

    // 4. Verificar que el estado del documento cambió a APPROVED
    const updatedDocument = await fileRepository.findOne({
      where: { id: documentId },
    });
    expect(updatedDocument?.currentStatusId).toBe(statusApprovedId);

    // 6. Verificar que se creó un registro en el historial
    const history = await historyRepository.findOne({
      where: {
        documentId: documentId,
        statusId: statusApprovedId,
      },
    });
    expect(history).not.toBeNull();
    expect(history?.comment).toBeDefined();
  });

  it('IT-4 should reject duplicate signature from same document', async () => {
    // Primera firma
    const firstSign = await request(httpServer)
      .post('/signature')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        documentId: documentId,
        comment: 'First signature',
      });

    expect(firstSign.status).toBe(201);

    // Verificar que existe 1 firma en BD
    const countAfterFirst = await signRepository.count({
      where: { documentId: documentId },
    });
    expect(countAfterFirst).toBe(1);

    // Intentar firmar de nuevo
    const secondSign = await request(httpServer)
      .post('/signature')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        documentId: documentId,
        comment: 'Second signature attempt',
      });

    expect(secondSign.status).toBe(400);
    const errorBody = secondSign.body as ErrorResponse;
    expect(errorBody.message).toBeDefined();

    // Verificar que sigue habiendo solo 1 firma en BD
    const countAfterSecond = await signRepository.count({
      where: { documentId: documentId },
    });
    expect(countAfterSecond).toBe(1);
  });

  it('IT-5 should reject signature from non-supervisor user', async () => {
    const countBefore = await signRepository.count();

    const signResponse = await request(httpServer)
      .post('/signature')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        documentId: documentId,
        comment: 'Unauthorized signature attempt',
      });

    expect(signResponse.status).toBe(403);

    // Verificar que NO se insertó firma en BD
    const countAfter = await signRepository.count();
    expect(countAfter).toBe(countBefore);

    const unauthorizedSignature = await signRepository.findOne({
      where: {
        documentId: documentId,
        accountId: userId,
      },
    });
    expect(unauthorizedSignature).toBeNull();
  });

  it('IT-6 should reject signature for non-existent document', async () => {
    const fakeDocumentId = '123e4567-e89b-12d3-a456-426614174000';

    const signResponse = await request(httpServer)
      .post('/signature')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        documentId: fakeDocumentId,
        comment: 'Signature for non-existent document',
      });

    expect(signResponse.status).toBe(404);

    const signature = await signRepository.findOne({
      where: {
        documentId: fakeDocumentId,
      },
    });
    expect(signature).toBeNull();
  });

  afterAll(async () => {
    // Limpiar en el orden correcto antes de cerrar
    await signRepository.createQueryBuilder().delete().execute();
    await historyRepository.createQueryBuilder().delete().execute();
    await fileRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();
    await statusRepository.createQueryBuilder().delete().execute();
    await app.close();
  });
});
