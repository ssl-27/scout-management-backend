import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class FileDto {
  @IsString()
  filename: string;

  @IsString()
  originalName: string;

  @IsString()
  url: string;
}

export class CreateWorkSubmissionDto {
  @IsNotEmpty()
  @IsUUID()
  requirementId: string; // Changed from trainingItemId

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  files?: FileDto[];

  @IsOptional()
  @IsString()
  externalUrl?: string;
}