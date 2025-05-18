import { Column, Entity, ManyToOne } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { BadgeRequirement } from './badge-requirement.entity';
import { Scout } from '../user-groups/scout.entity';
import { Leader } from '../user-groups/leader.entity';
import { MeetingEntity } from '../training/meeting.entity';
import { MemberBadge } from './member-badge.entity';

@Entity()
export class MemberRequirement extends SMISBaseEntity {
  @ManyToOne(() => Scout)
  scout: Scout;

  @ManyToOne(() => BadgeRequirement, requirement => requirement.memberRequirements)
  requirement: BadgeRequirement;

  // Link to the parent badge progress
  @ManyToOne(() => MemberBadge, memberBadge => memberBadge.requirements)
  memberBadge: MemberBadge;

  @Column({ type: 'date' })
  completionDate: Date;

  @ManyToOne(() => Leader)
  approvedBy: Leader;

  @Column({ nullable: true })
  selectedOption: string; // For OPTIONAL requirements

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'simple-array', nullable: true })
  usedBadgeIds: string[]; // IDs of proficiency badges used to fulfill this requirement

  @Column({ type: 'json', nullable: true })
  evidenceFiles: { filename: string; originalName: string; url: string }[];

  @ManyToOne(() => MeetingEntity, { nullable: true })
  completedInMeeting: MeetingEntity;
}