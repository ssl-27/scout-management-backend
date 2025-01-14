import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { MeetingEntity } from '../../../entities/training/meeting.entity';
import { TrainingRecordEntity } from '../../../entities/training/training-record.entity';
import { AttendanceService } from './attendance.service';
import { TrainingItemService } from './training-item.service';
import { ScoutSectionEnum } from '../../../common/enum/scout-section.enum';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(MeetingEntity)
    private readonly meetingRepository: Repository<MeetingEntity>,
    @InjectRepository(TrainingRecordEntity)
    private readonly trainingRecordRepository: Repository<TrainingRecordEntity>,
    private dataSource: DataSource,
    private readonly attendanceService: AttendanceService,
    private readonly trainingItemService: TrainingItemService,
  ) {}

  async create(createMeetingDto: CreateMeetingDto): Promise<MeetingEntity> {
    console.log('DTO received:', createMeetingDto);
    console.log('Training Item IDs:', createMeetingDto.trainingItemIds);
    console.log(
      'Type of trainingItemIds:',
      typeof createMeetingDto.trainingItemIds,
    );
    console.log('Is Array:', Array.isArray(createMeetingDto.trainingItemIds));

    const meeting = this.meetingRepository.create(createMeetingDto);

    try {
      meeting.trainingItems = await this.trainingItemService.findBatch(
        createMeetingDto.trainingItemIds,
      );
      return await this.meetingRepository.save(meeting);
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }
  // In your meeting service
  async findAll() {
    return await this.meetingRepository.find({
      relations: ['trainingItems'],
    });
  }

  // In your meeting service
  async findOne(meetingId: string) {
    return await this.meetingRepository
      .createQueryBuilder('meeting')
      .leftJoinAndSelect('meeting.trainingItems', 'trainingItems')
      .where('meeting.id = :id', { id: meetingId })
      .getOne();
  }

  async update(id: string, updateMeetingDto: Partial<CreateMeetingDto>): Promise<MeetingEntity> {
    return this.dataSource.transaction(async manager => {
      try {
        // Get the meeting with relationships
        const existingMeeting = await manager.findOne(MeetingEntity, {
          where: { id },
          relations: ['trainingItems', 'attendances', 'attendances.scout']
        });

        console.log('Existing Meeting:', {
          id: existingMeeting.id,
          trainingItemsCount: existingMeeting.trainingItems?.length,
          attendancesCount: existingMeeting.attendances?.length
        });

        if (!existingMeeting) {
          throw new NotFoundException(`Meeting with ID ${id} not found`);
        }

        // Update the meeting
        await manager.update(MeetingEntity, id, updateMeetingDto);

        // Handle completion logic
        if (updateMeetingDto.isMeetingCompleted === true && existingMeeting.isMeetingCompleted === false ) {
          console.log('Training Items:', existingMeeting.trainingItems);
          console.log('Attendances:', existingMeeting.attendances);

          const trainingRecords = existingMeeting.attendances.flatMap(attendance => {
            console.log('Processing attendance:', attendance);
            return existingMeeting.trainingItems.map(trainingItem => {
              console.log('Creating record for training item:', trainingItem);
              return manager.create(TrainingRecordEntity, {
                scout: attendance.scout,
                trainingItem: trainingItem,
                dateCompleted: new Date(),
                itemSection: trainingItem.badgeSection
              });
            });
          });

          console.log('Generated Training Records:', trainingRecords.length);

          if (trainingRecords.length > 0) {
            await manager.save(TrainingRecordEntity, trainingRecords);
          }
        }

        // Return updated meeting
        return manager.findOne(MeetingEntity, {
          where: { id },
          relations: ['trainingItems']
        });
      } catch (error) {
        console.error('Error in update:', error);
        throw error;
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.meetingRepository.delete(id);
  }
}