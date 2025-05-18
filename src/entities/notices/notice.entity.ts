import { Column, Entity, ManyToOne } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';
import { Leader } from '../user-groups/leader.entity';


@Entity()
export class Notice extends SMISBaseEntity {
  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ type: 'date' })
  sendDate: Date;

  @Column({ nullable: true })
  sendTime?: string;

  @Column({ default: false })
  isSent: boolean;

  @Column({ type: 'enum', enum: ['Meeting', 'Event', 'Announcement', 'Other'], default: 'Announcement' })
  noticeType: string;

  @ManyToOne(() => Leader)
  createdBy: Leader;
}