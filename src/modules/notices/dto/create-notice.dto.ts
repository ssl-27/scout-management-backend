import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoticeDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsDate()
  sendDate: Date;

  @IsOptional()
  @IsString()
  sendTime?: string;

  @IsEnum(['Meeting', 'Event', 'Announcement', 'Other'])
  noticeType: string;

  @IsOptional()
  @IsString()
  aiPrompt?: string; // Additional context for the AI
}