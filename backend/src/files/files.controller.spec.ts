import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RoleGuard } from '../security/guards/role.guard';

describe('FilesController', () => {
  let controller: FilesController;
  const mockGuard = {
    canActivate: jest.fn(() => true), // siempre deja pasar
  };
  const mockFilesService = {
    uploadFile: jest.fn(),
    streamFile: jest.fn(),
    downloadFile: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getFileHistory: jest.fn(),
    getStatusTypes: jest.fn(), // 👈 era `findAllStatusTypes`, debe ser igual que en tu controller
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll()', async () => {
    await controller.findAll();
    expect(mockFilesService.findAll).toHaveBeenCalled();
  });
});
