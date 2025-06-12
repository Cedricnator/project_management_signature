// dto/update-role.dto.ts
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../common/enum/user-role.enum';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsNotEmpty({ message: 'New rol is required' })
  newRole: UserRole;
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
