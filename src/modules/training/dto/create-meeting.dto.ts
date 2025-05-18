import { IsBoolean, IsDateString, IsNotEmpty, IsString, IsArray, IsUUID } from 'class-validator';

export class CreateMeetingDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsDateString()
  meetingDateStart: Date;

  @IsNotEmpty()
  @IsDateString()
  meetingDateEnd: Date;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsBoolean()
  isMeetingCompleted: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  requirementIds: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  proficiencyBadgeIds: string[];
}