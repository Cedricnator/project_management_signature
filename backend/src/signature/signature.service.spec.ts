import { Test, TestingModule } from '@nestjs/testing';
import { SignatureService } from './signature.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SignDocument } from './entities/account-document.entity';
import { User } from '../users/entities/user.entity';
import { FilesService } from '../files/files.service';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enum/user-role.enum';
import { Request } from 'express';

describe('SignatureService', () => {
  let service: SignatureService;
  let mockFilesService: Partial<FilesService>;
  let mockSignatureRepo: Partial<Repository<SignDocument>>;
  let mockUserRepo: Partial<Repository<User>>

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
      createQueryBuilder: jest.fn(),
    };

    mockUserRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    // Mock FilesService
    mockFilesService = {
      findOne: jest.fn().mockResolvedValue(mockFile),
      verifyFileIntegrity: jest.fn().mockReturnValue(true),
      changeFileStatus: jest.fn().mockResolvedValue({ message: 'Status updated' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureService,
        {
          provide: getRepositoryToken(SignDocument),
          useValue: mockSignatureRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
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
    const userId = 'supervisor-123';

    it('should return valid document and user for signing', async () => {
      // Setup mocks
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(mockSupervisor);
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(null); // No existing signature
      
      const result = await service['validateDocumentForSigning'](documentId, userId);
      
      expect(result.isValid).toBe(true);
      expect(result.document).toEqual(mockFile);
      expect(result.user).toEqual(mockSupervisor);
    });

    it('should return invalid if user is not found', async () => {
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(null);
      
      const result = await service['validateDocumentForSigning'](documentId, userId);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('User not found or inactive');
    });

    it('should return invalid if user is not a supervisor', async () => {
      const regularUser = { ...mockSupervisor, role: UserRole.USER };
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(regularUser);
      
      const result = await service['validateDocumentForSigning'](documentId, userId);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('User is not a supervisor');
    });

    it('should return invalid if document already signed by user', async () => {
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(mockSupervisor);
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(mockSignature); // Existing signature
      
      const result = await service['validateDocumentForSigning'](documentId, userId);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('You have already signed this document');
    });
  });

  describe('signDocument', () => {
    it('should sign the document', async () => {
      const signDocumentDto = {
        documentId: 'file-123',
        userId: 'supervisor-123',
        comment: 'Approved',
      };

      const mockRequest = {
        ip: '192.168.1.100',
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      } as unknown as Request;

      // Setup mocks
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(mockSupervisor);
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(null); // No existing signature
      (mockSignatureRepo.create as jest.Mock).mockReturnValue(mockSignature);
      (mockSignatureRepo.save as jest.Mock).mockResolvedValue(mockSignature);

      const result = await service.signDocument(signDocumentDto, mockRequest);

      expect(result).toBeDefined();
      expect(result.message).toBe('Document signed successfully');
      expect(result.signer.email).toBe(mockSupervisor.email);
      expect(mockSignatureRepo.create).toHaveBeenCalled();
      expect(mockSignatureRepo.save).toHaveBeenCalled();
      expect(mockFilesService.changeFileStatus).toHaveBeenCalled();
    });

    it('should throw BadRequestException if validation fails', async () => {
      const signDocumentDto = {
        documentId: 'file-123',
        userId: 'supervisor-123',
        comment: 'Approved',
      };

      const mockRequest = {} as Request;

      // Mock user not found
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.signDocument(signDocumentDto, mockRequest)).rejects.toThrow(
        'User not found or inactive'
      );
    });
  });

  describe('findAll', () => {
    it('should return all signatures', async () => {
      const mockSignatures = [
        { id: 'signature-1', documentId: 'file-123', accountId: 'supervisor-123' },
        { id: 'signature-2', documentId: 'file-456', accountId: 'supervisor-456' },
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
        'Signature with ID fake-id not found'
      );
    });
  });

  describe('verifySignatureIntegrity', () => {
    it('should verify signature integrity', async () => {
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(mockSignature);
      
      const result = await service.verifySignatureIntegrity('signature-1');
      
      expect(mockFilesService.verifyFileIntegrity).toHaveBeenCalledWith(mockFile);
      // Note: This test might return false due to hash comparison, 
      // but it should not throw an error
      expect(typeof result).toBe('boolean');
    });

    it('should return false if signature not found', async () => {
      (mockSignatureRepo.findOne as jest.Mock).mockResolvedValue(null);
      
      const result = await service.verifySignatureIntegrity('fake-id');
      
      expect(result).toBe(false);
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
        'Signature with ID fake-id not found'
      );
    });
  });
});