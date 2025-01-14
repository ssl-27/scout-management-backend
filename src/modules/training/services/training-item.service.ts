import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, In, Repository } from 'typeorm';
import { CreateTrainingItemDto } from '../dto/create-training-item.dto';
import { TrainingItem } from '../../../entities/training/training-item.entity';

@Injectable()
export class TrainingItemService {
  constructor(
    @InjectRepository(TrainingItem)
    private readonly trainingItemRepository: Repository<TrainingItem>,
  ) {}

  async create(createTrainingItemDto: CreateTrainingItemDto): Promise<TrainingItem> {
    const trainingItem = this.trainingItemRepository.create(createTrainingItemDto);
    return this.trainingItemRepository.save(trainingItem);
  }

  async findAll(): Promise<TrainingItem[]> {
    return this.trainingItemRepository.find();
  }

  async findOne(id: string): Promise<TrainingItem> {
    return this.trainingItemRepository.findOne({ where: { id } });
  }

  async findBatch(ids: string[]): Promise<TrainingItem[]> {
    return this.trainingItemRepository.findBy({ id: In(ids) });
  }

  async update(id: string, createTrainingItemDto: CreateTrainingItemDto): Promise<TrainingItem> {
    await this.trainingItemRepository.update(id, createTrainingItemDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.trainingItemRepository.delete(id);
  }

  async findByBadge(id: string) {
    return this.trainingItemRepository.find({ where: { badge: Equal(id) } });
  }
}