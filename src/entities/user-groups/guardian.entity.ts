import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { BaseUserEntity } from '../base/base-user.entity';
import { GuardianRelationshipEnum } from '../../common/enum/guardian-relationship.enum';

@Entity()
export class Guardian {
  @OneToOne(() => BaseUserEntity)
  @JoinColumn({ name: 'id' })
  @PrimaryColumn()
  id: string;

  @Column({ type: 'enum', enum: GuardianRelationshipEnum })
  relationship: GuardianRelationshipEnum;
}
