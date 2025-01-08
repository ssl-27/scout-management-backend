import { IsDate, IsEnum, IsInt, IsString } from 'class-validator';
import { ScoutSectionEnum } from '../../../common/enum/scout-section.enum';
import { PatrolNamesEnum } from '../../../common/enum/patrol-names.enum';

export class CreateScoutMemberDto {
  @IsString()
  id: string;

  @IsEnum(ScoutSectionEnum)
  section: ScoutSectionEnum;

  @IsEnum(PatrolNamesEnum)
  patrol: PatrolNamesEnum;

  @IsDate()
  standardAwardDate: Date;

  @IsDate()
  advancedAwardDate: Date;

  @IsDate()
  chiefsScoutAwardDate: Date;

  @IsString()
  schoolClass: string;

  @IsInt()
  classNumber: number;
}