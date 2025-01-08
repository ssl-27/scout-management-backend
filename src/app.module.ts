import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserGeneralModule } from './modules/users/modules/user-general.module';
//import { LeaderModule } from './modules/users/modules/leader.module';

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
    // LeaderModule,
    UserGeneralModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
