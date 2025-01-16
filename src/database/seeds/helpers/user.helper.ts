import { faker } from '@faker-js/faker/locale/zh_TW'; // Using HK/TW locale
import { GenderEnum } from '../../../common/enum/gender.enum';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { LeaderRankEnum } from '../../../common/enum/leader-rank.enum';
import { ScoutSectionEnum } from '../../../common/enum/scout-section.enum';

export const generateBaseUser = (role: UserTypeEnum) => {
  const gender = faker.helpers.arrayElement([GenderEnum.MALE, GenderEnum.FEMALE]);
  const firstName = gender === GenderEnum.MALE ?
    faker.person.firstName('male') :
    faker.person.firstName('female');

  return {
    firstName,
    lastName: faker.person.lastName(),
    preferredName: firstName,
    email: faker.internet.email(),
    phone: faker.phone.number({style: 'national'}),
    chineseName: faker.person.lastName() + faker.person.firstName(),
    role,
    gender,
    status: faker.helpers.arrayElement(['Active', 'Inactive', 'Pending'])
  };
};