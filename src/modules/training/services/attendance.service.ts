import { Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { CreateBatchAttendanceDto } from '../dto/create-batch-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from '../../../entities/training/attendance.entity';
import { Repository } from 'typeorm';
import { PatrolNamesEnum } from '../../../common/enum/patrol-names.enum';
import { ScoutMember } from '../../../entities/user-groups/scout/scout-member.entity';
import { MeetingEntity } from '../../../entities/training/meeting.entity';
import { async } from 'rxjs';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(ScoutMember)
    private scoutMemberRepository: Repository<ScoutMember>,
    @InjectRepository(MeetingEntity)
    private meetingRepository: Repository<MeetingEntity>
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(createAttendanceDto);
    attendance.meetingEntity = await this.meetingRepository.findOne({ where: { id: createAttendanceDto.meetingId } });
    attendance.scout = await this.scoutMemberRepository.findOne({ where: { id: createAttendanceDto.scoutId } });
    return this.attendanceRepository.save(attendance);
  }

  async createBatch(createBatchAttendanceDto: CreateBatchAttendanceDto): Promise<Attendance[]> {
    const attendances = await Promise.all(createBatchAttendanceDto.attendances.map(async attendanceDto => {
      const attendance = this.attendanceRepository.create(attendanceDto);
      attendance.meetingEntity = await this.meetingRepository.findOne({ where: { id: attendanceDto.meetingId } });
      attendance.scout = await this.scoutMemberRepository.findOne({ where: { id: attendanceDto.scoutId } });
      return attendance;
    }));
    return this.attendanceRepository.save(attendances);
  }
  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find();
  }

  async findOne(id: string): Promise<Attendance> {
    return this.attendanceRepository.findOne({ where: { id } });
  }

  async update(id: string, updateAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    await this.attendanceRepository.update(id, updateAttendanceDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.attendanceRepository.delete(id);
  }

  async findByMeeting(meetingId: string): Promise<Attendance[]> {
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.scout', 'scout')
      .leftJoinAndSelect('attendance.meetingEntity', 'meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .getMany();
  }

  async findByMeetingAndUsers(meetingId: string, userIds: string[]): Promise<Attendance[]> {
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.scout', 'scout')
      .leftJoinAndSelect('attendance.meetingEntity', 'meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('scout.id IN (:...userIds)', { userIds })
      .getMany();
  }

  async findByMeetingAndPatrol(meetingId: string, patrolId: PatrolNamesEnum) {
    const patrolName = PatrolNamesEnum[patrolId];
    const troopMemberIds = (await this.scoutMemberRepository.findBy({ patrol: patrolName })).map(member => member.id);
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.scout', 'scout')
      .leftJoinAndSelect('attendance.attendanceMeeting', 'meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('scout.id IN (:...troopMemberIds)', { troopMemberIds })
      .getMany();
  }
}