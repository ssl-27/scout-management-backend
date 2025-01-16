import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { ScoutSectionEnum } from '../../common/enum/scout-section.enum';
import { BadgeDetailsEntity } from './badge-details.entity';
import { Attendance } from './attendance.entity';
import { MeetingEntity } from './meeting.entity';
import { TrainingRecordEntity } from './training-record.entity';
import { Transform } from 'class-transformer';

@Entity()
export class TrainingItem extends SMISBaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ScoutSectionEnum, default: ScoutSectionEnum.SCOUT })
  badgeSection: ScoutSectionEnum;

  @ManyToOne(() => BadgeDetailsEntity, badge => badge.trainingItems, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @Transform(({ value }) => value?.id) // Only serialize the ID
  badge: BadgeDetailsEntity;

  @ManyToMany(() => MeetingEntity, meeting => meeting.trainingItems, { nullable: true })
  meetings: MeetingEntity[];

  @OneToMany(() => TrainingRecordEntity, trainingRecord => trainingRecord.trainingItem)
  @JoinTable()
  trainingRecords: TrainingRecordEntity[];

}
