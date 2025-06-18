import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { DocumentStatusType } from './entities/document_status_type.entity';
import { DocumentHistory } from './entities/document_history.entity';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enum/user-role.enum';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Readable } from 'typeorm/platform/PlatformTools';
import { DocumentStatus } from './enum/document-status.enum';

describe('FilesService', () => {
  let service: FilesService;

  let mockUserService: Partial<UsersService>;
  let mockAuthService: Partial<AuthService>;

  let mockFileRepo: Partial<Repository<File>>;
  let mockStatusRepo: Partial<Repository<DocumentStatusType>>;
  let mockHistoryRepo: Partial<Repository<DocumentHistory>>;
  let mockDatasource: Partial<DataSource>;

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
    path: '/tmp/test-file.pdf',
    destination: 'uploads',
    stream: new Readable({ read() {} }),
  }


  beforeEach(async () => {
    mockFileRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
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
      findByIds: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      updateRole: jest.fn(),
    };

    mockDatasource = {
      getRepository: jest.fn().mockReturnValue(mockFileRepo),
      createQueryBuilder: jest.fn(),
      transaction: jest.fn().mockImplementation((cb) => cb(mockDatasource)),
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
          provide: DataSource,
          useValue: mockDatasource,
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
    const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
    const mockReadFileSync = jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('test content'));

    (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
    (mockStatusRepo.findOne as jest.Mock).mockResolvedValue(mockStatus);
    (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
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
    
    mockExistsSync.mockRestore();
    mockReadFileSync.mockRestore();
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
          comment: 'First upload',
          createdAt: new Date(),
          updatedAt: new Date(),
        }, 
        { 
          id: 'history-2',
          documentId: 'file-123',
          statusId: 'status-456',
          changedBy: mockUser.id,
          comment: 'Second upload',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      const expectedTransformedHistory = [
        {
          id: 'history-1',
          documentId: 'file-123',
          statusId: 'status-123',
          changedBy: `${mockUser.firstName} ${mockUser.lastName}`,
          comment: 'First upload',
          createdAt: mockHistory[0].createdAt,
          updatedAt: mockHistory[0].updatedAt,
        },
        {
          id: 'history-2',
          documentId: 'file-123',
          statusId: 'status-456',
          changedBy: `${mockUser.firstName} ${mockUser.lastName}`,
          comment: 'Second upload',
          createdAt: mockHistory[1].createdAt,
          updatedAt: mockHistory[1].updatedAt,
        }
      ];
          
      (mockUserService.findOne as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValue(mockUser);

      (mockFileRepo.find as jest.Mock).mockResolvedValue([mockFile]);
      (mockHistoryRepo.find as jest.Mock).mockResolvedValue(mockHistory);

      const result = await service.getFileHistoryByUserId(mockUser.id);
      expect(result).toEqual(expectedTransformedHistory);
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

    describe('uploadFile', () => {
      it('should fail when file parameter is null', async () => {
        await expect(service.uploadFile(null as any, { name: 'test', description: 'test' }, 'test@example.com'))
          .rejects.toThrow('No file provided!');
      });

      it('should fail when file parameter is undefined', async () => {
        await expect(service.uploadFile(undefined as any, { name: 'test', description: 'test' }, 'test@example.com'))
          .rejects.toThrow('No file provided!');
      });

      it('should fail when file has no path property', async () => {
         const { path, ...fileWithoutPath } = mockMulterFile;
        
        await expect(service.uploadFile(fileWithoutPath as any, { name: 'test', description: 'test' }, 'test@example.com'))
          .rejects.toThrow('File not saved properly to disk');
      });

      it('should fail when file path does not exist on disk', async () => {
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);
        
        await expect(service.uploadFile(mockMulterFile, { name: 'test', description: 'test' }, 'test@example.com'))
          .rejects.toThrow('File not saved properly to disk');
          
        mockExistsSync.mockRestore();
      });

      it('should fail when user email does not exist', async () => {
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);
        
        await expect(service.uploadFile(mockMulterFile, { name: 'test', description: 'test' }, 'nonexistent@example.com'))
          .rejects.toThrow('User with email nonexistent@example.com not found');
          
        mockExistsSync.mockRestore();
      });

      it('should fail when file cannot be read from disk', async () => {
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(require('fs'), 'readFileSync').mockImplementation(() => {
          throw new Error('Permission denied');
        });
        
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        
        await expect(service.uploadFile(mockMulterFile, { name: 'test', description: 'test' }, 'test@example.com'))
          .rejects.toThrow('Error processing file: Permission denied');
          
        mockExistsSync.mockRestore();
        mockReadFileSync.mockRestore();
      });

      it('should fail when findDocumentStatus throws error', async () => {
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('test'));
        
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
        (mockStatusRepo.findOne as jest.Mock).mockResolvedValue(null);
        
        await expect(service.uploadFile(mockMulterFile, { name: 'test', description: 'test' }, 'test@example.com'))
          .rejects.toThrow('Error finding document status');
          
        mockExistsSync.mockRestore();
        mockReadFileSync.mockRestore();
      });

      it('should throw ConflictException when same user uploads same file', async () => {
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('test'));
        const mockUnlinkSync = jest.spyOn(require('fs'), 'unlinkSync').mockImplementation(() => {});
        
        const existingFile = { ...mockFile, uploadBy: mockUser, fileHash: 'samehash' };
        
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(existingFile);
        
        await expect(service.uploadFile(mockMulterFile, { name: 'test', description: 'test' }, 'test@example.com'))
          .rejects.toThrow('You have already uploaded this file');
          
        mockExistsSync.mockRestore();
        mockReadFileSync.mockRestore();
        mockUnlinkSync.mockRestore();
      });

      it('should handle file cleanup error gracefully', async () => {
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('test'));
        const mockUnlinkSync = jest.spyOn(require('fs'), 'unlinkSync').mockImplementation(() => {
          throw new Error('Cannot delete file');
        });
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        const existingFile = { ...mockFile, uploadBy: mockUser, fileHash: 'samehash' };
        
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(existingFile);
        
        await expect(service.uploadFile(mockMulterFile, { name: 'test', description: 'test' }, 'test@example.com'))
          .rejects.toThrow('You have already uploaded this file');
          
        expect(consoleSpy).toHaveBeenCalledWith('Could not cleanup temporary file:', expect.any(Error));
          
        mockExistsSync.mockRestore();
        mockReadFileSync.mockRestore();
        mockUnlinkSync.mockRestore();
        consoleSpy.mockRestore();
      });
    });

    describe('findFilesByUser', () => {
      it('should fail when user does not exist', async () => {
        (mockUserService.findOne as jest.Mock).mockResolvedValue(null);
        
        await expect(service.findFilesByUser('nonexistent-id'))
          .rejects.toThrow('User with id nonexistent-id not found');
      });

      it('should fail when user has no documents', async () => {
        (mockUserService.findOne as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.find as jest.Mock).mockResolvedValue([]);
        
        await expect(service.findFilesByUser(mockUser.id))
          .rejects.toThrow(`No documents found for user ${mockUser.email}`);
      });

      it('should fail when user has null documents', async () => {
        (mockUserService.findOne as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.find as jest.Mock).mockResolvedValue(null);
        
        await expect(service.findFilesByUser(mockUser.id))
          .rejects.toThrow(`No documents found for user ${mockUser.email}`);
      });
    });

    describe('findOne', () => {
      it('should fail with empty string id', async () => {
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
        
        await expect(service.findOne(''))
          .rejects.toThrow('Document with id  not found');
      });

      it('should fail with null id', async () => {
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
        
        await expect(service.findOne(null as any))
          .rejects.toThrow('Document with id null not found');
      });

      it('should fail with undefined id', async () => {
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
        
        await expect(service.findOne(undefined as any))
          .rejects.toThrow('Document with id undefined not found');
      });
    });

    describe('getFileHistoryByUserId', () => {
      it('should fail when user in history does not exist', async () => {
        const mockHistory = [{ 
          id: 'history-1',
          documentId: 'file-123',
          statusId: 'status-123',
          changedBy: 'nonexistent-user-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        }];
        
        (mockUserService.findOne as jest.Mock)
          .mockResolvedValueOnce(mockUser) // First call for main user
          .mockResolvedValueOnce(null); // Second call for history user
        (mockFileRepo.find as jest.Mock).mockResolvedValue([mockFile]);
        (mockHistoryRepo.find as jest.Mock).mockResolvedValue(mockHistory);
        
        await expect(service.getFileHistoryByUserId(mockUser.id))
          .rejects.toThrow('User with id nonexistent-user-id not found');
      });

      it('should handle empty history gracefully', async () => {
        (mockUserService.findOne as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.find as jest.Mock).mockResolvedValue([mockFile]);
        (mockHistoryRepo.find as jest.Mock).mockResolvedValue([]);
        
        const result = await service.getFileHistoryByUserId(mockUser.id);
        expect(result).toEqual([]);
      });
    });

    describe('downloadFile', () => {
      it('should fail when file does not exist on disk', async () => {
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(mockFile);
        
        const mockResponse = {
          setHeader: jest.fn(),
        } as any;
        
        await expect(service.downloadFile(mockFile.id, mockResponse))
          .rejects.toThrow('File not found on disk');
          
        mockExistsSync.mockRestore();
      });

      it('should fail when document does not exist', async () => {
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
        
        const mockResponse = {} as any;
        
        await expect(service.downloadFile('nonexistent-id', mockResponse))
          .rejects.toThrow('Document with id nonexistent-id not found');
      });
    });

    describe('streamFile', () => {
      it('should fail when document has no filePath', async () => {
        const fileWithoutPath = { ...mockFile, filePath: null };
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(fileWithoutPath);
        
        await expect(service.streamFile(mockFile.id))
          .rejects.toThrow('File path not found');
      });

      it('should fail when file path is empty string', async () => {
        const fileWithEmptyPath = { ...mockFile, filePath: '' };
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(fileWithEmptyPath);
        
        await expect(service.streamFile(mockFile.id))
          .rejects.toThrow('File path not found');
      });
    });

    describe('update', () => {
      it('should fail when user does not exist', async () => {
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(mockFile);
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);
        
        await expect(service.update(mockFile.id, undefined, 'nonexistent@example.com', { name: 'new name' }))
          .rejects.toThrow('User with email nonexistent@example.com not found');
      });

      it('should fail when document status is not allowed', async () => {
        const approvedFile = { ...mockFile, currentStatusId: 'approved-status-id' };
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(approvedFile);
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        
        await expect(service.update(mockFile.id, undefined, mockUser.email, { name: 'new name' }))
          .rejects.toThrow('Document can only be updated if it is in a rejected or pending review status');
      });

      it('should fail when new file path does not exist', async () => {
        const rejectedFile = { ...mockFile, currentStatusId: DocumentStatus.REJECTED };
        const newFile = { ...mockMulterFile, path: '/nonexistent/path' };
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);
        
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(rejectedFile);
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        
        await expect(service.update(mockFile.id, newFile, mockUser.email, { name: 'new name' }))
          .rejects.toThrow('New file not saved properly to disk');
          
        mockExistsSync.mockRestore();
      });

      it('should handle old file deletion error gracefully', async () => {
        const rejectedFile = { ...mockFile, currentStatusId: DocumentStatus.REJECTED };
        const newFile = { ...mockMulterFile };
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('test'));
        const mockUnlinkSync = jest.spyOn(require('fs'), 'unlinkSync').mockImplementation(() => {
          throw new Error('Cannot delete old file');
        });
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        (mockFileRepo.findOne as jest.Mock)
          .mockResolvedValueOnce(rejectedFile)
          .mockResolvedValueOnce(rejectedFile);
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.update as jest.Mock).mockResolvedValue({});
        (mockHistoryRepo.create as jest.Mock).mockReturnValue({});
        (mockHistoryRepo.save as jest.Mock).mockResolvedValue({});
        
        const result = await service.update(mockFile.id, newFile, mockUser.email, { name: 'new name' });
        
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Could not delete old file'), expect.any(Error));
        expect(result).toBeDefined();
        
        mockExistsSync.mockRestore();
        mockReadFileSync.mockRestore();
        mockUnlinkSync.mockRestore();
        consoleSpy.mockRestore();
      });
    });

    describe('remove', () => {
      it('should handle file deletion error gracefully', async () => {
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const mockUnlinkSync = jest.spyOn(require('fs'), 'unlinkSync').mockImplementation(() => {
          throw new Error('Permission denied');
        });
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(mockFile);
        (mockFileRepo.remove as jest.Mock).mockResolvedValue(mockFile);
        
        const result = await service.remove(mockFile.id);
        
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Could not delete file'), expect.any(Error));
        expect(result).toEqual({ id: mockFile.id, documentName: mockFile.name });
        
        mockExistsSync.mockRestore();
        mockUnlinkSync.mockRestore();
        consoleSpy.mockRestore();
      });
    });

    describe('changeFileStatus', () => {
      it('should fail when user does not exist', async () => {
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(mockFile);
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);
        
        await expect(service.changeFileStatus(mockFile.id, 'new-status-id', 'nonexistent@example.com'))
          .rejects.toThrow('User with email nonexistent@example.com not found');
      });

      it('should fail when status does not exist', async () => {
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(mockFile);
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        (mockStatusRepo.findOne as jest.Mock).mockResolvedValue(null);
        
        await expect(service.changeFileStatus(mockFile.id, 'nonexistent-status-id', mockUser.email))
          .rejects.toThrow('Status not found');
      });
    });

    describe('verifyFileIntegrity', () => {
      it('should return false when document has no fileBuffer', () => {
        const fileWithoutBuffer = { ...mockFile, fileBuffer: null };
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        const result = service.verifyFileIntegrity(fileWithoutBuffer as any);
        
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Document does not have a file buffer to verify');
        
        consoleSpy.mockRestore();
      });

      it('should return false when document has no fileHash', () => {
        const fileWithoutHash = { ...mockFile, fileHash: null, fileBuffer: Buffer.from('test') };
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        const result = service.verifyFileIntegrity(fileWithoutHash as any);
        
        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Document does not have a file hash to compare against');
        
        consoleSpy.mockRestore();
      });

      it('should throw InternalServerErrorException when crypto fails', () => {
        const mockCreateHash = jest.spyOn(require('crypto'), 'createHash').mockImplementation(() => {
          throw new Error('Crypto error');
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        const fileWithBufferAndHash = { 
          ...mockFile, 
          fileBuffer: Buffer.from('test'), 
          fileHash: 'validhash' 
        };
        
        expect(() => service.verifyFileIntegrity(fileWithBufferAndHash as any))
          .toThrow('Could not verify file integrity');
          
        mockCreateHash.mockRestore();
        consoleSpy.mockRestore();
      });

      it('should return false when hashes do not match', () => {
        const fileWithWrongHash = { 
          ...mockFile, 
          fileBuffer: Buffer.from('test'), 
          fileHash: 'wronghash' 
        };
        
        const result = service.verifyFileIntegrity(fileWithWrongHash as any);
        expect(result).toBe(false);
      });
    });

    describe('getStatusTypes', () => {
      it('should throw InternalServerErrorException when repository fails', async () => {
        (mockStatusRepo.find as jest.Mock).mockRejectedValue(new Error('Database error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        await expect(service.getStatusTypes())
          .rejects.toThrow('Could not fetch document status types');
          
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching document status types:', expect.any(Error));
        
        consoleSpy.mockRestore();
      });
    });

    describe('findDocumentStatus', () => {
      it('should throw InternalServerErrorException when repository throws', async () => {
        (mockStatusRepo.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        await expect(service['findDocumentStatus']('any-id'))
          .rejects.toThrow('Error finding document status');
          
        expect(consoleSpy).toHaveBeenCalledWith('Error finding document status with id any-id:', expect.any(Error));
        
        consoleSpy.mockRestore();
      });
    });

    describe('getFilesHistory', () => {
      it('should fail when user in history does not exist', async () => {
        const mockHistory = [{ 
          id: 'history-1',
          documentId: 'file-123',
          statusId: 'status-123',
          changedBy: 'nonexistent-user-id',
          comment: 'test comment',
          createdAt: new Date(),
          updatedAt: new Date(),
        }];
        
        (mockHistoryRepo.find as jest.Mock).mockResolvedValue(mockHistory);
        (mockUserService.findOne as jest.Mock).mockResolvedValue(null);
        
        await expect(service.getFilesHistory())
          .rejects.toThrow('User with id nonexistent-user-id not found');
      });
    });

    describe('Edge Cases and Data Integrity', () => {
      it('should handle extremely large file sizes', async () => {
        const largeFile = { 
          ...mockMulterFile, 
          size: Number.MAX_SAFE_INTEGER,
          buffer: Buffer.alloc(1000000) // 1MB buffer
        };
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(largeFile.buffer);
        
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
        (mockStatusRepo.findOne as jest.Mock).mockResolvedValue(mockStatus);
        (mockFileRepo.create as jest.Mock).mockReturnValue(mockFile);
        (mockFileRepo.save as jest.Mock).mockResolvedValue(mockFile);
        (mockHistoryRepo.create as jest.Mock).mockReturnValue({});
        (mockHistoryRepo.save as jest.Mock).mockResolvedValue({});
        
        const result = await service.uploadFile(largeFile, { name: 'large-file.pdf', description: 'test' }, mockUser.email);
        expect(result).toBeDefined();
        
        mockExistsSync.mockRestore();
        mockReadFileSync.mockRestore();
      });

      it('should handle special characters in file names', async () => {
        const specialCharFile = { 
          ...mockMulterFile, 
          originalname: 'файл с русскими символами.pdf',
          filename: 'файл с русскими символами.pdf'
        };
        
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('test'));
        
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(null);
        (mockStatusRepo.findOne as jest.Mock).mockResolvedValue(mockStatus);
        (mockFileRepo.create as jest.Mock).mockReturnValue(mockFile);
        (mockFileRepo.save as jest.Mock).mockResolvedValue(mockFile);
        (mockHistoryRepo.create as jest.Mock).mockReturnValue({});
        (mockHistoryRepo.save as jest.Mock).mockResolvedValue({});
        
        const result = await service.uploadFile(specialCharFile, { name: 'test-файл', description: 'test' }, mockUser.email);
        expect(result).toBeDefined();
        
        mockExistsSync.mockRestore();
        mockReadFileSync.mockRestore();
      });

      it('should handle concurrent duplicate file uploads', async () => {
        const mockExistsSync = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(Buffer.from('identical content'));
        const mockUnlinkSync = jest.spyOn(require('fs'), 'unlinkSync').mockImplementation(() => {});
        
        // Simulate race condition where same file is found during upload
        const existingFile = { ...mockFile, uploadBy: { id: 'other-user-id' } };
        
        (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
        (mockFileRepo.findOne as jest.Mock).mockResolvedValue(existingFile);
        
        await expect(service.uploadFile(mockMulterFile, { name: 'test', description: 'test' }, mockUser.email))
          .rejects.toThrow('This file has already been uploaded by another user');
          
        mockExistsSync.mockRestore();
        mockReadFileSync.mockRestore();
        mockUnlinkSync.mockRestore();
      });
    });
});
