import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  TableInheritance,
} from 'typeorm';
import { ScoutSectionEnum } from '../../common/enum/scout-section.enum';
import { Guardian } from './guardian.entity';
import { BaseUserEntity } from '../base/base-user.entity';


@Entity()
export abstract class Scout {
  @OneToOne(() => BaseUserEntity)
  @JoinColumn({ name: 'id' })
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true, unique: true })
  ymisId: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: ScoutSectionEnum,
  })
  section: ScoutSectionEnum;

  @Column({ type: 'date', nullable: true })
  investitureDate?: Date;

  @Column({ nullable: true, type: 'date' })
  dateJoined?: Date;

}
