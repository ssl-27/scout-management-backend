// src/controllers/training-item.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Patch } from '@nestjs/common';
import { CreateTrainingItemDto } from '../dto/create-training-item.dto';
import { TrainingItemService } from '../services/training-item.service';

@Controller('training-items')
export class TrainingItemController {
  constructor(private readonly trainingItemService: TrainingItemService) {}

  @Post()
  create(@Body() createTrainingItemDto: CreateTrainingItemDto) {
    return this.trainingItemService.create(createTrainingItemDto);
  }

  @Get()
  findAll() {
    return this.trainingItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainingItemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrainingItemDto: CreateTrainingItemDto) {
    return this.trainingItemService.update(id, updateTrainingItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainingItemService.remove(id);
  }
}