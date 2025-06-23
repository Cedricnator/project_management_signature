import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enum/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: 'User password',
    example: 'strongpassword123',
  })
  password: string;

  @IsEmail()
  @ApiProperty({
    description: 'User email address',
    example: 'email@example.com',
  })
  email: string;
  @IsString()
  @ApiProperty({
    description: 'User role',
    example: 'USER',
    default: UserRole.USER,
  })
  role: UserRole = UserRole.USER;
}
