import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { Attendance } from './attendance.entity';
import { BadgeRequirement } from '../badge/badge-requirement.entity';
import { Badge } from '../badge/badge.entity';

@Entity()
export class MeetingEntity extends SMISBaseEntity {
  @Column()
  title: string;

  @Column({ type: 'timestamp' })
  meetingDateStart: Date;

  @Column({ type: 'timestamp' })
  meetingDateEnd: Date;

  @Column()
  location: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: false })
  isMeetingCompleted: boolean;

  @OneToMany(() => Attendance, attendance => attendance.meetingEntity)
  attendances: Attendance[];

  @ManyToMany(() => BadgeRequirement)
  @JoinTable({
    name: 'meeting_badge_requirement',
    joinColumn: { name: 'meeting_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'badge_requirement_id', referencedColumnName: 'id' }
  })
  coveredRequirements: BadgeRequirement[];

  @ManyToMany(() => Badge)
  @JoinTable({
    name: 'meeting_proficiency_badge',
    joinColumn: { name: 'meeting_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'badge_id', referencedColumnName: 'id' }
  })
  proficiencyBadges: Badge[];
}