import { Column, Entity, ManyToOne } from 'typeorm';
import { ScoutMember } from './scoutmember.entity';
import { ProficiencyBadge } from './proficiency-badge.entity';
import { SMISBaseEntity } from './base.entity';

@Entity()
export class BadgeProgress extends SMISBaseEntity {
  @ManyToOne(() => ScoutMember)
  scout: ScoutMember;

  @ManyToOne(() => ProficiencyBadge)
  proficiencyBadge: ProficiencyBadge;

  @Column({ type: 'date', nullable: true })
  dateCompleted?: Date;
}
