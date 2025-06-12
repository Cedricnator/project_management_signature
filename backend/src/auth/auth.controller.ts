import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthentificationInput } from './dto/auth-input-auth.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from 'jsonwebtoken';
import { ApiBearerAuth, ApiProperty, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  create(@Body() input: AuthentificationInput) {
    return this.authService.authenticate(input);
  }

  @ApiProperty({ title: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Created User' })
  @ApiResponse({ status: 401, description: 'Invalid Credentials' })
  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiResponse({ status: 200, description: 'Returns the current user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 401, description: 'token no provided or invalid' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
