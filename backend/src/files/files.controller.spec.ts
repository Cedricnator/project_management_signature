import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RoleGuard } from '../security/guards/role.guard';
import { BadRequestException } from '@nestjs/common';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../common/enum/user-role.enum';

describe('FilesController', () => {
  let controller: FilesController;
  let mockFilesService: jest.Mocked<FilesService>;

  const mockGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockUser: JwtPayload = {
    sub: 123,
    email: 'test@example.com',
    role: UserRole.USER,
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test content'),
    size: 1024,
    destination: '',
    filename: 'test-123.pdf',
    path: 'uploads/test-123.pdf',
    stream: null as any,
  };

  beforeEach(async () => {
    const mockFilesServiceValue = {
      uploadFile: jest.fn(),
      streamFile: jest.fn(),
      downloadFile: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getFileHistory: jest.fn(),
      getStatusTypes: jest.fn(),
      findFilesByUser: jest.fn(),
      getFileHistoryByUserId: jest.fn(),
      getFileHistoryById: jest.fn(),
      getFilesHistory: jest.fn(),
      changeFileStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesServiceValue,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<FilesController>(FilesController);
    mockFilesService = module.get(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const uploadFileDto = { name: 'test.pdf', description: 'Test file' };
      const expectedResult = { id: 'file-123', name: 'test.pdf' };

      mockFilesService.uploadFile.mockResolvedValue(expectedResult as any);

      const result = await controller.uploadFile(
        mockFile,
        uploadFileDto,
        mockUser,
      );

      expect(mockFilesService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        uploadFileDto,
        mockUser.email,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException when file is not provided', async () => {
      const uploadFileDto = { name: 'test.pdf', description: 'Test file' };

      expect(() =>
        controller.uploadFile(null as any, uploadFileDto, mockUser),
      ).toThrow(BadRequestException);
      expect(mockFilesService.uploadFile).not.toHaveBeenCalled();
    });
  });

  describe('streamFile', () => {
    it('should stream file successfully', async () => {
      const fileId = 'file-123';
      const expectedResult = { file: 'stream data' };

      mockFilesService.streamFile.mockResolvedValue(expectedResult as any);

      const result = await controller.streamFile(fileId);

      expect(mockFilesService.streamFile).toHaveBeenCalledWith(fileId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllFileHistory', () => {
    it('should get all file history successfully', async () => {
      const expectedResult = [{ id: 'history-1', action: 'uploaded' }];

      mockFilesService.getFilesHistory.mockResolvedValue(expectedResult as any);

      const result = await controller.getAllFileHistory();

      expect(mockFilesService.getFilesHistory).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllStatusTypes', () => {
    it('should get all status types successfully', async () => {
      const expectedResult = [{ id: 'status-1', name: 'Pending' }];

      mockFilesService.getStatusTypes.mockResolvedValue(expectedResult as any);

      const result = await controller.findAllStatusTypes();

      expect(mockFilesService.getStatusTypes).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should get all files successfully', async () => {
      const expectedResult = [{ id: 'file-1', name: 'test.pdf' }];

      mockFilesService.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll();

      expect(mockFilesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findFilesByUser', () => {
    it('should get files by user successfully', async () => {
      const userId = 'user-123';
      const expectedResult = [{ id: 'file-1', name: 'test.pdf' }];

      mockFilesService.findFilesByUser.mockResolvedValue(expectedResult as any);

      const result = await controller.findFilesByUser(userId);

      expect(mockFilesService.findFilesByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserFileHistory', () => {
    it('should get user file history successfully', async () => {
      const userId = 'user-123';
      const expectedResult = [{ id: 'history-1', action: 'uploaded' }];

      mockFilesService.getFileHistoryByUserId.mockResolvedValue(
        expectedResult as any,
      );

      const result = await controller.getUserFileHistory(userId);

      expect(mockFilesService.getFileHistoryByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const fileId = 'file-123';
      const mockResponse = {} as any;
      const expectedResult = { file: 'download data' };

      mockFilesService.downloadFile.mockResolvedValue(expectedResult as any);

      const result = await controller.downloadFile(fileId, mockResponse);

      expect(mockFilesService.downloadFile).toHaveBeenCalledWith(
        fileId,
        mockResponse,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getFileHistory', () => {
    it('should get file history by id successfully', async () => {
      const fileId = 'file-123';
      const expectedResult = {
        document: { id: fileId, name: 'test.pdf' },
        history: [{ id: 'history-1', action: 'uploaded' }],
      };

      mockFilesService.getFileHistoryById.mockResolvedValue(
        expectedResult as any,
      );

      const result = await controller.getFileHistory(fileId);

      expect(mockFilesService.getFileHistoryById).toHaveBeenCalledWith(fileId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should get file by id successfully', async () => {
      const fileId = 'file-123';
      const expectedResult = { id: fileId, name: 'test.pdf' };

      mockFilesService.findOne.mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(fileId);

      expect(mockFilesService.findOne).toHaveBeenCalledWith(fileId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update file successfully', async () => {
      const fileId = 'file-123';
      const updateFileDto = { description: 'Updated description' };
      const expectedResult = { id: fileId, name: 'updated.pdf' };

      mockFilesService.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(
        fileId,
        mockFile,
        mockUser,
        updateFileDto,
      );

      expect(mockFilesService.update).toHaveBeenCalledWith(
        fileId,
        mockFile,
        mockUser.email,
        updateFileDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove file successfully', async () => {
      const fileId = 'file-123';
      const expectedResult = { id: fileId, documentName: 'test.pdf' };

      mockFilesService.remove.mockResolvedValue(expectedResult as any);

      const result = await controller.remove(fileId);

      expect(mockFilesService.remove).toHaveBeenCalledWith(fileId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('changeFileStatus', () => {
    it('should change file status successfully', async () => {
      const fileId = 'file-123';
      const changeFileStatusDto = {
        statusId: 'status-2',
        comment: 'Status changed',
      };
      const expectedResult = { id: fileId, statusId: 'status-2' };

      mockFilesService.changeFileStatus.mockResolvedValue(
        expectedResult as any,
      );

      const result = await controller.changeFileStatus(
        fileId,
        changeFileStatusDto,
        mockUser,
      );

      expect(mockFilesService.changeFileStatus).toHaveBeenCalledWith(
        fileId,
        changeFileStatusDto.statusId,
        mockUser.email,
        changeFileStatusDto.comment,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
