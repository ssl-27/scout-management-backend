import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingRecordEntity } from '../../../entities/training/training-record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TrainingRecordsService {
  constructor(
    @InjectRepository(TrainingRecordEntity)
    private readonly trainingRecordRepository: Repository<TrainingRecordEntity>,
  ) {}


  async findAllByScoutId(id: string): Promise<TrainingRecordEntity[]> {
    const results =  this.trainingRecordRepository.createQueryBuilder('trainingRecord')
      .leftJoinAndSelect('trainingRecord.trainingItem', 'trainingItems')
      .leftJoinAndSelect('trainingItems.badge', 'badge')
      .leftJoinAndSelect('trainingRecord.scout', 'scout')
      .where('scout.id = :id', { id })
      .getMany();
    console.log('Results:', results);
    return results;
  }
}