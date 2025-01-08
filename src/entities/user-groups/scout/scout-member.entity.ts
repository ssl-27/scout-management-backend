import { ChildEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn, TableInheritance } from 'typeorm';
import { Scout } from '../scout.entity';
import { ScoutSectionRankEnum } from '../../../common/enum/scout-section-rank.enum';
import { PatrolNamesEnum } from '../../../common/enum/patrol-names.enum';
import { BaseUserEntity } from '../../base/base-user.entity';

@Entity()
export class ScoutMember {
  @OneToOne(() => Scout)
  @JoinColumn({ name: 'id' })
  @PrimaryColumn()
  id: string;

  @Column({ type: 'enum', enum: ScoutSectionRankEnum })
  scoutSectionRank: ScoutSectionRankEnum;

  @Column({ type: 'enum', enum: PatrolNamesEnum })
  patrol: PatrolNamesEnum;

  @Column({ type: 'date', nullable: true })
  standardAwardDate?: Date;

  @Column({ type: 'date', nullable: true })
  advancedAwardDate?: Date;

  @Column({ type: 'date', nullable: true })
  chiefsScoutAwardDate?: Date;

  @Column()
  schoolClass: string;

  @Column({ type: 'int' })
  classNumber: number;
}
