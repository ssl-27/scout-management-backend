import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { CreateBatchAttendanceDto } from '../dto/create-batch-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from '../../../entities/training/attendance.entity';
import { Repository } from 'typeorm';
import { PatrolNamesEnum } from '../../../common/enum/patrol-names.enum';
import { ScoutMember } from '../../../entities/user-groups/scout/scout-member.entity';
import { MeetingEntity } from '../../../entities/training/meeting.entity';
import { async } from 'rxjs';
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

  async create(createAttendanceDto: CreateAttendanceDto, user): Promise<Attendance> {
    const scoutMember = await this.scoutMemberRepository.findOne({
      where: { id: createAttendanceDto.scoutId }
    });
    switch (user.group) {
      case 'LEADER':
        break;
      case 'MEMBER':
        if (user.role !== 'PL' && user.role !== 'APL') {
          throw new ForbiddenException('You do not have permission to create attendance');
        }
        if (scoutMember.patrol !== user.patrol) {
          throw new ForbiddenException('You can only create attendance for members in your patrol');
        }
      default:
        throw new ForbiddenException('You do not have permission to create attendance');
    }

    const attendance = this.attendanceRepository.create(createAttendanceDto);
    attendance.meetingEntity = await this.meetingRepository.findOne({ where: { id: createAttendanceDto.meetingId } });
    attendance.scout = scoutMember;
    return this.attendanceRepository.save(attendance);
  }

  async createBatch(createBatchAttendanceDto: CreateBatchAttendanceDto, user): Promise<Attendance[]> {
    const attendances = await Promise.all(createBatchAttendanceDto.attendances.map(async attendanceDto => {
      const scoutMember = await this.scoutMemberRepository.findOne({
        where: { id: attendanceDto.scoutId }
      });
      switch (user.group) {
        case 'LEADER':
          break;
        case 'MEMBER':
          if (user.role !== 'PL' && user.role !== 'APL') {
            throw new ForbiddenException('You do not have permission to create attendance');
          }
          if (scoutMember.patrol !== user.patrol) {
            throw new ForbiddenException('You can only create attendance for members in your patrol');
          }
        default:
          throw new ForbiddenException('You do not have permission to create attendance');
      }
      const attendance = this.attendanceRepository.create(attendanceDto);
      attendance.meetingEntity = await this.meetingRepository.findOne({ where: { id: attendanceDto.meetingId } });
      attendance.scout = scoutMember;
      return attendance;
    }));
    return this.attendanceRepository.save(attendances);
  }


  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find();
  }

  async findMyAttendance(user): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { scout: { id: user.userId } },
      relations: ['meetingEntity'],
      order: { meetingDate: 'DESC' }
    });
  }

  async findOne(id: string, user): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['scout']
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
          where: { id: attendance.scout.id }
        });

        if ([ScoutSectionRankEnum.PL, ScoutSectionRankEnum.APL].includes(user.rank)
          && scoutMember.patrol === user.patrol) {
          return attendance;
        }

        throw new ForbiddenException('You do not have permission to view this attendance record');
      case UserTypeEnum.GUARDIAN:
        const isGuardianOfScout = await this.memberGuardianRepository.findOne({
          where: {
            guardian: { id: user.userId },
            scout: { id: attendance.scout.id }
          }
        });

        if (!isGuardianOfScout) {
          throw new ForbiddenException('You do not have permission to view this attendance record');
        }

        return attendance;
    }
  }

  async update(id: string, updateAttendanceDto: CreateAttendanceDto, user): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['scout']
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
      where: { id: attendance.scout.id }
    });

    if (scoutMember.patrol !== user.patrol) {
      throw new ForbiddenException('You can only update attendance for members in your patrol');
    }

    await this.attendanceRepository.update(id, updateAttendanceDto);
    return this.findOne(id, user);
  }

  async remove(id: string, user): Promise<void> {
    await this.attendanceRepository.delete(id);
  }

  async findByMeeting(meetingId: string, user): Promise<Attendance[]> {
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.scout', 'scout')
      .leftJoinAndSelect('scout.id', 'scoutMember')
      .leftJoinAndSelect('scoutMember.id', 'baseUser')
      .leftJoinAndSelect('attendance.meetingEntity', 'meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .getMany();
  }

  async findByMeetingAndUsers(meetingId: string, userIds: string[], user): Promise<Attendance[]> {
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.scout', 'scout')
      .leftJoinAndSelect('attendance.meetingEntity', 'meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('scout.id IN (:...userIds)', { userIds })
      .getMany();
  }

  async findByMeetingAndPatrol(meetingId: string, patrol: PatrolNamesEnum): Promise<Attendance[]> {
    const patrolMembers = await this.scoutMemberRepository.find({
      where: { patrol }
    });

    const patrolMemberIds = patrolMembers.map(member => member.id);

    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.scout', 'scout')
      .leftJoinAndSelect('attendance.meetingEntity', 'meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('scout.id IN (:...patrolMemberIds)', { patrolMemberIds })
      .getMany();
  }

  async findAllForMember(memberId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { scout: { id: memberId } },
      relations: ['meetingEntity'],
      order: { meetingDate: 'DESC' }
    });
  }

  async findAllForGuardianChildren(guardianId: string): Promise<{ childId: string, attendances: Attendance[] }[]> {
    // First get all children IDs for this guardian
    const guardianRelations = await this.memberGuardianRepository.find({
      where: { guardian: { id: guardianId } },
      relations: ['scout']
    });

    const childrenAttendances = await Promise.all(
      guardianRelations.map(async (relation) => ({
        childId: relation.scout.id,
        relationship: relation.relationship,
        attendances: await this.attendanceRepository.find({
          where: { scout: { id: relation.scout.id } },
          relations: ['meetingEntity'],
          order: { meetingDate: 'DESC' }
        })
      }))
    );

    return childrenAttendances;
  }

}