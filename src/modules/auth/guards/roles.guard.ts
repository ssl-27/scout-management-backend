import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequiredRole, ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { UserRolesInterface } from '../user-roles.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RequiredRole[]>(ROLES_KEY, [context.getHandler()]);


    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    const userRoles: UserRolesInterface = user.roles;

    return requiredRoles.some(required => {
      // Check if user is in the required group
      if (required.group !== userRoles.group) {
        return false;
      }

      // If no specific roles are required, any role in the group is fine
      if (!required.roles || required.roles.length === 0) {
        return true;
      }
      return requiredRoles.some((role) => user.roles?.includes(role));
    });
  }
}