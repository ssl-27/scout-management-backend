import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './controller/attendance.controller';
import { MeetingController } from './controller/meeting.controller';
import { AttendanceService } from './services/attendance.service';
import { MeetingService } from './services/meeting-service';
import { TrainingItemController } from './controller/training-item.controller';
import { BadgeDetailsController } from './controller/badge-details.controller';
import { BadgeDetailsService } from './services/badge-details.service';
import { TrainingItemService } from './services/training-item.service';
import { Attendance } from '../../entities/training/attendance.entity';
import { BadgeDetailsEntity } from '../../entities/training/badge-details.entity';
import { TrainingRecordEntity } from '../../entities/training/training-record.entity';
import { MeetingEntity } from '../../entities/training/meeting.entity';
import { TrainingItem } from '../../entities/training/training-item.entity';
import { Scout } from '../../entities/user-groups/scout.entity';
import { ScoutMember } from '../../entities/user-groups/scout/scout-member.entity';
import { MemberGuardian } from '../../entities/user-groups/member-guardian.entity';
import { BaseUserEntity } from '../../entities/base/base-user.entity';
import { TrainingRecordsController } from './controller/training-records.controller';
import { TrainingRecordsService } from './services/training-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, MeetingEntity, TrainingRecordEntity, TrainingItem, BadgeDetailsEntity, ScoutMember, MemberGuardian, BaseUserEntity, TrainingRecordEntity])],
  controllers: [AttendanceController, BadgeDetailsController, TrainingItemController, MeetingController, TrainingRecordsController],
  providers: [AttendanceService, BadgeDetailsService, TrainingItemService, MeetingService, TrainingRecordsService],
  exports: [AttendanceService, BadgeDetailsService, TrainingItemService, MeetingService, TrainingRecordsService],
})
export class TrainingModule {}
