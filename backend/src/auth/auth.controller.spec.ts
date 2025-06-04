import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthentificationInput } from './dto/auth-input-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    autenticate: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        JwtAuthGuard,
        ConfigService,
      ],
    }).compile();

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

    mockAuthService.autenticate.mockResolvedValue(expectedResponse);

    const result = await controller.create(input);

    expect(mockAuthService.autenticate).toHaveBeenCalledWith(input);
    expect(result).toEqual(expectedResponse);
  });

  it('should return user payload from /me', () => {
    const user = { id: 1, username: 'admin' };
    const result = controller.me(user);
    expect(result).toBe(user);
  });
});
