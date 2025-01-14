import { UserTypeEnum } from '../../common/enum/user-type.enum';
import { GuardianRelationshipEnum } from '../../common/enum/guardian-relationship.enum';
import { LeaderRankEnum } from '../../common/enum/leader-rank.enum';
import { ScoutSectionEnum } from '../../common/enum/scout-section.enum';
import { ScoutSectionRankEnum } from '../../common/enum/scout-section-rank.enum';

export interface UserRolesInterface {
  group: UserTypeEnum;
  role: GuardianRelationshipEnum | LeaderRankEnum | ScoutSectionEnum | ScoutSectionRankEnum
}