// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Leader } from '../../../entities/leader/leader.entity';
// import { LeaderController } from '../controllers/leader.controller';
// import { LeaderService } from '../services/leader.service';
//
// @Module({
//   imports: [TypeOrmModule.forFeature([Leader])],
//   controllers: [LeaderController],
//   providers: [LeaderService],
//   exports: [LeaderService],
// Export the service if other modules need to use it
// })
// export class LeaderModule {}