import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserGeneralModule } from './modules/users/modules/user-general.module';
import { TrainingModule } from './modules/training/training.module';
// import { SeedModule } from './database/seeds/seed.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { NoticesModule } from './modules/notices/notices.module';
import { BadgeModule } from './modules/badge/badge.module';
import { CommandsModule } from './commands/commands.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { NotificationsModule } from './modules/notifications/notification.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    AuthModule,
    UserGeneralModule,
    TrainingModule,
    // SeedModule,
    FileUploadModule,
    NoticesModule,
    BadgeModule,
    CommandsModule,
    ActivitiesModule,
    NotificationsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
