// src/modules/training/dto/create-badge-details.dto.ts
import { IsEnum, IsNotEmpty, IsString, IsArray, IsUUID, ValidateNested, IsOptional } from 'class-validator';
import { ScoutSectionEnum } from '../../../common/enum/scout-section.enum';
import { Type } from 'class-transformer';
import { CreateAttendanceDto } from './create-attendance.dto';
import { CreateTrainingItemDto } from './create-training-item.dto';
import { BadgeTypeEnum } from '../../../common/enum/badge-type.enum';

export class CreateBadgeDetailsDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(ScoutSectionEnum)
  badgeSection: ScoutSectionEnum;

  @IsEnum(BadgeTypeEnum)
  @IsOptional()
  badgeType: BadgeTypeEnum = BadgeTypeEnum.OTHER;

  @IsArray()
  @IsUUID('4', { each: true })
  trainingItemIds: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingItemDto)
  trainingItems: CreateTrainingItemDto[];

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  prerequisiteBadgeIds: string[];
}