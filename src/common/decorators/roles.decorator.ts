import { UserTypeEnum } from '../enum/user-type.enum';
import { GuardianRelationshipEnum } from '../enum/guardian-relationship.enum';
import { LeaderRankEnum } from '../enum/leader-rank.enum';
import { ScoutSectionEnum } from '../enum/scout-section.enum';
import { ScoutSectionRankEnum } from '../enum/scout-section-rank.enum';
import { SetMetadata } from '@nestjs/common';

export interface RequiredRole {
  group: UserTypeEnum;
  roles?: (GuardianRelationshipEnum | LeaderRankEnum | ScoutSectionEnum | ScoutSectionRankEnum)[];


}

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: RequiredRole[]) => SetMetadata(ROLES_KEY, roles);

// Convenience decorators for common cases
export const LeaderOnly = (roles?: LeaderRankEnum[]) => RequireRoles({ group: UserTypeEnum.LEADER, roles });
export const ScoutMemberOnly = (roles?: ScoutSectionRankEnum[]) => RequireRoles({ group: UserTypeEnum.MEMBER, roles });
export const GuardianOnly = (roles?: GuardianRelationshipEnum[]) => RequireRoles({ group: UserTypeEnum.GUARDIAN, roles });