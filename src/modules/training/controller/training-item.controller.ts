// src/controllers/training-item.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Patch, UseGuards } from '@nestjs/common';
import { CreateTrainingItemDto } from '../dto/create-training-item.dto';
import { TrainingItemService } from '../services/training-item.service';
import { RequireRoles } from '../../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

@Controller('training-items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainingItemController {
  constructor(private readonly trainingItemService: TrainingItemService) {}

  @Post()
  @RequireRoles({ group: UserTypeEnum.LEADER })
  create(@Body() createTrainingItemDto: CreateTrainingItemDto) {
    return this.trainingItemService.create(createTrainingItemDto);
  }

  @Get()
  @RequireRoles({ group: UserTypeEnum.LEADER }, { group: UserTypeEnum.MEMBER })
  findAll() {
    return this.trainingItemService.findAll();
  }

  @Get(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER }, { group: UserTypeEnum.MEMBER })
  findOne(@Param('id') id: string) {
    return this.trainingItemService.findOne(id);
  }

  @Patch(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  update(@Param('id') id: string, @Body() updateTrainingItemDto: CreateTrainingItemDto) {
    return this.trainingItemService.update(id, updateTrainingItemDto);
  }

  @Delete(':id')
  @RequireRoles({ group: UserTypeEnum.ADMIN })
  remove(@Param('id') id: string) {
    return this.trainingItemService.remove(id);
  }
}