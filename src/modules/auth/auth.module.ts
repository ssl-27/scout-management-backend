import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from '../../entities/otp/otp.entity';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Leader } from '../../entities/user-groups/leader.entity';
import { Guardian } from '../../entities/user-groups/guardian.entity';
import { Scout } from '../../entities/user-groups/scout.entity';
import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpEntity, BaseUserEntity, Leader, Guardian, Scout, ScoutMember]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}