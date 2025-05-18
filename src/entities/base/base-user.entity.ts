import { Column, Entity, TableInheritance } from 'typeorm';
import { SMISBaseEntity } from './base.entity';
import { IsEmail } from 'class-validator';
import { UserTypeEnum } from '../../common/enum/user-type.enum';
import { GenderEnum } from '../../common/enum/gender.enum';

@Entity()
export abstract class BaseUserEntity extends SMISBaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  preferredName: string;

  @Column()
  @IsEmail()
  email?: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  chineseName?: string;

  @Column({ type: 'enum', enum: UserTypeEnum })
  role: UserTypeEnum;

  @Column({ type: 'enum', enum: GenderEnum })
  gender: GenderEnum;

  @Column({ type: 'enum', enum: ['Active', 'Inactive', 'Pending'], default: 'Pending' })
  status: string;
}