import { IsDate, IsEnum, IsString } from 'class-validator';
import { ScoutSectionEnum } from '../../../common/enum/scout-section.enum';
import { CreateScoutMemberDto } from './create-scout-member.dto';

export class CreateMemberDto {
  @IsString()
  id: string;

  @IsString()
  ymisId: string;

  @IsDate()
  dateOfBirth: Date;

  @IsEnum(ScoutSectionEnum)
  section: ScoutSectionEnum;

  @IsDate()
  investitureDate: Date;

  @IsDate()
  dateJoined: Date;

  scoutSectionDetails: CreateScoutMemberDto
}