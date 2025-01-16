import { faker } from '@faker-js/faker/locale/zh_TW';
import { ScoutSectionEnum } from '../../../common/enum/scout-section.enum';
import { PatrolNamesEnum } from '../../../common/enum/patrol-names.enum';
import { ScoutSectionRankEnum } from '../../../common/enum/scout-section-rank.enum';
import { generateBaseUser } from '../helpers/user.helper';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { HK_SCOUT_DATA } from '../data/hk-data';

export const generateScoutMember = () => {
  const baseUser = generateBaseUser(UserTypeEnum.MEMBER);

  // Generate birthdate for appropriate scout age (11-16)
  const birthDate = faker.date.birthdate({ mode: 'age', min: 11, max: 16 });

  // Scout base data
  const scoutData = {
    ymisId: faker.number.int({ min: 10000, max: 99999 }).toString(),
    dateOfBirth: birthDate,
    section: ScoutSectionEnum.SCOUT,
    investitureDate: faker.date.past({ years: 2 }),
    dateJoined: faker.date.past({ years: 3 })
  };

  // Scout member specific data
  const scoutMemberData = {
    scoutSectionRank: faker.helpers.arrayElement(Object.values(ScoutSectionRankEnum)),
    patrol: faker.helpers.arrayElement(Object.values(PatrolNamesEnum)),
    schoolClass: faker.helpers.arrayElement(['F.1', 'F.2', 'F.3', 'F.4']),
    classNumber: faker.number.int({ min: 1, max: 42 })
  };

  return {
    ...baseUser,
    ...scoutData,
    scoutSectionDetails: scoutMemberData
  };
};

export const generateScoutMembers = (count: number) => {
  return Array.from({ length: count }, () => generateScoutMember());
};