// src/modules/training/dto/create-training-record.dto.ts
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTrainingRecordDto {
  @IsUUID()
  @IsNotEmpty()
  scoutId: string;

  @IsUUID()
  @IsNotEmpty()
  trainingItemId: string;

  @IsDateString()
  @IsNotEmpty()
  dateCompleted: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}