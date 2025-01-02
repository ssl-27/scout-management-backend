import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SMISBaseEntity } from './base.entity';
import { ScoutSectionEnum } from '../common/enum/scout-section.enum';
import { IsEmail } from 'class-validator';
import { Guardian } from './guardian.entity';

@Entity()
export abstract class Scout extends SMISBaseEntity {
  @Column({ nullable: true, unique: true })
  ymisId: string;

  @Column({ nullable: true })
  chineseName?: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

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

  @Column()
  @IsEmail()
  email: string;

  @Column()
  phone: string;

  @Column()
  @OneToOne(() => Guardian, (guardian) => guardian.scout)
  @JoinColumn()
  guardian: Guardian;
}
