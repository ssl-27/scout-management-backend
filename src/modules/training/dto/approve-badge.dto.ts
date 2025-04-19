// src/modules/training/dto/approve-badge.dto.ts

import { IsUUID, IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class ApproveBadgeDto {
  @IsUUID()
  @IsNotEmpty()
  scoutId: string;

  @IsUUID()
  @IsNotEmpty()
  badgeId: string;

  @IsDateString()
  @IsNotEmpty()
  completionDate: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}