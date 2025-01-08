import { IsEnum, IsString } from 'class-validator';
import { GuardianRelationshipEnum } from '../../../common/enum/guardian-relationship.enum';

export class CreateGuardianDto {
  @IsString()
  id: string;

  @IsEnum(GuardianRelationshipEnum)
  relationship: GuardianRelationshipEnum;

}