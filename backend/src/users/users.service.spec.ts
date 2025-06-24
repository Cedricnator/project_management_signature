import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserRole } from '../common/enum/user-role.enum';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUserDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    password: 'plainPassword123',
    role: UserRole.USER,
  };

  const mockCurrentUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Mock logger methods
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

  describe('create', () => {
    it('should create a new user successfully', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser as User);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser as User);
      mockedBcrypt.hashSync.mockReturnValue('hashedPassword123');

      const result = await service.create(mockCreateUserDto);

      expect(result).toEqual({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(mockedBcrypt.hashSync).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
    });

    it('should throw ConflictException when email already exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser as User);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        new ConflictException('Email already in use'),
      );
    });
  });

  describe('findOne', () => {
    it('should find user by id', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockUser as User);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockUser.id });
    });
  });

  describe('findOneByEmail', () => {
    it('should find user by email', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockUser as User);

      const result = await service.findOneByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({ email: mockUser.email });
    });
  });

  describe('findByEmail', () => {
    it('should return user details when user exists', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockUser as User);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        new NotFoundException('User with email nonexistent@example.com not found'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all users as UserResponseDto array', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-456', email: 'test2@example.com' }];
      jest.spyOn(repository, 'find').mockResolvedValue(users as User[]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('deleteByEmail', () => {
    it('should delete user successfully', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: {} });

      await expect(service.deleteByEmail(mockUser.email)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith({ email: mockUser.email });
    });

    it('should throw NotFoundException when deletion fails', async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteByEmail('nonexistent@example.com')).rejects.toThrow(
        new NotFoundException('User with email nonexistent@example.com not found'),
      );
    });
  });
});