import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let db: TypeOrmHealthIndicator;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockTypeOrmHealthIndicator = {
    pingCheck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    db = module.get<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when all services are up', async () => {
      const mockHealthResult = {
        status: 'ok',
        info: {
          database: {
            status: 'up',
            message: 'Connection successful',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
            message: 'Connection successful',
          },
        },
      };

      mockHealthCheckService.check.mockResolvedValue(mockHealthResult);
      mockTypeOrmHealthIndicator.pingCheck.mockResolvedValue({
        database: { status: 'up', message: 'Connection successful' },
      });

      const result = await controller.check();

      expect(result).toEqual(mockHealthResult);
      expect(result.status).toBe('ok');
      expect(result.info!.database.status).toBe('up');
    });

    it('should return error status when database is down', async () => {
      const mockErrorResult = {
        status: 'error',
        info: {},
        error: {
          database: {
            status: 'down',
            message: 'Connection failed',
          },
        },
        details: {
          database: {
            status: 'down',
            message: 'Connection failed',
          },
        },
      };

      // ✅ CORREGIDO: El health check service maneja el error internamente
      mockHealthCheckService.check.mockResolvedValue(mockErrorResult);
      // No configuramos el pingCheck para fallar aquí, porque el HealthCheckService
      // ya maneja esos errores y devuelve el resultado apropiado

      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.error!.database.status).toBe('down');
    });

    it('should verify database ping check is called correctly', async () => {
      const mockResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };

      mockHealthCheckService.check.mockResolvedValue(mockResult);

      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);

      // ✅ CORREGIDO: Verificar que la función se ejecuta sin error
      const checkFunction = mockHealthCheckService.check.mock.calls[0][0][0];

      // Mock para que pingCheck funcione correctamente cuando se llame
      mockTypeOrmHealthIndicator.pingCheck.mockResolvedValue({
        database: { status: 'up' },
      });

      // Ejecutar la función y verificar que no lance error
      await expect(checkFunction()).resolves.toEqual({
        database: { status: 'up' },
      });

      expect(db.pingCheck).toHaveBeenCalledWith('database');
    });

    it('should handle health check service errors', async () => {
      // ✅ CORREGIDO: Testear cuando el HealthCheckService mismo falla
      mockHealthCheckService.check.mockRejectedValue(
        new Error('Health check service error'),
      );

      await expect(controller.check()).rejects.toThrow(
        'Health check service error',
      );
    });

    it('should return consistent response structure', async () => {
      const mockResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };

      mockHealthCheckService.check.mockResolvedValue(mockResult);

      const result = await controller.check();

      // Verificar estructura de respuesta
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('info');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('details');
      expect(['ok', 'error', 'shutting_down']).toContain(result.status);
    });
  });

  // ✅ SIMPLIFICADO: Tests más realistas
  describe('Integration scenarios', () => {
    it('should handle database connectivity', async () => {
      const mockResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };

      mockHealthCheckService.check.mockResolvedValue(mockResult);

      const result = await controller.check();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
    });

    it('should verify dependencies are injected', () => {
      expect(controller).toBeDefined();
      expect(healthCheckService).toBeDefined();
      expect(db).toBeDefined();
    });
  });

  // ✅ TESTS BÁSICOS: Más simples y confiables
  describe('Basic functionality', () => {
    it('should call health check service', async () => {
      const mockResult = { status: 'ok', info: {}, error: {}, details: {} };
      mockHealthCheckService.check.mockResolvedValue(mockResult);

      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });

    it('should return health check result', async () => {
      const expectedResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };

      mockHealthCheckService.check.mockResolvedValue(expectedResult);

      const result = await controller.check();

      expect(result).toEqual(expectedResult);
    });
  });
});
