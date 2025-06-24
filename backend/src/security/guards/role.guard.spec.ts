import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';
import { UserRole } from '../../common/enum/user-role.enum';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockExecutionContext = (user: any, requiredRole?: UserRole): ExecutionContext => {
    const mockRequest = { user };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    // Mock del reflector para devolver el rol requerido
    reflector.getAllAndOverride.mockReturnValue(requiredRole);

    return context;
  };

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access for ADMIN users regardless of required role', () => {
      const adminUser = { role: UserRole.ADMIN };
      const context = mockExecutionContext(adminUser, UserRole.SUPERVISOR);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when no role is required', () => {
      const regularUser = { role: UserRole.USER };
      const context = mockExecutionContext(regularUser, undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow SUPERVISOR when SUPERVISOR role is required', () => {
      const supervisorUser = { role: UserRole.SUPERVISOR };
      const context = mockExecutionContext(supervisorUser, UserRole.SUPERVISOR);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny SUPERVISOR when role is required but user is not SUPERVISOR', () => {
      const regularUser = { role: UserRole.USER };
      const context = mockExecutionContext(regularUser, UserRole.SUPERVISOR);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access for USER role when any role is required', () => {
      const regularUser = { role: UserRole.USER };
      const context = mockExecutionContext(regularUser, UserRole.SUPERVISOR);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should call reflector with correct parameters', () => {
      const user = { role: UserRole.ADMIN };
      const context = mockExecutionContext(user, UserRole.SUPERVISOR);

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('role', [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should return false for undefined user role with required role', () => {
      const userWithoutRole = { role: undefined };
      const context = mockExecutionContext(userWithoutRole, UserRole.SUPERVISOR);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should handle edge case where user is missing from request', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: undefined }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      reflector.getAllAndOverride.mockReturnValue(UserRole.SUPERVISOR);

      expect(() => guard.canActivate(context)).toThrow();
    });
  });

  describe('Role hierarchy tests', () => {
    it('should allow ADMIN to access SUPERVISOR-only endpoints', () => {
      const adminUser = { role: UserRole.ADMIN };
      const context = mockExecutionContext(adminUser, UserRole.SUPERVISOR);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny USER access to SUPERVISOR-only endpoints', () => {
      const regularUser = { role: UserRole.USER };
      const context = mockExecutionContext(regularUser, UserRole.SUPERVISOR);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow access to public endpoints (no role required)', () => {
      const testCases = [
        { role: UserRole.ADMIN },
        { role: UserRole.SUPERVISOR },
        { role: UserRole.USER },
      ];

      testCases.forEach(user => {
        const context = mockExecutionContext(user, undefined);
        const result = guard.canActivate(context);
        expect(result).toBe(true);
      });
    });
  });
});