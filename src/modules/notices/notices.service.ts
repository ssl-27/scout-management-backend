// src/modules/notices/notices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { Notice } from '../../entities/notices/notice.entity';
import { EmailService } from '../email/email.service';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { UserTypeEnum } from '../../common/enum/user-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { DeviceTokenService } from '../notifications/device-token.service';

@Injectable()
export class NoticesService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
    @InjectRepository(BaseUserEntity)
    private baseUserRepository: Repository<BaseUserEntity>,
    private configService: ConfigService,
    private emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateNoticeContent(dto: CreateNoticeDto): Promise<string> {
    try {
      const prompt = `
        Create a scout notice with the following details:
        Title: ${dto.title}
        Type: ${dto.noticeType}
        Date: ${dto.sendDate}
        Additional context: ${dto.aiPrompt || 'No additional context provided'}
        
        The notice should be formatted appropriately for scouts and their parents, 
        include all necessary information, and have professional tone.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an assistant that creates professional notices for a local Hong Kong Scout Group." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
      });

      return response.choices[0].message.content || 'Failed to generate content.';
    } catch (error) {
      console.error('Error generating notice content:', error);
      throw new Error('Failed to generate notice content');
    }
  }

  async create(createNoticeDto: CreateNoticeDto, userId: string): Promise<Notice> {
    const notice = this.noticeRepository.create({
      ...createNoticeDto,
      createdBy: { id: userId } as any,
    });

    const userTokens = await this.deviceTokenService.getTokensByUserTypes([
      UserTypeEnum.MEMBER,
      UserTypeEnum.GUARDIAN,
    ]);

    try {
      // Get device tokens for members and guardians
      console.log('Getting device tokens for members and guardians...');
      const userTokens = await this.deviceTokenService.getTokensByUserTypes([
        UserTypeEnum.MEMBER,
        UserTypeEnum.GUARDIAN,
      ]);
      console.log(`Found ${userTokens.length} device tokens`);

      // Send notification if there are tokens
      if (userTokens.length > 0) {
        console.log('Sending notification to tokens:', userTokens);
        const result = await this.notificationsService.sendNotification(
          userTokens,
          'New Notice: ' + notice.title,
          notice.content.substring(0, 100) + '...',
          {
            type: 'notice',
            noticeId: notice.id
          },
        );
        console.log('Notification result:', result);
      } else {
        console.log('No device tokens found, skipping notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    return this.noticeRepository.save(notice);
  }

  async findAll(): Promise<Notice[]> {
    return this.noticeRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notice> {
    return this.noticeRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  async update(id: string, updateNoticeDto: Partial<CreateNoticeDto>): Promise<Notice> {
    await this.noticeRepository.update(id, updateNoticeDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.noticeRepository.delete(id);
  }

  // src/modules/notices/notices.service.ts (add this method)

  async sendNotice(noticeId: string): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id: noticeId },
      relations: ['createdBy'],
    });

    if (!notice) {
      throw new NotFoundException('Notice not found');
    }

    // Get recipients based on notice type
    const recipients = await this.getUserEmailsByRole();

    // Send email to all recipients
    for (const email of recipients) {
      try {
        await this.emailService.sendEmail(
          email,
          notice.title,
          notice.content,
        );
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
      }
    }

    // Mark as sent
    notice.isSent = true;
    return this.noticeRepository.save(notice);
  }

  private async getUserEmailsByRole(): Promise<string[]> {
    // Implement logic to get all member and parent emails
    // This would involve querying your user repository
    const users = await this.baseUserRepository.find({
      where: [
        { role: UserTypeEnum.MEMBER },
        { role: UserTypeEnum.GUARDIAN },
      ],
    });

    return users.map(user => user.email);
  }


}