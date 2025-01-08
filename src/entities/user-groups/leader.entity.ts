import { ChildEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn, TableInheritance } from 'typeorm';
import { BaseUserEntity } from '../base/base-user.entity';
import { LeaderRankEnum } from '../../common/enum/leader-rank.enum';

@Entity()
export class Leader {
  @OneToOne(() => BaseUserEntity)
  @JoinColumn({ name: 'id' })
  @PrimaryColumn()
  id: string;

  @Column({ type: 'date' })
  warrantExpiryDate: Date;

  @Column({ type: 'enum', enum: LeaderRankEnum })
  leaderRank: LeaderRankEnum;

  @Column()
  division: string;
}
