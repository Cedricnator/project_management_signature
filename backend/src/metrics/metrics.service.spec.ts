import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { File } from '../files/entities/file.entity';
import { DocumentStatus } from '../files/enum/document-status.enum';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  const mockUserRepository = {
    count: jest.fn(),
  };

  const mockFileRepository = {
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
          provide: getRepositoryToken(File),
          useValue: mockFileRepository,
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
      // Arrange
      mockUserRepository.count.mockResolvedValue(10);
      mockFileRepository.count
        .mockResolvedValueOnce(10) // totalDocuments
        .mockResolvedValueOnce(5); // pendingSignatures

      // Act
      const result = await service.getSystemMetrics();

      // Assert
      expect(result).toEqual({
        totalUsers: 10,
        totalDocuments: 10,
        pendingSignatures: 5,
      });
      expect(mockUserRepository.count).toHaveBeenCalledTimes(1);
      expect(mockFileRepository.count).toHaveBeenCalledTimes(2);
      expect(mockFileRepository.count).toHaveBeenNthCalledWith(2, {
        where: { currentStatusId: DocumentStatus.PENDING_REVIEW },
      });
    });

    it('should return zeros when system is empty', async () => {
      // Arrange
      mockUserRepository.count.mockResolvedValue(0);
      mockFileRepository.count.mockResolvedValue(0);

      // Act
      const result = await service.getSystemMetrics();

      // Assert
      expect(result).toEqual({
        totalUsers: 0,
        totalDocuments: 0,
        pendingSignatures: 0,
      });
    });

    it('should return correct metrics for different pending document counts', async () => {
      // Arrange
      mockUserRepository.count.mockResolvedValue(25);
      mockFileRepository.count
        .mockResolvedValueOnce(50) // totalDocuments
        .mockResolvedValueOnce(15); // pendingSignatures

      // Act
      const result = await service.getSystemMetrics();

      // Assert
      expect(result).toEqual({
        totalUsers: 25,
        totalDocuments: 50,
        pendingSignatures: 15,
      });
    });
  });
});
