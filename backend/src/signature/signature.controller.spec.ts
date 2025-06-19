import { Test, TestingModule } from '@nestjs/testing';
import { SignatureController } from './signature.controller';
import { SignatureService } from './signature.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RoleGuard } from '../security/guards/role.guard';

describe('SignatureController', () => {
  let controller: SignatureController;
  const mockGuard = {
    canActivate: jest.fn(() => true), // siempre deja pasar
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignatureController],
      providers: [
        {
          provide: SignatureService,
          useValue: {
            createSignature: jest.fn(),
            getSignature: jest.fn(),
            updateSignature: jest.fn(),
            deleteSignature: jest.fn(),
            listSignatures: jest.fn(),
            getSignatureHistory: jest.fn(),
            getStatusTypes: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RoleGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<SignatureController>(SignatureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
