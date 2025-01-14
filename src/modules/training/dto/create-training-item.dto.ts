// src/dto/create-training-item.dto.ts
import { IsEnum, IsNotEmpty, IsString, IsArray, IsUUID } from 'class-validator';
import { ScoutSectionEnum } from '../../../common/enum/scout-section.enum';

export class CreateTrainingItemDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(ScoutSectionEnum)
  badgeSection: ScoutSectionEnum;

  @IsUUID()
  badgeId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  meetingIds: string[];
}