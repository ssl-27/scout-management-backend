import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { TrainingItem } from './training-item.entity';
import { SMISBaseEntity } from '../base/base.entity';
import { ScoutSectionEnum } from '../../common/enum/scout-section.enum';

@Entity()
export class BadgeDetailsEntity extends SMISBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => TrainingItem, trainingItem => trainingItem.badge, {
    cascade: true,
    nullable: true
  })
  trainingItems: TrainingItem[];

  @Column({ type: 'enum', enum: ScoutSectionEnum})
  badgeSection: ScoutSectionEnum;
}