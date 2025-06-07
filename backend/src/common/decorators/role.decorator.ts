import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enum/user-role.enum';

export const Role = (role: UserRole) => SetMetadata('role', role);
