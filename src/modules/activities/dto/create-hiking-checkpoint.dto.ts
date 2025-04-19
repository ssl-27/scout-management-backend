import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHikingCheckpointDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  sequenceNumber: number;

  @IsOptional()
  @IsDateString()
  plannedDepartureTime?: string;

  @IsOptional()
  @IsDateString()
  plannedArrivalTime?: string;

  @IsOptional()
  @IsNumber()
  restTimeMinutes?: number;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}