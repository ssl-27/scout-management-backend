// src/controllers/badge-details.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Patch, UseGuards } from '@nestjs/common';
import { CreateBadgeDetailsDto } from '../dto/create-badge-details.dto';
import { BadgeDetailsService } from '../services/badge-details.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../../../common/decorators/roles.decorator';
import { UserTypeEnum } from '../../../common/enum/user-type.enum';

@Controller('badge-details')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BadgeDetailsController {
  constructor(private readonly badgeDetailsService: BadgeDetailsService) {}

  @Post()
  @RequireRoles({ group: UserTypeEnum.LEADER })
  create(@Body() createBadgeDetailsDto: CreateBadgeDetailsDto) {
    return this.badgeDetailsService.create(createBadgeDetailsDto);
  }

  @Get()
  @RequireRoles({ group: UserTypeEnum.LEADER }, { group: UserTypeEnum.MEMBER })
  findAll() {
    return this.badgeDetailsService.findAll();
  }

  @Get(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER }, { group: UserTypeEnum.MEMBER })
  findOne(@Param('id') id: string) {
    return this.badgeDetailsService.findOne(id);
  }

  @Patch(':id')
  @RequireRoles({ group: UserTypeEnum.LEADER })
  update(@Param('id') id: string, @Body() createBadgeDetailsDto: Partial<CreateBadgeDetailsDto>) {
    return this.badgeDetailsService.update(id, createBadgeDetailsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.badgeDetailsService.remove(id);
  }
}