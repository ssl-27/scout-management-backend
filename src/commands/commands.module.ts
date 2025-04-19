// src/commands/commands.module.ts
import { Module } from '@nestjs/common';
import { ImportBadgesCommand } from './import-badges.command';
import { BadgeModule } from '../modules/badge/badge.module';

@Module({
  imports: [BadgeModule],
  providers: [ImportBadgesCommand],
  exports: [ImportBadgesCommand],
})
export class CommandsModule {}