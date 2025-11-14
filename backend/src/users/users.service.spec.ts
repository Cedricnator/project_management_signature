import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '../common/enum/user-role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    role: UserRole.USER,
    isActive: true,
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const hashedPassword = 'hashedpassword';
      (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hashSync).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
      });
      expect(result).toEqual({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should create user with default role when role not provided', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const hashedPassword = 'hashedpassword';
      (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({
        ...mockUser,
        role: UserRole.USER,
      });
      userRepository.save.mockResolvedValue({
        ...mockUser,
        role: UserRole.USER,
      });

      const result = await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: hashedPassword,
        role: UserRole.USER,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });

    it('should throw ConflictException when user creation fails', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedpassword');

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(undefined as any);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const userId = 'user-123';

      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      const email = 'john@example.com';

      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(email);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return user data by email', async () => {
      const email = 'john@example.com';

      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(result).toEqual({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'nonexistent@example.com';

      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findByEmail(email)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users as UserResponseDto', async () => {
      const users = [mockUser];
      const expectedResponse = [
        {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          role: mockUser.role,
        },
      ];

      userRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('updateRole', () => {
    const currentUser: JwtPayload = {
      sub: 456,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    };

    it('should update user role successfully', async () => {
      const email = 'john@example.com';
      const newRole = UserRole.SUPERVISOR;

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, role: newRole });

      await expect(
        service.updateRole(email, newRole, currentUser),
      ).resolves.toBeUndefined();

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        role: newRole,
      });
    });

    it('should throw BadRequestException when trying to change own role', async () => {
      const email = 'admin@example.com';
      const newRole = UserRole.USER;

      await expect(
        service.updateRole(email, newRole, currentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'nonexistent@example.com';
      const newRole = UserRole.SUPERVISOR;

      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateRole(email, newRole, currentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user already has the role', async () => {
      const email = 'john@example.com';
      const newRole = UserRole.USER;
      const userWithSameRole = { ...mockUser, role: UserRole.USER };

      userRepository.findOne.mockResolvedValue(userWithSameRole);

      await expect(
        service.updateRole(email, newRole, currentUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteByEmail', () => {
    it('should delete user by email successfully', async () => {
      const email = 'john@example.com';

      userRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await expect(service.deleteByEmail(email)).resolves.toBeUndefined();

      expect(userRepository.delete).toHaveBeenCalledWith({ email });
    });

    it('should throw NotFoundException when user not found', async () => {
      const email = 'nonexistent@example.com';

      userRepository.delete.mockRejectedValue(new Error());

      await expect(service.deleteByEmail(email)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
