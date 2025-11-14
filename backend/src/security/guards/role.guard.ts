import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common/enum/user-role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole: UserRole = this.reflector.getAllAndOverride('role', [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === UserRole.ADMIN) {
      return true;
    }
    if (!requiredRole) {
      return true; // No role required, allow access
    }
    if (requiredRole === UserRole.SUPERVISOR) {
      return user.role === UserRole.SUPERVISOR;
    }

    if (user.role === UserRole.USER) {
      return false;
    }
    return false;
  }
}
