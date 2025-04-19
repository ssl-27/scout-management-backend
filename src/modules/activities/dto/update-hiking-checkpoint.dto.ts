// src/modules/activities/dto/update-hiking-checkpoint.dto.ts
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';

export class UpdateHikingCheckpointDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  sequenceNumber?: number;

  @IsOptional()
  @IsDateString()
  plannedDepartureTime?: string;

  @IsOptional()
  @IsDateString()
  actualDepartureTime?: string;

  @IsOptional()
  @IsDateString()
  plannedArrivalTime?: string;

  @IsOptional()
  @IsDateString()
  actualArrivalTime?: string;

  @IsOptional()
  @IsNumber()
  restTimeMinutes?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isCheckedIn?: boolean;

  @IsOptional()
  @IsBoolean()
  isCheckedOut?: boolean;
}

