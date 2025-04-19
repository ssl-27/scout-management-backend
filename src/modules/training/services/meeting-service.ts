import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MeetingEntity } from '../../../entities/training/meeting.entity';
import { BadgeRequirement } from '../../../entities/badge/badge-requirement.entity';
import { MemberRequirement } from '../../../entities/badge/member-requirement.entity';
import { Badge, BadgeGroup, BadgeType } from '../../../entities/badge/badge.entity';
import { MemberBadge } from '../../../entities/badge/member-badge.entity';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(MeetingEntity)
    private readonly meetingRepository: Repository<MeetingEntity>,
    @InjectRepository(MemberRequirement)
    private readonly memberRequirementRepository: Repository<MemberRequirement>,
    @InjectRepository(BadgeRequirement)
    private readonly badgeRequirementRepository: Repository<BadgeRequirement>,
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(MemberBadge)
    private readonly memberBadgeRepository: Repository<MemberBadge>,

  ) {}

  async create(createMeetingDto: any): Promise<MeetingEntity> {
    const meeting = this.meetingRepository.create({
      title: createMeetingDto.title,
      meetingDateStart: createMeetingDto.meetingDateStart,
      meetingDateEnd: createMeetingDto.meetingDateEnd,
      location: createMeetingDto.location,
      description: createMeetingDto.description,
      isMeetingCompleted: false,
    });

    // Handle badge requirements
    if (createMeetingDto.requirementIds && createMeetingDto.requirementIds.length > 0) {
      meeting.coveredRequirements = await this.badgeRequirementRepository.findBy({
        id: In(createMeetingDto.requirementIds),
      });
    }

    // Handle proficiency badges (interest group)
    if (createMeetingDto.proficiencyBadgeIds && createMeetingDto.proficiencyBadgeIds.length > 0) {
      meeting.proficiencyBadges = await this.badgeRepository.findBy({
        id: In(createMeetingDto.proficiencyBadgeIds),
        type: BadgeType.PROFICIENCY,
        group: BadgeGroup.INTEREST
      });
    }

    return this.meetingRepository.save(meeting);
  }
  async findAll(): Promise<MeetingEntity[]> {
    return this.meetingRepository.find({
      relations: ['coveredRequirements'],
      order: { meetingDateStart: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MeetingEntity> {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
      relations: [
        'coveredRequirements',
        'coveredRequirements.badge',
        'proficiencyBadges',
        'attendances',
        'attendances.scout'
      ],
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }

    return meeting;
  }
  async update(id: string, updateMeetingDto: any): Promise<MeetingEntity> {
    const meeting = await this.findOne(id);

    // Update simple fields
    if (updateMeetingDto.title) meeting.title = updateMeetingDto.title;
    if (updateMeetingDto.location) meeting.location = updateMeetingDto.location;
    if (updateMeetingDto.description) meeting.description = updateMeetingDto.description;
    if (updateMeetingDto.meetingDateStart) meeting.meetingDateStart = updateMeetingDto.meetingDateStart;
    if (updateMeetingDto.meetingDateEnd) meeting.meetingDateEnd = updateMeetingDto.meetingDateEnd;
    if (updateMeetingDto.isMeetingCompleted !== undefined) {
      meeting.isMeetingCompleted = updateMeetingDto.isMeetingCompleted;
    }

    // Update requirements if provided
    if (updateMeetingDto.requirementIds) {
      meeting.coveredRequirements = await this.badgeRequirementRepository.findBy({
        id: In(updateMeetingDto.requirementIds),
      });
    }

    // Update proficiency badges if provided
    if (updateMeetingDto.proficiencyBadgeIds) {
      meeting.proficiencyBadges = await this.badgeRepository.findBy({
        id: In(updateMeetingDto.proficiencyBadgeIds),
        type: BadgeType.PROFICIENCY,
        group: BadgeGroup.INTEREST
      });
    }

    await this.meetingRepository.save(meeting);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const meeting = await this.findOne(id);
    await this.meetingRepository.remove(meeting);
  }

  async completeMeeting(id: string, leaderId: string): Promise<MeetingEntity> {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
      relations: [
        'coveredRequirements',
        'proficiencyBadges',
        'attendances',
        'attendances.scout'
      ],
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }

    if (meeting.isMeetingCompleted) {
      return meeting; // Already completed
    }

    meeting.isMeetingCompleted = true;
    await this.meetingRepository.save(meeting);

    // Filter to only include attendees who were present
    const presentAttendees = meeting.attendances.filter(a => a.attendance === 'Present');

    // Process badge requirements for attendees
    if (meeting.coveredRequirements?.length > 0 && presentAttendees.length > 0) {
      for (const attendance of presentAttendees) {
        for (const requirement of meeting.coveredRequirements) {
          // Check if record already exists
          const existingRecord = await this.memberRequirementRepository.findOne({
            where: {
              scout: { id: attendance.scout.id },
              requirement: { id: requirement.id },
            },
          });

          if (!existingRecord) {
            const memberRequirement = this.memberRequirementRepository.create({
              scout: attendance.scout,
              requirement: requirement,
              completionDate: new Date(),
              approvedBy: { id: leaderId },
              completedInMeeting: meeting,
              remarks: `Completed during meeting: ${meeting.title}`,
            });

            await this.memberRequirementRepository.save(memberRequirement);
          }
        }
      }
    }

    // Process proficiency badges for attendees
    if (meeting.proficiencyBadges?.length > 0 && presentAttendees.length > 0) {
      for (const attendance of presentAttendees) {
        for (const badge of meeting.proficiencyBadges) {
          // Check if the badge is already awarded to this scout
          const existingBadge = await this.memberBadgeRepository.findOne({
            where: {
              scout: { id: attendance.scout.id },
              badge: { id: badge.id },
            },
          });

          if (!existingBadge) {
            // Create new member badge record
            const memberBadge = this.memberBadgeRepository.create({
              scout: attendance.scout,
              badge: badge,
              completionDate: new Date(),
              approvedBy: { id: leaderId },
              isApproved: true,
              remarks: `Awarded during meeting: ${meeting.title}`,
              progressPercentage: 100, // Proficiency badges are awarded fully
            });

            await this.memberBadgeRepository.save(memberBadge);
            console.log(`Awarded proficiency badge ${badge.id} to scout ${attendance.scout.id}`);
          }
        }
      }
    }

    return meeting;
  }}