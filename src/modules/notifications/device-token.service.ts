// src/notifications/device-token.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { DeviceToken } from '../../entities/notifications/device-token.entity';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { UserTypeEnum } from '../../common/enum/user-type.enum';
@Injectable()
export class DeviceTokenService {
  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,

    @InjectRepository(BaseUserEntity)
    private userRepository: Repository<BaseUserEntity>,
  ) {}

  async saveToken(userId: string, token: string, platform: string): Promise<DeviceToken> {
    // Check if token already exists for this user
    let deviceToken = await this.deviceTokenRepository.findOne({
      where: {
        token,
        user: { id: userId }
      },
    });

    if (deviceToken) {
      // Update last used timestamp
      deviceToken.lastUsed = new Date();
      return this.deviceTokenRepository.save(deviceToken);
    } else {
      // Create new token
      deviceToken = this.deviceTokenRepository.create({
        token,
        platform,
        user: { id: userId },
        lastUsed: new Date(),
      });
      return this.deviceTokenRepository.save(deviceToken);
    }
  }

  async removeToken(userId: string, token: string): Promise<void> {
    await this.deviceTokenRepository.delete({
      token,
      user: { id: userId },
    });
  }

  async getTokensByUserId(userId: string): Promise<string[]> {
    const deviceTokens = await this.deviceTokenRepository.find({
      where: { user: { id: userId } },
    });
    return deviceTokens.map(dt => dt.token);
  }

  async getTokensByUserIds(userIds: string[]): Promise<string[]> {
    const deviceTokens = await this.deviceTokenRepository.find({
      where: { user: { id: In(userIds) } },
    });
    return deviceTokens.map(dt => dt.token);
  }

  async getTokensByUserTypes(userTypes: UserTypeEnum[]): Promise<string[]> {
    // First get users with these types
    const users = await this.userRepository.find({
      where: { role: In(userTypes) },
      select: ['id']
    });

    const userIds = users.map(user => user.id);

    // Then get tokens for these users
    return this.getTokensByUserIds(userIds);
  }

  async cleanupOldTokens(daysOld: number = 60): Promise<number> {
    // Remove tokens not used in the last X days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deviceTokenRepository.delete({
      lastUsed: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }
}