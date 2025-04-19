import { Column, Entity } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';

@Entity()
export class ScoutNotice extends SMISBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  url: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  targetAudience: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: false })
  isImported: boolean;
}