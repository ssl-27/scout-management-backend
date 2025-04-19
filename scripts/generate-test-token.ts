// scripts/generate-test-tokens.ts
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { UserTypeEnum } from '../src/common/enum/user-type.enum';
import { BaseUserEntity } from '../src/entities/base/base-user.entity';
import { Leader } from '../src/entities/user-groups/leader.entity';
import { Guardian } from '../src/entities/user-groups/guardian.entity';
import { Scout } from '../src/entities/user-groups/scout.entity';
import { ScoutMember } from '../src/entities/user-groups/scout/scout-member.entity';


// Load environment variables
dotenv.config({ path: '.env.development' });

// You can use specific emails or leave these empty to get the first user of each type
const testEmails = {
  [UserTypeEnum.LEADER]: 'smis-2025-leader-dev@maildrop.cc',
  [UserTypeEnum.MEMBER]: 'smis-2025-member-dev@maildrop.cc',
  [UserTypeEnum.GUARDIAN]: 'smis-2025-guardian-dev@maildrop.cc'
};

async function generateTokens() {
  // Create a database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [BaseUserEntity, Leader, Guardian, Scout, ScoutMember],
    synchronize: false,
  });

  try {
    // Initialize the connection
    await dataSource.initialize();
    console.log("Database connection established");

    const userRepository = dataSource.getRepository(BaseUserEntity);
    const leaderRepository = dataSource.getRepository(Leader);
    const guardianRepository = dataSource.getRepository(Guardian);
    const scoutRepository = dataSource.getRepository(Scout);
    const scoutMemberRepository = dataSource.getRepository(ScoutMember);

    // Get JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return;
    }

    // Generate tokens for each user type
    for (const userType of [UserTypeEnum.LEADER, UserTypeEnum.MEMBER, UserTypeEnum.GUARDIAN]) {
      console.log(`\n==== Generating token for ${userType} ====`);

      // Find user by email or get the first one of this type
      let query = userRepository.createQueryBuilder('user')
        .where('user.role = :role', { role: userType });

      if (testEmails[userType]) {
        query = query.andWhere('user.email = :email', { email: testEmails[userType] });
      }

      const user = await query.getOne();

      if (!user) {
        console.error(`No ${userType} user found`);
        continue;
      }

      console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);

      // Create base payload
      const payload = { email: user.email, sub: user.id, group: user.role };

      // Add role-specific data
      switch (user.role) {
        case UserTypeEnum.LEADER: {
          const leader = await leaderRepository.findOne({ where: { id: user.id } });
          if (leader) {
            payload['role'] = leader.leaderRank;
            payload['division'] = leader.division;
            console.log(`Leader rank: ${leader.leaderRank}, Division: ${leader.division}`);
          }
          break;
        }
        case UserTypeEnum.GUARDIAN: {
          const guardian = await guardianRepository.findOne({ where: { id: user.id } });
          if (guardian) {
            payload['relationship'] = guardian.relationship;
            console.log(`Guardian relationship: ${guardian.relationship}`);
          }
          break;
        }
        case UserTypeEnum.MEMBER: {
          const scout = await scoutRepository.findOne({ where: { id: user.id } });
          const scoutMember = await scoutMemberRepository.findOne({ where: { id: user.id } });

          if (scout && scoutMember) {
            payload['section'] = scout.section;
            payload['rank'] = scoutMember.scoutSectionRank;
            payload['patrol'] = scoutMember.patrol;
            console.log(`Scout section: ${scout.section}, Rank: ${scoutMember.scoutSectionRank}, Patrol: ${scoutMember.patrol}`);
          }
          break;
        }
      }

      // Generate a token with 1 year expiration
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '365d' });

      console.log(`\n${userType} TOKEN:`);
      console.log(token);

      // Also print decoded token for verification
      console.log(`\n${userType} PAYLOAD:`);
      console.log(jwt.decode(token));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the database connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log("Database connection closed");
    }
  }
}

// Run the function
generateTokens().catch(error => {
  console.error('Unhandled error:', error);
});