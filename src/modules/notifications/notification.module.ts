// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { DeviceTokenService } from './device-token.service';
import { NotificationsController } from './notifications.controller';
import { ConfigModule } from '@nestjs/config';
import { DeviceToken } from '../../entities/notifications/device-token.entity';
import { BaseUserEntity } from '../../entities/base/base-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceToken, BaseUserEntity]),
    ConfigModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, DeviceTokenService],
  exports: [NotificationsService, DeviceTokenService],
})
export class NotificationsModule {}