// src/modules/badge/badge.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from '../../entities/badge/badge.entity';
import { BadgeRequirement } from '../../entities/badge/badge-requirement.entity';
import { MemberBadge } from '../../entities/badge/member-badge.entity';
import { MemberRequirement } from '../../entities/badge/member-requirement.entity';
import { BadgeService } from './services/badge.service';
import { BadgeImportService } from './services/badge-import.service';
import { Scout } from '../../entities/user-groups/scout.entity';
import { Leader } from '../../entities/user-groups/leader.entity';
import { BadgeController } from './controller/badge.controller';
import { BaseUserEntity } from '../../entities/base/base-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Badge,
      BadgeRequirement,
      MemberBadge,
      MemberRequirement,
      Scout,
      Leader,
      BaseUserEntity,
    ]),
  ],
  providers: [BadgeService, BadgeImportService],
  controllers: [BadgeController],
  exports: [BadgeService, BadgeImportService],
})
export class BadgeModule {}