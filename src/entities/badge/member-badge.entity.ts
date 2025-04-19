import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { Badge } from './badge.entity';
import { Scout } from '../user-groups/scout.entity';
import { Leader } from '../user-groups/leader.entity';
import { MemberRequirement } from './member-requirement.entity';

@Entity()
export class MemberBadge extends SMISBaseEntity {
  @ManyToOne(() => Scout)
  scout: Scout;

  @ManyToOne(() => Badge)
  badge: Badge;

  @Column({ type: 'date', nullable: true })
  completionDate: Date;

  @Column({ default: false })
  isApproved: boolean;

  @ManyToOne(() => Leader, { nullable: true })
  approvedBy: Leader;

  @Column({ default: false })
  isUsedForProgressive: boolean;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'simple-array', nullable: true })
  usedForRequirementIds: string[];

  @Column({ type: 'json', nullable: true })
  evidenceFiles: { filename: string; originalName: string; url: string }[];

  // Relationship to requirement completion records
  @OneToMany(() => MemberRequirement, memberRequirement => memberRequirement.memberBadge)
  requirements: MemberRequirement[];

  // Add progress tracking
  @Column({ type: 'float', default: 0 })
  progressPercentage: number;
}