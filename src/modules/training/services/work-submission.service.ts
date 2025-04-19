import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkSubmission } from '../../../entities/training/work-submission.entity';
import { CreateWorkSubmissionDto } from '../dto/create-work-submission.dto';
import { ReviewWorkSubmissionDto } from '../dto/review-work-submission.dto';
import { Scout } from '../../../entities/user-groups/scout.entity';
import { Leader } from '../../../entities/user-groups/leader.entity';
import { BadgeRequirement } from '../../../entities/badge/badge-requirement.entity';
import { MemberRequirement } from '../../../entities/badge/member-requirement.entity';

@Injectable()
export class WorkSubmissionService {
  constructor(
  @InjectRepository(WorkSubmission)
  private workSubmissionRepository: Repository<WorkSubmission>,

  @InjectRepository(BadgeRequirement)
  private badgeRequirementRepository: Repository<BadgeRequirement>,

  @InjectRepository(Scout)
  private scoutRepository: Repository<Scout>,

  @InjectRepository(Leader)
  private leaderRepository: Repository<Leader>,

  @InjectRepository(MemberRequirement)
  private memberRequirementRepository: Repository<MemberRequirement>,
) {}

  async create(createWorkSubmissionDto: CreateWorkSubmissionDto, scoutId: string): Promise<WorkSubmission> {
    const scout = await this.scoutRepository.findOne({ where: { id: scoutId } });
    if (!scout) {
      throw new NotFoundException('Scout not found');
    }

    const requirement = await this.badgeRequirementRepository.findOne({
      where: { id: createWorkSubmissionDto.requirementId }
    });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }


    const workSubmission = this.workSubmissionRepository.create({
      scout,
      requirement,
      description: createWorkSubmissionDto.description,
      files: createWorkSubmissionDto.files,
      externalUrl: createWorkSubmissionDto.externalUrl,
      status: 'Pending'
    });

    return this.workSubmissionRepository.save(workSubmission);
  }

  async findAll(): Promise<WorkSubmission[]> {
    return this.workSubmissionRepository.find({
      relations: ['scout', 'trainingItem', 'reviewedBy']
    });
  }

  async findAllByScout(scoutId: string): Promise<WorkSubmission[]> {
    return this.workSubmissionRepository.find({
      where: { scout: { id: scoutId } },
      relations: ['requirement', 'reviewedBy']
    });
  }

  async findAllByRequirementId(requirementId: string): Promise<WorkSubmission[]> {
    return this.workSubmissionRepository.find({
      where: { requirement: { id: requirementId} },
      relations: ['scout', 'reviewedBy']
    });
  }

  async findPending(): Promise<WorkSubmission[]> {
    return this.workSubmissionRepository.find({
      where: { status: 'Pending' },
      relations: ['scout', 'requirement']
    });
  }

  async findOne(id: string): Promise<WorkSubmission> {
    const workSubmission = await this.workSubmissionRepository.findOne({
      where: { id },
      relations: ['scout', 'requirement', 'reviewedBy']
    });

    if (!workSubmission) {
      throw new NotFoundException('Work submission not found');
    }

    return workSubmission;
  }

  async review(id: string, reviewDto: ReviewWorkSubmissionDto, leaderId: string): Promise<WorkSubmission> {
    const workSubmission = await this.findOne(id);

    const leader = await this.leaderRepository.findOne({ where: { id: leaderId } });
    if (!leader) {
      throw new NotFoundException('Leader not found');
    }

    workSubmission.status = reviewDto.status;
    workSubmission.feedback = reviewDto.feedback;
    workSubmission.reviewedBy = leader;
    workSubmission.reviewedAt = new Date();

    const savedSubmission = await this.workSubmissionRepository.save(workSubmission);

    // If approved, create a MemberRequirement record
    if (reviewDto.status === 'Approved') {
      const existingRecord = await this.memberRequirementRepository.findOne({
        where: {
          scout: { id: workSubmission.scout.id },
          requirement: { id: workSubmission.requirement.id }
        }
      });

      if (!existingRecord) {
        const memberRequirement = this.memberRequirementRepository.create({
          scout: workSubmission.scout,
          requirement: workSubmission.requirement,
          completionDate: new Date(),
          approvedBy: leader,
          remarks: reviewDto.feedback || 'Approved via work submission',
          evidenceFiles: workSubmission.files
        });
        await this.memberRequirementRepository.save(memberRequirement);
      }
    }

    return savedSubmission;
  }
  async delete(id: string, userId: string): Promise<void> {
    const workSubmission = await this.findOne(id);

    // Only allow scouts to delete their own submissions and only if they're still pending
    if (workSubmission.scout.id !== userId || workSubmission.status !== 'Pending') {
      throw new ForbiddenException('You are not allowed to delete this submission');
    }

    await this.workSubmissionRepository.remove(workSubmission);
  }
}