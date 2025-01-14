import { SMISBaseEntity } from '../base/base.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Attendance } from './attendance.entity';
import { TrainingItem } from './training-item.entity';

@Entity()
export class MeetingEntity extends SMISBaseEntity {
  @Column()
  title: string;

  @Column( { type: 'timestamp'})
  meetingDateStart: Date;

  @Column( { type: 'timestamp'})
  meetingDateEnd: Date;

  @Column()
  location: string;

  @Column( { type: 'text'})
  description: string;

  @Column({ type: 'boolean', default: false })
  isMeetingCompleted: boolean;

  @OneToMany(() => Attendance, attendance => attendance.meetingEntity)
  @JoinColumn()
  attendances: Attendance[];

  @ManyToMany(() => TrainingItem)
  @JoinTable()
  trainingItems: TrainingItem[];

}