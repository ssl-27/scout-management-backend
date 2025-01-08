// create-leader.dto.ts
import { IsDate, IsEmail, IsEnum, IsString } from 'class-validator';
import { LeaderRankEnum } from '../../../common/enum/leader-rank.enum';


export class CreateLeaderDto {
  @IsString()
  id: string;

  @IsDate()
  warrantExpiryDate: Date;

  @IsEnum(LeaderRankEnum)
  rank: LeaderRankEnum;

  @IsString()
  division: string;
}