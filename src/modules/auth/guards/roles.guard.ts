import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequiredRole, ROLES_KEY } from '../../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RequiredRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // This comes from your JWT strategy

    // Check if user has any of the required roles
    return requiredRoles.some(required => {
      if (required.group !== user.group) return false;
      if (!required.roles || required.roles.length === 0) return true;
      return required.roles.includes(user.role);
    });
  }
}