import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseUserEntity } from '../../../entities/base/base-user.entity';
import { Guardian } from '../../../entities/user-groups/guardian.entity';
import { Scout } from '../../../entities/user-groups/scout.entity';
import { ScoutMember } from '../../../entities/user-groups/scout/scout-member.entity';
import { UserGeneralController } from '../controllers/user-general.controller';
import { UserGeneralService } from '../services/user-general.service';
import { Leader } from '../../../entities/user-groups/leader.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BaseUserEntity, Leader, Guardian, Scout, ScoutMember])],
  controllers: [UserGeneralController],
  providers: [UserGeneralService],
  exports: [UserGeneralService],
})
export class UserGeneralModule {}