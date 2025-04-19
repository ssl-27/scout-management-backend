import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { CreateBatchAttendanceDto } from '../dto/create-batch-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from '../../../entities/training/attendance.entity';
import { Repository } from 'typeorm';
import { PatrolNamesEnum } from '../../../common/enum/patrol-names.enum';
import { ScoutMember } from '../../../entities/user-groups/scout/scout-member.entity';
import { MeetingEntity } from '../../../entities/training/meeting.entity';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { ScoutSectionRankEnum } from '../../../common/enum/scout-section-rank.enum';
import { MemberGuardian } from '../../../entities/user-groups/member-guardian.entity';
import { BaseUserEntity } from '../../../entities/base/base-user.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(ScoutMember)
    private scoutMemberRepository: Repository<ScoutMember>,
    @InjectRepository(MeetingEntity)
    private meetingRepository: Repository<MeetingEntity>,
    @InjectRepository(MemberGuardian)
    private memberGuardianRepository: Repository<MemberGuardian>,
    @InjectRepository(BaseUserEntity)
    private baseUserRepository: Repository<BaseUserEntity>,
  ) {}


  async createBatch(
    createBatchAttendanceDto: CreateBatchAttendanceDto,
    user,
  ): Promise<Attendance[]> {
    const attendances = await Promise.all(
      createBatchAttendanceDto.attendances.map(async (attendanceDto) => {
        const scoutMember = await this.scoutMemberRepository.findOne({
          where: { id: attendanceDto.scoutId },
        });
        switch (user.group) {
          case 'LEADER':
            break;
          case 'MEMBER':
            if (user.role !== 'PL' && user.role !== 'APL') {
              throw new ForbiddenException(
                'You do not have permission to create attendance',
              );
            }
            if (scoutMember.patrol !== user.patrol) {
              throw new ForbiddenException(
                'You can only create attendance for members in your patrol',
              );
            }
          default:
            throw new ForbiddenException(
              'You do not have permission to create attendance',
            );
        }
        const attendance = this.attendanceRepository.create(attendanceDto);
        attendance.meetingEntity = await this.meetingRepository.findOne({
          where: { id: attendanceDto.meetingId },
        });
        attendance.scout = scoutMember;
        return attendance;
      }),
    );
    return this.attendanceRepository.save(attendances);
  }

  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find();
  }

  async findMyAttendance(user): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { scout: { id: user.userId } },
      relations: ['meetingEntity'],
      order: { meetingDate: 'DESC' },
    });
  }

  async findOne(id: string, user): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['scout'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    switch (user.group) {
      case UserTypeEnum.LEADER:
        return attendance;
      case UserTypeEnum.MEMBER:
        // Allow if it's their own attendance
        if (attendance.scout.id === user.userId) {
          return attendance;
        }

        // Allow if they're PL/APL and it's their patrol
        const scoutMember = await this.scoutMemberRepository.findOne({
          where: { id: attendance.scout.id },
        });

        if (
          [ScoutSectionRankEnum.PL, ScoutSectionRankEnum.APL].includes(
            user.rank,
          ) &&
          scoutMember.patrol === user.patrol
        ) {
          return attendance;
        }

        throw new ForbiddenException(
          'You do not have permission to view this attendance record',
        );
      case UserTypeEnum.GUARDIAN:
        const isGuardianOfScout = await this.memberGuardianRepository.findOne({
          where: {
            guardian: { id: user.userId },
            scout: { id: attendance.scout.id },
          },
        });

        if (!isGuardianOfScout) {
          throw new ForbiddenException(
            'You do not have permission to view this attendance record',
          );
        }

        return attendance;
    }
  }

  async update(
    id: string,
    updateAttendanceDto: CreateAttendanceDto,
    user,
  ): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['scout'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    // Leaders can update any attendance
    if (user.group === UserTypeEnum.LEADER) {
      await this.attendanceRepository.update(id, updateAttendanceDto);
      return this.findOne(id, user);
    }

    // For PL/APL, check if the attendance is for their patrol
    const scoutMember = await this.scoutMemberRepository.findOne({
      where: { id: attendance.scout.id },
    });

    if (scoutMember.patrol !== user.patrol) {
      throw new ForbiddenException(
        'You can only update attendance for members in your patrol',
      );
    }

    await this.attendanceRepository.update(id, updateAttendanceDto);
    return this.findOne(id, user);
  }

  async remove(id: string, user): Promise<void> {
    await this.attendanceRepository.delete(id);
  }

  async findByMeeting(meetingId: string, user): Promise<any[]> {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId }
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${meetingId} not found`);
    }

    // If user is a leader, return all scouts with their attendance status
    if (user.group === UserTypeEnum.LEADER) {
      // First get all scouts
      const allScouts = await this.scoutMemberRepository.find({
        relations: ['id']
      });

      // Then get existing attendance records for this meeting
      const existingAttendances = await this.attendanceRepository.find({
        where: { meetingEntity: { id: meetingId } },
        relations: ['scout']
      });

      // Create a map of existing attendance by scout ID for quick lookup
      const attendanceMap = new Map();
      existingAttendances.forEach(att => {
        attendanceMap.set(att.scout.id, att);
      });

      // Return a combined list of all scouts with their attendance status if exists
      return Promise.all(allScouts.map(async (scout) => {
        const attendance = attendanceMap.get(scout['id']['id']);

        // Fetch the base user details for the scout
        const scoutUser = await this.baseUserRepository.findOne({
          where: { id: scout['id']['id'] },
        });

        return {
          scout: {
            id: scout.id,
            preferredName: scoutUser?.preferredName,
            firstName: scoutUser?.firstName,
            lastName: scoutUser?.lastName,
            patrol: scout.patrol,
          },
          attendance: attendance ? attendance.attendance : 'Not Marked',
          attendanceId: attendance ? attendance.id : null,
          meetingEntity: { id: meetingId },
        };
      }));
    }

    // If user is a Patrol Leader or APL, only show scouts from their patrol
    else if (user.group === UserTypeEnum.MEMBER &&
      [ScoutSectionRankEnum.PL, ScoutSectionRankEnum.APL, ScoutSectionRankEnum.SPL].includes(user.role)) {

      // Get scouts from the user's patrol
      const patrolScouts = await this.scoutMemberRepository.find({
        where: { patrol: user.patrol },
        relations: ['id'] // This should join with the BaseUserEntity
      });

      // Get existing attendance records
      const existingAttendances = await this.attendanceRepository.find({
        where: { meetingEntity: { id: meetingId } },
        relations: ['scout']
      });

      // Create a map of existing attendance by scout ID
      const attendanceMap = new Map();
      existingAttendances.forEach(att => {
        attendanceMap.set(att.scout.id, att);
      });

      // Return combined data
      return patrolScouts.map(async (scout) => {
        const attendance = attendanceMap.get(scout.id);

        // Fetch the base user details for the scout
        const scoutUser = await this.baseUserRepository.findOne({
          where: { id: scout.id },
        });

        return {
          scout: {
            id: scout.id,
            preferredName: scoutUser?.preferredName,
            firstName: scoutUser?.firstName,
            lastName: scoutUser?.lastName,
            patrol: scout.patrol,
          },
          attendance: attendance ? attendance.attendance : 'Not Marked',
          attendanceId: attendance ? attendance.id : null,
          meetingEntity: { id: meetingId },
        };
      });
    }

    // For other users, return empty array or throw exception based on your requirements
    return [];
  }
  async findByMeetingAndUsers(
    meetingId: string,
    userIds: string[],
    user,
  ): Promise<Attendance[]> {
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.scout', 'scout')
      .leftJoinAndSelect('attendance.meetingEntity', 'meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('scout.id IN (:...userIds)', { userIds })
      .getMany();
  }

  async findByMeetingAndPatrol(
    meetingId: string,
    patrol: PatrolNamesEnum,
  ): Promise<Attendance[]> {
    const patrolMembers = await this.scoutMemberRepository.find({
      where: { patrol },
    });

    const patrolMemberIds = patrolMembers.map((member) => member.id);

    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.scout', 'scout')
      .leftJoinAndSelect('attendance.meetingEntity', 'meeting')
      .leftJoinAndSelect('scout.id', 'baseUser')
      .leftJoinAndSelect('baseUser.id', 'scoutMember')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('scout.id IN (:...patrolMemberIds)', { patrolMemberIds })
      .getMany();
  }

  async findAllForMember(memberId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { scout: { id: memberId } },
      relations: ['meetingEntity'],
      order: { meetingDate: 'DESC' },
    });
  }

  async findAllForGuardianChildren(
    guardianId: string,
  ): Promise<{ childId: string; attendances: Attendance[] }[]> {
    // First get all children IDs for this guardian
    const guardianRelations = await this.memberGuardianRepository.find({
      where: { guardian: { id: guardianId } },
      relations: ['scout'],
    });

    return await Promise.all(
      guardianRelations.map(async (relation) => {
        // Load the base user entity to get the name properties
        const baseUser = await this.baseUserRepository.findOne({
          where: { id: relation.scout.id },
        });

        return {
          childId: relation.scout.id,
          childName: `${baseUser.firstName} ${baseUser.lastName}`,
          relationship: relation.relationship,
          attendances: await this.attendanceRepository.find({
            where: { scout: { id: relation.scout.id } },
            relations: ['meetingEntity'],
            order: { meetingDate: 'DESC' },
          }),
        };
      }),
    );
  }

  async markAttendance(createAttendanceDto:CreateAttendanceDto): Promise<Attendance> {
    // Find the meeting
    const meeting = await this.meetingRepository.findOne({
      where: { id: createAttendanceDto.meetingId }
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${createAttendanceDto.meetingId} not found`);
    }

    // Find the scout
    const scout = await this.scoutMemberRepository.findOne({
      where: { id: createAttendanceDto.scoutId }
    });

    if (!scout) {
      throw new NotFoundException(`Scout with ID ${createAttendanceDto.scoutId} not found`);
    }

    // Check if attendance record already exists
    let attendance = await this.attendanceRepository.findOne({
      where: {
        meetingEntity: { id: createAttendanceDto.meetingId },
        scout: { id: createAttendanceDto.scoutId }
      }
    });

    if (attendance) {
      // Update existing record
      attendance.attendance = createAttendanceDto.attendance;
      return this.attendanceRepository.save(attendance);
    } else {
      // Create new attendance record
      attendance = this.attendanceRepository.create({
        meetingEntity: meeting,
        scout: scout,
        meetingDate: meeting.meetingDateStart,
        attendance: createAttendanceDto.attendance,
      });

      return this.attendanceRepository.save(attendance);
    }
  }
}