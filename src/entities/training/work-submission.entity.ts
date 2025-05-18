// src/entities/training/work-submission.entity.ts
import { Column, Entity, ManyToOne } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { Scout } from '../user-groups/scout.entity';
import { BadgeRequirement } from '../badge/badge-requirement.entity';
import { Leader } from '../user-groups/leader.entity';

@Entity()
export class WorkSubmission extends SMISBaseEntity {
  @ManyToOne(() => Scout)
  scout: Scout;

  @ManyToOne(() => BadgeRequirement)
  requirement: BadgeRequirement;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  files: { filename: string; originalName: string; url: string }[];

  @Column({ type: 'varchar', nullable: true })
  externalUrl: string;

  @Column({ type: 'enum', enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
  status: string;

  @ManyToOne(() => Leader, { nullable: true })
  reviewedBy: Leader;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  feedback: string;
}