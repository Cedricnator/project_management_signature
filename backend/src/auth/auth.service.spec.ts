import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockUsersService = {
      findOneByEmail: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    it('should authenticate user successfully', async () => {
      const authInput = { email: 'test@example.com', password: 'password123' };
      const user = { id: '1', email: 'test@example.com', role: 'USER' };
      const authResult = {
        email: 'test@example.com',
        role: 'USER',
        token: 'jwt-token',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersService.findOneByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'USER',
      } as any);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.authenticate(authInput);

      expect(result).toEqual(authResult);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: '1',
        email: 'test@example.com',
        role: 'USER',
      });
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      const authInput = {
        email: 'invalid@example.com',
        password: 'password123',
      };

      usersService.findOneByEmail.mockResolvedValue(null);

      await expect(service.authenticate(authInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const authInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      usersService.findOneByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'USER',
      } as any);

      await expect(service.authenticate(authInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid credentials', async () => {
      const authInput = { email: 'test@example.com', password: 'password123' };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersService.findOneByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'USER',
      } as any);

      const result = await service.validateUser(authInput);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'USER',
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const authInput = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      usersService.findOneByEmail.mockResolvedValue(null);

      await expect(service.validateUser(authInput)).rejects.toThrow(
        'Invalid email',
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const authInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      usersService.findOneByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'USER',
      } as any);

      await expect(service.validateUser(authInput)).rejects.toThrow(
        'Invalid password',
      );
    });
  });

  describe('signIn', () => {
    it('should return auth result with token', async () => {
      const user = { id: '1', email: 'test@example.com', role: 'USER' };
      const expectedResult = {
        email: 'test@example.com',
        role: 'USER',
        token: 'jwt-token',
      };

      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.signIn(user);

      expect(result).toEqual(expectedResult);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: '1',
        email: 'test@example.com',
        role: 'USER',
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify and return payload for valid token', () => {
      const token = 'valid-jwt-token';
      const secret = 'test-secret';
      const payload = { id: '1', email: 'test@example.com', role: 'USER' };

      configService.get.mockReturnValue(secret);
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const result = service.verifyToken(token);

      expect(result).toEqual(payload);
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwt.verify).toHaveBeenCalledWith(token, secret);
    });

    it('should throw UnauthorizedException when JWT_SECRET is not configured', () => {
      configService.get.mockReturnValue(null);

      expect(() => service.verifyToken('token')).toThrow(
        'JWT_SECRET not configured',
      );
    });

    it('should throw UnauthorizedException for invalid token', () => {
      const secret = 'test-secret';

      configService.get.mockReturnValue(secret);
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyToken('invalid-token')).toThrow(
        'Token inválido o expirado',
      );
    });
  });
});
