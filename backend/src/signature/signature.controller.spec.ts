import { Test, TestingModule } from '@nestjs/testing';
import { SignatureController } from './signature.controller';
import { SignatureService } from './signature.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RoleGuard } from '../security/guards/role.guard';
import { SignDocumentDto } from './dto/sign-document.dto';
import { UserRole } from '../common/enum/user-role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('SignatureController', () => {
  let controller: SignatureController;
  let signatureService: jest.Mocked<SignatureService>;

  const mockGuard = {
    canActivate: jest.fn(() => true), // siempre deja pasar
  };

  const mockUser: JwtPayload = {
    sub: 123,
    email: 'supervisor@example.com',
    role: UserRole.SUPERVISOR,
  };

  const mockRequest = {
    headers: { 'user-agent': 'test-agent' },
    ip: '127.0.0.1',
  };

  beforeEach(async () => {
    const mockSignatureService = {
      signDocument: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      verifySignatureIntegrity: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignatureController],
      providers: [
        {
          provide: SignatureService,
          useValue: mockSignatureService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<SignatureController>(SignatureController);
    signatureService = module.get(SignatureService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signDocument', () => {
    it('should call SignatureService.signDocument with correct parameters', async () => {
      const signDocumentDto: SignDocumentDto = {
        documentId: 'doc-123',
        comment: 'Approved document',
      };
      const expectedResult = {
        id: 'doc-123',
        name: 'test.pdf',
        signatureHash: 'hash123',
        signedAt: new Date(),
        signer: {
          id: 'user-123',
          email: 'supervisor@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role: UserRole.SUPERVISOR,
        },
      };

      signatureService.signDocument.mockResolvedValue(expectedResult as any);

      const result = await controller.signDocument(
        signDocumentDto,
        mockUser,
        mockRequest as any,
      );

      expect(signatureService.signDocument).toHaveBeenCalledWith(
        signDocumentDto,
        mockUser.email,
        mockRequest,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all signatures', async () => {
      const mockSignatures = [
        {
          id: 'sig-1',
          accountId: 'user-1',
          documentId: 'doc-1',
          validated: true,
          validatedAt: new Date(),
          signatureHash: 'hash1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        },
        {
          id: 'sig-2',
          accountId: 'user-2',
          documentId: 'doc-2',
          validated: true,
          validatedAt: new Date(),
          signatureHash: 'hash2',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        },
      ];

      signatureService.findAll.mockResolvedValue(mockSignatures as any);

      const result = await controller.findAll();

      expect(signatureService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSignatures);
    });
  });

  describe('findOne', () => {
    it('should return a signature by id', async () => {
      const mockSignature = { id: 'sig-123', documentId: 'doc-123' };
      const signatureId = 'sig-123';

      signatureService.findOne.mockResolvedValue(mockSignature as any);

      const result = await controller.findOne(signatureId);

      expect(signatureService.findOne).toHaveBeenCalledWith(signatureId);
      expect(result).toEqual(mockSignature);
    });
  });

  describe('verifySignature', () => {
    it('should verify signature integrity and return result', async () => {
      const signatureId = 'sig-123';
      const isValid = true;
      const expectedResult = { isValid };

      signatureService.verifySignatureIntegrity.mockResolvedValue(isValid);

      const result = await controller.verifySignature(signatureId);

      expect(signatureService.verifySignatureIntegrity).toHaveBeenCalledWith(
        signatureId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return false when signature is invalid', async () => {
      const signatureId = 'sig-123';
      const isValid = false;
      const expectedResult = { isValid };

      signatureService.verifySignatureIntegrity.mockResolvedValue(isValid);

      const result = await controller.verifySignature(signatureId);

      expect(signatureService.verifySignatureIntegrity).toHaveBeenCalledWith(
        signatureId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a signature by id', async () => {
      const signatureId = 'sig-123';
      const mockDeletedSignature = {
        id: signatureId,
        accountId: 'user-123',
        documentId: 'doc-123',
        validated: true,
        validatedAt: new Date(),
        signatureHash: 'hash123',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      };
      const expectedResult = {
        message: `Signature with ID ${signatureId} has been deleted successfully`,
        deletedSignature: mockDeletedSignature,
      };

      signatureService.remove.mockResolvedValue(expectedResult as any);

      const result = await controller.remove(signatureId);

      expect(signatureService.remove).toHaveBeenCalledWith(signatureId);
      expect(result).toEqual(expectedResult);
    });
  });
});
