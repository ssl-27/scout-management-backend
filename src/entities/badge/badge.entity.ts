// src/entities/badge/badge.entity.ts

import { Column, Entity, OneToMany } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { BadgeRequirement } from './badge-requirement.entity';
import { MemberBadge } from './member-badge.entity';

export enum BadgeType {
  PROGRESSIVE = 'PROGRESSIVE',
  PROFICIENCY = 'PROFICIENCY',
  SEA_ACTIVITY = 'SEA_ACTIVITY',
  AIR_ACTIVITY = 'AIR_ACTIVITY',
  OTHER = 'OTHER',
}

export enum BadgeSection {
  SCOUT = 'SCOUT',
  CUB = 'CUB',
  VENTURE = 'VENTURE',
  ROVER = 'ROVER',
}

export enum BadgeGroup {
  PROGRESSIVE = 'PROGRESSIVE',
  INTEREST = 'INTEREST',
  PURSUIT = 'PURSUIT',
  SERVICE = 'SERVICE',
  INSTRUCTOR = 'INSTRUCTOR',
  SEA_ACTIVITY = 'SEA_ACTIVITY',
  AIR_ACTIVITY = 'AIR_ACTIVITY',
  OTHER_AWARDS = 'OTHER_AWARDS',
}

@Entity()
export class Badge extends SMISBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: BadgeType,
  })
  type: BadgeType;

  @Column({
    type: 'enum',
    enum: BadgeSection,
  })
  section: BadgeSection;

  @Column({
    type: 'enum',
    enum: BadgeGroup,
  })
  group: BadgeGroup;

  @Column({ nullable: true })
  externalId: string; // To map with imported badge IDs

  @OneToMany(() => BadgeRequirement, requirement => requirement.badge)
  requirements: BadgeRequirement[];

  @OneToMany(() => MemberBadge, memberBadge => memberBadge.badge)
  memberBadges: MemberBadge[];

  @Column({ type: 'simple-array', nullable: true })
  prerequisiteBadgeIds: string[];
}