import { Column, Entity, OneToOne } from 'typeorm';
import { SMISBaseEntity } from './base.entity';
import { IsEmail } from 'class-validator';
import { Scout } from './scout.entity';

@Entity()
export class Guardian extends SMISBaseEntity {
  @Column()
  name: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  phone: string;

  @Column()
  relationship: string;

  @Column()
  @OneToOne(() => Scout, (scout) => scout.guardian)
  scout: Scout;
}
