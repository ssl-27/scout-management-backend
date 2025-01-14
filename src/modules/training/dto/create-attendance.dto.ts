// src/dto/create-attendance.dto.ts
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsDateString()
  meetingDate: Date;

  @IsNotEmpty()
  @IsEnum(['Present', 'Absent', 'Excused', 'Late'])
  attendance: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsUUID()
  scoutId: string;

  @IsNotEmpty()
  @IsUUID()
  meetingId: string;


}