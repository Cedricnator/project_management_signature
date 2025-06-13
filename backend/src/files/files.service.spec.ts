import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { DocumentStatusType } from './entities/document_status_type.entity';
import { DocumentHistory } from './entities/document_history.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enum/user-role.enum';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Readable } from 'typeorm/platform/PlatformTools';

describe('FilesService', () => {
  let service: FilesService;

  let mockUserService: Partial<UsersService>;
  let mockAuthService: Partial<AuthService>;

  let mockFileRepo: Partial<Repository<File>>;
  let mockStatusRepo: Partial<Repository<DocumentStatusType>>;
  let mockHistoryRepo: Partial<Repository<DocumentHistory>>;

  const mockUser = {
    id: 'abc',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
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
    currentStatusId: 'status-123',
    fileHash: 'abc123hash',
    
  }

  const mockStatus = {
    id: '01974b23-bc2f-7e5f-a9d0-73a5774d2778',
    status: 'pending_review',
  }

  const mockMulterFile = {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: 'utf-8',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test'),
    size: 1024,
    filename: 'test-123.pdf',
    path: 'uploads/test-123.pdf',
    destination: 'uploads',
    stream: new Readable({ read() {} }),
  }


  beforeEach(async () => {
    mockFileRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockStatusRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    mockAuthService = {
      validateUser: jest.fn(),
      verifyToken: jest.fn(),
    };

    mockHistoryRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockUserService = {
      findOne: jest.fn(),
      findOneByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      updateRole: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(File),
          useValue: mockFileRepo,
        },
        {
          provide: getRepositoryToken(DocumentStatusType),
          useValue: mockStatusRepo,
        },
        {
          provide: getRepositoryToken(DocumentHistory),
          useValue: mockHistoryRepo,
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Ejemplo de test: findOne()
  it('should throw NotFoundException if document is not found', async () => {
    (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
    await expect(service.findOne('fake-id')).rejects.toThrow(
      'Document with id fake-id not found',
    );
    await expect(
      service.getFileHistoryByUserId('fake-user-id'),
    ).rejects.toThrow('User with id fake-user-id not found');
  });

  it('should return a document if found', async () => {
    const mockDoc = { id: 'abc123', name: 'file.pdf' } as File;
    (mockFileRepo.findOne as jest.Mock).mockResolvedValue(mockDoc);
    const result = await service.findOne('abc123');
    expect(result).toEqual(mockDoc);
  });

  it('should upload new file successfully', async () => {
    (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
    (mockStatusRepo.findOne as jest.Mock).mockResolvedValue(mockStatus);
    (mockFileRepo.create as jest.Mock).mockReturnValue(mockFile);
    (mockFileRepo.save as jest.Mock).mockResolvedValue(mockFile);
    (mockHistoryRepo.create as jest.Mock).mockReturnValue({});
    (mockHistoryRepo.save as jest.Mock).mockResolvedValue({});

    const uploadDto = {
      description: 'Test file',
      name: 'test.pdf',
    };

    const result = await service.uploadFile(mockMulterFile, uploadDto, 'test@example.com');
    expect(result).toBeDefined();
    expect(result.name).toBe('test.pdf');
    expect(result.filePath).toBe('uploads/test.pdf');
    expect(result.mimetype).toBe('application/pdf');
    expect(result.fileSize).toBe(1024);
    expect(result.description).toBe('Test file');
  })
  
  it('should return all files for a user', async () => {
    (mockUserService.findOne as jest.Mock).mockResolvedValue(mockUser);
    (mockFileRepo.find as jest.Mock).mockResolvedValue([mockFile]);

    const result = await service.findFilesByUser(mockUser.id);
    expect(result).toEqual([mockFile]);
  });

  describe('findFilesByUser', () => {
    it('should return all files for a user', async () => {
      (mockUserService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (mockFileRepo.find as jest.Mock).mockResolvedValue([mockFile]);

      const result = await service.findFilesByUser(mockUser.id);
      expect(result).toEqual([mockFile]);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const mockUserId = 'fake-user-id';
      (mockUserService.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findFilesByUser(mockUserId)).rejects.toThrow(
        `User with id ${mockUserId} not found`,
      );
    });
  });

  describe('getFileHistoryByUserId', () => {
    it('should return file history for a user', async () => {
      const mockHistory = [
        { 
          id: 'history-1',
          documentId: 'file-123',
          statusId: 'status-123',
          changedBy: mockUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, 
        { 
          id: 'history-2',
          documentId: 'file-123',
          statusId: 'status-456',
          changedBy: mockUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      (mockUserService.findOne as jest.Mock).mockResolvedValue(mockUser);

      (mockFileRepo.find as jest.Mock).mockResolvedValue([mockFile]);

      (mockHistoryRepo.find as jest.Mock).mockResolvedValue(mockHistory);

      const result = await service.getFileHistoryByUserId(mockUser.id);
      // expect(result).toEqual(mockHistory);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const mockUserId = 'fake-user-id';
      (mockUserService.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.getFileHistoryByUserId(mockUserId)).rejects.toThrow(
        `User with id ${mockUserId} not found`,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      (mockFileRepo.findOne as jest.Mock).mockResolvedValue(mockFile);
      (mockFileRepo.remove as jest.Mock).mockResolvedValue(mockFile);

      const result = await service.remove(mockFile.id);
      expect(result).toEqual({ id: mockFile.id, documentName: mockFile.name });
    });

    it('should throw NotFoundException if file is not found', async () => {
      (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('fake-file-id')).rejects.toThrow(
        'Document with id fake-file-id not found',
      );
    });
  });

  describe('updateFileStatus', () => {

  })

  describe('findDoumentStatus', () => {

  })

  describe('downloadFile', () => {

  })

  describe('streamFile', () => {

  })

  describe('verifyFileIntegrity', () => {

  })

  describe('getStatusTypes', () => {
    
  })
});
