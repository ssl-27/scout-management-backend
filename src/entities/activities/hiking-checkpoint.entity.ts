// src/entities/activities/hiking-checkpoint.entity.ts
import { Column, Entity, ManyToOne } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { HikingPlan } from './hiking-plan.entity';

@Entity()
export class HikingCheckpoint extends SMISBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'int' })
  sequenceNumber: number;

  @Column({ type: 'timestamp', nullable: true })
  plannedDepartureTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDepartureTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  plannedArrivalTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualArrivalTime: Date;

  @Column({ type: 'int', nullable: true })
  restTimeMinutes: number;

  @Column()
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ default: false })
  isCheckedIn: boolean;

  @Column({ default: false })
  isCheckedOut: boolean;

  @ManyToOne(() => HikingPlan, hikingPlan => hikingPlan.checkpoints, { onDelete: 'CASCADE' })
  hikingPlan: HikingPlan;
}