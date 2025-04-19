// src/commands/import-badges.command.ts
import { Command, CommandRunner } from 'nest-commander';
import { BadgeImportService } from '../modules/badge/services/badge-import.service';

@Command({ name: 'import-badges', description: 'Import badges from JSON files' })
export class ImportBadgesCommand extends CommandRunner {
  constructor(private readonly badgeImportService: BadgeImportService) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('Starting badge import...');
      const result = await this.badgeImportService.importBadges();
      console.log(result.message);
      process.exit(0);
    } catch (error) {
      console.error('Badge import failed:', error);
      process.exit(1);
    }
  }
}