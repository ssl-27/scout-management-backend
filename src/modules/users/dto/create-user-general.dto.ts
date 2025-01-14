import { IsDate, IsEmail, IsEnum, IsString } from 'class-validator';
import { LeaderRankEnum } from '../../../common/enum/leader-rank.enum';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { CreateLeaderDto } from './create-leader.dto';
import { CreateMemberDto } from './create-member.dto';
import { CreateGuardianDto } from './create-guardian.dto';
import { GenderEnum } from '../../../common/enum/gender.enum';


export class CreateUserGeneralDto {
  //general items
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  preferredName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  chineseName?: string;

  @IsEnum(UserTypeEnum)
  role: UserTypeEnum;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsString()
  status: string

  leaderDetails: CreateLeaderDto;

  memberDetails: CreateMemberDto;

  guardianDetails: CreateGuardianDto;
}