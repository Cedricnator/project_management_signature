import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../common/enum/user-role.enum';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
  };

  const mockAuthInput = {
    email: 'test@example.com',
    password: 'plainPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Mock logger methods to avoid console output
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    it('should authenticate user successfully', async () => {
      const mockToken = 'jwt.token.here';
      
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockToken);

      const result = await service.authenticate(mockAuthInput);

      expect(result).toEqual({
        email: mockUser.email,
        role: mockUser.role,
        token: mockToken,
      });
    });

    it('should throw UnauthorizedException when user validation fails', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      await expect(service.authenticate(mockAuthInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(mockAuthInput);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      await expect(service.validateUser(mockAuthInput)).rejects.toThrow(
        new UnauthorizedException('Invalid email'),
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.validateUser(mockAuthInput)).rejects.toThrow(
        new UnauthorizedException('Invalid password'),
      );
    });
  });

  describe('signIn', () => {
    it('should generate JWT token for user', async () => {
      const mockToken = 'jwt.token.here';
      const mockSignInUser = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockToken);

      const result = await service.signIn(mockSignInUser);

      expect(result).toEqual({
        email: mockUser.email,
        role: mockUser.role,
        token: mockToken,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('verifyToken', () => {
    const mockSecret = 'test-jwt-secret';
    const mockToken = 'valid.jwt.token';
    const mockPayload = {
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    };

    beforeEach(() => {
      jest.spyOn(configService, 'get').mockReturnValue(mockSecret);
    });

    it('should verify valid token successfully', () => {
      // Mock jwt.verify to return valid payload
      const jwtVerifySpy = jest.spyOn(require('jsonwebtoken'), 'verify')
        .mockReturnValue(mockPayload);

      const result = service.verifyToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwtVerifySpy).toHaveBeenCalledWith(mockToken, mockSecret);
    });

    it('should throw UnauthorizedException when JWT_SECRET not configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      expect(() => service.verifyToken(mockToken)).toThrow(
        new UnauthorizedException('JWT_SECRET not configured'),
      );
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      jest.spyOn(require('jsonwebtoken'), 'verify')
        .mockImplementation(() => {
          throw new Error('Invalid token');
        });

      expect(() => service.verifyToken('invalid.token')).toThrow(
        new UnauthorizedException('Invalid token or expired'),
      );
    });

    it('should throw UnauthorizedException when token is expired', () => {
      jest.spyOn(require('jsonwebtoken'), 'verify')
        .mockImplementation(() => {
          throw new Error('jwt expired');
        });

      expect(() => service.verifyToken('expired.token')).toThrow(
        new UnauthorizedException('Invalid token or expired'),
      );
    });
  });
});