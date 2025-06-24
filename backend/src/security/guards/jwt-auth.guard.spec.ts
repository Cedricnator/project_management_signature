import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enum/user-role.enum';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  const mockExecutionContext = (authHeader?: string): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authHeader,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when token is valid', async () => {
      const mockPayload: JwtPayload = {
        sub: 123,
        email: 'test@test.com',
        role: UserRole.SUPERVISOR,
        iat: 1234567890,
        exp: 1234567890,
      };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);
      const context = mockExecutionContext('Bearer validtoken123');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validtoken123');
    });

    it('should throw UnauthorizedException when no authorization header', async () => {
      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Authorization header not found')
      );
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      const context = mockExecutionContext('Bearer');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Token not provided')
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      const context = mockExecutionContext('Bearer invalidtoken');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Token not verified')
      );
    });

    it('should throw UnauthorizedException when authorization type is not Bearer', async () => {
      const context = mockExecutionContext('Basic dGVzdDp0ZXN0');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Token not provided')
      );
    });

    it('should add user to request when token is valid', async () => {
      const mockPayload: JwtPayload = {
        sub: 123,
        email: 'test@test.com',
        role: UserRole.SUPERVISOR,
        iat: 1234567890,
        exp: 1234567890,
      };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);
      
      const mockRequest = {
        headers: { authorization: 'Bearer validtoken123' },
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await guard.canActivate(context);

      expect(mockRequest).toHaveProperty('user', mockPayload);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token correctly from Bearer authorization', () => {
      const mockRequest = {
        headers: { authorization: 'Bearer mytoken123' },
      };

      // Necesitas hacer el método público o usar reflection para testear métodos privados
      const token = guard['extractTokenFromHeader'](mockRequest as any);
      expect(token).toBe('mytoken123');
    });

    it('should return null for invalid authorization format', () => {
      const mockRequest = {
        headers: { authorization: 'Basic dGVzdA==' },
      };

      const token = guard['extractTokenFromHeader'](mockRequest as any);
      expect(token).toBeNull();
    });

    it('should throw when no authorization header', () => {
      const mockRequest = { headers: {} };

      expect(() => guard['extractTokenFromHeader'](mockRequest as any))
        .toThrow(new UnauthorizedException('Authorization header not found'));
    });
  });
});