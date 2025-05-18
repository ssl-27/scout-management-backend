import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';
import { Attendance } from '../../entities/training/attendance.entity';
import { MeetingEntity } from '../../entities/training/meeting.entity';
import { WorkSubmission } from '../../entities/training/work-submission.entity';
import { MemberBadge } from '../../entities/badge/member-badge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScoutMember,
      Attendance,
      MeetingEntity,
      WorkSubmission,
      MemberBadge
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}