import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { UserRole } from '../common/enum/user-role.enum';
import { Role } from '../common/decorators/role.decorator';
import { RoleGuard } from '../security/guards/role.guard';
import { UpdateUserRoleDto } from './dto/update-rol.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.create(createUserDto);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard, RoleGuard)
  getUserByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get()
  @Role(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiResponse({
    status: 200,
    description: 'Returns all users',
    type: [UserResponseDto],
  })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Patch('change-role')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(UserRole.ADMIN)
  async updateUserRole(
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.usersService.updateRole(dto.email, dto.newRole, user);
    return { message: `User role updated to ${dto.newRole}` };
  }

  @Delete('email/:email')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role(UserRole.ADMIN)
  @HttpCode(204)
  deleteUser(@Param('email') email: string) {
    return this.usersService.deleteByEmail(email);
  }
}
