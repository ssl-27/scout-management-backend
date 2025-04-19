// src/modules/badge/badge-import.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import {
  Badge,
  BadgeGroup,
  BadgeSection,
  BadgeType,
} from '../../../entities/badge/badge.entity';
import {
  BadgeRequirement,
  RequirementType,
} from '../../../entities/badge/badge-requirement.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BadgeImportService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(BadgeRequirement)
    private requirementRepository: Repository<BadgeRequirement>,
    private dataSource: DataSource, // Inject the DataSource for transaction management
  ) {}

  async importBadges() {
    // Use a transaction to ensure database consistency
    return this.dataSource.transaction(async (manager) => {
      try {
        console.log('Starting badge import...');

        // First, clear records from the dependent tables
        console.log('Deleting member_requirement records...');
        await manager.query('DELETE FROM "member_requirement"');

        // Then clear badge requirements
        console.log('Deleting badge_requirement records...');
        await manager.delete('badge_requirement', {});

        // Finally clear the badges
        console.log('Deleting badge records...');
        await manager.delete('badge', {});

        // Import proficiency badges
        console.log('Importing proficiency badges...');
        await this.importProficiencyBadges(manager);

        // Import progressive badges
        console.log('Importing progressive badges...');
        await this.importProgressiveBadges(manager);

        console.log('Badge import completed successfully!');
        return { success: true, message: 'Badges imported successfully' };
      } catch (error) {
        console.error('Error during badge import:', error);
        throw error;
      }
    });
  }

  // Update these methods to accept the EntityManager as a parameter
  private async importProficiencyBadges(manager: EntityManager) {
    const filePath = path.join(
      process.cwd(),
      'data',
      'proficiency-badges.json',
    );
    console.log('Reading proficiency badges from:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      throw new Error(`Proficiency badges file not found: ${filePath}`);
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const badgeData of jsonData.badges) {
      console.log(`Processing badge: ${badgeData.title}`);

      const badge = this.badgeRepository.create({
        title: badgeData.title,
        type: BadgeType[badgeData.type],
        section: BadgeSection.SCOUT, // Default to SCOUT section
        group: BadgeGroup[badgeData.group],
        externalId: badgeData.id,
      });

      await manager.save(badge);
    }
  }

// Modify this part in the importProgressiveBadges method
  private async importProgressiveBadges(manager: EntityManager) {
    const filePath = path.join(process.cwd(), 'data', 'progressive-badges.json');
    console.log('Reading progressive badges from:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      throw new Error(`Progressive badges file not found: ${filePath}`);
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const badgeData of jsonData.badges) {
      // Create the badge
      const badge = this.badgeRepository.create({
        title: badgeData.title,
        type: BadgeType.PROGRESSIVE,
        section: BadgeSection[badgeData.section],
        group: BadgeGroup.PROGRESSIVE,
        externalId: badgeData.id,
      });

      // Add prerequisites if any
      if (badgeData.prerequisites && badgeData.prerequisites.length > 0) {
        const prereqBadges = await manager.find(Badge, {
          where: {
            externalId: In(badgeData.prerequisites),
          },
        });

        badge.prerequisiteBadgeIds = prereqBadges.map((b) => b.id);
      }

      const savedBadge = await manager.save(badge);

      // Create requirements
      if (badgeData.requirements && badgeData.requirements.length > 0) {
        for (const reqData of badgeData.requirements) {
          console.log(
            `Processing requirement: ${reqData.text} (${reqData.order})`,
          );

          const requirement = this.requirementRepository.create({
            badge: savedBadge,
            text: reqData.text || '',
            sortOrder: reqData.order || 0,
            type: RequirementType[reqData.type],
            section: reqData.section,
          });

          // Handle badge requirements
          if (reqData.badges_used && reqData.badges_used.length > 0) {
            const usedBadges = await manager.find(Badge, {
              where: {
                externalId: In(reqData.badges_used),
              },
            });

            requirement.badgesUsed = usedBadges.map((b) => b.id);
          }

          // Handle options for OPTIONAL requirements
          if (reqData.options && reqData.options.length > 0) {
            requirement.options = reqData.options;
          }

          const savedRequirement = await manager.save(requirement);

          // Create sub-requirements if any
          if (reqData.sub_requirements && reqData.sub_requirements.length > 0) {
            for (const subReqData of reqData.sub_requirements) {
              console.log(
                `Processing sub-requirement: ${subReqData.text} (${subReqData.order})`,
              );

              const subRequirement = this.requirementRepository.create({
                badge: savedBadge,
                parent: savedRequirement, // This is the important part - linking to parent
                text: subReqData.text || '',
                sortOrder: subReqData.order,
                type: RequirementType[subReqData.type],
              });

              // Handle badges used in sub-requirements (if any)
              if (subReqData.badges_used && subReqData.badges_used.length > 0) {
                const usedBadges = await manager.find(Badge, {
                  where: {
                    externalId: In(subReqData.badges_used),
                  },
                });

                subRequirement.badgesUsed = usedBadges.map((b) => b.id);
              }

              // Handle options for OPTIONAL sub-requirements
              if (subReqData.options && subReqData.options.length > 0) {
                subRequirement.options = subReqData.options;
              }

              await manager.save(subRequirement);
            }
          }
        }
      }
    }
  }}