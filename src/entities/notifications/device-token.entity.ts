// src/entities/device-token.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BaseUserEntity } from '../base/base-user.entity';

@Entity()
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  platform: string;

  @ManyToOne(() => BaseUserEntity, { onDelete: 'CASCADE' })
  user: BaseUserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUsed: Date;
}