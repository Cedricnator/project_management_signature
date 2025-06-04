import { UserRole } from '../../users/entities/user-role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
