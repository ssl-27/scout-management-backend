import { faker } from '@faker-js/faker/locale/zh_TW';
import { HK_SCOUT_DATA } from '../data/hk-data';

export const generateMeeting = () => {
  const startDate = faker.date.future();
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 2);

  return {
    title: `Scout Meeting - ${faker.helpers.arrayElement([
      'Regular Training',
      'Badge Work',
      'Outdoor Skills',
      'First Aid Practice',
      'Knots and Pioneering'
    ])}`,
    meetingDateStart: startDate,
    meetingDateEnd: endDate,
    location: faker.helpers.arrayElement(HK_SCOUT_DATA.meetingLocations),
    description: faker.lorem.paragraph(),
    isMeetingCompleted: faker.datatype.boolean()
  };
};

export const generateMeetings = (count: number) => {
  return Array.from({ length: count }, () => generateMeeting());
};