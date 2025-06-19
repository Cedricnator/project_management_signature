import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enum/user-role.enum';

export class UserResponseDto {
  @ApiProperty({
    example: 'Doe',
    description: 'Nombre del usuario',
  })
  firstName: string;

  @ApiProperty({
    example: 'John',
    description: 'Apellido del usuario',
  })
  lastName: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'email',
  })
  email: string;

  @ApiProperty({
    example: 'supervisor',
    description: 'role in the system',
    enum: UserRole, // si aplica
  })
  role: string;
}
