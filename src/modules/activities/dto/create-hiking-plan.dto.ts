import { IsArray, IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateHikingCheckpointDto } from './create-hiking-checkpoint.dto';

export class CreateHikingPlanDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  startDateTime: string;

  @IsNotEmpty()
  @IsDateString()
  endDateTime: string;

  @IsNotEmpty()
  @IsUUID()
  supervisorId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];

  @IsOptional()
  @IsBoolean()
  isAssessmentPassed: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHikingCheckpointDto)
  checkpoints: CreateHikingCheckpointDto[];
}