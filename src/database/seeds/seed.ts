import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { Leader } from '../../entities/user-groups/leader.entity';
import { Scout } from '../../entities/user-groups/scout.entity';
import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';
import { Guardian } from '../../entities/user-groups/guardian.entity';
import { MemberGuardian } from '../../entities/user-groups/member-guardian.entity';
import { BadgeDetailsEntity } from '../../entities/training/badge-details.entity';
import { TrainingItem } from '../../entities/training/training-item.entity';
import { MeetingEntity } from '../../entities/training/meeting.entity';
import { Attendance } from '../../entities/training/attendance.entity';

import { generateLeaders } from './entities/leader.seed';
import { generateScoutMembers } from './entities/scout-member.seed';
import { generateGuardians } from './entities/guardian.seed';
import { generateMeetings } from './entities/meeting.seed';
import { generateBadges } from './entities/badge.seed';
import { faker } from '@faker-js/faker/locale/zh_TW';
import { ScoutSectionEnum } from '../../common/enum/scout-section.enum';
import { LeaderRankEnum } from '../../common/enum/leader-rank.enum';
import { TEST_EMAIL_ACCOUNTS } from './data/test-email-accounts';

@Injectable()
export class Seeder {
  constructor(
    @InjectRepository(BaseUserEntity)
    private readonly baseUserRepository: Repository<BaseUserEntity>,

    @InjectRepository(Leader)
    private readonly leaderRepository: Repository<Leader>,

    @InjectRepository(Scout)
    private readonly scoutRepository: Repository<Scout>,

    @InjectRepository(ScoutMember)
    private readonly scoutMemberRepository: Repository<ScoutMember>,

    @InjectRepository(Guardian)
    private readonly guardianRepository: Repository<Guardian>,

    @InjectRepository(MemberGuardian)
    private readonly memberGuardianRepository: Repository<MemberGuardian>,

    @InjectRepository(BadgeDetailsEntity)
    private readonly badgeRepository: Repository<BadgeDetailsEntity>,

    @InjectRepository(TrainingItem)
    private readonly trainingItemRepository: Repository<TrainingItem>,

    @InjectRepository(MeetingEntity)
    private readonly meetingRepository: Repository<MeetingEntity>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async seed() {
    try {
      // Clear existing data
      await this.clearExistingData();

      // Seed Leaders
      const leaders = await this.seedLeaders();
      console.log(`Created ${leaders.length} leaders`);

      // Seed Scouts and Scout Members
      const scouts = await this.seedScouts();
      console.log(`Created ${scouts.length} scouts`);

      // Seed Guardians and Member-Guardian relationships
      const guardians = await this.seedGuardians(scouts);
      console.log(`Created ${guardians.length} guardians`);

      // Seed Badges and Training Items
      const badges = await this.seedBadges();
      console.log(`Created ${badges.length} badges`);

      // Seed Meetings and Attendance
      const meetings = await this.seedMeetings(scouts);
      console.log(`Created ${meetings.length} meetings`);

      console.log('Seeding completed successfully!');
    } catch (error) {
      console.error('Seeding failed:', error);
      throw error;
    }
  }

  private async clearExistingData() {
    try {
      // Using queryRunner to handle transactions
      const queryRunner =
        this.baseUserRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Clear tables in order of dependencies
        console.log('Clearing existing data...');

        // First, clear junction tables and dependent tables
        await queryRunner.query('DELETE FROM "training_record_entity"');
        await queryRunner.query('DELETE FROM "attendance"');
        await queryRunner.query(
          'DELETE FROM "meeting_entity_training_items_training_item"',
        );
        await queryRunner.query('DELETE FROM "member_guardian"');

        // Then clear main entity tables
        await queryRunner.query('DELETE FROM "meeting_entity"');
        await queryRunner.query('DELETE FROM "training_item"');
        await queryRunner.query('DELETE FROM "badge_details_entity"');

        // Clear user-related tables
        await queryRunner.query('DELETE FROM "guardian"');
        await queryRunner.query('DELETE FROM "scout_member"');
        await queryRunner.query('DELETE FROM "scout"');
        await queryRunner.query('DELETE FROM "leader"');
        await queryRunner.query('DELETE FROM "base_user_entity"');

        await queryRunner.commitTransaction();
        console.log('Data cleared successfully');
      } catch (err) {
        console.error('Error during data clearing:', err);
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error('Failed to clear existing data:', error);
      throw error;
    }
  }

  private async seedLeaders(): Promise<Leader[]> {
    const leaderData = generateLeaders(10);
    const savedLeaders = [];

    for (const leader of leaderData) {
      // Create base user
      const baseUser = this.baseUserRepository.create(leader);
      await this.baseUserRepository.save(baseUser);

      // Create leader with reference to base user
      const leaderEntity = this.leaderRepository.create({
        id: baseUser.id,
        warrantExpiryDate: leader.warrantExpiryDate,
        leaderRank: leader.leaderRank,
        division: leader.division,
      });

      savedLeaders.push(await this.leaderRepository.save(leaderEntity));

      //choose 1 SL to change the accounts email for testing
      const leaderTestAccount = await this.leaderRepository.findOneBy({ leaderRank: LeaderRankEnum.SL });
      leaderTestAccount.email = TEST_EMAIL_ACCOUNTS.LEADER;
      await this.leaderRepository.save(leaderTestAccount);
    }

    return savedLeaders;
  }

  private async seedScouts(): Promise<Scout[]> {
    const scoutData = generateScoutMembers(30);
    const savedScouts = [];

    for (const scout of scoutData) {
      // Create base user
      const baseUser = this.baseUserRepository.create(scout);
      await this.baseUserRepository.save(baseUser);

      // Create scout
      const scoutEntity = this.scoutRepository.create({
        id: baseUser.id,
        ymisId: scout.ymisId,
        dateOfBirth: scout.dateOfBirth,
        section: scout.section,
        investitureDate: scout.investitureDate,
        dateJoined: scout.dateJoined,
      });
      await this.scoutRepository.save(scoutEntity);

      // Create scout member details
      const scoutMemberEntity = this.scoutMemberRepository.create({
        id: baseUser.id,
        ...scout.scoutSectionDetails,
      });
      await this.scoutMemberRepository.save(scoutMemberEntity);

      savedScouts.push(scoutEntity);
    }

    return savedScouts;
  }

  private async seedGuardians(scouts: Scout[]): Promise<Guardian[]> {
    const guardianData = generateGuardians(scouts.map((scout) => scout.id));
    const savedGuardians = [];

    for (const guardian of guardianData) {
      // Create base user
      const baseUser = this.baseUserRepository.create(guardian);
      await this.baseUserRepository.save(baseUser);

      // Create guardian
      const guardianEntity = this.guardianRepository.create({
        id: baseUser.id,
        relationship: guardian.relationship,
      });
      await this.guardianRepository.save(guardianEntity);

      // Create member-guardian relationship
      const memberGuardian = this.memberGuardianRepository.create({
        scout: { id: guardian.memberId },
        guardian: { id: guardianEntity.id },
        relationship: guardian.relationship,
      });
      await this.memberGuardianRepository.save(memberGuardian);

      savedGuardians.push(guardianEntity);
    }

    const guardianTestAccount = await this.guardianRepository.findOneBy({ relationship: 'Parent' });
    guardianTestAccount.email = TEST_EMAIL_ACCOUNTS.GUARDIAN;
    await this.guardianRepository.save(guardianTestAccount);

    const memberTestAccount = await this.scoutRepository.findOneBy({ id: guardianTestAccount.memberId });
    memberTestAccount.email = TEST_EMAIL_ACCOUNTS.MEMBER;
    await this.scoutRepository.save(memberTestAccount);

    return savedGuardians;
  }

  private async seedBadges(): Promise<BadgeDetailsEntity[]> {
    const badgeData = generateBadges(20);
    const savedBadges = [];

    for (const badge of badgeData) {
      // Create badge
      const badgeEntity = this.badgeRepository.create(badge);
      const savedBadge = await this.badgeRepository.save(badgeEntity);

      // Create training items for this badge
      for (let i = 0; i < 3; i++) {
        const trainingItem = this.trainingItemRepository.create({
          title: `Training Item ${i + 1} for ${badge.title}`,
          description: `Description for training item ${i + 1}`,
          badgeSection: badge.badgeSection,
          badge: savedBadge,
        });
        await this.trainingItemRepository.save(trainingItem);
      }

      savedBadges.push(savedBadge);
    }

    return savedBadges;
  }

  private async seedMeetings(scouts: Scout[]): Promise<MeetingEntity[]> {
    const meetingData = generateMeetings(15); // Generate 15 meetings
    const savedMeetings = [];

    for (const meeting of meetingData) {
      // Step 1: Create and save the meeting
      const meetingEntity = this.meetingRepository.create(meeting);
      const savedMeeting = await this.meetingRepository.save(meetingEntity);

      // Step 2: Create and save the training items for this meeting
      const trainingItems = Array.from({
        length: faker.number.int({ min: 1, max: 5 }),
      }).map(() =>
        this.trainingItemRepository.create({
          title: faker.lorem.words(3),
          description: faker.lorem.sentences(2),
          badgeSection: faker.helpers.enumValue(ScoutSectionEnum), // Use actual enum values
        }),
      );

      const savedTrainingItems =
        await this.trainingItemRepository.save(trainingItems);

      // Step 3: Update the meeting with the linked training items
      savedMeeting.trainingItems = savedTrainingItems;
      await this.meetingRepository.save(savedMeeting);

      // Step 4: Create random attendance records for the meeting
      const randomScouts = this.getRandomItems(
        scouts,
        Math.floor(scouts.length * 0.7),
      ); // 70% of scouts
      for (const scout of randomScouts) {
        const attendance = this.attendanceRepository.create({
          meetingDate: savedMeeting.meetingDateStart,
          attendance: Math.random() > 0.2 ? 'Present' : 'Absent', // 80% chance of being present
          scout: { id: scout.id },
          meetingEntity: savedMeeting,
        });
        await this.attendanceRepository.save(attendance);
      }

      savedMeetings.push(savedMeeting);
    }

    console.log(
      'Meetings with training items and attendance seeded successfully!',
    );
    return savedMeetings;
  }

  // private async seedMeetingsWithTrainingItems(): Promise<void> {
  //   const meetingData = generateMeetings(10); // Assuming this generates the base meeting data
  //
  //   for (const meeting of meetingData) {
  //     // Step 1: Create and save the training items for this meeting
  //     const trainingItems = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() =>
  //       this.trainingItemRepository.create({
  //         title: faker.lorem.words(3),
  //         description: faker.lorem.sentences(2),
  //         badgeSection: faker.helpers.enumValue(ScoutSectionEnum), // Use actual enum
  //       }),
  //     );
  //
  //     const savedTrainingItems = await this.trainingItemRepository.save(trainingItems);
  //
  //     // Step 2: Create the meeting and link training items
  //     const meetingEntity = this.meetingRepository.create({
  //       ...meeting,
  //       trainingItems: savedTrainingItems, // Associate saved training items
  //     });
  //
  //     // Step 3: Save the meeting entity with the linked training items
  //     await this.meetingRepository.save(meetingEntity);
  //   }
  //
  //   console.log('Meetings with training items seeded successfully!');
  // }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}