import { Column, Entity, TableInheritance } from 'typeorm';
import { SMISBaseEntity } from '../base/base.entity';

@Entity()
export class OtpEntity extends SMISBaseEntity {
  @Column()
  otp: string;

  @Column()
  email: string;

  @Column()
  expiryDate: Date;

  @Column({ default: false })
  isUsed: boolean;
}