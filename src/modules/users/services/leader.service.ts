// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Leader } from '../../../entities/leader/leader.entity';
// import { Repository } from 'typeorm';
// import { CreateLeaderDto } from '../dto/create-leader.dto';
//
// @Injectable()
// export class LeaderService {
//   constructor(
//     @InjectRepository(Leader)
//     private leaderRepository: Repository<Leader>,
//   ) {}
//
//   // Create
//   async create(createLeaderDto: CreateLeaderDto): Promise<Leader> {
//     const leader = this.leaderRepository.create({
//       ...createLeaderDto,
//       role: 'leader',    });
//     return await this.leaderRepository.save(leader);
//   }
//
//   // Read all
//   async findAll(): Promise<Leader[]> {
//     return await this.leaderRepository.find();
//   }
//
//   // Read one
//   async findOne(id: string): Promise<Leader> {
//     return await this.leaderRepository.findOneBy({ id });
//   }
//
//   // Update
//   async update(id: string, updateLeaderDto: Partial<CreateLeaderDto>): Promise<Leader> {
//     await this.leaderRepository.update(id, updateLeaderDto);
//     return this.findOne(id);
//   }
//
//   // Delete
//   async remove(id: string): Promise<void> {
//     await this.leaderRepository.delete(id);
//   }
// }