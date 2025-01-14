import { Column, Entity, ManyToOne } from 'typeorm';
import { Scout } from './scout.entity';
import { Guardian } from './guardian.entity';
import { SMISBaseEntity } from '../base/base.entity';
import { GuardianRelationshipEnum } from '../../common/enum/guardian-relationship.enum';

@Entity()
export class MemberGuardian extends SMISBaseEntity {
  @ManyToOne(() => Scout)
  scout: Scout;

  @ManyToOne(() => Guardian)
  guardian: Guardian;

  @Column({ type: 'enum', enum: GuardianRelationshipEnum })
  relationship: string;
}