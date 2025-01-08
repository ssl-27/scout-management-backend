import { Column, Entity, ManyToOne, TableInheritance } from 'typeorm';
import { ScoutMember } from '../user-groups/scout/scout-member.entity';
import { ProficiencyBadge } from './proficiency-badge.entity';
import { SMISBaseEntity } from '../base/base.entity';

@Entity()
export class BadgeProgress extends SMISBaseEntity {
  @ManyToOne(() => ScoutMember)
  scout: ScoutMember;

  @ManyToOne(() => ProficiencyBadge)
  proficiencyBadge: ProficiencyBadge;

  @Column({ type: 'date', nullable: true })
  dateCompleted?: Date;
}
