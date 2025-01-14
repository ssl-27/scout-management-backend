// src/controllers/badge-details.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Patch } from '@nestjs/common';
import { CreateBadgeDetailsDto } from '../dto/create-badge-details.dto';
import { BadgeDetailsService } from '../services/badge-details.service';

@Controller('badge-details')
export class BadgeDetailsController {
  constructor(private readonly badgeDetailsService: BadgeDetailsService) {}

  @Post()
  create(@Body() createBadgeDetailsDto: CreateBadgeDetailsDto) {
    return this.badgeDetailsService.create(createBadgeDetailsDto);
  }

  @Get()
  findAll() {
    return this.badgeDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.badgeDetailsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() createBadgeDetailsDto: Partial<CreateBadgeDetailsDto>) {
    return this.badgeDetailsService.update(id, createBadgeDetailsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.badgeDetailsService.remove(id);
  }
}