import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RoleGuard } from '../security/guards/role.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../common/enum/user-role.enum';
import { UpdateUserRoleDto } from './dto/update-rol.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockGuard = {
    canActivate: jest.fn(() => true), // siempre deja pasar
  };

  const mockCurrentUser: JwtPayload = {
    sub: 123,
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      updateRole: jest.fn(),
      deleteByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      const expectedResult = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: UserRole.USER,
      };

      usersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const email = 'john@example.com';
      const expectedResult = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: UserRole.USER,
      };

      usersService.findByEmail.mockResolvedValue(expectedResult);

      const result = await controller.getUserByEmail(email);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedResult = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: UserRole.USER,
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: UserRole.ADMIN,
        },
      ];

      usersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const updateRoleDto: UpdateUserRoleDto = {
        email: 'john@example.com',
        newRole: UserRole.SUPERVISOR,
      };

      const expectedResult = {
        message: `User role updated to ${UserRole.SUPERVISOR}`,
      };

      usersService.updateRole.mockResolvedValue(undefined);

      const result = await controller.updateUserRole(
        updateRoleDto,
        mockCurrentUser,
      );

      expect(usersService.updateRole).toHaveBeenCalledWith(
        updateRoleDto.email,
        updateRoleDto.newRole,
        mockCurrentUser,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteUser', () => {
    it('should delete user by email', async () => {
      const email = 'john@example.com';

      usersService.deleteByEmail.mockResolvedValue(undefined);

      const result = await controller.deleteUser(email);

      expect(usersService.deleteByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeUndefined();
    });
  });
});
