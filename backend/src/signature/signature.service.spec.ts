import { Test, TestingModule } from '@nestjs/testing';
import { SignatureService } from './signature.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SignDocument } from './entities/account-document.entity';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enum/user-role.enum';
import { createHash } from 'crypto';

describe('SignatureService', () => {
  let service: SignatureService;
  let mockFilesService: Partial<FilesService>;
  let mockSignatureRepo: Partial<Repository<SignDocument>>;
  let mockUsersService: Partial<UsersService>;

  const mockSupervisor = {
    id: 'supervisor-123',
    email: 'supervisor@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: UserRole.SUPERVISOR,
    isActive: true,
    password: 'hashedpassword',
  };

  const mockFile = {
    id: 'file-123',
    name: 'test.pdf',
    description: 'Test file',
    filePath: 'uploads/test.pdf',
    fileSize: 1024,
    mimetype: 'application/pdf',
    originalFilename: 'test.pdf',
    filename: 'test-123.pdf',
    uploadedBy: 'user-123',
    currentStatusId: '01974b23-bc2f-7e5f-a9d0-73a5774d2778', // pending status
    fileHash: 'abc123hash',
    fileBuffer: Buffer.from('test content'),
  };

  const mockSignature = {
    id: 'signature-1',
    documentId: 'file-123',
    accountId: 'supervisor-123',
    validated: true,
    validatedAt: new Date(),
    signatureHash: 'abc123signaturehash',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
  };

  beforeEach(async () => {
    // Mock repositories
    mockSignatureRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockFilesService = {
      findOne: jest.fn().mockResolvedValue(mockFile),
      findDocumentWithBuffer: jest.fn().mockResolvedValue(mockFile),
      verifyFileIntegrity: jest.fn().mockReturnValue(true),
      changeFileStatus: jest
        .fn()
        .mockResolvedValue({ message: 'Status updated' }),
    };

    mockUsersService = {
      findOne: jest.fn().mockResolvedValue(mockSupervisor),
      findByEmail: jest.fn().mockResolvedValue(mockSupervisor),
      findOneByEmail: jest.fn().mockResolvedValue(mockSupervisor),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureService,
        {
          provide: getRepositoryToken(SignDocument),
          useValue: mockSignatureRepo,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<SignatureService>(SignatureService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateDocumentForSigning', () => {
    const documentId = 'file-123';
    const mockUser = mockSupervisor;

    it('should return valid document and user for signing', async () => {
      // Setup mocks
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(null); // No existing signature

      const result = await service['validateDocumentForSigning'](
        documentId,
        mockUser,
      );

      expect(result.isValid).toBe(true);
      expect(result.document).toEqual(mockFile);
    });

    it('should return invalid if user is not found', async () => {
      const result = await service['validateDocumentForSigning'](
        documentId,
        null,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('User not found');
    });

    it('should return invalid if user is not a supervisor', async () => {
      const regularUser = { ...mockSupervisor, role: UserRole.USER };

      const result = await service['validateDocumentForSigning'](
        documentId,
        regularUser,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('User is not a supervisor');
    });

    it('should return invalid if document already signed by user', async () => {
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(mockSignature); // Existing signature

      const result = await service['validateDocumentForSigning'](
        documentId,
        mockUser,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('You have already signed this document');
    });
  });

  describe('findAll', () => {
    it('should return all signatures', async () => {
      const mockSignatures = [
        {
          id: 'signature-1',
          documentId: 'file-123',
          accountId: 'supervisor-123',
        },
        {
          id: 'signature-2',
          documentId: 'file-456',
          accountId: 'supervisor-456',
        },
      ];

      (mockSignatureRepo.find as jest.Mock).mockResolvedValue(mockSignatures);

      const result = await service.findAll();

      expect(result).toEqual(mockSignatures);
      expect(mockSignatureRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a signature by id', async () => {
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(mockSignature);

      const result = await service.findOne('signature-1');

      expect(result).toEqual(mockSignature);
      expect(mockSignatureRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'signature-1' },
        relations: ['account', 'document'],
      });
    });

    it('should throw NotFoundException if signature not found', async () => {
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('fake-id')).rejects.toThrow(
        'Signature with ID fake-id not found',
      );
    });
  });

  describe('verifySignatureIntegrity', () => {
    it('should return true when signature hash matches expected hash', async () => {
      const testDate = new Date('2025-01-01T12:00:00Z');
      const mockSignatureWithValidHash = {
        ...mockSignature,
        validatedAt: testDate,
        signatureHash: '', // Will be calculated
      };

      // Calculate the expected hash based on the signature data
      const originalSignatureData = {
        documentId: mockSignatureWithValidHash.documentId,
        userId: mockSignatureWithValidHash.accountId,
        timestamp: testDate.toISOString(),
        userAgent: mockSignatureWithValidHash.userAgent,
        ipAddress: mockSignatureWithValidHash.ipAddress,
        originalFileHash: mockFile.fileHash,
      };

      const expectedHash = createHash('sha256')
        .update(JSON.stringify(originalSignatureData))
        .digest('hex');

      mockSignatureWithValidHash.signatureHash = expectedHash;

      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(
        mockSignatureWithValidHash,
      );

      const result = await service.verifySignatureIntegrity('signature-1');

      expect(result).toBe(true);
      expect(mockFilesService.verifyFileIntegrity).toHaveBeenCalledWith(
        mockFile,
      );
    });

    it('should return false when signature hash does not match expected hash', async () => {
      const testDate = new Date('2025-01-01T12:00:00Z');
      const mockSignatureWithInvalidHash = {
        ...mockSignature,
        validatedAt: testDate,
        signatureHash: 'invalidhash123', // Wrong hash
      };

      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(
        mockSignatureWithInvalidHash,
      );

      const result = await service.verifySignatureIntegrity('signature-1');

      expect(result).toBe(false);
      expect(mockFilesService.verifyFileIntegrity).toHaveBeenCalledWith(
        mockFile,
      );
    });

    it('should return false when file integrity check fails', async () => {
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(mockSignature);
      (mockFilesService.verifyFileIntegrity as jest.Mock).mockReturnValue(
        false,
      );

      const result = await service.verifySignatureIntegrity('signature-1');

      expect(result).toBe(false);
      expect(mockFilesService.verifyFileIntegrity).toHaveBeenCalledWith(
        mockFile,
      );
    });

    it('should return false if signature not found', async () => {
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.verifySignatureIntegrity('fake-id');

      expect(result).toBe(false);
      expect(mockFilesService.verifyFileIntegrity).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a signature by id', async () => {
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(mockSignature);
      (mockSignatureRepo.remove as jest.Mock).mockResolvedValue(mockSignature);

      const result = await service.remove('signature-1');

      expect(result.message).toContain('deleted successfully');
      expect(mockSignatureRepo.remove).toHaveBeenCalledWith(mockSignature);
    });

    it('should throw NotFoundException if signature not found', async () => {
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('fake-id')).rejects.toThrow(
        'Signature with ID fake-id not found',
      );
    });
  });
});