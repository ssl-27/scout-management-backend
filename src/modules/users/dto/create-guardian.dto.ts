import { IsEnum, IsString } from 'class-validator';
import { GuardianRelationshipEnum } from '../../../common/enum/guardian-relationship.enum';

export class CreateGuardianDto {
  @IsString()
  id: string;

  @IsString()
  memberId: string;

  @IsEnum(GuardianRelationshipEnum)
  relationship: GuardianRelationshipEnum;

}