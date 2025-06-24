import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as by from 'bcryptjs';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from '../common/enum/user-role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    
    this.logger.log(`Checking if user with email ${createUserDto.email} exists`);

    if (exists) {
      this.logger.warn(`User with email ${createUserDto.email} already exists`);
      throw new ConflictException('Email already in use');
    }

    // Ensure that the password is hashed before saving
    const user: User = this.usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      password: by.hashSync(createUserDto.password, 10),
      role: createUserDto.role || UserRole.USER,
    });
    const userCreated = await this.usersRepository.save(user);
  
    if (!userCreated) {
      this.logger.error(`Failed to create user with email ${createUserDto.email}`);
      throw new ConflictException('User creation failed');
    }
    this.logger.log(`User with email ${createUserDto.email} created successfully`);
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: userCreated.email,
      role: userCreated.role,
    };
  }

  findOne(id: string) {
    this.logger.log(`Fetching user with ID: ${id}`);
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string) {
    this.logger.log(`Fetching user with email: ${email}`);
    return this.usersRepository.findOneBy({ email });
  }

  async findByEmail(email: string) {
    this.logger.log(`Fetching user details for email: ${email}`);
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
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
    this.logger.log('Fetching all users');
  
    return this.usersRepository
      .find()
      .then((users) => users.map((user) => this.userToUserResponseDto(user)));
  }

  private userToUserResponseDto(user: User): UserResponseDto {
    this.logger.log(`Converting user to UserResponseDto for email: ${user.email}`);
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
    this.logger.log(`Updating role for user with email: ${email} to ${newRole}`);
    if (email === currentUser.email) {
      this.logger.warn(
        `Attempt to change own role by user with email: ${currentUser.email}`,
      );
      throw new BadRequestException(
        'You cannot change your own role. Please contact an administrator.',
      );
    }
    const user: User | null = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (user.role === newRole) {
      this.logger.warn(`User with email ${email} already has role ${newRole}`);
      throw new BadRequestException(`User already has role ${newRole}`);
    }

    user.role = newRole;
    this.logger.log(
      `Role for user with email ${email} updated to ${newRole}`,
    );
    await this.usersRepository.save(user);
  }

  deleteByEmail(email: string): Promise<void> {
    this.logger.log(`Deleting user with email: ${email}`);
    return this.usersRepository
      .delete({ email: email })
      .then(() => {
        this.logger.log(`User with email ${email} deleted successfully`);
        return;
      })
      .catch(() => {
        // Handle any errors that occur during deletion
        this.logger.error(`Failed to delete user with email ${email}`);
        throw new NotFoundException(`User with email ${email} not found`);
      });
  }
}
