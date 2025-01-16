import { faker } from '@faker-js/faker/locale/zh_TW';
import { ScoutSectionEnum } from '../../../common/enum/scout-section.enum';

// Based on the PDF content
const BADGE_CATEGORIES = {
  interest: [
    'Angler', 'Animal Care', 'Archery', 'Artist', 'Athlete',
    'Camp Cook', 'Canoeist', 'Collector', 'Computer', 'Cyclist'
  ],
  pursuit: [
    'Archery', 'Astronomer', 'Aviation Navigator', 'Backwoods Cook',
    'Camper', 'Canoeist', 'Canoe Polo', 'Communicator'
  ],
  service: [
    'Camp Warden', 'Canoe Rescuer', 'Civics', 'Conservator',
    'Disability Awareness', 'Fireman', 'First Aider'
  ]
};

export const generateBadge = () => {
  const category = faker.helpers.arrayElement(['interest', 'pursuit', 'service']);
  const badgeName = faker.helpers.arrayElement(BADGE_CATEGORIES[category]);

  return {
    title: badgeName,
    description: faker.lorem.paragraph(),
    badgeSection: ScoutSectionEnum.SCOUT,
    trainingItems: []
  };
};

export const generateTrainingItem = (badgeId: string) => {
  return {
    title: faker.lorem.words(3),
    description: faker.lorem.sentences(2),
    badgeSection: ScoutSectionEnum.SCOUT,
    badgeId
  };
};

export const generateBadges = (count: number) => {
  return Array.from({ length: count }, () => generateBadge());
};