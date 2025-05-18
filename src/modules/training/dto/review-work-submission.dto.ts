import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewWorkSubmissionDto {
  @IsNotEmpty()
  @IsEnum(['Approved', 'Rejected'])
  status: 'Approved' | 'Rejected';

  @IsOptional()
  @IsString()
  feedback?: string;
}