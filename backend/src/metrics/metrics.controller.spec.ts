import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;
  let service: MetricsService;

  const mockMetricsService = {
    getSystemMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /metrics', () => {
    it('should return system metrics', async () => {
      // Arrange
      const expectedMetrics = {
        totalUsers: 10,
        totalDocuments: 10,
        pendingSignatures: 5,
      };
      mockMetricsService.getSystemMetrics.mockResolvedValue(expectedMetrics);

      // Act
      const result = await controller.getMetrics();

      // Assert
      expect(result).toEqual(expectedMetrics);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getSystemMetrics).toHaveBeenCalledTimes(1);
    });

    it('should return zeros when system is empty', async () => {
      // Arrange
      const expectedMetrics = {
        totalUsers: 0,
        totalDocuments: 0,
        pendingSignatures: 0,
      };
      mockMetricsService.getSystemMetrics.mockResolvedValue(expectedMetrics);

      // Act
      const result = await controller.getMetrics();

      // Assert
      expect(result).toEqual(expectedMetrics);
    });
  });
});
