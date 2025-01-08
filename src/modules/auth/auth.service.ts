import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from '../../entities/otp/otp.entity';
import { Repository } from 'typeorm';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,

    @InjectRepository(BaseUserEntity)
    private baseUserRepository: Repository<BaseUserEntity>,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async requestOtp(dto: RequestOtpDto) {
    const user = await this.baseUserRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = this.emailService.generateOtp();

    const otpEntity = this.otpRepository.create({
      otp,
      email: dto.email,
      expiryDate: new Date(Date.now() + 600000),
    });
    await this.otpRepository.save(otpEntity);

    await this.emailService.sendOtp(dto.email, otp);
    return { message: 'OTP sent' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otpRecord = await this.otpRepository.findOne({
      where: { email: dto.email, otp: dto.otp,  isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord ||  otpRecord.expiryDate < new Date()) {
      throw new UnauthorizedException('Invalid OTP or OTP expired');
    }

    otpRecord.isUsed = true;
    await this.otpRepository.save(otpRecord);

    const user = await this.baseUserRepository.findOne({
      where: { email: dto.email },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    }
  }
}

