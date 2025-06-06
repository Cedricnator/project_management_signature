import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../common/enum/user-role.enum';
import { Role } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../common/guard/role.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Role(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
}
