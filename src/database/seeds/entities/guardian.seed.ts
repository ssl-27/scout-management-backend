import { faker } from '@faker-js/faker/locale/zh_TW';
import { GuardianRelationshipEnum } from '../../../common/enum/guardian-relationship.enum';
import { generateBaseUser } from '../helpers/user.helper';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';

export const generateGuardian = (scoutId: string) => {
  const baseUser = generateBaseUser(UserTypeEnum.GUARDIAN);

  return {
    ...baseUser,
    memberId: scoutId,
    relationship: faker.helpers.arrayElement(Object.values(GuardianRelationshipEnum))
  };
};

export const generateGuardians = (scoutIds: string[]) => {
  return scoutIds.map(scoutId => generateGuardian(scoutId));
};