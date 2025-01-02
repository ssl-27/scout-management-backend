import { Column, Entity } from 'typeorm';
import { Scout } from './scout.entity';
import { ScoutSectionRankEnum } from '../common/enum/scout-section-rank.enum';
import { PatrolNamesEnum } from '../common/enum/patrol-names.enum';

@Entity()
export class ScoutMember extends Scout {
  @Column({ type: 'enum', enum: ScoutSectionRankEnum })
  rank: ScoutSectionRankEnum;

  @Column({ type: 'enum', enum: PatrolNamesEnum })
  patrol: PatrolNamesEnum;

  @Column({ type: 'date', nullable: true })
  standardAwardDate?: Date;

  @Column({ type: 'date', nullable: true })
  advancedAwardDate?: Date;

  @Column({ type: 'date', nullable: true })
  chiefsScoutAwardDate?: Date;
}
