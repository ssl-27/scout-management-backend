// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { BaseUserEntity } from '../../entities/base/base-user.entity';
// import { Leader } from '../../entities/user-groups/leader.entity';
// import { Scout } from '../../entities/user-groups/scout.entity';
// import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';
// import { Guardian } from '../../entities/user-groups/guardian.entity';
// import { MemberGuardian } from '../../entities/user-groups/member-guardian.entity';
//
// import { MeetingEntity } from '../../entities/training/meeting.entity';
// // import { Attendance } from '../../entities/training/attendance.entity';
// import { Seeder } from './seed';
// import { SeedCommand } from './seed.command';
//
// @Module({
//   imports: [
//     TypeOrmModule.forFeature([
//       BaseUserEntity,
//       Leader,
//       Scout,
//       ScoutMember,
//       Guardian,
//       MemberGuardian,
//       MeetingEntity,
//       Attendance,
//     ]),
//   ],
//   providers: [Seeder, SeedCommand],
//   exports: [Seeder],
// })
// export class SeedModule {}