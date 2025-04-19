// src/modules/activities/services/hiking-plan.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { HikingPlan } from '../../../entities/activities/hiking-plan.entity';
import { HikingCheckpoint } from '../../../entities/activities/hiking-checkpoint.entity';
import { Leader } from '../../../entities/user-groups/leader.entity';
import { ScoutMember } from '../../../entities/user-groups/scout/scout-member.entity';
import { CreateHikingPlanDto } from '../dto/create-hiking-plan.dto';
import { UpdateHikingPlanDto } from '../dto/update-hiking-plan.dto';
import { CheckInOutDto } from '../dto/check-in-out.dto';
import { EmailService } from '../../email/email.service';
import { MemberGuardian } from '../../../entities/user-groups/member-guardian.entity';
import { BaseUserEntity } from '../../../entities/base/base-user.entity';

@Injectable()
export class HikingPlanService {
  constructor(
    @InjectRepository(HikingPlan)
    private hikingPlanRepository: Repository<HikingPlan>,

    @InjectRepository(HikingCheckpoint)
    private hikingCheckpointRepository: Repository<HikingCheckpoint>,

    @InjectRepository(Leader)
    private leaderRepository: Repository<Leader>,

    @InjectRepository(ScoutMember)
    private scoutMemberRepository: Repository<ScoutMember>,

    @InjectRepository(MemberGuardian)
    private memberGuardianRepository: Repository<MemberGuardian>,

    @InjectRepository(BaseUserEntity)
    private baseUserRepository: Repository<BaseUserEntity>,

    private dataSource: DataSource,

    private emailService: EmailService,
  ) {}

  async create(createHikingPlanDto: CreateHikingPlanDto): Promise<HikingPlan> {
    // Start a transaction to ensure all operations succeed or fail together
    return this.dataSource.transaction(async manager => {
      // Find supervisor
      const supervisor = await manager.findOne(Leader, {
        where: { id: createHikingPlanDto.supervisorId }
      });

      // Find members
      const members = await manager.findBy(ScoutMember, {
        id: In(createHikingPlanDto.memberIds)
      });

      // Create hiking plan
      const hikingPlan = manager.create(HikingPlan, {
        title: createHikingPlanDto.title,
        description: createHikingPlanDto.description,
        startDateTime: new Date(createHikingPlanDto.startDateTime),
        endDateTime: new Date(createHikingPlanDto.endDateTime),
        supervisor,
        members,
        isAssessmentPassed: createHikingPlanDto.isAssessmentPassed || false,
      });

      const savedPlan = await manager.save(hikingPlan);

      // Create checkpoints if any
      if (createHikingPlanDto.checkpoints && createHikingPlanDto.checkpoints.length > 0) {
        const checkpoints = createHikingPlanDto.checkpoints.map(cpDto => {
          return manager.create(HikingCheckpoint, {
            name: cpDto.name,
            sequenceNumber: cpDto.sequenceNumber,
            plannedDepartureTime: cpDto.plannedDepartureTime ? new Date(cpDto.plannedDepartureTime) : null,
            plannedArrivalTime: cpDto.plannedArrivalTime ? new Date(cpDto.plannedArrivalTime) : null,
            restTimeMinutes: cpDto.restTimeMinutes,
            location: cpDto.location,
            latitude: cpDto.latitude,
            longitude: cpDto.longitude,
            hikingPlan: savedPlan,
          });
        });

        // Save all checkpoints
        await manager.save(checkpoints);

        // Update the savedPlan object with the saved checkpoints
        savedPlan.checkpoints = checkpoints;
      }

      return savedPlan;
    });
  }
  async findAll(): Promise<HikingPlan[]> {
    return this.hikingPlanRepository.find({
      relations: ['supervisor', 'members', 'checkpoints'],
      order: {
        startDateTime: 'DESC',
        checkpoints: {
          sequenceNumber: 'ASC'
        }
      }
    });
  }

  async findAllForScout(scoutId: string): Promise<HikingPlan[]> {
    // Get all hiking plan IDs this scout is a member of
    const result = await this.dataSource.query(`
    SELECT hiking_plan_id 
    FROM hiking_plan_members 
    WHERE scout_member_id = $1
  `, [scoutId]);

    const planIds = result.map(row => row.hiking_plan_id);
    if (planIds.length === 0) return [];

    // Now, for each plan ID, get the complete plan with all members
    const plans: HikingPlan[] = [];

    for (const planId of planIds) {
      // Get the hiking plan
      const plan = await this.hikingPlanRepository.findOne({
        where: { id: planId },
        relations: ['supervisor', 'supervisor.id', 'checkpoints']
      });

      if (!plan) continue;

      // Now get all members for this plan using a direct query
      const members = await this.dataSource.query(`
      SELECT sm.*, bu.*
      FROM scout_member sm
      JOIN hiking_plan_members hpm ON sm.id = hpm.scout_member_id
      JOIN base_user_entity bu ON sm.id = bu.id
      WHERE hpm.hiking_plan_id = $1
    `, [planId]);

      plan.members = members;
      plans.push(plan);
    }

    // Sort by start date descending
    plans.sort((a, b) => b.startDateTime.getTime() - a.startDateTime.getTime());

    console.log(`Found ${plans.length} plans for scout ${scoutId} using direct SQL`);
    if (plans.length > 0) {
      console.log(`First plan has ${plans[0].members.length} members`);
    }

    return plans;
  }
  async findOne(id: string): Promise<HikingPlan> {
    const hikingPlan = await this.hikingPlanRepository.findOne({
      where: { id },
      relations: [
        'supervisor',
        'supervisor.id',
        'members',
        'members.id.id',
        'checkpoints'
      ],
    });

    if (!hikingPlan) {
      throw new NotFoundException(`Hiking plan with ID ${id} not found`);
    }

    return hikingPlan;
  }

  async update(id: string, updateHikingPlanDto: UpdateHikingPlanDto): Promise<HikingPlan> {
    const hikingPlan = await this.findOne(id);

    // Update basic properties
    if (updateHikingPlanDto.title) hikingPlan.title = updateHikingPlanDto.title;
    if (updateHikingPlanDto.description !== undefined) hikingPlan.description = updateHikingPlanDto.description;
    if (updateHikingPlanDto.startDateTime) hikingPlan.startDateTime = new Date(updateHikingPlanDto.startDateTime);
    if (updateHikingPlanDto.endDateTime) hikingPlan.endDateTime = new Date(updateHikingPlanDto.endDateTime);
    if (updateHikingPlanDto.isAssessmentPassed !== undefined) hikingPlan.isAssessmentPassed = updateHikingPlanDto.isAssessmentPassed;

    // Update supervisor if provided
    if (updateHikingPlanDto.supervisorId) {
      const supervisor = await this.leaderRepository.findOne({
        where: { id: updateHikingPlanDto.supervisorId }
      });

      if (!supervisor) {
        throw new NotFoundException(`Supervisor with ID ${updateHikingPlanDto.supervisorId} not found`);
      }

      hikingPlan.supervisor = supervisor;
    }

    // Update members if provided
    if (updateHikingPlanDto.memberIds) {
      const members = await this.scoutMemberRepository.findBy({
        id: In(updateHikingPlanDto.memberIds)
      });

      if (members.length !== updateHikingPlanDto.memberIds.length) {
        throw new NotFoundException('One or more members not found');
      }

      hikingPlan.members = members;
    }

    // Update checkpoints if provided
    if (updateHikingPlanDto.checkpoints) {
      // Handle checkpoint updates or additions
      for (const cpDto of updateHikingPlanDto.checkpoints) {
        if (cpDto.id) {
          // Update existing checkpoint
          const checkpoint = hikingPlan.checkpoints.find(cp => cp.id === cpDto.id);
          if (checkpoint) {
            if (cpDto.name) checkpoint.name = cpDto.name;
            if (cpDto.sequenceNumber !== undefined) checkpoint.sequenceNumber = cpDto.sequenceNumber;
            if (cpDto.plannedDepartureTime) checkpoint.plannedDepartureTime = new Date(cpDto.plannedDepartureTime);
            if (cpDto.plannedArrivalTime) checkpoint.plannedArrivalTime = new Date(cpDto.plannedArrivalTime);
            if (cpDto.restTimeMinutes !== undefined) checkpoint.restTimeMinutes = cpDto.restTimeMinutes;
            if (cpDto.location) checkpoint.location = cpDto.location;
            if (cpDto.latitude !== undefined) checkpoint.latitude = cpDto.latitude;
            if (cpDto.longitude !== undefined) checkpoint.longitude = cpDto.longitude;

            await this.hikingCheckpointRepository.save(checkpoint);
          }
        } else {
          // Add new checkpoint
          const newCheckpoint = this.hikingCheckpointRepository.create({
            name: cpDto.name,
            sequenceNumber: cpDto.sequenceNumber,
            plannedDepartureTime: cpDto.plannedDepartureTime ? new Date(cpDto.plannedDepartureTime) : null,
            plannedArrivalTime: cpDto.plannedArrivalTime ? new Date(cpDto.plannedArrivalTime) : null,
            restTimeMinutes: cpDto.restTimeMinutes,
            location: cpDto.location,
            latitude: cpDto.latitude,
            longitude: cpDto.longitude,
            hikingPlan,
          });

          hikingPlan.checkpoints.push(await this.hikingCheckpointRepository.save(newCheckpoint));
        }
      }
    }

    hikingPlan.lastUpdate = new Date();
    return this.hikingPlanRepository.save(hikingPlan);
  }

  async remove(id: string): Promise<void> {
    const hikingPlan = await this.findOne(id);
    await this.hikingPlanRepository.remove(hikingPlan);
  }

  async checkIn(scoutId: string, dto: CheckInOutDto): Promise<HikingCheckpoint> {
    const checkpoint = await this.hikingCheckpointRepository.findOne({
      where: { id: dto.checkpointId },
      relations: ['hikingPlan', 'hikingPlan.members', 'hikingPlan.supervisor'],
    });

    if (!checkpoint) {
      throw new NotFoundException(`Checkpoint with ID ${dto.checkpointId} not found`);
    }

    // Verify the scout is part of this hiking plan
    const isMember = checkpoint.hikingPlan.members.some(member => member.id === scoutId);
    if (!isMember) {
      throw new BadRequestException('You are not part of this hiking plan');
    }

    // Check if already checked in
    if (checkpoint.isCheckedIn) {
      throw new BadRequestException('Already checked in to this checkpoint');
    }

    // Calculate distance to verify location
    const distance = this.calculateDistance(
      checkpoint.latitude,
      checkpoint.longitude,
      dto.latitude,
      dto.longitude
    );

    // Allow check-in if within 100 meters of the checkpoint
    if (distance > 100) {
      throw new ForbiddenException('You are not close enough to the checkpoint');
    }

    // Update checkpoint
    checkpoint.isCheckedIn = true;
    checkpoint.actualArrivalTime = new Date();

    const updated = await this.hikingCheckpointRepository.save(checkpoint);

    // Send notifications
    await this.sendCheckpointNotifications(checkpoint, scoutId, 'checked in');

    return updated;
  }

  async checkOut(scoutId: string, dto: CheckInOutDto): Promise<HikingCheckpoint> {
    const checkpoint = await this.hikingCheckpointRepository.findOne({
      where: { id: dto.checkpointId },
      relations: ['hikingPlan', 'hikingPlan.members', 'hikingPlan.supervisor'],
    });

    if (!checkpoint) {
      throw new NotFoundException(`Checkpoint with ID ${dto.checkpointId} not found`);
    }

    // Verify the scout is part of this hiking plan
    const isMember = checkpoint.hikingPlan.members.some(member => member.id === scoutId);
    if (!isMember) {
      throw new BadRequestException('You are not part of this hiking plan');
    }

    // Check if already checked out
    if (checkpoint.isCheckedOut) {
      throw new BadRequestException('Already checked out from this checkpoint');
    }

    // Check if checked in
    if (!checkpoint.isCheckedIn) {
      throw new BadRequestException('Must check in before checking out');
    }

    // Calculate distance to verify location
    const distance = this.calculateDistance(
      checkpoint.latitude,
      checkpoint.longitude,
      dto.latitude,
      dto.longitude
    );

    // Allow check-out if within 100 meters of the checkpoint
    if (distance > 100) {
      throw new ForbiddenException('You are not close enough to the checkpoint');
    }

    // Update checkpoint
    checkpoint.isCheckedOut = true;
    checkpoint.actualDepartureTime = new Date();

    const updated = await this.hikingCheckpointRepository.save(checkpoint);

    // Send notifications
    await this.sendCheckpointNotifications(checkpoint, scoutId, 'checked out');

    return updated;
  }

  // Helper method to calculate distance between two coordinates using the Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  private async sendCheckpointNotifications(checkpoint: HikingCheckpoint, scoutId: string, action: string): Promise<void> {
    try {
      const scout = await this.scoutMemberRepository.findOne({
        where: { id: scoutId },
        relations: ['id'], // This represents the BaseUserEntity
      });

      if (!scout) {
        return;
      }

      const scoutUser = await this.baseUserRepository.findOne({
        where: { id: scoutId }
      });

      // Get supervisor email
      const supervisorUser = await this.baseUserRepository.findOne({
        where: { id: checkpoint.hikingPlan.supervisor.id }
      });

      // Get parents' emails
      const guardianRelations = await this.memberGuardianRepository.find({
        where: { scout: { id: scoutId } },
        relations: ['guardian'],
      });

      const guardianEmails = [];
      for (const relation of guardianRelations) {
        const guardian = await this.baseUserRepository.findOne({
          where: { id: relation.guardian.id }
        });
        if (guardian) {
          guardianEmails.push(guardian.email);
        }
      }

      // Prepare notification content
      const hikingPlanTitle = checkpoint.hikingPlan.title;
      const checkpointName = checkpoint.name;
      const scoutName = scoutUser ? `${scoutUser.firstName} ${scoutUser.lastName}` : 'A scout';
      const timestamp = new Date().toLocaleString();

      const subject = `Hiking Update: ${scoutName} has ${action} checkpoint ${checkpointName}`;
      const content = `
        <h2>Hiking Checkpoint Update</h2>
        <p><strong>${scoutName}</strong> has ${action} checkpoint "<strong>${checkpointName}</strong>" 
        in hiking plan "<strong>${hikingPlanTitle}</strong>" at ${timestamp}.</p>
        <p>Current location: ${checkpoint.location}</p>
      `;

      // Send to supervisor
      if (supervisorUser) {
        await this.emailService.sendEmail(supervisorUser.email, subject, content);
      }

      // Send to parents
      for (const email of guardianEmails) {
        await this.emailService.sendEmail(email, subject, content);
      }
    } catch (error) {
      console.error('Failed to send checkpoint notifications:', error);
    }
  }

  async findAllForSupervisor(supervisorId: string): Promise<HikingPlan[]> {
    return this.hikingPlanRepository.find({
      where: { supervisor: { id: supervisorId } },
      relations: ['supervisor', 'members', 'checkpoints'],
      order: {
        startDateTime: 'DESC',
        checkpoints: {
          sequenceNumber: 'ASC'
        }
      }
    });
  }
}