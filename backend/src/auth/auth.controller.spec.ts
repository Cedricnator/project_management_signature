import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthentificationInput } from './dto/auth-input-auth.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../common/enum/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    authenticate: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };
  const mockGuard = {
    canActivate: jest.fn(() => true), // siempre deja pasar
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        ConfigService,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    module.get<AuthService>(AuthService);
    module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call AuthService.autenticate() on login', async () => {
    const input: AuthentificationInput = { email: 'john', password: '1234' };
    const expectedResponse = { access_token: 'token123' };

    mockAuthService.authenticate.mockResolvedValue(expectedResponse);

    const result = await controller.create(input);

    expect(mockAuthService.authenticate).toHaveBeenCalledWith(input);
    expect(result).toEqual(expectedResponse);
  });

  it('should call UsersService.create() on register', async () => {
    const input = {
      firstName: 'New',
      lastName: 'User',
      email: 'newuser@example.com',
      password: 'password123',
      role: UserRole.USER,
    };
    const expectedResponse = {
      id: '1',
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
    };

    mockUsersService.create.mockResolvedValue(expectedResponse);

    const result = await controller.register(input);

    expect(mockUsersService.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(expectedResponse);
  });

  it('should return user payload from /me', () => {
    const user = { id: 1, username: 'admin' };
    const result = controller.me(user);
    expect(result).toBe(user);
  });
});
