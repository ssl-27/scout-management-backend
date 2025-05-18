// src/modules/notices/notices.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';
import { Notice } from '../../entities/notices/notice.entity';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { EmailService } from '../email/email.service';
import { ScoutNotice } from '../../entities/notices/scout-notice.entity';
import { NoticeScraperController } from './notice-scraper.controller';
import { NoticeScraperService } from './notice-scraper.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DeviceTokenService } from '../notifications/device-token.service';
import { DeviceToken } from '../../entities/notifications/device-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notice,BaseUserEntity,ScoutNotice, DeviceToken])],
  controllers: [NoticesController, NoticeScraperController],
  providers: [NoticesService,EmailService, NoticeScraperService,NotificationsService, DeviceTokenService],
})
export class NoticesModule {}