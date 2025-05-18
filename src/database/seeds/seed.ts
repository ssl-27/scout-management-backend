import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { Leader } from '../../entities/user-groups/leader.entity';
import { Scout } from '../../entities/user-groups/scout.entity';
import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';
import { Guardian } from '../../entities/user-groups/guardian.entity';
import { MemberGuardian } from '../../entities/user-groups/member-guardian.entity';

import { generateLeaders } from './entities/leader.seed';
import { generateScoutMembers } from './entities/scout-member.seed';
import { generateGuardians } from './entities/guardian.seed';
import { TEST_EMAIL_ACCOUNTS } from './data/test-email-accounts';
import { UserTypeEnum } from '../../common/enum/user-type.enum';

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

      // Seed test users with email accounts
      const testUsersWithEmail = await this.seedTestUsersWithEmail();
      console.log(
        `Created ${testUsersWithEmail.length} test users with email accounts`,
      );

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
        await queryRunner.query('DELETE FROM "attendance"');

        await queryRunner.query('DELETE FROM "member_guardian"');


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

  private async seedTestUsersWithEmail(): Promise<BaseUserEntity[]> {
    const savedTestUsers = [];
    //choose 1 Leader to change the accounts email for testing
    const leaderTestAccount = await this.leaderRepository.findOneBy({});
    const testLeaderAccount = await this.baseUserRepository.findOneBy({
      role: UserTypeEnum.LEADER,
    });
    testLeaderAccount.email = TEST_EMAIL_ACCOUNTS.LEADER;
    savedTestUsers.push(await this.baseUserRepository.save(testLeaderAccount));

    //choose 1 scout to change the accounts email for testing
    const testScoutAccount = await this.baseUserRepository.findOneBy({
      role: UserTypeEnum.MEMBER,
    });
    testScoutAccount.email = TEST_EMAIL_ACCOUNTS.MEMBER;
    savedTestUsers.push(await this.baseUserRepository.save(testScoutAccount));

    //choose 1 guardian to change the accounts email for testing
    const guardianTestAccount = await this.memberGuardianRepository.findOne({
      where: { scout: { id: testScoutAccount.id } },
      relations: ['guardian'],
    });
    const testGuardianAccount = await this.baseUserRepository.findOneBy({
      id: guardianTestAccount.guardian.id,
    });
    testGuardianAccount.email = TEST_EMAIL_ACCOUNTS.GUARDIAN;
    savedTestUsers.push(
      await this.baseUserRepository.save(testGuardianAccount),
    );

    return savedTestUsers;
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
    return savedGuardians;
  }

}