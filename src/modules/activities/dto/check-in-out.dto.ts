import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CheckInOutDto {
  @IsNotEmpty()
  @IsUUID()
  checkpointId: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;
}