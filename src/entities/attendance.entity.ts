import { Column, Entity, JoinColumn, ManyToOne, TableInheritance } from 'typeorm';
import { ScoutMember } from './user-groups/scout/scout-member.entity';
import { SMISBaseEntity } from './base/base.entity';

@Entity()
export class Attendance extends SMISBaseEntity {
  @Column({ type: 'date' })
  meetingDate: Date;

  @Column({ type: 'enum', enum: ['Present', 'Absent', 'Excused', 'Late'] })
  status: string;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => ScoutMember)
  @JoinColumn({ name: 'ymisId' })
  scout: ScoutMember;
}
