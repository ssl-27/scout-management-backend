// src/notifications/notifications.controller.ts
import { Controller, Post, Body, UseGuards, Delete, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DeviceTokenService } from './device-token.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('register-token')
  async registerToken(
    @Body() body: { token: string; platform: string },
    @CurrentUser() user,
  ) {
    await this.deviceTokenService.saveToken(
      user.userId,
      body.token,
      body.platform,
    );
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('token/:token')
  async removeToken(@Param('token') token: string, @CurrentUser() user) {
    await this.deviceTokenService.removeToken(user.userId, token);
    return { success: true };
  }
}