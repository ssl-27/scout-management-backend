import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { Leader } from '../user-groups/leader.entity';
import { ScoutMember } from '../user-groups/scout/scout-member.entity';
import { HikingCheckpoint } from './hiking-checkpoint.entity';

@Entity()
export class HikingPlan extends SMISBaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @Column({ type: 'timestamp' })
  endDateTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdate: Date;

  @ManyToOne(() => Leader)
  supervisor: Leader;

  @ManyToMany(() => ScoutMember)
  @JoinTable({
    name: 'hiking_plan_members',
    joinColumn: { name: 'hiking_plan_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'scout_member_id', referencedColumnName: 'id' }
  })
  members: ScoutMember[];

  @Column({ default: false })
  isAssessmentPassed: boolean;

  @OneToMany(() => HikingCheckpoint, checkpoint => checkpoint.hikingPlan, { cascade: true })
  checkpoints: HikingCheckpoint[];
}