import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from './entities/file.entity';
import { DocumentStatusType } from './entities/document_status_type.entity';
import { DocumentHistory } from './entities/document_history.entity';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

const mockJwtAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    return true;
  }),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findAndCount: jest.fn(),
};

const mockDataSource = {
  createQueryRunner: jest.fn(() => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    },
  })),
};

const mockUsersService = {
  findOne: jest.fn(),
  findOneByEmail: jest.fn(),
  findByIds: jest.fn(),
};

describe('FilesModule Configuration', () => {
  it('should create module with all dependencies', async () => {
    const module = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(File),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DocumentStatusType),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DocumentHistory),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
      controllers: [FilesController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    expect(module).toBeDefined();
    expect(module.get(FilesService)).toBeDefined();
    expect(module.get(FilesController)).toBeDefined();
    expect(module.get(JwtService)).toBeDefined();

    await module.close();
  });

  it('should allow controller operations', async () => {
    const module = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(File),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DocumentStatusType),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DocumentHistory),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
      controllers: [FilesController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    await module.close();
  });
});
