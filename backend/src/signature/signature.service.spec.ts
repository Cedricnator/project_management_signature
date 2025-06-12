import { Test, TestingModule } from '@nestjs/testing';
import { SignatureService } from './signature.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SignDocument } from './entities/account-document.entity';
import { User } from '../users/entities/user.entity';
import { FilesService } from '../files/files.service';

describe('SignatureService', () => {
  let service: SignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureService,
        {
          provide: getRepositoryToken(SignDocument),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: FilesService,
          useValue: {
            findOne: jest.fn(),
            verifyFileIntegrity: jest.fn(),
            changeFileStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SignatureService>(SignatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
