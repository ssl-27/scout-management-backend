import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { Scout } from '../user-groups/scout.entity';
import { TrainingItem } from './training-item.entity';
import { SMISBaseEntity } from '../base/base.entity';
import { ScoutSectionEnum } from '../../common/enum/scout-section.enum';

@Entity()
export class TrainingRecordEntity extends SMISBaseEntity {
  @ManyToOne(() => Scout)
  scout: Scout;

  @ManyToOne(() => TrainingItem)
  trainingItem: TrainingItem;

  @Column({ type: 'enum', enum: ScoutSectionEnum})
  itemSection: ScoutSectionEnum;

  @Column({ type: 'date'})
  dateCompleted: Date;


}