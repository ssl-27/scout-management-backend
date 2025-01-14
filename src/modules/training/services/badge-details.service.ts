import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateBadgeDetailsDto } from '../dto/create-badge-details.dto';
import { BadgeDetailsEntity } from '../../../entities/training/badge-details.entity';
import { TrainingItem } from '../../../entities/training/training-item.entity';
import { TrainingItemService } from './training-item.service';

@Injectable()
export class BadgeDetailsService {
  constructor(
    @InjectRepository(BadgeDetailsEntity)
    private readonly badgeDetailsRepository: Repository<BadgeDetailsEntity>,
    @InjectRepository(TrainingItem)
    private readonly trainingItemRepository: Repository<TrainingItem>,
    private readonly trainingItemService: TrainingItemService,
    private dataSource: DataSource,
  ) {}

  async create(
    createBadgeDetailsDto: CreateBadgeDetailsDto,
  ): Promise<BadgeDetailsEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Create badge details first
      const badgeDetails = this.badgeDetailsRepository.create({
        title: createBadgeDetailsDto.title,
        description: createBadgeDetailsDto.description,
        badgeSection: createBadgeDetailsDto.badgeSection,
      });

      // Save badge details
      const savedBadgeDetails = await manager.save(
        BadgeDetailsEntity,
        badgeDetails,
      );

      // Create and save training items
      if (createBadgeDetailsDto.trainingItems?.length > 0) {
        const trainingItems = createBadgeDetailsDto.trainingItems.map((item) =>
          this.trainingItemRepository.create({
            ...item,
            badge: savedBadgeDetails,
          }),
        );

        // Save all training items
        await manager.save(TrainingItem, trainingItems);

        // Update badgeDetails with training items
        savedBadgeDetails.trainingItems = trainingItems;
      }

      // Return clean object without circular references
      return await manager.findOne(BadgeDetailsEntity, {
        where: { id: savedBadgeDetails.id },
        relations: ['trainingItems'],
      });
    });
  }

  async findAll(): Promise<BadgeDetailsEntity[]> {
    const results = await this.badgeDetailsRepository.find();
    for (let i = 0; i < results.length; i++) {
      const badgeDetails = results[i];
      badgeDetails.trainingItems = await this.trainingItemService.findByBadge(
        badgeDetails.id,
      );
    }
    return results;
  }

  async findOne(id: string): Promise<BadgeDetailsEntity> {
    const result = await this.badgeDetailsRepository.findOne({ where: { id } });
    result.trainingItems = await this.trainingItemService.findByBadge(
      result.id,
    );
    return result;
  }

  async update(
    id: string,
    createBadgeDetailsDto: Partial<CreateBadgeDetailsDto>,
  ): Promise<BadgeDetailsEntity> {
    await this.badgeDetailsRepository.update(id, createBadgeDetailsDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.badgeDetailsRepository.delete(id);
  }
}