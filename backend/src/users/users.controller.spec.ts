import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RoleGuard } from '../security/guards/role.guard';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const mockGuard = {
      canActivate: jest.fn(() => true), // siempre deja pasar
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getUserHistory: jest.fn(),
            getStatusTypes: jest.fn(), // Asegúrate de que este método coincida con el del controller
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
