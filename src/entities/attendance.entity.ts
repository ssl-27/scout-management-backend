import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ScoutMember } from './scoutmember.entity';
import { SMISBaseEntity } from './base.entity';

@Entity()
export class Attendance extends SMISBaseEntity {
  @Column({ type: 'date' })
  meetingDate: Date;

  @Column({ type: 'enum', enum: ['Present', 'Absent', 'Excused', 'Late'] })
  status: string;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => ScoutMember)
  @JoinColumn({ name: 'scoutId' })
  scout: ScoutMember;
}
