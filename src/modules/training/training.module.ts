// src/modules/training/training.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './controller/attendance.controller';
import { MeetingController } from './controller/meeting.controller';
import { AttendanceService } from './services/attendance.service';
import { MeetingService } from './services/meeting-service';
import { Attendance } from '../../entities/training/attendance.entity';
import { MeetingEntity } from '../../entities/training/meeting.entity';
import { Scout } from '../../entities/user-groups/scout.entity';
import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';
import { MemberGuardian } from '../../entities/user-groups/member-guardian.entity';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { Leader } from '../../entities/user-groups/leader.entity';
import { WorkSubmission } from '../../entities/training/work-submission.entity';
import { Badge } from '../../entities/badge/badge.entity';
import { BadgeRequirement } from '../../entities/badge/badge-requirement.entity';
import { MemberRequirement } from '../../entities/badge/member-requirement.entity';
import { WorkSubmissionService } from './services/work-submission.service';
import { WorkSubmissionController } from './controller/work-submission.controller';
import { MemberBadge } from '../../entities/badge/member-badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Attendance,
    MeetingEntity,
    Scout,
    ScoutMember,
    MemberGuardian,
    BaseUserEntity,
    Leader,
    WorkSubmission,
    Badge,
    BadgeRequirement,
    MemberRequirement,
    MemberBadge
  ])],
  controllers: [AttendanceController, MeetingController, WorkSubmissionController],
  providers: [AttendanceService, MeetingService, WorkSubmissionService],
  exports: [AttendanceService, MeetingService, WorkSubmissionService],
})
export class TrainingModule {}