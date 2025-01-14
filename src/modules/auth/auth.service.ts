import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from '../../entities/otp/otp.entity';
import { Repository } from 'typeorm';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { Leader } from '../../entities/user-groups/leader.entity';
import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';
import { Guardian } from '../../entities/user-groups/guardian.entity';
import { Scout } from '../../entities/user-groups/scout.entity';
import { UserTypeEnum } from '../../common/enum/user-type.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,

    @InjectRepository(BaseUserEntity)
    private baseUserRepository: Repository<BaseUserEntity>,

    @InjectRepository(Leader)
    private leaderRepository: Repository<Leader>,

    @InjectRepository(Guardian)
    private guardianRepository: Repository<Guardian>,

    @InjectRepository(Scout)
    private scoutRepository: Repository<Scout>,

    @InjectRepository(ScoutMember)
    private scoutMemberRepository: Repository<ScoutMember>,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}


  //TODO: hash otp
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
      where: { email: dto.email, otp: dto.otp, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord || otpRecord.expiryDate < new Date()) {
      throw new UnauthorizedException('Invalid OTP or OTP expired');
    }

    otpRecord.isUsed = true;
    await this.otpRepository.save(otpRecord);

    const user = await this.baseUserRepository.findOne({
      where: { email: dto.email },
    });

    const payload = { email: user.email, sub: user.id, group: user.role };

    switch (user.role) {
      case UserTypeEnum.LEADER: {
        const leader = await this.leaderRepository.findOne({ where: { id: user.id } });
        payload['role'] = leader.leaderRank;
        payload['division'] = leader.division;
        break;
      }

      case UserTypeEnum.GUARDIAN: {
        const guardian = await this.guardianRepository.findOne({ where: { id: user.id } });
        payload['relationship'] = guardian.relationship;
        break;
      }

      case UserTypeEnum.MEMBER: {
        const scout = await this.scoutRepository.findOne({ where: { id: user.id } });
        const scoutMember = await this.scoutMemberRepository.findOne({ where: { id: user.id } });
        payload['section'] = scout.section;
        payload['rank'] = scoutMember.scoutSectionRank;
        payload['patrol'] = scoutMember.patrol;
        break;
      }
    }



        return {
          access_token: await this.jwtService.signAsync(payload),
        };
    }
}

