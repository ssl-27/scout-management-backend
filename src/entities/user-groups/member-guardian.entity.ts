import { Column, Entity, ManyToOne } from 'typeorm';
import { Scout } from './scout.entity';
import { ScoutMember } from './scout/scout-member.entity';
import { Guardian } from './guardian.entity';
import { SMISBaseEntity } from '../base/base.entity';

@Entity()
export class MemberGuardian extends SMISBaseEntity {
  @ManyToOne(() => Scout)
  scout: ScoutMember;

  @ManyToOne(() => Guardian)
  guardian: Guardian;

  @Column({ type: 'enum', enum: ['Mother', 'Father', 'Guardian'] })
  relationship: string;
}