import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { TrainingRecordsService } from '../services/training-records.service';

@Controller('training-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainingRecordsController {
  constructor(
    private readonly trainingRecordsService: TrainingRecordsService,
  ) {}

  @Get('scout/:id')
  @RequireRoles({ group: UserTypeEnum.LEADER }, { group: UserTypeEnum.MEMBER })
  findOne(@Param('id') id: string) {
    return this.trainingRecordsService.findAllByScoutId(id);
  }
}