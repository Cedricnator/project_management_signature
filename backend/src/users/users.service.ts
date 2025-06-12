import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as by from 'bcryptjs';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import { SignInAuthDto } from '../auth/dto/sign-in-auth.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from 'src/common/enum/user-role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<SignInAuthDto> {
    const exists = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (exists) {
      throw new ConflictException('Email already in use');
    }

    // Ensure that the password is hashed before saving
    const user: User = this.usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      password: by.hashSync(createUserDto.password, 10), // Hash the password
    });
    const userCreated = await this.usersRepository.save(user);
    if (!userCreated) {
      throw new ConflictException('User creation failed');
    }
    return {
      id: userCreated.id,
      email: userCreated.email,
      role: userCreated.role,
    };
  }

  findOne(id: string) {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    // Fetch all users and map them to UserResponseDto
    return this.usersRepository
      .find()

      .then((users) => users.map((user) => this.userToUserResponseDto(user)));
  }

  private userToUserResponseDto(user: User): UserResponseDto {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }

  async updateRole(
    email: string,
    newRole: UserRole,
    currentUser: JwtPayload,
  ): Promise<void> {
    if (email === currentUser.email) {
      throw new BadRequestException(
        'You cannot change your own role. Please contact an administrator.',
      );
    }
    const user: User | null = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (user.role === newRole) {
      throw new BadRequestException(`User already has role ${newRole}`);
    }

    user.role = newRole;
    await this.usersRepository.save(user);
  }
}
