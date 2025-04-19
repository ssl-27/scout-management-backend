import { Column, Entity, JoinColumn, ManyToOne, OneToMany, TableInheritance } from 'typeorm';
import { ScoutMember } from '../user-groups/scout/scout-member.entity';
import { SMISBaseEntity } from '../base/base.entity';
import { MeetingEntity } from './meeting.entity';

@Entity()
export class Attendance extends SMISBaseEntity {
  @Column({ type: 'date' })
  meetingDate: Date;

  @Column({ type: 'enum', enum: ['Present', 'Absent', 'Excused', 'Late'] })
  attendance: string;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => ScoutMember)
  scout: ScoutMember;

  @ManyToOne(() => MeetingEntity, meeting => meeting.attendances)
  meetingEntity: MeetingEntity;


}
