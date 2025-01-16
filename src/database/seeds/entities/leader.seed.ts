import { faker } from '@faker-js/faker/locale/zh_TW';
import { LeaderRankEnum } from '../../../common/enum/leader-rank.enum';
import { generateBaseUser } from '../helpers/user.helper';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { HK_SCOUT_DATA } from '../data/hk-data';

export const generateLeader = () => {
  const baseUser = generateBaseUser(UserTypeEnum.LEADER);

  return {
    ...baseUser,
    warrantExpiryDate: faker.date.future({ years: 3 }),
    leaderRank: faker.helpers.arrayElement(Object.values(LeaderRankEnum)),
    division: faker.helpers.arrayElement(HK_SCOUT_DATA.districts)
  };
};

export const generateLeaders = (count: number) => {
  return Array.from({ length: count }, () => generateLeader());
};