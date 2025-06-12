import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { DocumentStatusType } from './entities/document_status_type.entity';
import { DocumentHistory } from './entities/document_history.entity';
import { Repository } from 'typeorm';

describe('FilesService', () => {
  let service: FilesService;

  let mockFileRepo: Partial<Repository<File>>;
  let mockStatusRepo: Partial<Repository<DocumentStatusType>>;
  let mockHistoryRepo: Partial<Repository<DocumentHistory>>;

  beforeEach(async () => {
    mockFileRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    mockStatusRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    mockHistoryRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
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
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
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
  });

  it('should return a document if found', async () => {
    const mockDoc = { id: 'abc123', name: 'file.pdf' } as File;
    (mockFileRepo.findOne as jest.Mock).mockResolvedValue(mockDoc);
    const result = await service.findOne('abc123');
    expect(result).toEqual(mockDoc);
  });
});
