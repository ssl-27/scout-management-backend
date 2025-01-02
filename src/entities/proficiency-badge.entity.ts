import { Column, Entity } from 'typeorm';
import { ProficiencyBadgeGroupEnum } from '../common/enum/proficiency-badge-group.enum';
import { SMISBaseEntity } from './base.entity';

@Entity()
export class ProficiencyBadge extends SMISBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: ProficiencyBadgeGroupEnum })
  group: ProficiencyBadgeGroupEnum;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  requirements?: string;
}
