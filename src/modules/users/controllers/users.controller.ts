// src/modules/users/users.controllers.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';


@Controller('users')
@UseGuards(JwtAuthGuard)  // Protect all routes in this controllers
export class UsersController {
  @Get('me')
  getCurrentUser(@CurrentUser() user) {
    return {
      user: user,
      id: user.userId,
      email: user.email,
      // role: user.roles.role,
      // Add any other user info you want to expose
    };
  }

  @Get('roles')
  getUserRoles(@CurrentUser() user) {
    return {
      group: user.roles.group,
      role: user.roles.role
    };
  }
}