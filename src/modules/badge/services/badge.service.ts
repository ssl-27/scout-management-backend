// src/modules/badge/services/badge.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge, BadgeGroup, BadgeType } from '../../../entities/badge/badge.entity';
import { BadgeRequirement, RequirementType } from '../../../entities/badge/badge-requirement.entity';
import { MemberBadge } from '../../../entities/badge/member-badge.entity';
import { MemberRequirement } from '../../../entities/badge/member-requirement.entity';
import { Scout } from '../../../entities/user-groups/scout.entity';
import { DataSource } from 'typeorm';
import { BaseUserEntity } from '../../../entities/base/base-user.entity';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,

    @InjectRepository(BadgeRequirement)
    private requirementRepository: Repository<BadgeRequirement>,

    @InjectRepository(MemberBadge)
    private memberBadgeRepository: Repository<MemberBadge>,

    @InjectRepository(MemberRequirement)
    private memberRequirementRepository: Repository<MemberRequirement>,

    @InjectRepository(BaseUserEntity)
    private baseUserRepository: Repository<BaseUserEntity>,

    private dataSource: DataSource, // For transactions
  ) {}

  async getAllBadges(): Promise<Badge[]> {
    return this.badgeRepository.find({
      relations: ['requirements'],
      order: { title: 'ASC' },
    });
  }

  async getBadgeById(id: string): Promise<Badge> {
    return this.badgeRepository.findOne({
      where: { id },
      relations: ['requirements'],
    });
  }

  async getMemberBadges(scoutId: string): Promise<MemberBadge[]> {
    return this.memberBadgeRepository.find({
      where: { scout: { id: scoutId } },
      relations: ['badge', 'approvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMemberRequirements(scoutId: string, badgeId: string): Promise<MemberRequirement[]> {
    return this.memberRequirementRepository.find({
      where: {
        scout: { id: scoutId },
        requirement: { badge: { id: badgeId } },
      },
      relations: ['requirement', 'approvedBy', 'memberBadge'],
    });
  }

  async getScoutBadgeProgress(scoutId: string): Promise<any[]> {
    // Get all badges
    const badges = await this.badgeRepository.find({
      relations: ['requirements'],
    });

    // Get all member badges for this scout
    const memberBadges = await this.memberBadgeRepository.find({
      where: { scout: { id: scoutId } },
      relations: ['badge', 'approvedBy'],
    });

    // Create a map for quick badge status lookup
    const badgeStatusMap = new Map();
    for (const mb of memberBadges) {
      const baseUser = await this.baseUserRepository.findOne({
        where: { id: mb.approvedBy.id },
      });

      badgeStatusMap.set(mb.badge.id, {
        isApproved: mb.isApproved,
        completionDate: mb.completionDate,
        approvedBy: baseUser,
        progressPercentage: mb.progressPercentage
      });
    }

    // Get all completed requirements
    const completedRequirements = await this.memberRequirementRepository.find({
      where: { scout: { id: scoutId } },
      relations: ['requirement', 'requirement.badge'],
    });

    // Create a map for quick requirement completion lookup
    const completedReqMap = new Map();
    completedRequirements.forEach(cr => {
      if (cr.requirement.badge) {
        if (!completedReqMap.has(cr.requirement.badge.id)) {
          completedReqMap.set(cr.requirement.badge.id, new Set());
        }
        completedReqMap.get(cr.requirement.badge.id).add(cr.requirement.id);
      }
    });

    // Create the progress report for each badge
    const badgeProgressPromises = badges.map(async badge => {
      const badgeStatus = badgeStatusMap.get(badge.id) || {};
      const completedReqs = completedReqMap.get(badge.id) || new Set();
      const totalReqs = badge.requirements.length;
      const completedCount = completedReqs.size;
      let progressPercentage = totalReqs > 0 ? (completedCount / totalReqs) * 100 : 0;

      // Check if the badge is completed
      const { isComplete } = await this.checkBadgeCompletion(scoutId, badge.id);

      // If badge is completed or approved, set progress to 100%
      if (isComplete || badgeStatus.isApproved) {
        progressPercentage = 100;
      }

      return {
        badgeId: badge.id,
        badgeTitle: badge.title,
        badgeType: badge.type,
        badgeSection: badge.section,
        isApproved: badgeStatus.isApproved || false,
        completionDate: badgeStatus.completionDate || null,
        approvedBy: badgeStatus.approvedBy || null,
        progress: {
          completedRequirements: completedCount,
          totalRequirements: totalReqs,
          percentage: progressPercentage,
        }
      };
    });

    return Promise.all(badgeProgressPromises);
  }
  async awardBadge(
    scoutId: string,
    badgeId: string,
    leaderId: string,
    completionDate: Date,
    remarks?: string
  ): Promise<MemberBadge> {
    // Start a transaction to ensure data consistency
    return this.dataSource.transaction(async manager => {
      // Check if the badge already exists for this scout
      let memberBadge = await manager.findOne(MemberBadge, {
        where: {
          scout: { id: scoutId },
          badge: { id: badgeId }
        },
        relations: ['badge', 'scout']
      });

      if (!memberBadge) {
        // Create a new badge record
        memberBadge = manager.create(MemberBadge, {
          scout: { id: scoutId } as any,
          badge: { id: badgeId } as any,
          completionDate,
          approvedBy: { id: leaderId } as any,
          isApproved: true,
          remarks
        });
      } else {
        // Update existing record
        memberBadge.completionDate = completionDate;
        memberBadge.approvedBy = { id: leaderId } as any;
        memberBadge.isApproved = true;
        memberBadge.remarks = remarks;
      }

      return manager.save(memberBadge);
    });
  }

  async completeRequirement(
    scoutId: string,
    requirementId: string,
    leaderId: string,
    completionDate: Date,
    remarks?: string,
    selectedOption?: string,
    usedBadgeIds?: string[],
    evidenceFiles?: any[]
  ): Promise<MemberRequirement> {
    return this.dataSource.transaction(async manager => {
      // Get the requirement info to find the badge
      const requirement = await manager.findOne(BadgeRequirement, {
        where: { id: requirementId },
        relations: ['badge']
      });

      if (!requirement) {
        throw new NotFoundException(`Requirement with ID ${requirementId} not found`);
      }

      // Get or create the member badge record
      let memberBadge = await manager.findOne(MemberBadge, {
        where: {
          scout: { id: scoutId },
          badge: { id: requirement.badge.id }
        }
      });

      if (!memberBadge) {
        memberBadge = manager.create(MemberBadge, {
          scout: { id: scoutId } as any,
          badge: { id: requirement.badge.id } as any
        });
        memberBadge = await manager.save(memberBadge);
      }

      // Check for existing requirement record
      let memberRequirement = await manager.findOne(MemberRequirement, {
        where: {
          scout: { id: scoutId },
          requirement: { id: requirementId }
        }
      });

      if (!memberRequirement) {
        // Create new requirement record
        memberRequirement = manager.create(MemberRequirement, {
          scout: { id: scoutId } as any,
          requirement: { id: requirementId } as any,
          memberBadge,
          completionDate,
          approvedBy: { id: leaderId } as any,
          remarks,
          selectedOption,
          usedBadgeIds,
          evidenceFiles
        });
      } else {
        // Update existing record
        memberRequirement.completionDate = completionDate;
        memberRequirement.approvedBy = { id: leaderId } as any;
        memberRequirement.remarks = remarks;
        memberRequirement.selectedOption = selectedOption;
        memberRequirement.usedBadgeIds = usedBadgeIds;
        memberRequirement.evidenceFiles = evidenceFiles;
        memberRequirement.memberBadge = memberBadge;
      }

      const savedRequirement = await manager.save(memberRequirement);

      // Update badge progress percentage
      await this.updateBadgeProgress(manager, scoutId, requirement.badge.id);

      // If using badges to fulfill this requirement, mark them as used
      if (usedBadgeIds && usedBadgeIds.length > 0) {
        for (const badgeId of usedBadgeIds) {
          const badge = await manager.findOne(MemberBadge, {
            where: {
              scout: { id: scoutId },
              badge: { id: badgeId }
            }
          });

          if (badge) {
            badge.isUsedForProgressive = true;
            if (!badge.usedForRequirementIds) {
              badge.usedForRequirementIds = [];
            }
            if (!badge.usedForRequirementIds.includes(requirementId)) {
              badge.usedForRequirementIds.push(requirementId);
            }
            await manager.save(badge);
          }
        }
      }

      return savedRequirement;
    });
  }

  private async updateBadgeProgress(
    manager: any,
    scoutId: string,
    badgeId: string
  ): Promise<void> {
    // Get all requirements for this badge
    const badge = await manager.findOne(Badge, {
      where: { id: badgeId },
      relations: ['requirements']
    });

    if (!badge || !badge.requirements || badge.requirements.length === 0) {
      return;
    }

    // Get completed requirements
    const completedRequirements = await manager.find(MemberRequirement, {
      where: {
        scout: { id: scoutId },
        requirement: { badge: { id: badgeId } }
      },
      relations: ['requirement']
    });

    const totalReqs = badge.requirements.length;
    const completedCount = completedRequirements.length;
    const progressPercentage = totalReqs > 0 ? (completedCount / totalReqs) * 100 : 0;

    // Update progress in member badge
    await manager.update(MemberBadge,
      { scout: { id: scoutId }, badge: { id: badgeId } },
      { progressPercentage }
    );

    // Check if all requirements are complete
    const isComplete = this.isBadgeCompleted(badge, completedRequirements);

    // If all requirements are met but badge not yet approved, we can update the status
    if (isComplete) {
      const memberBadge = await manager.findOne(MemberBadge, {
        where: {
          scout: { id: scoutId },
          badge: { id: badgeId },
          isApproved: false
        }
      });

      if (memberBadge) {
        memberBadge.completionDate = new Date();
        // We don't set isApproved automatically - that should be done explicitly by a leader
        await manager.save(memberBadge);
      }
    }
  }

  private isBadgeCompleted(badge: Badge, completedReqs: MemberRequirement[]): boolean {
    // Create a map for quick lookup of completed requirements
    const completedReqMap = new Map(
      completedReqs.map(cr => [cr.requirement.id, cr])
    );

    // Check mandatory requirements
    const mandatoryReqs = badge.requirements.filter(r => r.type === RequirementType.MANDATORY);
    const allMandatoryComplete = mandatoryReqs.every(r => completedReqMap.has(r.id));

    // Check optional requirements
    const optionalReqs = badge.requirements.filter(r => r.type === RequirementType.OPTIONAL);
    const allOptionalComplete = optionalReqs.every(r => {
      // Check if requirement is completed
      const completedReq = completedReqMap.get(r.id);
      if (!completedReq) return false;

      // If it has options, ensure one is selected
      if (r.options && r.options.length > 0) {
        return !!completedReq.selectedOption;
      }

      return true;
    });

    // Check elective requirements
    const electiveReqs = badge.requirements.filter(r => r.type === RequirementType.ELECTIVE);
    const hasElectives = electiveReqs.length > 0;
    const anyElectiveComplete = !hasElectives ||
      electiveReqs.some(r => completedReqMap.has(r.id));

    return allMandatoryComplete && allOptionalComplete && anyElectiveComplete;
  }

  async checkBadgeCompletion(scoutId: string, badgeId: string): Promise<{
    isComplete: boolean,
    missingRequirements: string[]
  }> {
    const badge = await this.badgeRepository.findOne({
      where: { id: badgeId },
      relations: ['requirements'],
    });

    if (!badge) {
      throw new NotFoundException(`Badge with ID ${badgeId} not found`);
    }

    // Check if the badge is already approved
    const memberBadge = await this.memberBadgeRepository.findOne({
      where: {
        scout: { id: scoutId },
        badge: { id: badgeId }
      },
    });

    if (!memberBadge?.isApproved && badge.type != BadgeType.PROGRESSIVE) {
      return { isComplete: false, missingRequirements: [] };
    }

    const completedRequirements = await this.memberRequirementRepository.find({
      where: {
        scout: { id: scoutId },
        requirement: { badge: { id: badgeId } }
      },
      relations: ['requirement'],
    });

    const completedReqIds = new Set(completedRequirements.map(r => r.requirement.id));

    const mandatoryRequirements = badge.requirements.filter(r => r.type === RequirementType.MANDATORY);
    const electiveRequirements = badge.requirements.filter(r => r.type === RequirementType.ELECTIVE);

    // Check mandatory requirements
    const missingMandatory = mandatoryRequirements
      .filter(r => !completedReqIds.has(r.id))
      .map(r => r.text);

    // Check elective requirements
    const hasElectives = electiveRequirements.length > 0;
    const completedElective = hasElectives &&
      electiveRequirements.some(r => completedReqIds.has(r.id));

    const missingElective = hasElectives && !completedElective
      ? ['At least one elective requirement must be completed']
      : [];

    // Check prerequisites
    let prerequisitesMet = true;
    let missingPrerequisites = [];

    if (badge.prerequisiteBadgeIds && badge.prerequisiteBadgeIds.length > 0) {
      for (const prereqId of badge.prerequisiteBadgeIds) {
        const memberBadge = await this.memberBadgeRepository.findOne({
          where: {
            scout: { id: scoutId },
            badge: { id: prereqId },
            isApproved: true
          },
        });

        if (!memberBadge) {
          prerequisitesMet = false;
          const prereqBadge = await this.badgeRepository.findOne({
            where: { id: prereqId },
          });
          if (prereqBadge) {
            missingPrerequisites.push(`Prerequisite badge: ${prereqBadge.title}`);
          }
        }
      }
    }

    const isComplete = missingMandatory.length === 0 &&
      (!hasElectives || completedElective) &&
      prerequisitesMet;

    const missingRequirements = [...missingMandatory, ...missingElective, ...missingPrerequisites];

    return { isComplete, missingRequirements };
  }

  async getIncompleteBadgeRequirementsForScout(scoutId: string): Promise<BadgeRequirement[]> {
    // Get all badge requirements
    const allRequirements = await this.requirementRepository.find({
      relations: ['badge']
    });

    // Get completed requirements for this scout
    const completedRequirements = await this.memberRequirementRepository.find({
      where: { scout: { id: scoutId } },
      relations: ['requirement']
    });

    // Create a set of completed requirement IDs for quick lookup
    const completedReqIds = new Set(completedRequirements.map(cr => cr.requirement.id));

    // Filter out completed requirements
    return allRequirements.filter(req => !completedReqIds.has(req.id));
  }

  async getDetailedBadgeProgress(scoutId: string, badgeId: string) {
    const badge = await this.badgeRepository.findOne({
      where: { id: badgeId },
      relations: ['requirements'],
    });

    if (!badge) {
      throw new NotFoundException(`Badge with ID ${badgeId} not found`);
    }

    // Retrieve all requirements, including parent-child relationships
    const requirements = await this.requirementRepository.find({
      where: { badge: { id: badgeId } },
      relations: ['parent']
    });

    // Build a map of parent requirements to their children
    const requirementMap = new Map();
    const topLevelRequirements = [];

    // First pass: index all requirements by ID
    requirements.forEach(req => {
      requirementMap.set(req.id, { ...req, children: [] });
    });

    // Second pass: build parent-child relationships
    requirements.forEach(req => {
      if (req.parent) {
        const parentReq = requirementMap.get(req.parent.id);
        if (parentReq) {
          parentReq.children.push(requirementMap.get(req.id));
        }
      } else {
        topLevelRequirements.push(requirementMap.get(req.id));
      }
    });

    // Now get completion status for all requirements
    const memberRequirements = await this.memberRequirementRepository.find({
      where: {
        scout: { id: scoutId },
        requirement: { badge: { id: badgeId } }
      },
      relations: ['requirement']
    });

    // Create a map for completed requirements
    const completedRequirementsMap = new Map(
      memberRequirements.map(mr => [mr.requirement.id, mr])
    );

    // Process requirements to include completion status
    const processRequirements = (reqs) => {
      return reqs.map(req => {
        const memberRequirement = completedRequirementsMap.get(req.id);
        const processed = {
          id: req.id,
          text: req.text,
          type: req.type,
          options: req.options,
          isCompleted: !!memberRequirement,
          completionDate: memberRequirement?.completionDate || null,
          selectedOption: memberRequirement?.selectedOption || null,
          remarks: memberRequirement?.remarks || null,
          evidenceFiles: memberRequirement?.evidenceFiles || [],
          usedBadgeIds: memberRequirement?.usedBadgeIds || [],
          children:[]
        };

        if (req.children && req.children.length > 0) {
          processed.children = processRequirements(req.children);
        }

        return processed;
      });
    };

    const processedRequirements = processRequirements(topLevelRequirements);

    // Get the member badge for overall progress
    const memberBadge = await this.memberBadgeRepository.findOne({
      where: {
        scout: { id: scoutId },
        badge: { id: badgeId }
      }
    });

    // Calculate total and completed requirements counts
    const countRequirements = (reqs) => {
      let total = reqs.length;
      let completed = 0;

      reqs.forEach(req => {
        if (req.isCompleted) completed++;
        if (req.children && req.children.length > 0) {
          const counts = countRequirements(req.children);
          total += counts.total;
          completed += counts.completed;
        }
      });

      return { total, completed };
    };

    // Check if the badge is completed
    const { isComplete } = await this.checkBadgeCompletion(scoutId, badgeId);

    // Calculate percentage but override to 100% if badge is completed
    const counts = countRequirements(processedRequirements);
    let progressPercentage = counts.total > 0
      ? (counts.completed / counts.total) * 100
      : 0;

    // If badge is completed, set progress to 100%
    if (isComplete || memberBadge?.isApproved) {
      progressPercentage = 100;
    }

    return {
      badgeId: badge.id,
      badgeTitle: badge.title,
      isApproved: memberBadge?.isApproved || false,
      completionDate: memberBadge?.completionDate,
      progressPercentage: memberBadge?.progressPercentage || progressPercentage,
      totalRequirements: counts.total,
      completedCount: counts.completed,
      requirements: processedRequirements
    };
  }

  async getInterestProficiencyBadges(): Promise<Badge[]> {
    return this.badgeRepository.find({
      where: {
        type: BadgeType.PROFICIENCY,
        group: BadgeGroup.INTEREST
      },
      order: { title: 'ASC' },
    });
  }

  async getAllRequirements(): Promise<BadgeRequirement[]> {
    return this.requirementRepository.find({
      relations: ['badge'],
      order: { sortOrder: 'ASC' },
    });
  }
}