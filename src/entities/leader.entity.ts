import { Column, Entity } from 'typeorm';
import { SMISBaseEntity } from './base.entity';
import { IsEmail } from 'class-validator';
import { LeaderRankEnum } from '../common/enum/leader-rank.enum';

@Entity()
export class Leader extends SMISBaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'date' })
  warrantExpiryDate: Date;

  @Column({ type: 'enum', enum: LeaderRankEnum })
  rank: LeaderRankEnum;

  @Column()
  division: string;
}
