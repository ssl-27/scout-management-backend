// src/modules/activities/activities.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HikingPlan } from '../../entities/activities/hiking-plan.entity';
import { HikingCheckpoint } from '../../entities/activities/hiking-checkpoint.entity';
import { Leader } from '../../entities/user-groups/leader.entity';
import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';
import { MemberGuardian } from '../../entities/user-groups/member-guardian.entity';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { HikingPlanService } from './services/hiking-plan.service';
import { HikingPlanController } from './controllers/hiking-plan.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HikingPlan,
      HikingCheckpoint,
      Leader,
      ScoutMember,
      MemberGuardian,
      BaseUserEntity
    ]),
    EmailModule
  ],
  controllers: [HikingPlanController],
  providers: [HikingPlanService],
  exports: [HikingPlanService]
})
export class ActivitiesModule {}