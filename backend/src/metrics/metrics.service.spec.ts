import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DocumentStatus } from '../files/enum/document-status.enum';

describe('MetricsService', () => {
  let service: MetricsService;

  const mockUserRepository = {
    count: jest.fn(),
  };

  const mockDocumentRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSystemMetrics', () => {
    it('should return system metrics with 10 users, 10 documents, and 5 pending signatures', async () => {
      mockUserRepository.count.mockResolvedValue(10);
      mockDocumentRepository.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);

      const result = await service.getSystemMetrics();

      expect(result).toEqual({
        totalUsers: 10,
        totalDocuments: 10,
        pendingSignatures: 5,
      });
      expect(mockUserRepository.count).toHaveBeenCalledTimes(1);
      expect(mockDocumentRepository.count).toHaveBeenCalledTimes(2);
      expect(mockDocumentRepository.count).toHaveBeenNthCalledWith(2, {
        where: { status: DocumentStatus.PENDING_REVIEW },
      });
    });

    it('should return zeros when system is empty', async () => {
      mockUserRepository.count.mockResolvedValue(0);
      mockDocumentRepository.count.mockResolvedValue(0);

      const result = await service.getSystemMetrics();

      expect(result).toEqual({
        totalUsers: 0,
        totalDocuments: 0,
        pendingSignatures: 0,
      });
    });

    it('should return correct metrics for different pending document counts', async () => {
      mockUserRepository.count.mockResolvedValue(25);
      mockDocumentRepository.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(15);

      const result = await service.getSystemMetrics();

      expect(result).toEqual({
        totalUsers: 25,
        totalDocuments: 50,
        pendingSignatures: 15,
      });
    });
  });
});
