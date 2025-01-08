import { Column, Entity, TableInheritance } from 'typeorm';
import { ProficiencyBadgeGroupEnum } from '../../common/enum/proficiency-badge-group.enum';
import { SMISBaseEntity } from '../base/base.entity';

@Entity()
export class ProficiencyBadge extends SMISBaseEntity {
  @Column()
  badgeName: string;

  @Column({ type: 'enum', enum: ProficiencyBadgeGroupEnum })
  proficiencyBadgeGroup: ProficiencyBadgeGroupEnum;

  @Column({ nullable: true })
  proficiencyBadgeDescription?: string;

  @Column({ nullable: true })
  proficiencyBadgeRequirements?: string;
}
