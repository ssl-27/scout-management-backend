// src/entities/badge/badge-requirement.entity.ts

import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { Badge } from './badge.entity';
import { MemberRequirement } from './member-requirement.entity';

export enum RequirementType {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL',
  ELECTIVE = 'ELECTIVE',
}

@Entity()
export class BadgeRequirement extends SMISBaseEntity {
  @ManyToOne(() => Badge, badge => badge.requirements)
  badge: Badge;

  @Column({nullable: true})
  text: string;

  @Column()
  sortOrder: number;

  @Column({
    type: 'enum',
    enum: RequirementType,
    default: RequirementType.MANDATORY,
  })
  type: RequirementType;

  @Column({ nullable: true })
  section: string;

  @Column({ type: 'simple-array', nullable: true })
  badgesUsed: string[]; // Badge IDs that can fulfill this requirement

  @Column({ type: 'json', nullable: true })
  options: any[]; // For OPTIONAL type requirements with choices

  @ManyToOne(() => BadgeRequirement, { nullable: true })
  parent: BadgeRequirement;

  @OneToMany(() => MemberRequirement, memberRequirement => memberRequirement.requirement)
  memberRequirements: MemberRequirement[];
}